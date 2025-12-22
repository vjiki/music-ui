import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Story } from '../types';

// Cache empty promise for invalid users to avoid creating new promises
const EMPTY_STORIES_PROMISE = Promise.resolve([] as Story[]);

/**
 * Safe version of useStories that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 * Makes API calls for guest users using the guest user ID
 * 
 * IMPORTANT: The promise must be memoized to prevent React from re-suspending
 */
export function useStoriesSafe(userId: string | null): Story[] {
  // Memoize the promise to ensure stable reference across renders
  const storiesPromise = useMemo(() => {
    if (!userId) {
      return EMPTY_STORIES_PROMISE;
    }
    // Use the provided userId (including guest user ID) for API calls
    // React Cache in repository ensures same promise for same userId
    return serviceContainer.storiesRepository.getStories(userId);
  }, [userId]);
  
  return use(storiesPromise);
}

