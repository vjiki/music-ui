import axios from 'axios';
import type { ChatListItem } from '../types';
import type { IChatsService } from '../core/interfaces/IChatsService';

const API_BASE_URL = 'https://music-bird.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests
const pendingChatsRequests = new Map<string, Promise<ChatListItem[]>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const chatsResultCache = new Map<string, { data: ChatListItem[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL to prevent rapid re-requests after successful fetch

/**
 * Concrete implementation of IChatsService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class ChatsService implements IChatsService {
  async getChats(userId: string): Promise<ChatListItem[]> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = chatsResultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        chatsResultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    const existingRequest = pendingChatsRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise
      return existingRequest;
    }

    // Create new request and cache it
    const request = api.get<ChatListItem[]>(`/api/v1/chats/user/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        chatsResultCache.set(userId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingChatsRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = chatsResultCache.get(userId);
          if (cached && cached.timestamp === now) {
            chatsResultCache.delete(userId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingChatsRequests.delete(userId);
        chatsResultCache.delete(userId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingChatsRequests.set(userId, request);
    return request;
  }
}

