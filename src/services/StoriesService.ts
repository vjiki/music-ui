import axios from 'axios';
import type { Story } from '../types';
import type { IStoriesService } from '../core/interfaces/IStoriesService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://music-back-g2u6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Concrete implementation of IStoriesService
 * Follows Dependency Inversion Principle (DIP)
 */
export class StoriesService implements IStoriesService {
  async getStories(userId: string): Promise<Story[]> {
    const response = await api.get<Story[]>(`/api/v1/stories/user/${userId}`);
    return response.data;
  }
}

