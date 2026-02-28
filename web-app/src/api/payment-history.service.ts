import { apiClient } from './client.ts';
import { API_CONFIG } from './config.ts';
import type { PaymentSearchResponse } from '../types/payment.types.ts';

export const paymentHistoryService = {
  async searchPayments(
    startDate: string,
    endDate: string,
  ): Promise<PaymentSearchResponse> {
    const response = await apiClient.get<PaymentSearchResponse>(
      API_CONFIG.ENDPOINTS.INSTANT_PAYMENT.SEARCH,
      {
        params: {
          PageIndex: 0,
          PageSize: 50,
          ValueDateMin: startDate,
          ValueDateMax: endDate,
          SortBy: 'CreatedTime',
          SortDirection: 'Descending',
        },
      },
    );
    return response.data;
  },
};
