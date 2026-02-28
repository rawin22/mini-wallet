// Types for Instant Payment (P2P) operations

export interface InstantPaymentCreateRequest {
  fromCustomerAlias: string;
  toCustomerAlias: string;
  amount: number;
  currencyCode: string;
  memo?: string;
  invoice?: string;
}

export interface InstantPaymentCreateResponse {
  paymentId: string;
  paymentReference: string;
  fromCustomerAlias: string;
  toCustomerAlias: string;
  amount: number;
  currencyCode: string;
  status: string;
  createdTime: string;
  problems: ApiProblem[] | null;
}

export interface InstantPaymentPostRequest {
  paymentId: string;
}

export interface InstantPaymentPostResponse {
  paymentId: string;
  paymentReference: string;
  status: string;
  postedTime: string;
  problems: ApiProblem[] | null;
}

export interface AliasExistsResponse {
  exists: boolean;
  alias: string;
  customerName?: string;
  problems: ApiProblem[] | null;
}

export interface ApiProblem {
  code: string;
  message: string;
  severity: string;
}
