import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import type { CustomerBalanceData } from '../types/balance.types';
import { BalanceListItem } from '../components/BalanceListItem';
import '../styles/Balances.css';

const HIDE_ZERO_BALANCES_KEY = 'balances_hide_zero';

export const Balances: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [filteredBalances, setFilteredBalances] = useState<CustomerBalanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters - Initialize from localStorage
  const [hideZeroBalances, setHideZeroBalances] = useState<boolean>(() => {
    const saved = localStorage.getItem(HIDE_ZERO_BALANCES_KEY);
    return saved === 'true';
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Persist hideZeroBalances filter to localStorage
  useEffect(() => {
    localStorage.setItem(HIDE_ZERO_BALANCES_KEY, String(hideZeroBalances));
  }, [hideZeroBalances]);

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!user?.userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await balanceService.getBalances(user.userId);
        setBalances(response.balances || []);
      } catch (err) {
        console.error('Error fetching balances:', err);
        setError('Failed to load balances. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [user?.userId]);

  // Apply filters
  useEffect(() => {
    let result = [...balances];

    // Hide zero balances
    if (hideZeroBalances) {
      result = result.filter(b => b.balanceAvailable > 0);
    }

    // Favorites only (placeholder - implement favorites logic)
    if (favoritesOnly) {
      // TODO: Filter by favorites from user preferences
      result = result.filter(() => false); // Placeholder
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.currencyCode.toLowerCase().includes(term) ||
        b.accountNumber.includes(term)
      );
    }

    // Sort by currency code
    result.sort((a, b) => a.currencyCode.localeCompare(b.currencyCode));

    setFilteredBalances(result);
  }, [balances, hideZeroBalances, favoritesOnly, searchTerm]);

  // Calculate total in base currency
  const totalBaseBalance = balances.reduce(
    (sum, b) => sum + b.balanceAvailableBase,
    0
  );

  const handleViewStatement = (accountId: string) => {
    // Navigate to statement page
    console.log('View statement for:', accountId);
    navigate(`/history/statement/${accountId}`);
  };

  if (isLoading) {
    return (
      <div className="balances-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading balances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="balances-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="balances-page">
      {/* Header */}
      <div className="balances-header">
        <div className="breadcrumb">
          <a href="/dashboard">Dashboard</a> &gt; Balances
        </div>
        <h1 className="page-title">Balances</h1>

        {/* Total Balance Summary */}
        <div className="total-balance-card">
          <div className="total-label">Total Balance (USD Equivalent)</div>
          <div className="total-amount">
            {totalBaseBalance.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </div>
          <div className="total-subtitle">
            Across {balances.length} currencies
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="balances-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by currency or account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-toggles">
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={hideZeroBalances}
              onChange={(e) => setHideZeroBalances(e.target.checked)}
            />
            <span className="toggle-label">Hide Zero Balances</span>
          </label>

          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            <span className="toggle-label">Favorites Only</span>
          </label>
        </div>

        <div className="results-count">
          Showing {filteredBalances.length} of {balances.length} accounts
        </div>
      </div>

      {/* Balance List */}
      <div className="balances-container">
        {filteredBalances.length === 0 ? (
          <div className="empty-state">
            <p>No balances found matching your filters.</p>
          </div>
        ) : (
          <div className="balances-list">
            {filteredBalances.map((balance) => (
              <BalanceListItem
                key={balance.accountId}
                balance={balance}
                onViewStatement={handleViewStatement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
