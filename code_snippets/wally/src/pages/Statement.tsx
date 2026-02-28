import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { statementService } from '../api/statement.service';
import type { StatementResponse } from '../types/statement.types';
import '../styles/Statement.css';

export const Statement: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get dates from URL params or set defaults (last 90 days)
  const getDefaultStartDate = () => {
    const paramDate = searchParams.get('startDate');
    if (paramDate) return new Date(paramDate);
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  };

  const getDefaultEndDate = () => {
    const paramDate = searchParams.get('endDate');
    if (paramDate) return new Date(paramDate);
    return new Date();
  };

  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<Date>(getDefaultEndDate());
  const [statementData, setStatementData] = useState<StatementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statement data
  useEffect(() => {
    const fetchStatement = async () => {
      if (!accountId) {
        setError('Invalid account ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await statementService.getStatement(accountId, startDate, endDate);
        setStatementData(response);
      } catch (err) {
        console.error('Error fetching statement:', err);
        setError('Failed to load statement. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatement();
  }, [accountId, startDate, endDate]);

  // Apply filter (update URL params and state)
  const handleApplyFilter = () => {
    const params = new URLSearchParams();
    params.set('startDate', formatDateForURL(startDate));
    params.set('endDate', formatDateForURL(endDate));
    setSearchParams(params);
  };

  // Date preset handlers
  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  // Calculate totals
  const totalDebits = statementData?.entries?.reduce((sum, e) => sum + e.debitAmount, 0) || 0;
  const totalCredits = statementData?.entries?.reduce((sum, e) => sum + e.creditAmount, 0) || 0;
  const netChange = totalCredits - totalDebits;

  if (isLoading) {
    return (
      <div className="statement-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statement...</p>
        </div>
      </div>
    );
  }

  if (error || !statementData) {
    return (
      <div className="statement-page">
        <div className="error-container">
          <p className="error-message">{error || 'Failed to load statement'}</p>
          <button onClick={() => navigate('/balances')}>Back to Balances</button>
        </div>
      </div>
    );
  }

  return (
    <div className="statement-page">
      {/* Header */}
      <div className="statement-header">
        <div className="breadcrumb">
          <a href="/dashboard">Dashboard</a> &gt; <a href="/balances">Balances</a> &gt; Statement
        </div>
        <h1 className="page-title">
          Statement for {statementData.accountInfo.accountCurrencyCode}
        </h1>
      </div>

      {/* Account Details Card */}
      <div className="account-details-card">
        <h2 className="card-title">Account Details</h2>
        <div className="account-details-grid">
          <div className="detail-item">
            <span className="detail-label">Account Number:</span>
            <span className="detail-value">{statementData.accountInfo.accountNumber}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Account Name:</span>
            <span className="detail-value">{statementData.accountInfo.accountName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Currency:</span>
            <span className="detail-value">{statementData.accountInfo.accountCurrencyCode}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Currency Scale:</span>
            <span className="detail-value">{statementData.accountInfo.accountCurrencyScale}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Beginning Balance:</span>
            <span className="detail-value balance-amount">
              {formatAmount(statementData.accountInfo.beginningBalance, statementData.accountInfo.accountCurrencyScale)} {statementData.accountInfo.accountCurrencyCode}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Ending Balance:</span>
            <span className="detail-value balance-amount">
              {formatAmount(statementData.accountInfo.endingBalance, statementData.accountInfo.accountCurrencyScale)} {statementData.accountInfo.accountCurrencyCode}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3 className="filter-title">Date Range</h3>

        {/* Date Presets */}
        <div className="date-presets">
          <button onClick={() => setDatePreset(7)} className="preset-button">Last 7 Days</button>
          <button onClick={() => setDatePreset(30)} className="preset-button">Last 30 Days</button>
          <button onClick={() => setDatePreset(90)} className="preset-button">Last 90 Days</button>
        </div>

        {/* Date Pickers */}
        <div className="date-pickers">
          <div className="date-input-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(startDate)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={formatDateForInput(endDate)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="date-input"
            />
          </div>
          <button onClick={handleApplyFilter} className="apply-filter-button">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-label">Total Debits</div>
          <div className="summary-value debit">
            -{formatAmount(totalDebits, statementData.accountInfo.accountCurrencyScale)} {statementData.accountInfo.accountCurrencyCode}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Credits</div>
          <div className="summary-value credit">
            +{formatAmount(totalCredits, statementData.accountInfo.accountCurrencyScale)} {statementData.accountInfo.accountCurrencyCode}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Net Change</div>
          <div className={`summary-value ${netChange >= 0 ? 'credit' : 'debit'}`}>
            {netChange >= 0 ? '+' : ''}{formatAmount(netChange, statementData.accountInfo.accountCurrencyScale)} {statementData.accountInfo.accountCurrencyCode}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Transactions</div>
          <div className="summary-value">{statementData.entries?.length || 0}</div>
        </div>
      </div>

      {/* Statement Entries */}
      <div className="entries-section">
        <h3 className="entries-title">
          Statement Entries ({formatDateDisplay(startDate)} - {formatDateDisplay(endDate)})
        </h3>

        {!statementData.entries || statementData.entries.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found for this period.</p>
          </div>
        ) : (
          <div className="entries-table-container">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th className="amount-column">Debit</th>
                  <th className="amount-column">Credit</th>
                  <th className="amount-column">Balance</th>
                </tr>
              </thead>
              <tbody>
                {statementData.entries?.map((entry) => (
                  <tr key={entry.transactionId} className="entry-row">
                    <td className="date-cell">{formatDateTime(entry.transactionTime)}</td>
                    <td>
                      <span className="transaction-type-badge">{entry.transactionType}</span>
                    </td>
                    <td className="description-cell">{entry.description}</td>
                    <td className="reference-cell">{entry.referenceNumber || '-'}</td>
                    <td className="amount-column debit-amount">
                      {entry.debitAmount > 0 ? formatAmount(entry.debitAmount, statementData.accountInfo.accountCurrencyScale) : '-'}
                    </td>
                    <td className="amount-column credit-amount">
                      {entry.creditAmount > 0 ? formatAmount(entry.creditAmount, statementData.accountInfo.accountCurrencyScale) : '-'}
                    </td>
                    <td className="amount-column balance-cell">
                      {formatAmount(entry.runningBalance, statementData.accountInfo.accountCurrencyScale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="secondary-button">
          Back to Dashboard
        </button>
        <button onClick={() => navigate('/balances')} className="secondary-button">
          Back to Balances
        </button>
      </div>
    </div>
  );
};

// Helper functions
function formatAmount(amount: number, scale: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: scale,
    maximumFractionDigits: scale,
  });
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForURL(date: Date): string {
  return formatDateForInput(date);
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
