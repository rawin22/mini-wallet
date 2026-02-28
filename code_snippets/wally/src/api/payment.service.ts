import apiClient from './client';
import { API_CONFIG } from './config';
import type {
  InstantPaymentSearchResponse,
  WirePaymentSearchResponse,
  PaymentSearchRequest,
  UnifiedPayment,
  InstantPaymentSearchRecord,
  WirePaymentSearchRecord,
} from '../types/payment.types';

export const paymentService = {
  // === SEARCH INSTANT PAYMENTS ===
  async searchInstantPayments(
    request: PaymentSearchRequest = {}
  ): Promise<InstantPaymentSearchResponse> {
    const params = new URLSearchParams();

    if (request.pageIndex !== undefined) params.append('PageIndex', request.pageIndex.toString());
    if (request.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request.paymentReference) params.append('PaymentReference', request.paymentReference);
    if (request.currencyCode) params.append('CurrencyCode', request.currencyCode);
    if (request.amountMin !== undefined) params.append('AmountMin', request.amountMin.toString());
    if (request.amountMax !== undefined) params.append('AmountMax', request.amountMax.toString());
    if (request.valueDateMin) params.append('ValueDateMin', request.valueDateMin);
    if (request.valueDateMax) params.append('ValueDateMax', request.valueDateMax);
    if (request.sortBy) params.append('SortBy', request.sortBy);
    if (request.sortDirection) params.append('SortDirection', request.sortDirection);

    const queryString = params.toString();
    const url = `${API_CONFIG.ENDPOINTS.INSTANT_PAYMENT.SEARCH}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<InstantPaymentSearchResponse>(url);
    return response.data;
  },

  // === SEARCH WIRE PAYMENTS ===
  async searchWirePayments(
    request: PaymentSearchRequest = {}
  ): Promise<WirePaymentSearchResponse> {
    const params = new URLSearchParams();

    if (request.pageIndex !== undefined) params.append('PageIndex', request.pageIndex.toString());
    if (request.pageSize !== undefined) params.append('PageSize', request.pageSize.toString());
    if (request.paymentReference) params.append('PaymentReference', request.paymentReference);
    if (request.currencyCode) params.append('AmountCurrencyCode', request.currencyCode);
    if (request.amountMin !== undefined) params.append('AmountMin', request.amountMin.toString());
    if (request.amountMax !== undefined) params.append('AmountMax', request.amountMax.toString());
    if (request.valueDateMin) params.append('ValueDateMin', request.valueDateMin);
    if (request.valueDateMax) params.append('ValueDateMax', request.valueDateMax);
    if (request.sortBy) params.append('SortBy', request.sortBy);
    if (request.sortDirection) params.append('SortDirection', request.sortDirection);

    const queryString = params.toString();
    const url = `${API_CONFIG.ENDPOINTS.PAYMENT.WIRE_SEARCH}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<WirePaymentSearchResponse>(url);
    return response.data;
  },

  // === SEARCH ALL PAYMENTS (COMBINED) ===
  async searchAllPayments(
    request: PaymentSearchRequest = {},
    currentUserAlias: string = ''
  ): Promise<{ payments: UnifiedPayment[]; totalCount: number }> {
    try {
      // Fetch both payment types in parallel
      const [instantResponse, wireResponse] = await Promise.all([
        this.searchInstantPayments(request).catch(err => {
          console.error('Error fetching instant payments:', err);
          return { records: { payments: [], totalCount: 0, pageIndex: 0, pageSize: 0 }, problems: null };
        }),
        this.searchWirePayments(request).catch(err => {
          console.error('Error fetching wire payments:', err);
          return { payments: [], totalCount: 0, problems: null };
        }),
      ]);

      // Normalize instant payments
      const instantPayments: UnifiedPayment[] = (instantResponse.records?.payments || []).map(p =>
        normalizeInstantPayment(p, currentUserAlias)
      );

      // Normalize wire payments
      const wirePayments: UnifiedPayment[] = (wireResponse.payments || []).map(p =>
        normalizeWirePayment(p)
      );

      // Merge and sort by created time (newest first)
      const allPayments = [...instantPayments, ...wirePayments].sort(
        (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );

      const totalCount = (instantResponse.records?.totalCount || 0) + (wireResponse.totalCount || 0);

      return { payments: allPayments, totalCount };
    } catch (error) {
      console.error('Error in searchAllPayments:', error);
      throw error;
    }
  },
};

// === NORMALIZATION HELPERS ===

function normalizeInstantPayment(
  payment: InstantPaymentSearchRecord,
  currentUserAlias: string
): UnifiedPayment {
  const isIncoming = payment.toCustomerAlias === currentUserAlias;

  return {
    id: payment.paymentId,
    reference: payment.paymentReference,
    type: 'instant',
    from: payment.fromCustomerAlias + (payment.fromCustomerName ? ` (${payment.fromCustomerName})` : ''),
    to: payment.toCustomerAlias + (payment.toCustomerName ? ` (${payment.toCustomerName})` : ''),
    amount: payment.amount,
    currency: payment.currencyCode,
    status: payment.status,
    statusDisplay: getInstantPaymentStatus(payment.status, isIncoming),
    createdTime: payment.createdTime,
    description: payment.memo || payment.invoice || undefined,
    rawData: payment,
  };
}

function normalizeWirePayment(payment: WirePaymentSearchRecord): UnifiedPayment {
  return {
    id: payment.paymentId,
    reference: payment.paymentReference,
    type: 'wire',
    from: payment.customerName,
    to: payment.beneficiaryName + (payment.beneficiaryBankName ? ` (${payment.beneficiaryBankName})` : ''),
    amount: payment.amount,
    currency: payment.amountCurrencyCode,
    status: payment.paymentStatusTypeName,
    statusDisplay: getWirePaymentStatus(payment.paymentStatusTypeName),
    createdTime: payment.createdTime,
    description: payment.reasonForPayment || undefined,
    rawData: payment,
  };
}

// Status mapping helpers
function getInstantPaymentStatus(status: string, isIncoming: boolean): string {
  if (status === 'Posted') return isIncoming ? 'Received' : 'Paid';
  if (status === 'Created') return 'Pending';
  if (status === 'Voided') return 'Cancelled';
  return status;
}

function getWirePaymentStatus(status: string): string {
  switch (status) {
    case 'Created': return 'Draft';
    case 'Submitted': return 'Processing';
    case 'FundsApproved': return 'Approved';
    case 'Verified': return 'Verified';
    case 'Released': return 'Sent';
    case 'Voided': return 'Cancelled';
    default: return status;
  }
}
