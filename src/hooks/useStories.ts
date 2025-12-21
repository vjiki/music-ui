import { use } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';

/**
 * Custom hook for fetching stories
 * Uses React 19's use() hook for promise handling
 * Leverages React Cache through repository pattern
 */
export function useStories(userId: string) {
  const storiesPromise = serviceContainer.storiesRepository.getStories(userId);
  return use(storiesPromise);
}

