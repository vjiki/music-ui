import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

// Cache empty promise for invalid users to avoid creating new promises
const EMPTY_PLAYLISTS_PROMISE = Promise.resolve([] as Playlist[]);

/**
 * Safe version of usePlaylists that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Makes API calls for guest users using the guest user ID
 * 
 * IMPORTANT: The promise must be memoized to prevent React from re-suspending
 */
export function usePlaylistsSafe(userId: string | null): Playlist[] {
  // Memoize the promise to ensure stable reference across renders
  const playlistsPromise = useMemo(() => {
    if (!userId) {
      return EMPTY_PLAYLISTS_PROMISE;
    }
    // Use the provided userId (including guest user ID) for API calls
    // React Cache in repository ensures same promise for same userId
    return serviceContainer.playlistsRepository.getPlaylists(userId);
  }, [userId]);
  
  return use(playlistsPromise);
}

