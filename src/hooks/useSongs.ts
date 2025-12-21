import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Song } from '../types';

// Cache empty promise for guest users to avoid creating new promises
const EMPTY_SONGS_PROMISE = Promise.resolve([] as Song[]);

/**
 * Custom hook for fetching songs
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Skips API calls for guest users
 */
export function useSongs(userId: string): Song[] {
  // Always call use() unconditionally - React Cache will handle deduplication
  const songsPromise = userId === 'guest' || !userId
    ? EMPTY_SONGS_PROMISE
    : serviceContainer.songsRepository.getSongs(userId);
  
  return use(songsPromise);
}

