import axios from 'axios';
import type { Story } from '../types';
import type { IStoriesService } from '../core/interfaces/IStoriesService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests
const pendingStoriesRequests = new Map<string, Promise<Story[]>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const storiesResultCache = new Map<string, { data: Story[]; timestamp: number }>();
const CACHE_TTL = 5000; // 5 second cache TTL to prevent rapid re-requests after successful fetch

// Track request counts for debugging (can be removed in production)
if (typeof window !== 'undefined' && (window as any).__DEV__) {
  (window as any).__storiesRequestCount = 0;
  (window as any).__storiesCacheHits = 0;
  (window as any).__storiesResultCacheHits = 0;
}

/**
 * Concrete implementation of IStoriesService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class StoriesService implements IStoriesService {
  async getStories(userId: string): Promise<Story[]> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = storiesResultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          (window as any).__storiesResultCacheHits = ((window as any).__storiesResultCacheHits || 0) + 1;
        }
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        storiesResultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    const existingRequest = pendingStoriesRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        (window as any).__storiesCacheHits = ((window as any).__storiesCacheHits || 0) + 1;
      }
      return existingRequest;
    }

    // Create new request and cache it
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      (window as any).__storiesRequestCount = ((window as any).__storiesRequestCount || 0) + 1;
    }

    const request = api.get<Story[]>(`/api/v1/stories/user/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        storiesResultCache.set(userId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingStoriesRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = storiesResultCache.get(userId);
          if (cached && cached.timestamp === now) {
            storiesResultCache.delete(userId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingStoriesRequests.delete(userId);
        storiesResultCache.delete(userId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingStoriesRequests.set(userId, request);
    return request;
  }
}

