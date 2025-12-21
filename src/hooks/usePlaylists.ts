import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

/**
 * Custom hook for fetching playlists
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 */
export function usePlaylists(userId: string): Playlist[] {
  // Always call use() unconditionally, but use a cached promise for guest users
  const playlistsPromise = useMemo(() => {
    if (userId === 'guest' || !userId) {
      // Return a cached empty promise for guest users
      return Promise.resolve([] as Playlist[]);
    }
    // React Cache in the repository will handle deduplication for real users
    return serviceContainer.playlistsRepository.getPlaylists(userId);
  }, [userId]);
  
  return use(playlistsPromise);
}

