import { cache } from 'react';
import type { User, AuthRequest, AuthResponse } from '../../types';
import type { IAuthService } from '../interfaces/IAuthService';

/**
 * Repository pattern for authentication data access
 * Follows Single Responsibility Principle (SRP)
 * Uses React Cache for request deduplication
 */
export class AuthRepository {
  constructor(private readonly authService: IAuthService) {}

  authenticate = async (credentials: AuthRequest): Promise<AuthResponse> => {
    return this.authService.authenticate(credentials);
  };

  getUser = cache(async (userId: string): Promise<User> => {
    return this.authService.getUser(userId);
  });
}

