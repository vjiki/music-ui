import axios from 'axios';
import type { User, AuthRequest, AuthResponse } from '../types';
import type { IAuthService } from '../core/interfaces/IAuthService';

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
 * Concrete implementation of IAuthService
 * Follows Dependency Inversion Principle (DIP)
 */
export class AuthService implements IAuthService {
  async authenticate(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/authenticate', credentials);
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response = await api.get<User>(`/api/v1/users/${userId}`);
    return response.data;
  }
}

