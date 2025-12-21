import { cache } from 'react';
import type { Story } from '../../types';
import type { IStoriesService } from '../interfaces/IStoriesService';

/**
 * Repository pattern for stories data access
 * Follows Single Responsibility Principle (SRP)
 * Uses React Cache for request deduplication
 */
export class StoriesRepository {
  constructor(private readonly storiesService: IStoriesService) {}

  getStories = cache(async (userId: string): Promise<Story[]> => {
    return this.storiesService.getStories(userId);
  });
}

