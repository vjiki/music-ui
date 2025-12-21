import axios from 'axios';
import type { User, AuthRequest, AuthResponse } from '../types';
import type { IAuthService } from '../core/interfaces/IAuthService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache for getUser - prevents multiple simultaneous requests
const pendingGetUserRequests = new Map<string, Promise<User>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const getUserResultCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL to prevent rapid re-requests after successful fetch

/**
 * Concrete implementation of IAuthService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding for getUser
 */
export class AuthService implements IAuthService {
  async authenticate(credentials: AuthRequest): Promise<AuthResponse> {
    // POST request - don't cache authentication
    const response = await api.post<AuthResponse>('/api/v1/auth/authenticate', credentials);
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = getUserResultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        getUserResultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    const existingRequest = pendingGetUserRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise
      return existingRequest;
    }

    // Create new request and cache it
    const request = api.get<User>(`/api/v1/users/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        getUserResultCache.set(userId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingGetUserRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = getUserResultCache.get(userId);
          if (cached && cached.timestamp === now) {
            getUserResultCache.delete(userId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingGetUserRequests.delete(userId);
        getUserResultCache.delete(userId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingGetUserRequests.set(userId, request);
    return request;
  }
}

