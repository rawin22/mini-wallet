// src/api/auth.service.ts

import apiClient from './client';
import { API_CONFIG } from './config';
import type { AuthResponse, LoginRequest, RefreshTokenRequest } from '../types/auth.types';
export const authService = {
  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const payload: LoginRequest = {
      loginId: username,
      password: password,
      callerId: '819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58', // Your actual caller ID  
      ipAddress: '',
      geolocation: '',
      includeUserSettingsInResponse: true,
      includeAccessRightsWithUserSettings: false,
    };

    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      payload
    );

    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(accessToken: string, refreshToken: string): Promise<AuthResponse> {
    const payload: RefreshTokenRequest = {
      accessToken,
      refreshToken,
    };

    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      payload
    );

    return response.data;
  },
};
