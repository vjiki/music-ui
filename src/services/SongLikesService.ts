import axios from 'axios';
import type { SongLikeRequest, SongLikeResponse } from '../types';
import type { ISongLikesService } from '../core/interfaces/ISongLikesService';

// In development, use proxy (no CORS needed)
// In production, use full URL (CORS required)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? '' : 'https://music-back-g2u6.onrender.com');

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

  async getLikeDislikeInfo(songId: string, userId: string): Promise<SongLikeResponse> {
    const response = await api.get<SongLikeResponse>(`/api/v1/song-likes/song/${songId}/user/${userId}`);
    return response.data;
  }
}

