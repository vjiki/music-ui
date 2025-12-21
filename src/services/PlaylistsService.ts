import axios from 'axios';
import type { Playlist, PlaylistWithSongs } from '../types';
import type { IPlaylistsService } from '../core/interfaces/IPlaylistsService';

const API_BASE_URL = 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request deduplication cache - prevents multiple simultaneous requests
// Using WeakMap would be better but we need string keys, so Map is fine
// This is module-level, so it persists across all instances
const pendingPlaylistsRequests = new Map<string, Promise<Playlist[]>>();
const pendingPlaylistWithSongsRequests = new Map<string, Promise<PlaylistWithSongs>>();

// Result cache - stores resolved results temporarily to prevent rapid re-requests
const playlistsResultCache = new Map<string, { data: Playlist[]; timestamp: number }>();
const playlistWithSongsResultCache = new Map<string, { data: PlaylistWithSongs; timestamp: number }>();
const CACHE_TTL = 60000; // 60 second cache TTL to prevent rapid re-requests after successful fetch

// Track request counts for debugging (can be removed in production)
if (typeof window !== 'undefined' && (window as any).__DEV__) {
  (window as any).__playlistsRequestCount = 0;
  (window as any).__playlistsCacheHits = 0;
  (window as any).__playlistsResultCacheHits = 0;
  (window as any).__playlistWithSongsRequestCount = 0;
  (window as any).__playlistWithSongsCacheHits = 0;
  (window as any).__playlistWithSongsResultCacheHits = 0;
}

/**
 * Concrete implementation of IPlaylistsService
 * Follows Dependency Inversion Principle (DIP)
 * Includes request deduplication to prevent flooding
 */
export class PlaylistsService implements IPlaylistsService {
  async getPlaylists(userId: string): Promise<Playlist[]> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = playlistsResultCache.get(userId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          (window as any).__playlistsResultCacheHits = ((window as any).__playlistsResultCacheHits || 0) + 1;
        }
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        playlistsResultCache.delete(userId);
      }
    }

    // Check if there's already a pending request for this userId
    const existingRequest = pendingPlaylistsRequests.get(userId);
    if (existingRequest) {
      // Cache hit - return existing promise
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        (window as any).__playlistsCacheHits = ((window as any).__playlistsCacheHits || 0) + 1;
      }
      return existingRequest;
    }

    // Create new request and cache it
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      (window as any).__playlistsRequestCount = ((window as any).__playlistsRequestCount || 0) + 1;
    }

    const request = api.get<Playlist[]>(`/api/v1/playlists/user/${userId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        playlistsResultCache.set(userId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingPlaylistsRequests.delete(userId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = playlistsResultCache.get(userId);
          if (cached && cached.timestamp === now) {
            playlistsResultCache.delete(userId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingPlaylistsRequests.delete(userId);
        playlistsResultCache.delete(userId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingPlaylistsRequests.set(userId, request);
    return request;
  }

  async getPlaylistWithSongs(playlistId: string): Promise<PlaylistWithSongs> {
    // First check result cache (prevents rapid re-requests after successful fetch)
    const cachedResult = playlistWithSongsResultCache.get(playlistId);
    if (cachedResult) {
      const age = Date.now() - cachedResult.timestamp;
      if (age < CACHE_TTL) {
        // Return cached result immediately - no API call needed
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          (window as any).__playlistWithSongsResultCacheHits = ((window as any).__playlistWithSongsResultCacheHits || 0) + 1;
        }
        return Promise.resolve(cachedResult.data);
      } else {
        // Cache expired, remove it
        playlistWithSongsResultCache.delete(playlistId);
      }
    }

    // Check if there's already a pending request for this playlistId
    const existingRequest = pendingPlaylistWithSongsRequests.get(playlistId);
    if (existingRequest) {
      // Cache hit - return existing promise
      if (typeof window !== 'undefined' && (window as any).__DEV__) {
        (window as any).__playlistWithSongsCacheHits = ((window as any).__playlistWithSongsCacheHits || 0) + 1;
      }
      return existingRequest;
    }

    // Create new request and cache it
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      (window as any).__playlistWithSongsRequestCount = ((window as any).__playlistWithSongsRequestCount || 0) + 1;
    }

    const request = api.get<PlaylistWithSongs>(`/api/v1/playlists/${playlistId}`)
      .then((response) => {
        const now = Date.now();
        // Store result in cache IMMEDIATELY before removing from pending
        playlistWithSongsResultCache.set(playlistId, { data: response.data, timestamp: now });
        // Remove from pending cache after completion
        pendingPlaylistWithSongsRequests.delete(playlistId);
        // Clean up result cache after TTL expires
        setTimeout(() => {
          const cached = playlistWithSongsResultCache.get(playlistId);
          if (cached && cached.timestamp === now) {
            playlistWithSongsResultCache.delete(playlistId);
          }
        }, CACHE_TTL);
        return response.data;
      })
      .catch((error) => {
        // Remove from cache on error
        pendingPlaylistWithSongsRequests.delete(playlistId);
        playlistWithSongsResultCache.delete(playlistId);
        throw error;
      });

    // Cache the pending request BEFORE returning
    pendingPlaylistWithSongsRequests.set(playlistId, request);
    return request;
  }
}
