import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Story } from '../types';

/**
 * Safe version of useStories that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function useStoriesSafe(userId: string | null): Story[] {
  // Always call use() unconditionally, but use a cached promise for invalid users
  const storiesPromise = useMemo(() => {
    if (!userId || userId === 'guest') {
      // Return a cached empty promise for invalid users
      return Promise.resolve([] as Story[]);
    }
    // React Cache in the repository will handle deduplication for real users
    return serviceContainer.storiesRepository.getStories(userId);
  }, [userId]);
  
  return use(storiesPromise);
}

