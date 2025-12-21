import axios from 'axios';
import type { Follower } from '../types';
import type { IFollowersService } from '../core/interfaces/IFollowersService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests
const pendingFollowersRequests = new Map<string, Promise<Follower[]>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const followersResultCache = new Map<string, { data: Follower[]; timestamp: number }>();
const CACHE_TTL = 5000; // 5 second cache TTL to prevent rapid re-requests after successful fetch

/**
 * Concrete implementation of IFollowersService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class FollowersService implements IFollowersService {
  async getFollowers(userId: string): Promise<Follower[]> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = followersResultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        followersResultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    const existingRequest = pendingFollowersRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise
      return existingRequest;
    }

    // Create new request and cache it
    const request = api.get<Follower[]>(`/api/v1/followers/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        followersResultCache.set(userId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingFollowersRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = followersResultCache.get(userId);
          if (cached && cached.timestamp === now) {
            followersResultCache.delete(userId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingFollowersRequests.delete(userId);
        followersResultCache.delete(userId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingFollowersRequests.set(userId, request);
    return request;
  }
}

