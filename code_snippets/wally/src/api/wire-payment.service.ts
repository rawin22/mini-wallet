import type {
  Beneficiary,
  BeneficiarySearchResponse,
  FXQuote,
  FXQuoteRequest,
  FXQuoteResponse,
  FXBookResponse,
  WirePaymentCreateRequest,
  WirePaymentCreateResponse,
  WirePaymentSubmitResponse,
  ExchangeRate,
} from '../types/wire-payment.types';
import {
  getBeneficiariesByCountry,
  getExchangeRate,
  calculateFXAmount,
  MOCK_BENEFICIARIES,
} from '../data/paymentReference';

export const wirePaymentService = {
  // ============ BENEFICIARY OPERATIONS ============

  /**
   * Search for saved beneficiaries
   */
  async searchBeneficiaries(
    countryCode?: string,
    currencyCode?: string
  ): Promise<BeneficiarySearchResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post('/api/v1/PaymentTemplate/Search', { countryCode, currencyCode });
      // return response.data;

      // For demo, use mock data
      let beneficiaries = MOCK_BENEFICIARIES.filter((b) => b.isActive);

      if (countryCode) {
        beneficiaries = beneficiaries.filter((b) => b.bankCountry === countryCode);
      }

      if (currencyCode) {
        beneficiaries = beneficiaries.filter((b) => b.currency === currencyCode);
      }

      return {
        beneficiaries,
        totalCount: beneficiaries.length,
        problems: null,
      };
    } catch (error) {
      console.error('Error searching beneficiaries:', error);
      return {
        beneficiaries: getBeneficiariesByCountry(countryCode || ''),
        totalCount: 0,
        problems: null,
      };
    }
  },

  /**
   * Get beneficiary by ID
   */
  async getBeneficiary(id: string): Promise<Beneficiary | null> {
    return MOCK_BENEFICIARIES.find((b) => b.id === id) || null;
  },

  // ============ FX OPERATIONS ============

  /**
   * Get current exchange rate
   */
  async getExchangeRate(baseCurrency: string, quoteCurrency: string): Promise<ExchangeRate> {
    try {
      // In production, call API:
      // const response = await apiClient.get(`/api/v1/ExchangeRate/TableRate/${baseCurrency}/${quoteCurrency}`);
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
  async createFXQuote(request: FXQuoteRequest): Promise<FXQuoteResponse> {
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
   * Book (lock) an FX quote
   */
  async bookFXQuote(quoteId: string): Promise<FXBookResponse> {
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

  // ============ WIRE PAYMENT OPERATIONS ============

  /**
   * Validate a wire payment before creation
   */
  async validatePayment(request: WirePaymentCreateRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!request.currencyCode) {
      errors.push('Currency is required');
    }

    if (!request.beneficiaryId && !request.beneficiaryName) {
      errors.push('Beneficiary is required');
    }

    if (!request.valueDate) {
      errors.push('Value date is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Create a wire payment
   */
  async createPayment(request: WirePaymentCreateRequest): Promise<WirePaymentCreateResponse> {
    try {
      // Validate first
      const validation = await this.validatePayment(request);
      if (!validation.valid) {
        return {
          paymentId: '',
          paymentReference: '',
          status: 'Error',
          amount: request.amount,
          currencyCode: request.currencyCode,
          valueDate: request.valueDate,
          problems: validation.errors.map((e) => ({ code: 'VALIDATION', message: e, severity: 'Error' })),
        };
      }

      // In production, call API:
      // const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT.CREATE, request);
      // return response.data;

      const paymentId = `PAY${Date.now()}`;
      const paymentReference = `WIRE${Math.floor(1000000 + Math.random() * 9000000)}`;

      return {
        paymentId,
        paymentReference,
        status: 'Created',
        amount: request.amount,
        currencyCode: request.currencyCode,
        sourceAmount: request.sourceAmount,
        sourceCurrencyCode: request.sourceCurrencyCode,
        exchangeRate: request.sourceAmount ? request.amount / request.sourceAmount : undefined,
        valueDate: request.valueDate,
        problems: null,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Submit a wire payment for processing
   */
  async submitPayment(paymentId: string): Promise<WirePaymentSubmitResponse> {
    try {
      // In production, call API:
      // const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.PAYMENT.CREATE}/${paymentId}/Submit`);
      // return response.data;

      return {
        paymentId,
        paymentReference: `WIRE${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        problems: null,
      };
    } catch (error) {
      console.error('Error submitting payment:', error);
      throw error;
    }
  },

  /**
   * Create and submit a wire payment in one operation
   */
  async sendWirePayment(request: WirePaymentCreateRequest): Promise<WirePaymentSubmitResponse> {
    const createResponse = await this.createPayment(request);

    if (createResponse.problems && createResponse.problems.length > 0) {
      throw new Error(createResponse.problems[0].message);
    }

    const submitResponse = await this.submitPayment(createResponse.paymentId);
    return {
      ...submitResponse,
      paymentReference: createResponse.paymentReference,
    };
  },
};
