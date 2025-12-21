import axios from 'axios';
import type { Song } from '../types';
import type { ISongsService } from '../core/interfaces/ISongsService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Concrete implementation of ISongsService
 * Follows Dependency Inversion Principle (DIP)
 */
export class SongsService implements ISongsService {
  async getSongs(userId: string): Promise<Song[]> {
    const response = await api.get<Song[]>(`/api/v1/songs/${userId}`);
    return response.data;
  }
}

