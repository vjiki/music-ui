import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Playlist } from '../types';

/**
 * Safe version of usePlaylists that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function usePlaylistsSafe(userId: string | null): Playlist[] {
  if (!userId) {
    return [];
  }
  
  try {
    const playlistsPromise = serviceContainer.playlistsRepository.getPlaylists(userId);
    return use(playlistsPromise);
  } catch (error) {
    console.error('Failed to load playlists:', error);
    return [];
  }
}

