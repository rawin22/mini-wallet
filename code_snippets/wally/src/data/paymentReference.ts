// Mock reference data for Payment Wizard
// In production, this would come from API calls

import type { PaymentCountry, PaymentCurrency, Beneficiary } from '../types/wire-payment.types';

export const PAYMENT_COUNTRIES: PaymentCountry[] = [
  {
    code: 'US',
    name: 'United States',
    localCurrency: 'USD',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    localCurrency: 'GBP',
    ibanRequired: true,
    swiftRequired: true,
    ibanFormat: 'GB00 0000 0000 0000 0000 00',
  },
  {
    code: 'DE',
    name: 'Germany',
    localCurrency: 'EUR',
    ibanRequired: true,
    swiftRequired: true,
    ibanFormat: 'DE00 0000 0000 0000 0000 00',
  },
  {
    code: 'FR',
    name: 'France',
    localCurrency: 'EUR',
    ibanRequired: true,
    swiftRequired: true,
    ibanFormat: 'FR00 0000 0000 0000 0000 0000 000',
  },
  {
    code: 'JP',
    name: 'Japan',
    localCurrency: 'JPY',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'AU',
    name: 'Australia',
    localCurrency: 'AUD',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'SG',
    name: 'Singapore',
    localCurrency: 'SGD',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    localCurrency: 'HKD',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'CH',
    name: 'Switzerland',
    localCurrency: 'CHF',
    ibanRequired: true,
    swiftRequired: true,
    ibanFormat: 'CH00 0000 0000 0000 0000 0',
  },
  {
    code: 'TH',
    name: 'Thailand',
    localCurrency: 'THB',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'PH',
    name: 'Philippines',
    localCurrency: 'PHP',
    ibanRequired: false,
    swiftRequired: true,
  },
  {
    code: 'IN',
    name: 'India',
    localCurrency: 'INR',
    ibanRequired: false,
    swiftRequired: true,
  },
];

export const PAYMENT_CURRENCIES: PaymentCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
];

// Mock saved beneficiaries
export const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben_001',
    name: 'John Smith',
    bankName: 'Bank of America',
    bankCountry: 'US',
    accountNumber: '1234567890',
    swiftBic: 'BOFAUS3N',
    currency: 'USD',
    address: '123 Main St, New York, NY',
    isActive: true,
  },
  {
    id: 'ben_002',
    name: 'Emma Wilson',
    bankName: 'Barclays Bank',
    bankCountry: 'GB',
    accountNumber: '12345678',
    iban: 'GB82WEST12345698765432',
    swiftBic: 'BABORSGB',
    currency: 'GBP',
    address: '45 Oxford Street, London',
    isActive: true,
  },
  {
    id: 'ben_003',
    name: 'Hans Mueller',
    bankName: 'Deutsche Bank',
    bankCountry: 'DE',
    accountNumber: '0123456789',
    iban: 'DE89370400440532013000',
    swiftBic: 'DEUTDEFF',
    currency: 'EUR',
    address: 'Friedrichstraße 100, Berlin',
    isActive: true,
  },
  {
    id: 'ben_004',
    name: 'Marie Dupont',
    bankName: 'BNP Paribas',
    bankCountry: 'FR',
    accountNumber: '0987654321',
    iban: 'FR7630006000011234567890189',
    swiftBic: 'BNPAFRPP',
    currency: 'EUR',
    address: '16 Boulevard Haussman, Paris',
    isActive: true,
  },
  {
    id: 'ben_005',
    name: 'Tanaka Yuki',
    bankName: 'Mitsubishi UFJ',
    bankCountry: 'JP',
    accountNumber: '1234567',
    swiftBic: 'BOABORSG',
    currency: 'JPY',
    address: '1-1-1 Marunouchi, Tokyo',
    isActive: true,
  },
];

// Mock exchange rates (for demo - in production use API)
export const MOCK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, SGD: 1.34, HKD: 7.82, CHF: 0.88, THB: 35.50, PHP: 56.20, INR: 83.10 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 163.00, AUD: 1.67, SGD: 1.46, HKD: 8.52, CHF: 0.96, THB: 38.70, PHP: 61.30, INR: 90.60 },
  GBP: { USD: 1.27, EUR: 1.16, JPY: 189.50, AUD: 1.94, SGD: 1.70, HKD: 9.90, CHF: 1.12, THB: 45.00, PHP: 71.30, INR: 105.30 },
  JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, AUD: 0.010, SGD: 0.009, HKD: 0.052, CHF: 0.0059, THB: 0.24, PHP: 0.38, INR: 0.56 },
  AUD: { USD: 0.65, EUR: 0.60, GBP: 0.52, JPY: 97.50, SGD: 0.88, HKD: 5.11, CHF: 0.58, THB: 23.20, PHP: 36.70, INR: 54.30 },
  SGD: { USD: 0.75, EUR: 0.69, GBP: 0.59, JPY: 111.70, AUD: 1.14, HKD: 5.84, CHF: 0.66, THB: 26.50, PHP: 42.00, INR: 62.10 },
  HKD: { USD: 0.13, EUR: 0.12, GBP: 0.10, JPY: 19.12, AUD: 0.20, SGD: 0.17, CHF: 0.11, THB: 4.54, PHP: 7.19, INR: 10.63 },
  CHF: { USD: 1.14, EUR: 1.04, GBP: 0.89, JPY: 170.00, AUD: 1.74, SGD: 1.52, HKD: 8.89, THB: 40.30, PHP: 63.90, INR: 94.50 },
  THB: { USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.21, AUD: 0.043, SGD: 0.038, HKD: 0.22, CHF: 0.025, PHP: 1.58, INR: 2.34 },
  PHP: { USD: 0.018, EUR: 0.016, GBP: 0.014, JPY: 2.66, AUD: 0.027, SGD: 0.024, HKD: 0.14, CHF: 0.016, THB: 0.63, INR: 1.48 },
  INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.80, AUD: 0.018, SGD: 0.016, HKD: 0.094, CHF: 0.011, THB: 0.43, PHP: 0.68 },
};

// Helper functions
export function getPaymentCountries(): PaymentCountry[] {
  return PAYMENT_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
}

export function getPaymentCountry(code: string): PaymentCountry | undefined {
  return PAYMENT_COUNTRIES.find((c) => c.code === code);
}

export function getPaymentCurrencies(): PaymentCurrency[] {
  return PAYMENT_CURRENCIES.sort((a, b) => a.code.localeCompare(b.code));
}

export function getPaymentCurrency(code: string): PaymentCurrency | undefined {
  return PAYMENT_CURRENCIES.find((c) => c.code === code);
}

export function getBeneficiariesByCountry(countryCode: string): Beneficiary[] {
  return MOCK_BENEFICIARIES.filter((b) => b.bankCountry === countryCode && b.isActive);
}

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1;
  return MOCK_EXCHANGE_RATES[from]?.[to] || 1;
}

export function calculateFXAmount(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  direction: 'sell' | 'buy'
): { sellAmount: number; buyAmount: number; rate: number } {
  const rate = getExchangeRate(fromCurrency, toCurrency);

  if (direction === 'sell') {
    // User specifies sell amount, calculate buy amount
    return {
      sellAmount: amount,
      buyAmount: Math.round((amount * rate) * 100) / 100,
      rate,
    };
  } else {
    // User specifies buy amount, calculate sell amount
    const inverseRate = getExchangeRate(toCurrency, fromCurrency);
    return {
      sellAmount: Math.round((amount * inverseRate) * 100) / 100,
      buyAmount: amount,
      rate,
    };
  }
}
