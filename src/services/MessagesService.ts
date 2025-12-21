import axios from 'axios';
import type { Message } from '../types';
import type { IMessagesService } from '../core/interfaces/IMessagesService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests
// Cache key includes chatId, userId1, and userId2 to handle all params
const pendingMessagesRequests = new Map<string, Promise<Message[]>>();
// Result cache - stores resolved results temporarily to prevent rapid re-requests
const messagesResultCache = new Map<string, { data: Message[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL to prevent rapid re-requests after successful fetch

/**
 * Helper to create cache key for messages requests
 */
function getMessagesCacheKey(chatId: string, userId1: string, userId2: string): string {
  // Sort userIds to ensure same cache key regardless of order
  const sortedUserIds = [userId1, userId2].sort().join('-');
  return `${chatId}-${sortedUserIds}`;
}

/**
 * Concrete implementation of IMessagesService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class MessagesService implements IMessagesService {
  async getMessages(chatId: string, userId1: string, userId2: string): Promise<Message[]> {
    const cacheKey = getMessagesCacheKey(chatId, userId1, userId2);

    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = messagesResultCache.get(cacheKey);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        messagesResultCache.delete(cacheKey);
      }
    }

    // Check if there's already a pending request for this cache key
    const existingRequest = pendingMessagesRequests.get(cacheKey);
    if (existingRequest) {
      // Cache hit - return existing promise
      return existingRequest;
    }

    // Create new request and cache it
    const request = api.get<Message[]>(`/api/v1/messages/chat/${chatId}`, {
      params: { userId1, userId2 },
    })
      .then((response) => {
        const now = Date.now();
        const filteredData = response.data.filter((msg) => !msg.isDeleted);
        // Store result in cache IMMEDIATELY before removing from pending
        messagesResultCache.set(cacheKey, { data: filteredData, timestamp: now });
        // Remove from pending cache after completion
        pendingMessagesRequests.delete(cacheKey);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = messagesResultCache.get(cacheKey);
          if (cached && cached.timestamp === now) {
            messagesResultCache.delete(cacheKey);
          }
        }, CACHE_TTL);
        return filteredData;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingMessagesRequests.delete(cacheKey);
        messagesResultCache.delete(cacheKey);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingMessagesRequests.set(cacheKey, request);
    return request;
  }
}

