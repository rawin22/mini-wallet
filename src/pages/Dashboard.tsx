import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { balanceService } from '../api/balance.service.ts';
import { formatCurrency } from '../utils/formatters.ts';
import type { CustomerBalanceData } from '../types/balance.types.ts';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideZero, setHideZero] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBalances = async () => {
      try {
        setLoading(true);
        const data = await balanceService.getBalances(user.organizationId);
        setBalances(data.balances || []);
      } catch (err) {
        setError(t('dashboard.loadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [user, t]);

  const filtered = hideZero
    ? balances.filter((b) => b.balance !== 0 || b.balanceAvailable !== 0)
    : balances;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('dashboard.welcome', { name: user?.firstName || '' })}</h1>
        <label className="hide-zero-toggle">
          <input type="checkbox" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} />
          {t('dashboard.hideZero')}
        </label>
      </div>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>{t('dashboard.loadingBalances')}</p></div>}

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>{t('common.retry')}</button>
        </div>
      )}

      {!loading && !error && (
        <div className="balance-grid">
          {filtered.length === 0 && <p className="no-data">{t('dashboard.noBalances')}</p>}
          {filtered.map((bal) => (
            <div key={bal.accountId} className="balance-card" onClick={() => navigate(`/statement/${bal.accountId}`)}>
              <div className="balance-card-header">
                <span className="currency-code">{bal.currencyCode}</span>
                <span className="account-number">{bal.accountNumber}</span>
              </div>
              <div className="balance-card-body">
                <div className="balance-row">
                  <span className="balance-label">{t('dashboard.available')}</span>
                  <span className="balance-value balance-number">{formatCurrency(bal.balanceAvailable)}</span>
                </div>
                <div className="balance-row">
                  <span className="balance-label">{t('dashboard.reserved')}</span>
                  <span className="balance-value balance-number">{formatCurrency(bal.activeHoldsTotal)}</span>
                </div>
                <div className="balance-row total">
                  <span className="balance-label">{t('dashboard.total')}</span>
                  <span className="balance-value balance-number">{formatCurrency(bal.balance)}</span>
                </div>
              </div>
              <div className="balance-card-footer">{t('dashboard.viewStatement')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
