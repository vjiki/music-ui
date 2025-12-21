import axios from 'axios';
import type { Follower } from '../types';
import type { IFollowersService } from '../core/interfaces/IFollowersService';

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
 * Concrete implementation of IFollowersService
 * Follows Dependency Inversion Principle (DIP)
 */
export class FollowersService implements IFollowersService {
  async getFollowers(userId: string): Promise<Follower[]> {
    const response = await api.get<Follower[]>(`/api/v1/followers/${userId}`);
    return response.data;
  }
}

