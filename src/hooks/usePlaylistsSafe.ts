import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

// Cache empty promise for invalid users to avoid creating new promises
const EMPTY_PLAYLISTS_PROMISE = Promise.resolve([] as Playlist[]);

/**
 * Safe version of usePlaylists that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function usePlaylistsSafe(userId: string | null): Playlist[] {
  // Always call use() unconditionally - React Cache will handle deduplication
  const playlistsPromise = !userId || userId === 'guest'
    ? EMPTY_PLAYLISTS_PROMISE
    : serviceContainer.playlistsRepository.getPlaylists(userId);
  
  return use(playlistsPromise);
}

