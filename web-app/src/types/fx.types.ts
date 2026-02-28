export interface FxCurrency {
  currencyCode: string;
  currencyName: string;
  currencyAmountScale: number;
  currencyRateScale: number;
  symbol: string;
  paymentCutoffTime: string;
  settlementDaysToAdd: number;
}

export interface FxCurrencyListResponse {
  currencies: FxCurrency[];
  problems: null | string;
}

export interface FxQuoteRequest {
  buyCurrencyCode: string;
  sellCurrencyCode: string;
  amount: number;
  amountCurrencyCode: string;
  dealType: string;
  windowOpenDate: string;
  finalValueDate: string;
  isForCurrencyCalculator: boolean;
}

export interface FxQuote {
  quoteId: string;
  quoteReference: string;
  quoteSequenceNumber: string;
  customerAccountNumber: string;
  dealType: string;
  buyAmount: string;
  buyCurrencyCode: string;
  sellAmount: string;
  sellCurrencyCode: string;
  rate: string;
  symbol: string;
  dealDate: string;
  valueDate: string;
  quoteTime: string;
  expirationTime: string;
  isForCurrencyCalculator: boolean;
}

export interface FxQuoteResponse {
  quote: FxQuote;
  problems: null | string;
}

export interface FxBookResponse {
  fxDepositData: {
    fxDealId: string;
    fxDealReference: string;
    depositId: string;
    depositReference: string;
  };
  problems: null | string;
}
