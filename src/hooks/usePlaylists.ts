import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';

/**
 * Custom hook for fetching playlists
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function usePlaylists(userId: string) {
  const playlistsPromise = serviceContainer.playlistsRepository.getPlaylists(userId);
  return use(playlistsPromise);
}

