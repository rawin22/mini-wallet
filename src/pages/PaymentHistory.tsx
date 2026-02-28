import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { paymentHistoryService } from '../api/payment-history.service.ts';
import { formatCurrency, formatDateTime } from '../utils/formatters.ts';
import type { PaymentSearchRecord } from '../types/payment.types.ts';
import '../styles/PaymentHistory.css';

export const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
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
        setError(t('history.paymentsLoadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user, t]);

  return (
    <div className="history-page">
      <h1>{t('history.paymentsTitle')}</h1>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>{t('common.loading')}</p></div>}
      {error && <div className="error-box"><p>{error}</p></div>}

      {!loading && !error && (
        payments.length === 0 ? (
          <p className="no-data">{t('history.noPayments')}</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>{t('history.date')}</th><th>{t('history.reference')}</th><th>{t('history.from')}</th><th>{t('history.to')}</th>
                <th className="num">{t('history.amount')}</th><th>{t('history.status')}</th>
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
