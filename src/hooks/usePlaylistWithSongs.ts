import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';

/**
 * Custom hook for fetching playlist with songs
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function usePlaylistWithSongs(playlistId: string) {
  const playlistPromise = serviceContainer.playlistsRepository.getPlaylistWithSongs(playlistId);
  return use(playlistPromise);
}

