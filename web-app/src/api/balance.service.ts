import { apiClient } from './client.ts';
import { API_CONFIG } from './config.ts';
import type { BalanceResponse } from '../types/balance.types.ts';

export const balanceService = {
  async getBalances(customerId: string): Promise<BalanceResponse> {
    const response = await apiClient.get<BalanceResponse>(
      `${API_CONFIG.ENDPOINTS.CUSTOMER.BALANCES}/${customerId}`,
    );
    return response.data;
  },
};
