import type { Short } from '../../types';

/**
 * Interface for Shorts Service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IShortsService {
  /**
   * Fetches shorts for a given user ID
   * @param userId - The user ID to fetch shorts for
   * @returns Promise resolving to an array of Short objects
   */
  getShorts(userId: string): Promise<Short[]>;
}

