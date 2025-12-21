import { cache } from 'react';
import type { Song } from '../../types';
import type { ISongsService } from '../interfaces/ISongsService';

/**
 * Repository pattern for songs data access
 * Follows Single Responsibility Principle (SRP)
 * Uses React Cache for request deduplication
 */
export class SongsRepository {
  constructor(private readonly songsService: ISongsService) {}

  /**
   * Cached function to get songs
   * React Cache ensures the same request is only made once
   */
  getSongs = cache(async (userId: string): Promise<Song[]> => {
    return this.songsService.getSongs(userId);
  });
}

