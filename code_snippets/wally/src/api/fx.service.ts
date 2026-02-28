import type { FXQuote, FXQuoteResponse, ExchangeRate } from '../types/wire-payment.types';
import type { FXDeal, FXDealSearchRequest, FXDealSearchResponse } from '../types/fx.types';
import { getExchangeRate, calculateFXAmount, MOCK_EXCHANGE_RATES } from '../data/paymentReference';

// Mock FX deal history for demo
const MOCK_FX_DEALS: FXDeal[] = [
  {
    dealId: 'FXD1001',
    dealReference: 'FXD1737900000001',
    sellCurrency: 'USD',
    buyCurrency: 'EUR',
    sellAmount: 5000,
    buyAmount: 4600,
    exchangeRate: 0.92,
    inverseRate: 1.087,
    status: 'Settled',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1002',
    dealReference: 'FXD1737800000002',
    sellCurrency: 'EUR',
    buyCurrency: 'GBP',
    sellAmount: 2000,
    buyAmount: 1720,
    exchangeRate: 0.86,
    inverseRate: 1.163,
    status: 'Settled',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1003',
    dealReference: 'FXD1737700000003',
    sellCurrency: 'GBP',
    buyCurrency: 'USD',
    sellAmount: 1000,
    buyAmount: 1270,
    exchangeRate: 1.27,
    inverseRate: 0.787,
    status: 'Settled',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1004',
    dealReference: 'FXD1737600000004',
    sellCurrency: 'USD',
    buyCurrency: 'JPY',
    sellAmount: 3000,
    buyAmount: 448500,
    exchangeRate: 149.5,
    inverseRate: 0.00669,
    status: 'Settled',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1005',
    dealReference: 'FXD1737500000005',
    sellCurrency: 'EUR',
    buyCurrency: 'USD',
    sellAmount: 10000,
    buyAmount: 10900,
    exchangeRate: 1.09,
    inverseRate: 0.917,
    status: 'Settled',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1006',
    dealReference: 'FXD1737400000006',
    sellCurrency: 'USD',
    buyCurrency: 'SGD',
    sellAmount: 2500,
    buyAmount: 3350,
    exchangeRate: 1.34,
    inverseRate: 0.746,
    status: 'Settled',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    dealId: 'FXD1007',
    dealReference: 'FXD1737300000007',
    sellCurrency: 'GBP',
    buyCurrency: 'EUR',
    sellAmount: 5000,
    buyAmount: 5800,
    exchangeRate: 1.16,
    inverseRate: 0.862,
    status: 'Cancelled',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export interface FXQuoteRequest {
  sellCurrency: string;
  buyCurrency: string;
  sellAmount?: number;
  buyAmount?: number;
}

export interface FXBookResponse {
  quoteId: string;
  dealId: string;
  status: string;
  bookedAt: string;
  settledAt?: string;
  problems: null | Array<{ code: string; message: string; severity: string }>;
}

export const fxService = {
  /**
   * Search FX deals (history)
   */
  async searchDeals(request: FXDealSearchRequest): Promise<FXDealSearchResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post(API_CONFIG.ENDPOINTS.FXDEAL.SEARCH, request);
      // return response.data;

      let deals = [...MOCK_FX_DEALS];

      // Apply filters
      if (request.status) {
        deals = deals.filter((d) => d.status.toLowerCase() === request.status!.toLowerCase());
      }

      if (request.sellCurrency) {
        deals = deals.filter((d) => d.sellCurrency === request.sellCurrency);
      }

      if (request.buyCurrency) {
        deals = deals.filter((d) => d.buyCurrency === request.buyCurrency);
      }

      // Sort
      if (request.sortDirection === 'Ascending') {
        deals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Paginate
      const pageIndex = request.pageIndex || 0;
      const pageSize = request.pageSize || 25;
      const start = pageIndex * pageSize;
      const paginatedDeals = deals.slice(start, start + pageSize);

      return {
        deals: paginatedDeals,
        totalCount: deals.length,
        pageIndex,
        pageSize,
        problems: null,
      };
    } catch (error) {
      console.error('Error searching FX deals:', error);
      throw error;
    }
  },

  /**
   * Get FX deal details
   */
  async getDealDetails(dealId: string): Promise<FXDeal | null> {
    try {
      // In production, call API:
      // const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FXDEAL.DETAILS}/${dealId}`);
      // return response.data;

      return MOCK_FX_DEALS.find((d) => d.dealId === dealId) || null;
    } catch (error) {
      console.error('Error getting FX deal details:', error);
      throw error;
    }
  },

  /**
   * Get exchange rate for a currency pair (synchronous preview)
   */
  getPreviewRate(baseCurrency: string, quoteCurrency: string): number {
    if (baseCurrency === quoteCurrency) return 1;
    return MOCK_EXCHANGE_RATES[baseCurrency]?.[quoteCurrency] || 1;
  },

  /**
   * Get exchange rate for a currency pair (async API call)
   */
  async getExchangeRate(baseCurrency: string, quoteCurrency: string): Promise<ExchangeRate> {
    try {
      // In production, call API:
      // const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.EXCHANGE_RATE.TABLE_RATE}/${baseCurrency}/${quoteCurrency}`);
      // return response.data;

      const rate = getExchangeRate(baseCurrency, quoteCurrency);
      return {
        baseCurrency,
        quoteCurrency,
        rate,
        inverseRate: 1 / rate,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      throw error;
    }
  },

  /**
   * Create an FX quote with expiry timer
   */
  async createQuote(request: FXQuoteRequest): Promise<FXQuoteResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post(API_CONFIG.ENDPOINTS.FXDEAL.QUOTE_CREATE, request);
      // return response.data;

      const { sellCurrency, buyCurrency, sellAmount, buyAmount } = request;

      let calc;
      if (sellAmount) {
        calc = calculateFXAmount(sellCurrency, buyCurrency, sellAmount, 'sell');
      } else if (buyAmount) {
        calc = calculateFXAmount(sellCurrency, buyCurrency, buyAmount, 'buy');
      } else {
        throw new Error('Either sellAmount or buyAmount must be specified');
      }

      const expiresAt = new Date(Date.now() + 30000); // 30 seconds expiry

      const quote: FXQuote = {
        quoteId: `FXQ${Date.now()}`,
        sellCurrency,
        buyCurrency,
        sellAmount: calc.sellAmount,
        buyAmount: calc.buyAmount,
        exchangeRate: calc.rate,
        inverseRate: 1 / calc.rate,
        expiresAt: expiresAt.toISOString(),
        expiresInSeconds: 30,
        status: 'Active',
      };

      return { quote, problems: null };
    } catch (error) {
      console.error('Error creating FX quote:', error);
      throw error;
    }
  },

  /**
   * Book an FX quote (lock the rate)
   */
  async bookQuote(quoteId: string): Promise<FXBookResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.FXDEAL.QUOTE_BOOK}/${quoteId}`);
      // return response.data;

      return {
        quoteId,
        dealId: `FXD${Date.now()}`,
        status: 'Booked',
        bookedAt: new Date().toISOString(),
        problems: null,
      };
    } catch (error) {
      console.error('Error booking FX quote:', error);
      throw error;
    }
  },

  /**
   * Book an FX quote and settle instantly (for internal transfers)
   */
  async bookAndSettle(quoteId: string): Promise<FXBookResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.FXDEAL.BOOK_AND_DEPOSIT}/${quoteId}`);
      // return response.data;

      return {
        quoteId,
        dealId: `FXD${Date.now()}`,
        status: 'Settled',
        bookedAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
        problems: null,
      };
    } catch (error) {
      console.error('Error booking and settling FX quote:', error);
      throw error;
    }
  },

  /**
   * Get available currencies for selling
   */
  async getSellCurrencies(): Promise<string[]> {
    // In production, call API:
    // const response = await apiClient.get(API_CONFIG.ENDPOINTS.FXDEAL.SELL_CURRENCIES);
    // return response.data;

    return Object.keys(MOCK_EXCHANGE_RATES);
  },

  /**
   * Get available currencies for buying
   */
  async getBuyCurrencies(): Promise<string[]> {
    // In production, call API:
    // const response = await apiClient.get(API_CONFIG.ENDPOINTS.FXDEAL.BUY_CURRENCIES);
    // return response.data;

    return Object.keys(MOCK_EXCHANGE_RATES);
  },
};
