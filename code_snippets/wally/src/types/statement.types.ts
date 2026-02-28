// Statement Types

export interface AccountInfo {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountCurrencyCode: string;
  accountCurrencyScale: number;
  beginningBalance: number;
  endingBalance: number;
}

export interface StatementEntry {
  transactionId: string;
  transactionTime: string;
  transactionType: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  referenceNumber?: string;
  counterpartyName?: string;
}

export interface StatementResponse {
  accountInfo: AccountInfo;
  entries: StatementEntry[];
  problems: null | any[];
}
