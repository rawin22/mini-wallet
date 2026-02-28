import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import type { CustomerBalanceData } from '../types/balance.types';
import BalanceCard from '../components/BalanceCard';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { ExchangeRatesWidget } from '../components/widgets/ExchangeRatesWidget';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  console.log('📊 Dashboard Component Rendering');
  const { user } = useAuth();
  console.log('👤 Current User:', user);
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hideZeroBalances, setHideZeroBalances] = useState<boolean>(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalances = async () => {
      console.log('💰 Fetching balances for user:', user?.userId);
      if (!user?.userId) {
        console.warn('⚠️ No user ID found');
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🌐 Calling balance API...');
        const response = await balanceService.getBalances(user.userId);
        console.log('✅ Balances received:', response.balances?.length || 0, 'currencies');
        setBalances(response.balances || []);
      } catch (err: any) {
        console.error('❌ Failed to fetch balances:', err);
        console.error('Error details:', err.response || err);
        setError(err.message || 'Failed to load balances. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [user?.userId]);

  const getFilteredBalances = (): CustomerBalanceData[] => {
    let filtered = [...balances];

    if (hideZeroBalances) {
      filtered = filtered.filter((b) => b.balanceAvailable > 0);
    }

    if (showFavoritesOnly) {
      filtered = [];
    }

    return filtered;
  };

  const filteredBalances = getFilteredBalances();

  return (
    <div className="dashboard-page">
      <div className="breadcrumb">
        <span className="breadcrumb-item">Dashboard</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">May the force be with you!</span>
      </div>

      <h2 className="dashboard-greeting">Welcome {user?.firstName?.toLowerCase()}</h2>

      <div className="balance-section">
        <div className="balance-section-header">
          <h3 className="balance-section-title">Your Balances</h3>
          <div className="balance-filters">
            <ToggleSwitch
              label="Favorites Only"
              active={showFavoritesOnly}
              onChange={setShowFavoritesOnly}
            />
            <ToggleSwitch
              label="Hide 0 Balances"
              active={hideZeroBalances}
              onChange={setHideZeroBalances}
            />
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading balances...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredBalances.length === 0 ? (
              <div className="no-balances">
                <p>
                  {showFavoritesOnly
                    ? 'No favorite balances to display.'
                    : hideZeroBalances
                      ? 'No balances with available funds.'
                      : 'No balances found.'}
                </p>
              </div>
            ) : (
              <div className="balance-cards-scroll-container">
                {filteredBalances.map((balance) => (
                  <div key={balance.accountId} className="balance-card-item">
                    <BalanceCard balance={balance} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="exchange-rates-section">
        <ExchangeRatesWidget
          visibleCurrencies={[
            ...balances
              .filter((b) => b.balanceAvailable > 0)
              .map((b) => b.currencyCode),
            'USD', // Always include USD for gold pricing reference
          ].filter((v, i, a) => a.indexOf(v) === i)} // Remove duplicates
        />
      </div>
    </div>
  );
};
