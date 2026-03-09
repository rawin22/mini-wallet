import { apiClient } from './client.ts';
import { API_CONFIG } from './config.ts';
import type { StatementResponse } from '../types/statement.types.ts';

export const statementService = {
  async getStatement(
    accountId: string,
    startDate: string,
    endDate: string,
  ): Promise<StatementResponse> {
    const response = await apiClient.get<StatementResponse>(
      API_CONFIG.ENDPOINTS.CUSTOMER.STATEMENT,
      { params: { accountId, strStartDate: startDate, strEndDate: endDate } },
    );
    return response.data;
  },
};
