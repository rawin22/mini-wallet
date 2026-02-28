import { API_CONFIG } from '../api/config.ts';
import type { TokenData, UserSettings } from '../types/auth.types.ts';

export const storage = {
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

  setUserData(user: UserSettings): void {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  getUserData(): UserSettings | null {
    const data = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  clearAuth(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;
    const bufferMs = 60 * 1000;
    return Date.now() >= new Date(expiresAt).getTime() - bufferMs;
  },
};
