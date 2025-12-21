import type { Song } from '../../types';

/**
 * Interface for songs service
 * Follows Interface Segregation Principle (ISP)
 */
export interface ISongsService {
  getSongs(userId: string): Promise<Song[]>;
}

