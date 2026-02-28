// src/api/config.ts

export const API_CONFIG = {
  // TODO: Replace with your actual API URL from appsettings or environment variable
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.winstantpay.com',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/Authenticate',
      REFRESH: '/api/v1/Authenticate/Refresh',
    },
    CUSTOMER: {
      BALANCES: '/api/v1/CustomerAccountBalance',
      STATEMENT: '/api/v1/CustomerAccountStatement',
    },
    FXDEAL: {
      QUOTE_CREATE: '/api/v1/FXDealQuote',
      QUOTE_BOOK: '/api/v1/FXDealQuote/Book',
      BOOK_AND_DEPOSIT: '/api/v1/FXDealQuote/BookAndInstantDeposit',
    },
    PAYMENT: {
      CREATE: '/api/v1/Payment',
      VALIDATE: '/api/v1/Payment/Validate',
      WIRE_SEARCH: '/api/v1/Payment/Search',
    },
    INSTANT_PAYMENT: {
      SEARCH: '/api/v1/InstantPayment/Search',
      CREATE: '/api/v1/InstantPayment',
      POST: '/api/v1/InstantPayment/Post',
    },
    CUSTOMER_ALIAS: {
      EXISTS: '/api/v1/CustomerAccountAliasList/Exists',
    },
  },
  
  TIMEOUT: 30000, // 30 seconds
  
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    EXPIRES_AT: 'auth_expires_at',
  },
};
