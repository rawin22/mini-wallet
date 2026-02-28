// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './utils/logger'; // Initialize global error handlers

console.log('🚀 ========================================');
console.log('🚀 WINPAY WALLET - React Application');
console.log('🚀 ========================================');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'NOT SET');
console.log('📅 Build Time:', new Date().toISOString());
console.log('🚀 ========================================\n');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('\n✅ React App Mounted Successfully!');
