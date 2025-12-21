import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

// Cache empty promise for guest users to avoid creating new promises
const EMPTY_PLAYLISTS_PROMISE = Promise.resolve([] as Playlist[]);

/**
 * Custom hook for fetching playlists
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 * 
 * IMPORTANT: The promise must be memoized to prevent React from re-suspending
 */
export function usePlaylists(userId: string): Playlist[] {
  // Memoize the promise to ensure stable reference across renders
  const playlistsPromise = useMemo(() => {
    if (userId === 'guest' || !userId) {
      return EMPTY_PLAYLISTS_PROMISE;
    }
    // React Cache in repository ensures same promise for same userId
    return serviceContainer.playlistsRepository.getPlaylists(userId);
  }, [userId]);
  
  return use(playlistsPromise);
}

