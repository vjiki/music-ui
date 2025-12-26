import { use, useMemo } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Short } from '../types';

// Cache empty promise for guest users to avoid creating new promises
const EMPTY_SHORTS_PROMISE = Promise.resolve([] as Short[]);

/**
 * Custom hook for fetching shorts
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through service pattern
 * 
 * IMPORTANT: The promise must be memoized to prevent React from re-suspending
 * React Cache in the service handles deduplication, but we need stable promise references
 */
export function useShorts(userId: string): Short[] {
  // Memoize the promise to ensure stable reference across renders
  // React Cache in the service will deduplicate actual API calls
  const shortsPromise = useMemo(() => {
    if (!userId) {
      return EMPTY_SHORTS_PROMISE;
    }
    // Use the provided userId for API calls
    // React Cache in service ensures same promise for same userId
    return serviceContainer.shortsService.getShorts(userId);
  }, [userId]);
  
  return use(shortsPromise);
}

