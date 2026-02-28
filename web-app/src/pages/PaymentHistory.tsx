import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { paymentHistoryService } from '../api/payment-history.service.ts';
import { formatCurrency, formatDateTime } from '../utils/formatters.ts';
import type { PaymentSearchRecord } from '../types/payment.types.ts';
import '../styles/PaymentHistory.css';

export const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentSearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await paymentHistoryService.searchPayments();
        setPayments(result.records?.payments || []);
      } catch (err) {
        setError('Failed to load payment history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  return (
    <div className="history-page">
      <h1>Payment History</h1>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>}
      {error && <div className="error-box"><p>{error}</p></div>}

      {!loading && !error && (
        payments.length === 0 ? (
          <p className="no-data">No payments found.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th><th>Reference</th><th>From</th><th>To</th>
                <th className="num">Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.paymentId}>
                  <td>{formatDateTime(p.createdTime)}</td>
                  <td>{p.paymentReference}</td>
                  <td>{p.fromCustomerName || p.fromCustomerAlias}</td>
                  <td>{p.toCustomerName || p.toCustomerAlias}</td>
                  <td className="num">{formatCurrency(p.amount)} {p.currencyCode}</td>
                  <td><span className={`status-badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};
