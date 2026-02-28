export interface PaymentSearchRecord {
  paymentId: string;
  paymentReference: string;
  fromCustomerAlias: string;
  toCustomerAlias: string;
  fromCustomerName?: string;
  toCustomerName?: string;
  amount: number;
  currencyCode: string;
  status: string;
  createdTime: string;
  valueDate?: string;
  memo?: string;
  invoice?: string;
}

export interface PaymentSearchResponse {
  records: {
    payments: PaymentSearchRecord[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
  };
  problems: null | string;
}
