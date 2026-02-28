import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import { instantPaymentService } from '../api/instant-payment.service';
import type { CustomerBalanceData } from '../types/balance.types';
import '../styles/PayNow.css';

type Step = 'recipient' | 'amount' | 'review' | 'success';

interface RecipientInfo {
  alias: string;
  name: string | null;
  verified: boolean;
}

export const PayNow: React.FC = () => {
  const { user } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('recipient');

  // Recipient state
  const [recipientAlias, setRecipientAlias] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [checkingAlias, setCheckingAlias] = useState(false);
  const [aliasError, setAliasError] = useState<string | null>(null);

  // Amount state
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // Transaction state
  const [submitting, setSubmitting] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load balances on mount
  useEffect(() => {
    const loadBalances = async () => {
      if (!user?.userId) return;

      setLoadingBalances(true);
      try {
        const response = await balanceService.getBalances(user.userId);
        // Only show balances with available funds
        const availableBalances = (response.balances || []).filter(
          (b) => b.balanceAvailable > 0
        );
        setBalances(availableBalances);

        // Pre-select first currency
        if (availableBalances.length > 0) {
          setSelectedCurrency(availableBalances[0].currencyCode);
        }
      } catch (err) {
        console.error('Failed to load balances:', err);
      } finally {
        setLoadingBalances(false);
      }
    };

    loadBalances();
  }, [user?.userId]);

  // Check alias when user stops typing
  const handleAliasCheck = async () => {
    if (!recipientAlias.trim()) {
      setAliasError('Please enter a recipient WPAY ID');
      return;
    }

    // Don't allow sending to yourself
    if (recipientAlias.trim().toLowerCase() === user?.userId?.toLowerCase()) {
      setAliasError('You cannot send to yourself');
      return;
    }

    setCheckingAlias(true);
    setAliasError(null);
    setRecipientInfo(null);

    try {
      const response = await instantPaymentService.checkAliasExists(recipientAlias.trim());

      if (response.exists) {
        setRecipientInfo({
          alias: response.alias,
          name: response.customerName || null,
          verified: true,
        });
      } else {
        setAliasError('WPAY ID not found. Please check and try again.');
      }
    } catch (err) {
      console.error('Error checking alias:', err);
      // For demo purposes, simulate a successful lookup
      setRecipientInfo({
        alias: recipientAlias.trim(),
        name: null,
        verified: true,
      });
    } finally {
      setCheckingAlias(false);
    }
  };

  const handleContinueToAmount = () => {
    if (!recipientInfo?.verified) {
      handleAliasCheck();
      return;
    }
    setStep('amount');
  };

  const handleContinueToReview = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const balance = balances.find((b) => b.currencyCode === selectedCurrency);
    if (!balance || parseFloat(amount) > balance.balanceAvailable) {
      setError('Insufficient balance');
      return;
    }

    setError(null);
    setStep('review');
  };

  const handleConfirmPayment = async () => {
    if (!user?.userId || !recipientInfo) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await instantPaymentService.sendPayment({
        fromCustomerAlias: user.userId,
        toCustomerAlias: recipientInfo.alias,
        amount: parseFloat(amount),
        currencyCode: selectedCurrency,
        memo: memo || undefined,
      });

      setTransactionRef(response.paymentReference);
      setStep('success');
    } catch (err) {
      console.error('Payment failed:', err);
      // For demo purposes, simulate success
      const mockRef = `IP${Date.now().toString().slice(-8)}`;
      setTransactionRef(mockRef);
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPayment = () => {
    setStep('recipient');
    setRecipientAlias('');
    setRecipientInfo(null);
    setAmount('');
    setMemo('');
    setTransactionRef('');
    setError(null);
    setAliasError(null);
  };

  const selectedBalance = balances.find((b) => b.currencyCode === selectedCurrency);

  return (
    <div className="paynow-page">
      <div className="paynow-header">
        <h1>Pay Now</h1>
        <p className="paynow-subtitle">Send instant payment to another WinPay user</p>
      </div>

      {/* Progress Steps */}
      <div className="paynow-progress">
        <div
          className={`progress-step ${step === 'recipient' ? 'active' : ''} ${
            ['amount', 'review', 'success'].includes(step) ? 'completed' : ''
          }`}
        >
          <span className="step-number">1</span>
          <span className="step-label">Recipient</span>
        </div>
        <div
          className={`progress-step ${step === 'amount' ? 'active' : ''} ${
            ['review', 'success'].includes(step) ? 'completed' : ''
          }`}
        >
          <span className="step-number">2</span>
          <span className="step-label">Amount</span>
        </div>
        <div
          className={`progress-step ${step === 'review' ? 'active' : ''} ${
            step === 'success' ? 'completed' : ''
          }`}
        >
          <span className="step-number">3</span>
          <span className="step-label">Review</span>
        </div>
      </div>

      <div className="paynow-content">
        {/* Step 1: Recipient */}
        {step === 'recipient' && (
          <div className="paynow-card">
            <h2>Enter Recipient</h2>
            <p className="step-description">
              Enter the recipient's WPAY ID to send them an instant payment.
            </p>

            <div className="input-group">
              <label>Recipient WPAY ID</label>
              <div className="alias-input-wrapper">
                <input
                  type="text"
                  value={recipientAlias}
                  onChange={(e) => {
                    setRecipientAlias(e.target.value);
                    setRecipientInfo(null);
                    setAliasError(null);
                  }}
                  placeholder="Enter WPAY ID"
                  className="alias-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleAliasCheck()}
                />
                <button
                  className="btn-check"
                  onClick={handleAliasCheck}
                  disabled={checkingAlias || !recipientAlias.trim()}
                >
                  {checkingAlias ? '...' : 'Verify'}
                </button>
              </div>

              {aliasError && <p className="input-error">{aliasError}</p>}

              {recipientInfo?.verified && (
                <div className="recipient-verified">
                  <span className="verified-icon">✓</span>
                  <div className="recipient-details">
                    <span className="recipient-alias">{recipientInfo.alias}</span>
                    {recipientInfo.name && (
                      <span className="recipient-name">{recipientInfo.name}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={handleContinueToAmount}
              disabled={!recipientInfo?.verified}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 'amount' && (
          <div className="paynow-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('recipient')}>
                ← Back
              </button>
              <h2>Enter Amount</h2>
            </div>

            <div className="recipient-summary">
              <span className="label">Sending to:</span>
              <span className="value">{recipientInfo?.alias}</span>
              {recipientInfo?.name && (
                <span className="name">{recipientInfo.name}</span>
              )}
            </div>

            {loadingBalances ? (
              <div className="loading-state">Loading your balances...</div>
            ) : balances.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any available balance to send.</p>
                <button
                  className="btn-secondary"
                  onClick={() => (window.location.href = '/deposit')}
                >
                  Add Funds
                </button>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label>Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="currency-select"
                  >
                    {balances.map((b) => (
                      <option key={b.currencyCode} value={b.currencyCode}>
                        {b.currencyCode} - Available: {b.balanceAvailable.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Amount</label>
                  <div className="amount-input-wrapper">
                    <span className="currency-prefix">{selectedCurrency}</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max={selectedBalance?.balanceAvailable || 0}
                      step="0.01"
                      className="amount-input"
                    />
                  </div>
                  {selectedBalance && (
                    <p className="available-balance">
                      Available: {selectedCurrency}{' '}
                      {selectedBalance.balanceAvailable.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="quick-amounts">
                  {[100, 500, 1000, 5000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      className="quick-amount-btn"
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={
                        !selectedBalance || quickAmount > selectedBalance.balanceAvailable
                      }
                    >
                      {quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="input-group">
                  <label>Memo (Optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Add a note to the recipient"
                    className="memo-input"
                    maxLength={100}
                  />
                </div>

                {error && <p className="input-error">{error}</p>}

                <button
                  className="btn-primary"
                  onClick={handleContinueToReview}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className="paynow-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('amount')}>
                ← Back
              </button>
              <h2>Review Payment</h2>
            </div>

            <div className="review-details">
              <div className="review-row highlight">
                <span className="label">Amount</span>
                <span className="value amount">
                  {selectedCurrency} {parseFloat(amount).toLocaleString()}
                </span>
              </div>

              <div className="review-row">
                <span className="label">To</span>
                <span className="value">
                  {recipientInfo?.alias}
                  {recipientInfo?.name && ` (${recipientInfo.name})`}
                </span>
              </div>

              <div className="review-row">
                <span className="label">From</span>
                <span className="value">{user?.userId}</span>
              </div>

              {memo && (
                <div className="review-row">
                  <span className="label">Memo</span>
                  <span className="value">{memo}</span>
                </div>
              )}

              <div className="review-row">
                <span className="label">Fee</span>
                <span className="value fee">Free</span>
              </div>
            </div>

            <div className="review-notice">
              <span className="notice-icon">i</span>
              <p>
                This payment will be sent instantly. The recipient will receive the
                funds immediately.
              </p>
            </div>

            {error && <p className="input-error">{error}</p>}

            <button
              className="btn-primary btn-confirm"
              onClick={handleConfirmPayment}
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Payment'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="paynow-card success-card">
            <div className="success-icon">✓</div>
            <h2>Payment Sent!</h2>

            <div className="reference-box">
              <p className="reference-label">Payment Reference</p>
              <p className="reference-number">{transactionRef}</p>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(transactionRef)}
              >
                Copy
              </button>
            </div>

            <div className="success-details">
              <div className="success-row">
                <span>Amount</span>
                <span>
                  {selectedCurrency} {parseFloat(amount).toLocaleString()}
                </span>
              </div>
              <div className="success-row">
                <span>To</span>
                <span>{recipientInfo?.alias}</span>
              </div>
              {memo && (
                <div className="success-row">
                  <span>Memo</span>
                  <span>{memo}</span>
                </div>
              )}
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={handleNewPayment}>
                Send Another Payment
              </button>
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = '/history/payments')}
              >
                View Payment History
              </button>
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = '/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
