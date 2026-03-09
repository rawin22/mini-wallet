import { API_CONFIG } from '../api/config.ts';
import type { TokenData, UserSettings } from '../types/auth.types.ts';

interface SavedCredentials {
  username: string;
  password: string;
}

const CREDENTIALS_CIPHER_KEY = import.meta.env.VITE_LOCAL_CREDENTIALS_SECRET || 'mini-wallet-local-key';

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (base64Value: string): string => {
  const binary = atob(base64Value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
};

const transformWithKey = (value: string, direction: 'encrypt' | 'decrypt'): string => {
  if (!value) return '';

  const input = direction === 'encrypt' ? value : fromBase64(value);
  let transformed = '';
  const modulo = 65535;

  for (let index = 0; index < input.length; index += 1) {
    const sourceCode = input.charCodeAt(index);
    const keyCode = CREDENTIALS_CIPHER_KEY.charCodeAt(index % CREDENTIALS_CIPHER_KEY.length);
    const shiftedCode =
      direction === 'encrypt'
        ? (sourceCode + keyCode) % modulo
        : (sourceCode - keyCode + modulo) % modulo;
    transformed += String.fromCharCode(shiftedCode);
  }

  return direction === 'encrypt' ? toBase64(transformed) : transformed;
};

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

  saveCredentials(username: string, password: string): void {
    const payload: SavedCredentials = {
      username: transformWithKey(username, 'encrypt'),
      password: transformWithKey(password, 'encrypt'),
    };
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.ENCRYPTED_CREDENTIALS, JSON.stringify(payload));
  },

  getSavedCredentials(): SavedCredentials | null {
    const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ENCRYPTED_CREDENTIALS);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<SavedCredentials>;
      if (!parsed.username || !parsed.password) return null;

      return {
        username: transformWithKey(parsed.username, 'decrypt'),
        password: transformWithKey(parsed.password, 'decrypt'),
      };
    } catch {
      return null;
    }
  },

  clearSavedCredentials(): void {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ENCRYPTED_CREDENTIALS);
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;
    const bufferMs = 60 * 1000;
    return Date.now() >= new Date(expiresAt).getTime() - bufferMs;
  },
};
