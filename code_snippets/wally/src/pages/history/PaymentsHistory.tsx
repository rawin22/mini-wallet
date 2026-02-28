import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { paymentService } from '../../api/payment.service';
import type {
  UnifiedPayment,
  PaymentSearchRequest,
} from '../../types/payment.types';
import { PaymentListItem } from '../../components/PaymentListItem';
import '../../styles/PaymentsHistory.css';

export const PaymentsHistory: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'' | 'instant' | 'wire'>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  // Current user alias
  const currentUserAlias = user?.userName || '';

  // Fetch payments
  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const request: PaymentSearchRequest = {
        pageIndex: currentPage,
        pageSize: pageSize,
        sortBy: 'CreatedTime',
        sortDirection: 'Descending',
      };

      const response = await paymentService.searchAllPayments(request, currentUserAlias);

      setPayments(response.payments || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (paymentId: string, paymentType: 'instant' | 'wire') => {
    // Navigate to payment details page
    console.log('View details for payment:', paymentId, 'type:', paymentType);
    // TODO: Navigate to appropriate details page based on type
    // if (paymentType === 'instant') {
    //   navigate(`/history/instant-payment/${paymentId}`);
    // } else {
    //   navigate(`/history/wire-payment/${paymentId}`);
    // }
  };

  const handleRepeat = (payment: UnifiedPayment) => {
    // Navigate to new payment form with pre-filled data
    console.log('Repeat payment:', payment);
    // TODO: Navigate to appropriate payment form based on type
    // if (payment.type === 'instant') {
    //   navigate('/pay-now', { state: { prefilledData: payment.rawData } });
    // } else {
    //   navigate('/withdraw', { state: { prefilledData: payment.rawData } });
    // }
  };

  // Filter payments (client-side)
  const filteredPayments = payments.filter(p => {
    // Filter by payment type
    if (paymentTypeFilter && p.type !== paymentTypeFilter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.from.toLowerCase().includes(term) ||
        p.to.toLowerCase().includes(term) ||
        p.reference.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="payments-history-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payments-history-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPayments}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-history-page">
      {/* Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <a href="/dashboard">Dashboard</a> &gt;
        </div>
        <h1 className="page-title">Payments History</h1>
        <p className="page-subtitle">
          Instant peer-to-peer transfers and wire payments
        </p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name, reference, or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="type-filters">
          <button
            className={`filter-btn ${paymentTypeFilter === '' ? 'active' : ''}`}
            onClick={() => setPaymentTypeFilter('')}
          >
            All Payments
          </button>
          <button
            className={`filter-btn ${paymentTypeFilter === 'instant' ? 'active' : ''}`}
            onClick={() => setPaymentTypeFilter('instant')}
          >
            💸 Instant
          </button>
          <button
            className={`filter-btn ${paymentTypeFilter === 'wire' ? 'active' : ''}`}
            onClick={() => setPaymentTypeFilter('wire')}
          >
            🏦 Wire
          </button>
        </div>

        <div className="results-info">
          Showing {filteredPayments.length} of {totalCount} payments
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-container">
        <div className="section-title">Payments History</div>

        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <p>No payments found.</p>
          </div>
        ) : (
          <div className="payments-list">
            {filteredPayments.map((payment) => (
              <PaymentListItem
                key={`${payment.type}-${payment.id}`}
                payment={payment}
                currentUserAlias={currentUserAlias}
                onViewDetails={handleViewDetails}
                onRepeat={handleRepeat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
