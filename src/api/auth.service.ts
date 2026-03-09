import { apiClient } from './client.ts';
import { API_CONFIG, getActiveCallerId } from './config.ts';
import type { AuthResponse, RefreshTokenRequest } from '../types/auth.types.ts';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        loginId: username,
        password: password,
        callerId: getActiveCallerId(),
        includeUserSettingsInResponse: true,
        includeAccessRightsWithUserSettings: false,
      },
    );
    return response.data;
  },

  async refreshToken(accessToken: string, refreshToken: string): Promise<AuthResponse> {
    const payload: RefreshTokenRequest = { accessToken, refreshToken };
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      payload,
    );
    return response.data;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch(API_CONFIG.ENDPOINTS.USER.PASSWORD_CHANGE, {
      userId,
      oldPassword,
      newPassword,
    });
  },
};
