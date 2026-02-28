import apiClient from './client';
import { API_CONFIG } from './config';
import type { StatementResponse } from '../types/statement.types';

// Helper: Format date to yyyy-MM-dd
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const statementService = {
  async getStatement(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StatementResponse> {
    const strStartDate = formatDateForAPI(startDate);
    const strEndDate = formatDateForAPI(endDate);

    const response = await apiClient.get<StatementResponse>(
      API_CONFIG.ENDPOINTS.CUSTOMER.STATEMENT,
      {
        params: {
          accountId,
          strStartDate,
          strEndDate,
        },
      }
    );

    return response.data;
  },
};
