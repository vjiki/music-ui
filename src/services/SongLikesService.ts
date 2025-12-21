import axios from 'axios';
import type { SongLikeRequest, SongLikeResponse } from '../types';
import type { ISongLikesService } from '../core/interfaces/ISongLikesService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache for getLikeDislikeInfo - prevents multiple simultaneous requests
const pendingLikeDislikeRequests = new Map<string, Promise<SongLikeResponse>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const likeDislikeResultCache = new Map<string, { data: SongLikeResponse; timestamp: number }>();
const CACHE_TTL = 5000; // 5 second cache TTL to prevent rapid re-requests after successful fetch

/**
 * Helper to create cache key for like/dislike info requests
 */
function getLikeDislikeCacheKey(songId: string, userId: string): string {
  return `${songId}-${userId}`;
}

/**
 * Concrete implementation of ISongLikesService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding for getLikeDislikeInfo
 */
export class SongLikesService implements ISongLikesService {
  async likeSong(request: SongLikeRequest): Promise<void> {
    // POST request - don't cache, but invalidate cache for this song/user
    const cacheKey = getLikeDislikeCacheKey(request.songId, request.userId);
    likeDislikeResultCache.delete(cacheKey);
    await api.post('/api/v1/song-likes/like', request);
  }

  async dislikeSong(request: SongLikeRequest): Promise<void> {
    // POST request - don't cache, but invalidate cache for this song/user
    const cacheKey = getLikeDislikeCacheKey(request.songId, request.userId);
    likeDislikeResultCache.delete(cacheKey);
    await api.post('/api/v1/song-likes/dislike', request);
  }

  async getLikeDislikeInfo(songId: string, userId: string): Promise<SongLikeResponse> {
    const cacheKey = getLikeDislikeCacheKey(songId, userId);

    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = likeDislikeResultCache.get(cacheKey);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        likeDislikeResultCache.delete(cacheKey);
      }
    }

    // Check if there's already a pending request for this cache key
    const existingRequest = pendingLikeDislikeRequests.get(cacheKey);
    if (existingRequest) {
      // Cache hit - return existing promise
      return existingRequest;
    }

    // Create new request and cache it
    const request = api.get<SongLikeResponse>(`/api/v1/song-likes/song/${songId}/user/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        likeDislikeResultCache.set(cacheKey, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingLikeDislikeRequests.delete(cacheKey);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = likeDislikeResultCache.get(cacheKey);
          if (cached && cached.timestamp === now) {
            likeDislikeResultCache.delete(cacheKey);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingLikeDislikeRequests.delete(cacheKey);
        likeDislikeResultCache.delete(cacheKey);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingLikeDislikeRequests.set(cacheKey, request);
    return request;
  }
}

