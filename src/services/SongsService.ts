import axios from 'axios';
import type { Song } from '../types';
import type { ISongsService } from '../core/interfaces/ISongsService';

const API_BASE_URL = 'https://music-bird.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests for the same userId
// Module-level cache persists across all service instances
const pendingRequests = new Map<string, Promise<Song[]>>();
// Result cache - stores resolved results and promise references to prevent rapid re-requests
const resultCache = new Map<string, { data: Song[]; promise: Promise<Song[]>; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL to prevent rapid re-requests after successful fetch

// Track request counts for debugging (can be removed in production)
if (typeof window !== 'undefined' && (window as any).__DEV__) {
  (window as any).__songsRequestCount = 0;
  (window as any).__songsCacheHits = 0;
  (window as any).__songsResultCacheHits = 0;
}

/**
 * Concrete implementation of ISongsService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class SongsService implements ISongsService {
  async getSongs(userId: string): Promise<Song[]> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    // This is checked FIRST to prevent any new requests if we have recent data
    const cachedResult = resultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached promise reference - maintains promise identity for React Cache
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          (window as any).__songsResultCacheHits = ((window as any).__songsResultCacheHits || 0) + 1;
        }
        // Return the cached promise (same reference = React Cache deduplication works)
        return cachedResult.promise;
      } else {
        // Cache expired, remove it
        resultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    // This prevents duplicate requests while one is in flight
    const existingRequest = pendingRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise (no new API call)
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        (window as any).__songsCacheHits = ((window as any).__songsCacheHits || 0) + 1;
      }
      return existingRequest;
    }

    // No cache hit - need to make a new request
    // Track this for debugging
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      (window as any).__songsRequestCount = ((window as any).__songsRequestCount || 0) + 1;
    }

    // Create the request promise
    const requestPromise = api.get<Song[]>(`/api/v1/songs/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Ensure all songs have like/dislike properties with default values
        const songsWithDefaults = response.data.map(song => ({
          ...song,
          isLiked: song.isLiked ?? false,
          isDisliked: song.isDisliked ?? false,
          likesCount: song.likesCount ?? 0,
          dislikesCount: song.dislikesCount ?? 0,
        }));
        // Store result AND promise reference in cache IMMEDIATELY (synchronously)
        // This prevents race conditions and maintains promise identity for React Cache
        resultCache.set(userId, { 
          data: songsWithDefaults, 
          promise: requestPromise, // Store the promise reference itself
          timestamp: now 
        });
        // Remove from pending cache after completion
        pendingRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = resultCache.get(userId);
          // Only delete if it's the same entry we set (prevent deleting newer cache)
          if (cached && cached.timestamp === now) {
            resultCache.delete(userId);
          }
        }, CACHE_TTL);
        return songsWithDefaults;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingRequests.delete(userId);
        resultCache.delete(userId);
        throw error;
      });

    // CRITICAL: Cache the pending request BEFORE returning
    // This must happen synchronously to prevent race conditions
    // If another call comes in before this line, it won't see the cached request
    pendingRequests.set(userId, requestPromise);

    return requestPromise;
  }
}
