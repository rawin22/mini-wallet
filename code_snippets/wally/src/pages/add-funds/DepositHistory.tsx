import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { depositService, type DepositRecord } from '../../api/deposit.service';
import '../../styles/DepositHistory.css';

export const DepositHistory: React.FC = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  // Fetch deposits
  useEffect(() => {
    fetchDeposits();
  }, [currentPage, user?.userId]);

  const fetchDeposits = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await depositService.search({
        pageIndex: currentPage,
        pageSize: pageSize,
        sortBy: 'CreatedTime',
        sortDirection: 'Descending',
      });

      setDeposits(response.deposits || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setError('Failed to load deposit history. Please try again.');
      setDeposits([]);
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
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  // Filter deposits (client-side)
  const filteredDeposits = deposits.filter((deposit) => {
    // Filter by status
    if (statusFilter && deposit.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Filter by currency
    if (currencyFilter && deposit.currency !== currencyFilter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        deposit.reference.toLowerCase().includes(term) ||
        deposit.senderBank?.toLowerCase().includes(term) ||
        deposit.senderName?.toLowerCase().includes(term) ||
        deposit.currency.toLowerCase().includes(term)
      );
    }

    return true;
  });

  // Get unique currencies for filter
  const currencies = [...new Set(deposits.map((d) => d.currency))].sort();

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="deposit-history-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading deposit history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deposit-history-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchDeposits}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="deposit-history-page">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <a href="/dashboard">Dashboard</a> &gt; <a href="/add-funds/bank">Add Funds</a> &gt;
        </div>
        <h1 className="page-title">Deposit History</h1>
        <p className="page-subtitle">Wire transfer deposit records</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by reference, bank, or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="currency-filter">
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
          >
            <option value="">All Currencies</option>
            {currencies.map((ccy) => (
              <option key={ccy} value={ccy}>
                {ccy}
              </option>
            ))}
          </select>
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </button>
        </div>

        <div className="results-info">
          Showing {filteredDeposits.length} of {totalCount} deposits
        </div>
      </div>

      {/* Deposits List */}
      <div className="deposits-container">
        <div className="section-title">Deposit Records</div>

        {filteredDeposits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <p>No deposit records found.</p>
            <a href="/add-funds/bank" className="btn-add-funds">
              View Deposit Instructions
            </a>
          </div>
        ) : (
          <div className="deposits-list">
            {filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="deposit-item">
                <div className="deposit-datetime">
                  <span className="deposit-icon">🏦</span>
                  <div className="datetime-wrapper">
                    <span className="datetime-text">{formatDate(deposit.createdAt)}</span>
                    <span className="datetime-text">{formatTime(deposit.createdAt)}</span>
                  </div>
                </div>

                <div className="deposit-details">
                  <span className="deposit-reference">{deposit.reference}</span>
                  <span className="deposit-source">
                    {deposit.senderBank && `${deposit.senderBank}`}
                    {deposit.senderName && ` • ${deposit.senderName}`}
                  </span>
                </div>

                <div className="deposit-amount">
                  <span className="amount-label">Amount</span>
                  <span className="amount-value">
                    +{deposit.currency} {formatAmount(deposit.amount)}
                  </span>
                </div>

                <div className="deposit-type">
                  <span className="type-label">Type</span>
                  <span className="type-badge">{deposit.type}</span>
                </div>

                <div className="deposit-status">
                  <span className={`status-badge ${getStatusClass(deposit.status)}`}>
                    {deposit.status}
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
