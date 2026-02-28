// Enhanced logging utility for React app

const isDev = import.meta.env.MODE === 'development';

export const logger = {
  // App lifecycle logs
  app: (message: string, ...args: any[]) => {
    if (isDev) console.log(`🚀 [APP] ${message}`, ...args);
  },

  // Component logs
  component: (name: string, message: string, ...args: any[]) => {
    if (isDev) console.log(`📦 [${name}] ${message}`, ...args);
  },

  // API logs
  api: {
    request: (endpoint: string, method: string = 'GET', data?: any) => {
      if (isDev) {
        console.log(`🌐 [API REQUEST] ${method} ${endpoint}`);
        if (data) console.log('   Payload:', data);
      }
    },
    response: (endpoint: string, data: any) => {
      if (isDev) {
        console.log(`✅ [API RESPONSE] ${endpoint}`);
        console.log('   Data:', data);
      }
    },
    error: (endpoint: string, error: any) => {
      console.error(`❌ [API ERROR] ${endpoint}`);
      console.error('   Error:', error);
      console.error('   Response:', error.response);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
    },
  },

  // Auth logs
  auth: {
    login: (user: any) => {
      if (isDev) console.log('🔐 [AUTH] User logged in:', user);
    },
    logout: () => {
      if (isDev) console.log('🔐 [AUTH] User logged out');
    },
    tokenRefresh: () => {
      if (isDev) console.log('🔐 [AUTH] Token refreshed');
    },
    error: (message: string, error?: any) => {
      console.error(`🔐 [AUTH ERROR] ${message}`, error);
    },
  },

  // Navigation logs
  nav: (from: string, to: string) => {
    if (isDev) console.log(`🧭 [NAV] ${from} → ${to}`);
  },

  // Error logs
  error: (context: string, error: any) => {
    console.error(`❌ [ERROR in ${context}]`, error);
  },

  // Warning logs
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [WARNING] ${message}`, ...args);
  },

  // Success logs
  success: (message: string, ...args: any[]) => {
    if (isDev) console.log(`✅ [SUCCESS] ${message}`, ...args);
  },

  // Debug logs
  debug: (context: string, message: string, data?: any) => {
    if (isDev) {
      console.log(`🔍 [DEBUG ${context}] ${message}`);
      if (data) console.log('   Data:', data);
    }
  },
};

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ [GLOBAL ERROR]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [UNHANDLED PROMISE REJECTION]', {
    reason: event.reason,
    promise: event.promise,
  });
});

export default logger;
