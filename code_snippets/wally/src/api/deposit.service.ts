import apiClient from './client';

// Types for deposits
export interface DepositRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  type: 'wire' | 'internal';
  senderBank?: string;
  senderName?: string;
  senderReference?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface DepositSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'Ascending' | 'Descending';
  status?: string;
  currency?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DepositSearchResponse {
  deposits: DepositRecord[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

// Mock data for demo purposes
const mockDeposits: DepositRecord[] = [
  {
    id: 'DEP001',
    reference: 'WD-2024-001234',
    amount: 5000.00,
    currency: 'USD',
    status: 'completed',
    type: 'wire',
    senderBank: 'Citibank',
    senderName: 'John Doe',
    senderReference: 'INV-2024-001',
    createdAt: '2024-01-20T14:30:00Z',
    completedAt: '2024-01-21T09:15:00Z',
  },
  {
    id: 'DEP002',
    reference: 'WD-2024-001235',
    amount: 10000.00,
    currency: 'EUR',
    status: 'completed',
    type: 'wire',
    senderBank: 'Deutsche Bank',
    senderName: 'John Doe',
    senderReference: 'TRANSFER-EUR',
    createdAt: '2024-01-18T10:00:00Z',
    completedAt: '2024-01-19T11:30:00Z',
  },
  {
    id: 'DEP003',
    reference: 'WD-2024-001236',
    amount: 2500.00,
    currency: 'SGD',
    status: 'processing',
    type: 'wire',
    senderBank: 'DBS Bank',
    senderName: 'John Doe',
    createdAt: '2024-01-22T08:45:00Z',
    notes: 'Pending bank confirmation',
  },
  {
    id: 'DEP004',
    reference: 'WD-2024-001237',
    amount: 15000.00,
    currency: 'USD',
    status: 'pending',
    type: 'wire',
    senderBank: 'Bank of America',
    senderName: 'John Doe',
    senderReference: 'WPAY-DEPOSIT',
    createdAt: '2024-01-23T16:20:00Z',
  },
  {
    id: 'DEP005',
    reference: 'WD-2024-001238',
    amount: 3000.00,
    currency: 'GBP',
    status: 'rejected',
    type: 'wire',
    senderBank: 'Barclays',
    senderName: 'Jane Doe',
    createdAt: '2024-01-15T12:00:00Z',
    notes: 'Sender name mismatch',
  },
  {
    id: 'DEP006',
    reference: 'WD-2024-001239',
    amount: 8000.00,
    currency: 'USD',
    status: 'completed',
    type: 'wire',
    senderBank: 'Chase Bank',
    senderName: 'John Doe',
    senderReference: 'Q1-FUNDING',
    createdAt: '2024-01-10T09:30:00Z',
    completedAt: '2024-01-11T14:00:00Z',
  },
];

export const depositService = {
  /**
   * Search deposit records
   */
  async search(request: DepositSearchRequest): Promise<DepositSearchResponse> {
    try {
      const response = await apiClient.post<DepositSearchResponse>(
        '/api/v1/Deposit/Search',
        request
      );
      return response.data;
    } catch {
      // Return mock data for demo
      let filteredDeposits = [...mockDeposits];

      // Apply filters
      if (request.status) {
        filteredDeposits = filteredDeposits.filter(
          (d) => d.status === request.status
        );
      }
      if (request.currency) {
        filteredDeposits = filteredDeposits.filter(
          (d) => d.currency === request.currency
        );
      }

      // Sort
      if (request.sortBy === 'CreatedTime' || request.sortBy === 'createdAt') {
        filteredDeposits.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return request.sortDirection === 'Ascending'
            ? dateA - dateB
            : dateB - dateA;
        });
      }

      // Pagination
      const pageIndex = request.pageIndex || 0;
      const pageSize = request.pageSize || 25;
      const start = pageIndex * pageSize;
      const paginatedDeposits = filteredDeposits.slice(start, start + pageSize);

      return {
        deposits: paginatedDeposits,
        totalCount: filteredDeposits.length,
        pageIndex,
        pageSize,
      };
    }
  },

  /**
   * Get deposit details by ID
   */
  async getById(depositId: string): Promise<DepositRecord | null> {
    try {
      const response = await apiClient.get<DepositRecord>(
        `/api/v1/Deposit/${depositId}`
      );
      return response.data;
    } catch {
      // Return mock data for demo
      return mockDeposits.find((d) => d.id === depositId) || null;
    }
  },
};
