export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://www.bizcurrency.com:20500',
  CALLER_ID: '12FDEC27-6E1F-4EC5-BF15-1C7E75A99117',

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/Authenticate',
      REFRESH: '/api/v1/Authenticate/Refresh',
    },
    CUSTOMER: {
      BALANCES: '/api/v1/CustomerAccountBalance',
      STATEMENT: '/api/v1/CustomerAccountStatement',
    },
    INSTANT_PAYMENT: {
      CREATE: '/api/v1/InstantPayment',
      POST: '/api/v1/InstantPayment/Post',
      SEARCH: '/api/v1/InstantPayment/Search',
    },
    FX: {
      QUOTE: '/api/v1/FXDealQuote',
      CURRENCY_LIST_BUY: '/api/v1/FXCurrencyList/Buy',
      CURRENCY_LIST_SELL: '/api/v1/FXCurrencyList/Sell',
      DEAL_SEARCH: '/api/v1/FXDealQuote/Search',
    },
    CURRENCY: {
      PAYMENT_LIST: '/api/v1/PaymentCurrencyList',
    },
  },

  TIMEOUT: 30000,

  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    EXPIRES_AT: 'auth_expires_at',
  },
};
