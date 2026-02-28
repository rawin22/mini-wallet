import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fxService } from '../../api/fx.service';
import type { FXDeal } from '../../types/fx.types';
import '../../styles/ConvertHistory.css';

export const ConvertHistory: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<FXDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  // Fetch FX deals
  useEffect(() => {
    fetchDeals();
  }, [currentPage, user?.userId]);

  const fetchDeals = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fxService.searchDeals({
        pageIndex: currentPage,
        pageSize: pageSize,
        sortBy: 'CreatedTime',
        sortDirection: 'Descending',
      });

      setDeals(response.deals || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Error fetching FX deals:', err);
      setError('Failed to load exchange history. Please try again.');
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'settled':
      case 'completed':
        return 'status-settled';
      case 'booked':
      case 'pending':
        return 'status-pending';
      case 'cancelled':
      case 'expired':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  // Filter deals (client-side)
  const filteredDeals = deals.filter((deal) => {
    // Filter by status
    if (statusFilter && deal.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        deal.dealReference.toLowerCase().includes(term) ||
        deal.sellCurrency.toLowerCase().includes(term) ||
        deal.buyCurrency.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="convert-history-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading exchange history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="convert-history-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchDeals}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="convert-history-page">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <a href="/dashboard">Dashboard</a> &gt;
        </div>
        <h1 className="page-title">Exchange History</h1>
        <p className="page-subtitle">Currency conversion transactions</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by reference or currency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'settled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('settled')}
          >
            Settled
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="results-info">
          Showing {filteredDeals.length} of {totalCount} exchanges
        </div>
      </div>

      {/* Deals List */}
      <div className="deals-container">
        <div className="section-title">Exchange Transactions</div>

        {filteredDeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💱</div>
            <p>No exchange transactions found.</p>
            <a href="/exchange" className="btn-exchange">
              Make an Exchange
            </a>
          </div>
        ) : (
          <div className="deals-list">
            {filteredDeals.map((deal) => (
              <div key={deal.dealId} className="deal-item">
                <div className="deal-datetime">
                  <span className="deal-icon">💱</span>
                  <div className="datetime-wrapper">
                    <span className="datetime-text">{formatDate(deal.createdAt)}</span>
                    <span className="datetime-text">{formatTime(deal.createdAt)}</span>
                  </div>
                </div>

                <div className="deal-conversion">
                  <div className="conversion-row sell">
                    <span className="conversion-label">Sold</span>
                    <span className="conversion-amount">
                      -{deal.sellCurrency} {formatAmount(deal.sellAmount)}
                    </span>
                  </div>
                  <div className="conversion-arrow">→</div>
                  <div className="conversion-row buy">
                    <span className="conversion-label">Bought</span>
                    <span className="conversion-amount">
                      +{deal.buyCurrency} {formatAmount(deal.buyAmount)}
                    </span>
                  </div>
                </div>

                <div className="deal-rate">
                  <span className="rate-label">Rate</span>
                  <span className="rate-value">
                    1 {deal.sellCurrency} = {deal.exchangeRate.toFixed(4)} {deal.buyCurrency}
                  </span>
                </div>

                <div className="deal-reference">
                  <span className="reference-label">Reference</span>
                  <span className="reference-value">{deal.dealReference}</span>
                </div>

                <div className="deal-status">
                  <span className={`status-badge ${getStatusClass(deal.status)}`}>
                    {deal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            className="page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
