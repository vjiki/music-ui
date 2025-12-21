import type { User, AuthRequest, AuthResponse } from '../../types';

/**
 * Interface for authentication service
 * Follows Interface Segregation Principle (ISP)
 */
export interface IAuthService {
  authenticate(credentials: AuthRequest): Promise<AuthResponse>;
  getUser(userId: string): Promise<User>;
}

