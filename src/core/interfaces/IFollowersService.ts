import type { Follower } from '../../types';

/**
 * Interface for followers service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IFollowersService {
  getFollowers(userId: string): Promise<Follower[]>;
}

