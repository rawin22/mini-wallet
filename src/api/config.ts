interface NotaryNodeConfig {
  branchId: string;
  name: string;
  countryCode: string;
  isDefault: boolean;
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.trim().toLowerCase() === 'true';
};

const DEFAULT_NOTARY_NODES: NotaryNodeConfig[] = [
  {
    branchId: '82b42669-ac24-e911-9109-3ee1a118192f',
    name: 'World KYC HK - Hong Kong',
    countryCode: 'HK',
    isDefault: true,
  },
  {
    branchId: 'adbc61a1-648e-e811-bca9-002590067f61',
    name: 'TradeEnabler TH - Thailand',
    countryCode: 'TH',
    isDefault: false,
  },
];

const parseNotaryNodes = (): NotaryNodeConfig[] => {
  const rawNodes = import.meta.env.VITE_SIGNUP_NOTARY_NODES as string | undefined;
  if (!rawNodes) {
    return DEFAULT_NOTARY_NODES;
  }

  try {
    const parsed = JSON.parse(rawNodes) as NotaryNodeConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_NOTARY_NODES;
    }

    const filtered = parsed.filter((node) => !!node.branchId && !!node.name && !!node.countryCode);
    if (filtered.length === 0) {
      return DEFAULT_NOTARY_NODES;
    }

    if (!filtered.some((node) => node.isDefault)) {
      return [{ ...filtered[0], isDefault: true }, ...filtered.slice(1)];
    }

    return filtered;
  } catch {
    return DEFAULT_NOTARY_NODES;
  }
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://www.bizcurrency.com:20500',
  CALLER_ID: import.meta.env.VITE_API_CALLER_ID || '12FDEC27-6E1F-4EC5-BF15-1C7E75A99117',

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/Authenticate',
      REFRESH: '/api/v1/Authenticate/Refresh',
    },
    USER: {
      DOES_USERNAME_EXIST: '/api/v1/User/DoesUsernameExist',
      LINK_ACCESS_RIGHT_TEMPLATE: '/api/v1/User/LinkAccessRightTemplate',
    },
    CUSTOMER: {
      BALANCES: '/api/v1/CustomerAccountBalance',
      STATEMENT: '/api/v1/CustomerAccountStatement',
      FROM_TEMPLATE: '/api/v1/Customer/FromTemplate',
      USER: '/api/v1/CustomerUser',
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
      DEAL_SEARCH: '/api/v1/FXDeal/Search',
    },
    CURRENCY: {
      PAYMENT_LIST: '/api/v1/PaymentCurrencyList',
    },
  },

  SIGNUP: {
    BANK_USERNAME: import.meta.env.VITE_BANK_USERNAME || '4kycmig',
    BANK_PASSWORD: import.meta.env.VITE_BANK_PASSWORD || 'Wkycmig@88',
    ACCOUNT_REPRESENTATIVE_ID:
      import.meta.env.VITE_ACCOUNT_REPRESENTATIVE_ID || '9469c6b2-ebed-ec11-915b-3ee1a118192f',
    CUSTOMER_TEMPLATE_ID:
      import.meta.env.VITE_CUSTOMER_TEMPLATE_ID || 'b3cccc87-4317-ef11-8541-002248afce03',
    ACCESS_RIGHT_TEMPLATE_ID:
      import.meta.env.VITE_ACCESS_RIGHT_TEMPLATE_ID || 'dba74278-a2e8-4503-b59c-8ab8cd458841',
    DEFAULT_COUNTRY_CODE: import.meta.env.VITE_DEFAULT_COUNTRY_CODE || 'HK',
    DEFAULT_REGISTERING_EMAIL: import.meta.env.VITE_DEFAULT_REGISTERING_EMAIL || 'register@worldkyc.com',
    REFERRED_BY_PLATFORM: import.meta.env.VITE_REFERRED_BY_PLATFORM || 'WorldKYC Signup',
    IS_REFERRED_BY_REQUIRED: parseBoolean(import.meta.env.VITE_IS_REFERRED_BY_REQUIRED, false),
    AFTER_SIGNUP_URL: import.meta.env.VITE_AFTER_SIGNUP_URL || '',
    NOTARY_NODES: parseNotaryNodes(),
  },

  TIMEOUT: 30000,

  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    EXPIRES_AT: 'auth_expires_at',
  },
};
