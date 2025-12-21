import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Story } from '../types';

// Cache empty promise for invalid users to avoid creating new promises
const EMPTY_STORIES_PROMISE = Promise.resolve([] as Story[]);

/**
 * Safe version of useStories that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function useStoriesSafe(userId: string | null): Story[] {
  // Always call use() unconditionally - React Cache will handle deduplication
  const storiesPromise = !userId || userId === 'guest'
    ? EMPTY_STORIES_PROMISE
    : serviceContainer.storiesRepository.getStories(userId);
  
  return use(storiesPromise);
}

