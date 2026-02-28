// FX Deal Types

export interface FXDeal {
  dealId: string;
  dealReference: string;
  sellCurrency: string;
  buyCurrency: string;
  sellAmount: number;
  buyAmount: number;
  exchangeRate: number;
  inverseRate: number;
  status: string;
  createdAt: string;
  settledAt?: string;
  quoteId?: string;
  customerId?: string;
}

export interface FXDealSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'Ascending' | 'Descending';
  status?: string;
  fromDate?: string;
  toDate?: string;
  sellCurrency?: string;
  buyCurrency?: string;
}

export interface FXDealSearchResponse {
  deals: FXDeal[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  problems: null | Array<{ code: string; message: string; severity: string }>;
}

export interface FXDealDetailResponse {
  deal: FXDeal;
  problems: null | Array<{ code: string; message: string; severity: string }>;
}
