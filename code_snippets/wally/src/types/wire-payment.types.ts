// Types for Wire Payment and related operations

// Country reference data
export interface PaymentCountry {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  localCurrency: string;
  ibanRequired: boolean;
  swiftRequired: boolean;
  ibanFormat?: string; // e.g., "XX00 0000 0000 0000 0000 00"
}

// Currency reference data
export interface PaymentCurrency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Beneficiary (Payment Template)
export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  bankCountry: string;
  accountNumber: string;
  iban?: string;
  swiftBic: string;
  currency: string;
  address?: string;
  isActive: boolean;
}

export interface BeneficiarySearchRequest {
  countryCode?: string;
  currencyCode?: string;
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface BeneficiarySearchResponse {
  beneficiaries: Beneficiary[];
  totalCount: number;
  problems: ApiProblem[] | null;
}

// FX Quote
export interface FXQuoteRequest {
  sellCurrency: string;
  buyCurrency: string;
  sellAmount?: number;
  buyAmount?: number;
}

export interface FXQuote {
  quoteId: string;
  sellCurrency: string;
  buyCurrency: string;
  sellAmount: number;
  buyAmount: number;
  exchangeRate: number;
  inverseRate: number;
  expiresAt: string; // ISO date string
  expiresInSeconds: number;
  status: 'Active' | 'Expired' | 'Booked';
}

export interface FXQuoteResponse {
  quote: FXQuote;
  problems: ApiProblem[] | null;
}

export interface FXBookResponse {
  quoteId: string;
  dealId: string;
  status: string;
  bookedAt: string;
  problems: ApiProblem[] | null;
}

// Wire Payment
export interface WirePaymentCreateRequest {
  beneficiaryId?: string;
  // Or new beneficiary details
  beneficiaryName?: string;
  beneficiaryBankName?: string;
  beneficiaryBankCountry?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryIban?: string;
  beneficiarySwiftBic?: string;
  // Payment details
  amount: number;
  currencyCode: string;
  sourceCurrencyCode: string;
  sourceAmount?: number;
  fxQuoteId?: string;
  valueDate: string; // ISO date
  reasonForPayment?: string;
  reference?: string;
}

export interface WirePaymentCreateResponse {
  paymentId: string;
  paymentReference: string;
  status: string;
  amount: number;
  currencyCode: string;
  sourceAmount?: number;
  sourceCurrencyCode?: string;
  exchangeRate?: number;
  valueDate: string;
  problems: ApiProblem[] | null;
}

export interface WirePaymentSubmitResponse {
  paymentId: string;
  paymentReference: string;
  status: string;
  submittedAt: string;
  problems: ApiProblem[] | null;
}

export interface ApiProblem {
  code: string;
  message: string;
  severity: string;
}

// Exchange Rate (simple rate lookup)
export interface ExchangeRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  inverseRate: number;
  timestamp: string;
}
