import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

// Cache empty promise for guest users to avoid creating new promises
const EMPTY_PLAYLISTS_PROMISE = Promise.resolve([] as Playlist[]);

/**
 * Custom hook for fetching playlists
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 */
export function usePlaylists(userId: string): Playlist[] {
  // Always call use() unconditionally - React Cache will handle deduplication
  const playlistsPromise = userId === 'guest' || !userId
    ? EMPTY_PLAYLISTS_PROMISE
    : serviceContainer.playlistsRepository.getPlaylists(userId);
  
  return use(playlistsPromise);
}

