import { apiClient } from './client.ts';
import { API_CONFIG } from './config.ts';
import type { PaymentSearchResponse } from '../types/payment.types.ts';

export const paymentHistoryService = {
  async searchPayments(): Promise<PaymentSearchResponse> {
    const response = await apiClient.get<PaymentSearchResponse>(
      API_CONFIG.ENDPOINTS.INSTANT_PAYMENT.SEARCH,
      {
        params: {
          PageIndex: 0,
          PageSize: 25,
          SortBy: 'CreatedTime',
          SortDirection: 'Descending',
        },
      },
    );
    return response.data;
  },
};
