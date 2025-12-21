import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

/**
 * Safe version of usePlaylists that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function usePlaylistsSafe(userId: string | null): Playlist[] {
  // Always call use() unconditionally, but use a cached promise for invalid users
  const playlistsPromise = useMemo(() => {
    if (!userId || userId === 'guest') {
      // Return a cached empty promise for invalid users
      return Promise.resolve([] as Playlist[]);
    }
    // React Cache in the repository will handle deduplication for real users
    return serviceContainer.playlistsRepository.getPlaylists(userId);
  }, [userId]);
  
  return use(playlistsPromise);
}

