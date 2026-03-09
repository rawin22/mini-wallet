interface NotaryNodeConfig {
  branchId: string;
  name: string;
  countryCode: string;
  isDefault: boolean;
}

interface SignupConfig {
  BANK_USERNAME: string;
  BANK_PASSWORD: string;
  ACCOUNT_REPRESENTATIVE_ID: string;
  CUSTOMER_TEMPLATE_ID: string;
  ACCESS_RIGHT_TEMPLATE_ID: string;
  DEFAULT_COUNTRY_CODE: string;
  DEFAULT_REGISTERING_EMAIL: string;
  REFERRED_BY_PLATFORM: string;
  IS_REFERRED_BY_REQUIRED: boolean;
  AFTER_SIGNUP_URL: string;
  NOTARY_NODES: NotaryNodeConfig[];
}

export type AppEnvironmentId = 'WKYC_BETA' | 'GPWEB_BETA' | 'GPWEB_PRODUCTION';

interface EnvironmentConfig {
  id: AppEnvironmentId;
  label: string;
  baseUrl: string;
  callerId: string;
  signup: SignupConfig;
}

const DEFAULT_ENVIRONMENT_ID: AppEnvironmentId = 'WKYC_BETA';

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.trim().toLowerCase() === 'true';
};

const normalizeNotaryNodes = (
  nodes: NotaryNodeConfig[],
  fallbackCountryCode: string,
): NotaryNodeConfig[] => {
  const filtered = nodes.filter((node) => !!node.branchId && !!node.name && !!node.countryCode);
  if (filtered.length === 0) {
    return [
      {
        branchId: '',
        name: 'Default Notary Node',
        countryCode: fallbackCountryCode,
        isDefault: true,
      },
    ];
  }

  if (!filtered.some((node) => node.isDefault)) {
    return [{ ...filtered[0], isDefault: true }, ...filtered.slice(1)];
  }

  return filtered;
};

const parseWkycNotaryNodes = (): NotaryNodeConfig[] => {
  const defaultNodes: NotaryNodeConfig[] = [
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

  const rawNodes = import.meta.env.VITE_SIGNUP_NOTARY_NODES as string | undefined;
  if (!rawNodes) {
    return normalizeNotaryNodes(defaultNodes, 'HK');
  }

  try {
    const parsed = JSON.parse(rawNodes) as NotaryNodeConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return normalizeNotaryNodes(defaultNodes, 'HK');
    }

    return normalizeNotaryNodes(parsed, 'HK');
  } catch {
    return normalizeNotaryNodes(defaultNodes, 'HK');
  }
};

const APP_ENVIRONMENT_CONFIGS: Record<AppEnvironmentId, EnvironmentConfig> = {
  WKYC_BETA: {
    id: 'WKYC_BETA',
    label: 'WKYC-BETA',
    baseUrl: import.meta.env.VITE_API_URL || 'https://www.bizcurrency.com:20500',
    callerId: import.meta.env.VITE_API_CALLER_ID || '12FDEC27-6E1F-4EC5-BF15-1C7E75A99117',
    signup: {
      BANK_USERNAME: import.meta.env.VITE_BANK_USERNAME || '',
      BANK_PASSWORD: import.meta.env.VITE_BANK_PASSWORD || '',
      ACCOUNT_REPRESENTATIVE_ID:
        import.meta.env.VITE_ACCOUNT_REPRESENTATIVE_ID || '9469c6b2-ebed-ec11-915b-3ee1a118192f',
      CUSTOMER_TEMPLATE_ID:
        import.meta.env.VITE_CUSTOMER_TEMPLATE_ID || 'b3cccc87-4317-ef11-8541-002248afce03',
      ACCESS_RIGHT_TEMPLATE_ID:
        import.meta.env.VITE_ACCESS_RIGHT_TEMPLATE_ID || 'dba74278-a2e8-4503-b59c-8ab8cd458841',
      DEFAULT_COUNTRY_CODE: import.meta.env.VITE_DEFAULT_COUNTRY_CODE || 'HK',
      DEFAULT_REGISTERING_EMAIL:
        import.meta.env.VITE_DEFAULT_REGISTERING_EMAIL || 'register@worldkyc.com',
      REFERRED_BY_PLATFORM: import.meta.env.VITE_REFERRED_BY_PLATFORM || 'WorldKYC Signup',
      IS_REFERRED_BY_REQUIRED: parseBoolean(import.meta.env.VITE_IS_REFERRED_BY_REQUIRED, false),
      AFTER_SIGNUP_URL: import.meta.env.VITE_AFTER_SIGNUP_URL || '',
      NOTARY_NODES: parseWkycNotaryNodes(),
    },
  },
  GPWEB_BETA: {
    id: 'GPWEB_BETA',
    label: 'GPWEB-BETA',
    baseUrl: 'https://www.bizcurrency.com:20300',
    callerId: '819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58',
    signup: {
      BANK_USERNAME: import.meta.env.VITE_GPWEB_BETA_BANK_USERNAME || '',
      BANK_PASSWORD: import.meta.env.VITE_GPWEB_BETA_BANK_PASSWORD || '',
      ACCOUNT_REPRESENTATIVE_ID: '93b92051-5061-eb11-913d-3ee1a118192f',
      CUSTOMER_TEMPLATE_ID: 'd7bccd8b-5261-eb11-913d-3ee1a118192f',
      ACCESS_RIGHT_TEMPLATE_ID: 'e12b3d13-d213-4cad-bbbc-f3a8ca65e533',
      DEFAULT_COUNTRY_CODE: 'HK',
      DEFAULT_REGISTERING_EMAIL: 'register@worldkyc.com',
      REFERRED_BY_PLATFORM: 'WorldKYC Signup',
      IS_REFERRED_BY_REQUIRED: false,
      AFTER_SIGNUP_URL: '',
      NOTARY_NODES: normalizeNotaryNodes(
        [
          {
            branchId: '790553ea-6b85-f011-8556-002248afce03',
            name: 'World KYC HK - DEMO - Hong Kong',
            countryCode: 'HK',
            isDefault: false,
          },
          {
            branchId: 'cb981909-6c85-f011-8556-002248afce03',
            name: 'TradeEnabler TH- DEMO - Thailand',
            countryCode: 'TH',
            isDefault: false,
          },
          {
            branchId: '87b00e64-d28e-f011-8556-002248afce03',
            name: 'WinstantGold SX - DEMO - Sint Maarten',
            countryCode: 'SX',
            isDefault: true,
          },
        ],
        'HK',
      ),
    },
  },
  GPWEB_PRODUCTION: {
    id: 'GPWEB_PRODUCTION',
    label: 'GPWEB-PRODUCTION',
    baseUrl: 'https://www.bizcurrency.com:20300',
    callerId: '819640E9-8DF1-4DB9-B13B-E9DCDDEEBA58',
    signup: {
      BANK_USERNAME:
        import.meta.env.VITE_GPWEB_PRODUCTION_BANK_USERNAME
        || import.meta.env.VITE_GPWEB_PROD_BANK_USERNAME
        || '',
      BANK_PASSWORD:
        import.meta.env.VITE_GPWEB_PRODUCTION_BANK_PASSWORD
        || import.meta.env.VITE_GPWEB_PROD_BANK_PASSWORD
        || '',
      ACCOUNT_REPRESENTATIVE_ID: '93b92051-5061-eb11-913d-3ee1a118192f',
      CUSTOMER_TEMPLATE_ID: 'd7bccd8b-5261-eb11-913d-3ee1a118192f',
      ACCESS_RIGHT_TEMPLATE_ID: 'e12b3d13-d213-4cad-bbbc-f3a8ca65e533',
      DEFAULT_COUNTRY_CODE: 'HK',
      DEFAULT_REGISTERING_EMAIL: 'register@worldkyc.com',
      REFERRED_BY_PLATFORM: 'WorldKYC Signup',
      IS_REFERRED_BY_REQUIRED: false,
      AFTER_SIGNUP_URL: '',
      NOTARY_NODES: normalizeNotaryNodes(
        [
          {
            branchId: '82b42669-ac24-e911-9109-3ee1a118192f',
            name: 'World KYC HK - Hong Kong',
            countryCode: 'HK',
            isDefault: false,
          },
          {
            branchId: 'adbc61a1-648e-e811-bca9-002590067f61',
            name: 'TradeEnabler TH - Thailand',
            countryCode: 'TH',
            isDefault: false,
          },
        ],
        'HK',
      ),
    },
  },
};

const isAppEnvironmentId = (value: string | null): value is AppEnvironmentId => {
  if (!value) return false;
  return value in APP_ENVIRONMENT_CONFIGS;
};

const getEnvironmentStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const API_CONFIG = {

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/Authenticate',
      REFRESH: '/api/v1/Authenticate/Refresh',
    },
    USER: {
      DOES_USERNAME_EXIST: '/api/v1/User/DoesUsernameExist',
      LINK_ACCESS_RIGHT_TEMPLATE: '/api/v1/User/LinkAccessRightTemplate',
      PASSWORD_CHANGE: '/api/v1/User/PasswordChange',
    },
    CUSTOMER: {
      GET: '/api/v1/Customer',
      UPDATE: '/api/v1/Customer',
      BALANCES: '/api/v1/CustomerAccountBalance',
      STATEMENT: '/api/v1/CustomerAccountStatement',
      FROM_TEMPLATE: '/api/v1/Customer/FromTemplate',
      USER: '/api/v1/CustomerUser',
    },
    COUNTRY: {
      LIST: '/api/v1/CountryList',
      ID_TYPES: '/api/v1/CountryIdentificationTypeList',
    },
    FILE_ATTACHMENT: {
      BASE: '/api/v1/FileAttachment',
      INFO_LIST: '/api/v1/FileAttachmentInfoList',
    },
    VERIFIED_LINK: {
      BASE: '/api/v1/VerifiedLink',
      SEARCH: '/api/v1/VerifiedLink/Search',
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

  TIMEOUT: 30000,

  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    EXPIRES_AT: 'auth_expires_at',
    SELECTED_ENVIRONMENT: 'selected_environment',
    AUTH_RESET_DONE: 'auth_reset_done_v1',
    ENCRYPTED_CREDENTIALS: 'auth_encrypted_credentials',
  },
} as const;

export const getEnvironmentOptions = (): Array<{ id: AppEnvironmentId; label: string }> => {
  return (Object.keys(APP_ENVIRONMENT_CONFIGS) as AppEnvironmentId[]).map((id) => ({
    id,
    label: APP_ENVIRONMENT_CONFIGS[id].label,
  }));
};

export const getSelectedEnvironment = (): AppEnvironmentId => {
  const storage = getEnvironmentStorage();
  const value = storage?.getItem(API_CONFIG.STORAGE_KEYS.SELECTED_ENVIRONMENT) ?? null;
  return isAppEnvironmentId(value) ? value : DEFAULT_ENVIRONMENT_ID;
};

export const setSelectedEnvironment = (environmentId: AppEnvironmentId): void => {
  const storage = getEnvironmentStorage();
  if (!storage) return;
  storage.setItem(API_CONFIG.STORAGE_KEYS.SELECTED_ENVIRONMENT, environmentId);
};

export const getActiveEnvironmentConfig = (): EnvironmentConfig => {
  return APP_ENVIRONMENT_CONFIGS[getSelectedEnvironment()];
};

export const getActiveBaseUrl = (): string => getActiveEnvironmentConfig().baseUrl;

export const getActiveCallerId = (): string => getActiveEnvironmentConfig().callerId;

export const getActiveSignupConfig = (): SignupConfig => getActiveEnvironmentConfig().signup;
