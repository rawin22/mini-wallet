// src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Balances } from './pages/Balances';
import { Statement } from './pages/Statement';
import { PaymentsHistory } from './pages/history/PaymentsHistory';
import { Withdraw } from './pages/Withdraw';
import { Deposit } from './pages/Deposit';
import { PayNow } from './pages/PayNow';
import { PaymentWizard } from './pages/PaymentWizard';
import { Exchange } from './pages/Exchange';
import { ConvertHistory } from './pages/history/ConvertHistory';
import { BankAccount } from './pages/add-funds/BankAccount';
import { DepositProof } from './pages/add-funds/DepositProof';
import { DepositHistory } from './pages/add-funds/DepositHistory';
import { Contact } from './pages/Contact';

const App: React.FC = () => {
  console.log('🎯 App Component Rendering');

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/balances"
            element={
              <ProtectedRoute>
                <Layout>
                  <Balances />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/statement/:accountId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Statement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentsHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Layout>
                  <Withdraw />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Layout>
                  <Deposit />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pay-now"
            element={
              <ProtectedRoute>
                <Layout>
                  <PayNow />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-wizard"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentWizard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exchange"
            element={
              <ProtectedRoute>
                <Layout>
                  <Exchange />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/convert"
            element={
              <ProtectedRoute>
                <Layout>
                  <ConvertHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-funds/bank"
            element={
              <ProtectedRoute>
                <Layout>
                  <BankAccount />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-funds/proof"
            element={
              <ProtectedRoute>
                <Layout>
                  <DepositProof />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-funds/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <DepositHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Layout>
                  <Contact />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Receive redirects to Deposit */}
          <Route path="/receive" element={<Navigate to="/deposit" replace />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
