import axios from 'axios';
import type { SongLikeRequest } from '../types';
import type { ISongLikesService } from '../core/interfaces/ISongLikesService';

const API_BASE_URL = 'https://music-bird.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Concrete implementation of ISongLikesService
 * Follows Dependency Inversion Principle (DIP)
 */
export class SongLikesService implements ISongLikesService {
  async likeSong(request: SongLikeRequest): Promise<void> {
    await api.post('/api/v1/song-likes/like', request);
  }

  async dislikeSong(request: SongLikeRequest): Promise<void> {
    await api.post('/api/v1/song-likes/dislike', request);
  }
}

