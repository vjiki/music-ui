import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';

/**
 * Custom hook for fetching songs
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function useSongs(userId: string) {
  const songsPromise = serviceContainer.songsRepository.getSongs(userId);
  return use(songsPromise);
}

