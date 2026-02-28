import { apiClient } from './client.ts';
import { API_CONFIG } from './config.ts';
import type { FxDealSearchResponse } from '../types/fx.types.ts';

export const fxHistoryService = {
  async searchDeals(): Promise<FxDealSearchResponse> {
    const response = await apiClient.get<FxDealSearchResponse>(
      API_CONFIG.ENDPOINTS.FX.DEAL_SEARCH,
      {
        params: {
          PageIndex: 0,
          PageSize: 50,
          SortBy: 'BookedTime',
          SortDirection: 'Descending',
        },
      },
    );
    return response.data;
  },
};
