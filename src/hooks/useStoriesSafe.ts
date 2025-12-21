import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { Story } from '../types';

/**
 * Safe version of useStories that returns empty array if userId is invalid
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function useStoriesSafe(userId: string | null): Story[] {
  if (!userId) {
    return [];
  }
  
  try {
    const storiesPromise = serviceContainer.storiesRepository.getStories(userId);
    return use(storiesPromise);
  } catch (error) {
    console.error('Failed to load stories:', error);
    return [];
  }
}

