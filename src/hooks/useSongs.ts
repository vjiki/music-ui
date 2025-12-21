import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Song } from '../types';

// Cache empty promise for guest users to avoid creating new promises
const EMPTY_SONGS_PROMISE = Promise.resolve([] as Song[]);

/**
 * Custom hook for fetching songs
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 * 
 * IMPORTANT: The promise must be memoized to prevent React from re-suspending
 * React Cache in the repository handles deduplication, but we need stable promise references
 */
export function useSongs(userId: string): Song[] {
  // Memoize the promise to ensure stable reference across renders
  // React Cache in the repository will deduplicate actual API calls
  const songsPromise = useMemo(() => {
    if (userId === 'guest' || !userId) {
      return EMPTY_SONGS_PROMISE;
    }
    // React Cache in repository ensures same promise for same userId
    return serviceContainer.songsRepository.getSongs(userId);
  }, [userId]);
  
  return use(songsPromise);
}

