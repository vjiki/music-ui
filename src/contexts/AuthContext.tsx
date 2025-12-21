import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { serviceContainer } from '../core/di/ServiceContainer';
import type { User, AuthRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: AuthRequest) => Promise<void>;
  signOut: () => void;
  currentUserId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('bird_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('bird_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (credentials: AuthRequest) => {
    try {
      const authResponse = await serviceContainer.authRepository.authenticate(credentials);
      if (authResponse.authenticated) {
        const userData = await serviceContainer.authRepository.getUser(authResponse.userId);
        setUser(userData);
        localStorage.setItem('bird_user', JSON.stringify(userData));
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('bird_user');
  };

  const currentUserId = user?.id || 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
        currentUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

