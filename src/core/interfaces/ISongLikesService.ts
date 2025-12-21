import type { SongLikeRequest } from '../../types';

/**
 * Interface for song likes service
 * Follows Interface Segregation Principle (ISP)
 */
export interface ISongLikesService {
  likeSong(request: SongLikeRequest): Promise<void>;
  dislikeSong(request: SongLikeRequest): Promise<void>;
}
