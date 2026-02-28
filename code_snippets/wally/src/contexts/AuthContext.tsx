// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthContextType, UserSettings, TokenData } from '../types/auth.types';
import { authService } from '../api/auth.service';
import { storage } from '../utils/storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout and refreshToken must be defined before the effects that use them
  const logout = useCallback((): void => {
    storage.clearAuth();
    setUser(null);
    setTokens(null);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const accessToken = storage.getAccessToken();
      const refreshTokenValue = storage.getRefreshToken();

      if (!accessToken || !refreshTokenValue) {
        logout();
        return false;
      }

      const response = await authService.refreshToken(accessToken, refreshTokenValue);

      if (response.tokens) {
        storage.setTokens(response.tokens);
        setTokens(response.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  }, [logout]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = storage.getUserData();
      const storedToken = storage.getAccessToken();
      const storedRefreshToken = storage.getRefreshToken();
      const storedExpiresAt = storage.getExpiresAt();

      if (storedUser && storedToken && storedRefreshToken && storedExpiresAt) {
        setUser(storedUser);
        setTokens({
          accessToken: storedToken,
          refreshToken: storedRefreshToken,
          expiresAt: storedExpiresAt,
        });

        // Check if token needs refresh
        if (storage.isTokenExpired()) {
          await refreshToken();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [refreshToken]);

  // Periodic token expiration check (every 30 seconds)
  useEffect(() => {
    if (!user || !tokens) return;

    const checkTokenExpiration = () => {
      if (storage.isTokenExpired()) {
        console.log('🔄 Token expired, refreshing...');
        refreshToken();
      }
    };

    // Check every 30 seconds
    const intervalId = setInterval(checkTokenExpiration, 30000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [user, tokens, refreshToken]);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(username, password);

      if (!response.tokens || !response.userSettings) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user data
      storage.setTokens(response.tokens);
      storage.setUserData(response.userSettings);

      // Update state
      setTokens(response.tokens);
      setUser(response.userSettings);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
