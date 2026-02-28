// src/types/auth.types.ts

export interface LoginRequest {
  loginId: string;
  password: string;
  callerId?: string;
  ipAddress?: string;
  geolocation?: string;
  includeUserSettingsInResponse?: boolean;
  includeAccessRightsWithUserSettings?: boolean;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
}

export interface UserSettings {
  userId: string;
  userName: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  fax?: string;
  emailAddress: string;
  wkycId?: string;
  preferredLanguage: string;
  cultureCode: string;
  isEnabled: boolean;
  isLockedOut: boolean;
  userMustChangePassword: boolean;
}

export interface AuthResponse {
  tokens: TokenData;
  userSettings: UserSettings;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: UserSettings | null;
  tokens: TokenData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}
