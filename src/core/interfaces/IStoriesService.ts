import type { Story } from '../../types';

/**
 * Interface for stories service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IStoriesService {
  getStories(userId: string): Promise<Story[]>;
}

