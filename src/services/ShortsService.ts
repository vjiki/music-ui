import axios from 'axios';
import type { Short } from '../types';
import type { IShortsService } from '../core/interfaces/IShortsService';

const API_BASE_URL = 'https://music-bird.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests for the same userId
const pendingRequests = new Map<string, Promise<Short[]>>();
// Result cache - stores resolved results and promise references
const resultCache = new Map<string, { data: Short[]; promise: Promise<Short[]>; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL

/**
 * Concrete implementation of IShortsService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class ShortsService implements IShortsService {
  async getShorts(userId: string): Promise<Short[]> {
    // First check result cache
    const cachedResult = resultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        return cachedResult.promise;
      } else {
        resultCache.delete(userId);
      }
    }

    // Check if there's already a pending request
    const existingRequest = pendingRequests.get(userId);
    if (existingRequest) {
      return existingRequest;
    }

    // Create the request promise
    const requestPromise = api.get<Short[]>(`/api/v1/shorts/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Ensure all shorts have like/dislike properties with default values
        const shortsWithDefaults = response.data.map(short => ({
          ...short,
          isLiked: short.isLiked ?? false,
          isDisliked: short.isDisliked ?? false,
          likesCount: short.likesCount ?? 0,
          dislikesCount: short.dislikesCount ?? 0,
        }));
        // Store result AND promise reference in cache
        resultCache.set(userId, { 
          data: shortsWithDefaults, 
          promise: requestPromise,
          timestamp: now 
        });
        // Remove from pending cache after completion
        pendingRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = resultCache.get(userId);
          if (cached && cached.timestamp === now) {
            resultCache.delete(userId);
          }
        }, CACHE_TTL);
        return shortsWithDefaults;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingRequests.delete(userId);
        resultCache.delete(userId);
        // Return empty array on error (same as iOS app behavior)
        console.error('Failed to fetch shorts:', error);
        return [];
      });

    // Cache the pending request
    pendingRequests.set(userId, requestPromise);

    return requestPromise;
  }
}

