// src/utils/storage.ts

import { API_CONFIG } from '../api/config';
import type { TokenData, UserSettings } from '../types/auth.types';

export const storage = {
  // Token management
  setTokens(tokens: TokenData): void {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);

  },

  getExpiresAt(): string | null {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
  },

  // User data management
  setUserData(user: UserSettings): void {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getUserData(): UserSettings | null {
    const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Clear all auth data
  clearAuth(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
  },

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;

    const expiryDate = new Date(expiresAt);
    const now = new Date();

    // Consider expired if within 1 minute of expiry
    const bufferTime = 60 * 1000; // 1 minute in milliseconds
    return now.getTime() >= (expiryDate.getTime() - bufferTime);
  },
};
