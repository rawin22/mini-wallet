import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Layout } from './components/layout/Layout.tsx';
import { Login } from './pages/Login.tsx';
import { Signup } from './pages/Signup.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Statement } from './pages/Statement.tsx';
import { InstantPayment } from './pages/InstantPayment.tsx';
import { FxDeal } from './pages/FxDeal.tsx';
import { PaymentHistory } from './pages/PaymentHistory.tsx';
import { ConvertHistory } from './pages/ConvertHistory.tsx';
import { Help } from './pages/Help.tsx';

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/statement/:accountId" element={<ProtectedRoute><Layout><Statement /></Layout></ProtectedRoute>} />
        <Route path="/pay-now" element={<ProtectedRoute><Layout><InstantPayment /></Layout></ProtectedRoute>} />
        <Route path="/exchange" element={<ProtectedRoute><Layout><FxDeal /></Layout></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Layout><Help /></Layout></ProtectedRoute>} />
        <Route path="/history/payments" element={<ProtectedRoute><Layout><PaymentHistory /></Layout></ProtectedRoute>} />
        <Route path="/history/convert" element={<ProtectedRoute><Layout><ConvertHistory /></Layout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
