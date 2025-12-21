import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Song } from '../types';

/**
 * Custom hook for fetching songs
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 */
export function useSongs(userId: string): Song[] {
  // Always call use() unconditionally, but use a cached promise for guest users
  const songsPromise = useMemo(() => {
    if (userId === 'guest' || !userId) {
      // Return a cached empty promise for guest users
      return Promise.resolve([] as Song[]);
    }
    // React Cache in the repository will handle deduplication for real users
    return serviceContainer.songsRepository.getSongs(userId);
  }, [userId]);
  
  return use(songsPromise);
}

