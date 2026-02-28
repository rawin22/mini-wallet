// === INSTANT PAYMENT TYPES ===
export interface InstantPaymentSearchRecord {
  paymentId: string;
  paymentReference: string;
  fromCustomerAlias: string;
  toCustomerAlias: string;
  fromCustomerName?: string;
  toCustomerName?: string;
  amount: number;
  currencyCode: string;
  status: string;                  // "Posted", "Created", "Voided"
  createdTime: string;
  valueDate?: string;
  memo?: string;
  invoice?: string;
}

export interface InstantPaymentSearchResponse {
  records: {
    payments: InstantPaymentSearchRecord[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
  };
  problems: any[] | null;
}

// === WIRE PAYMENT TYPES ===
export interface WirePaymentSearchRecord {
  paymentId: string;
  paymentReference: string;
  customerName: string;             // Sender
  beneficiaryName: string;          // Recipient
  amount: number;
  amountCurrencyCode: string;
  paymentStatusTypeName: string;    // "Created", "Submitted", "Released", "Voided"
  createdTime: string;
  submittedTime?: string;
  releasedTime?: string;
  beneficiaryBankName?: string;
  reasonForPayment?: string;
  valueDate?: string;
}

export interface WirePaymentSearchResponse {
  payments: WirePaymentSearchRecord[];
  totalCount: number;
  problems: any[] | null;
}

// === UNIFIED PAYMENT TYPE (for combined display) ===
export interface UnifiedPayment {
  id: string;
  reference: string;
  type: 'instant' | 'wire';
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: string;
  statusDisplay: string;           // User-friendly status
  createdTime: string;
  description?: string;
  rawData: InstantPaymentSearchRecord | WirePaymentSearchRecord; // Original data
}

// === SEARCH REQUEST TYPES ===
export interface PaymentSearchRequest {
  pageIndex?: number;
  pageSize?: number;
  paymentReference?: string;
  currencyCode?: string;
  amountMin?: number;
  amountMax?: number;
  valueDateMin?: string;
  valueDateMax?: string;
  sortBy?: 'CreatedTime' | 'Amount';
  sortDirection?: 'Ascending' | 'Descending';
}

export type PaymentDirection = 'outgoing' | 'incoming' | 'unknown';
export type PaymentType = 'instant' | 'wire';
