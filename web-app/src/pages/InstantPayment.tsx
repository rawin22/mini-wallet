import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { instantPaymentService } from '../api/instant-payment.service.ts';
import { balanceService } from '../api/balance.service.ts';
import { formatCurrency, todayDateString } from '../utils/formatters.ts';
import type { CustomerBalanceData } from '../types/balance.types.ts';
import '../styles/InstantPayment.css';

type Step = 'form' | 'review' | 'processing' | 'confirm' | 'success';

export const InstantPayment: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);

  // Form fields
  const [toCustomer, setToCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [memo, setMemo] = useState('');

  // Draft from API
  const [draftPaymentId, setDraftPaymentId] = useState('');
  const [draftReference, setDraftReference] = useState('');
  const [draftTimestamp, setDraftTimestamp] = useState('');

  useEffect(() => {
    if (!user) return;
    balanceService.getBalances(user.organizationId).then((data) => {
      const active = (data.balances || []).filter((b) => b.balanceAvailable > 0);
      setBalances(active);
      if (active.length > 0) setCurrency(active[0].currencyCode);
    }).catch(console.error);
  }, [user]);

  const handleCreatePayment = async () => {
    if (!user) return;
    setStep('processing');
    setError(null);
    try {
      const result = await instantPaymentService.createPayment({
        fromCustomer: user.userName,
        toCustomer,
        paymentTypeId: 1,
        amount: parseFloat(amount),
        currencyCode: currency,
        valueDate: todayDateString(),
        reasonForPayment: 'Instant Payment',
        externalReference: '',
        memo,
      });

      if (result.problems) {
        setError(String(result.problems));
        setStep('form');
        return;
      }

      setDraftPaymentId(result.payment.paymentId);
      setDraftReference(result.payment.paymentReference);
      setDraftTimestamp(result.payment.timestamp);
      setStep('confirm');
    } catch (err) {
      setError('Failed to create payment. Please try again.');
      setStep('form');
      console.error(err);
    }
  };

  const handleConfirmPayment = async () => {
    setStep('processing');
    setError(null);
    try {
      const result = await instantPaymentService.confirmPayment({
        instantPaymentId: draftPaymentId,
        timestamp: draftTimestamp,
      });

      if (result.problems) {
        setError(String(result.problems));
        setStep('confirm');
        return;
      }
      setStep('success');
    } catch (err) {
      setError('Failed to confirm payment. Please try again.');
      setStep('confirm');
      console.error(err);
    }
  };

  const resetForm = () => {
    setStep('form');
    setToCustomer('');
    setAmount('');
    setMemo('');
    setError(null);
  };

  const parsedAmount = parseFloat(amount);
  const isFormValid = toCustomer.trim() && parsedAmount > 0 && currency;

  return (
    <div className="instant-payment-page">
      <h1>Instant Payment</h1>

      {error && <div className="error-box"><p>{error}</p></div>}

      {step === 'form' && (
        <div className="payment-card">
          <div className="form-group">
            <label className="form-label">Receiver PayID</label>
            <input className="form-input" value={toCustomer} onChange={(e) => setToCustomer(e.target.value)}
              placeholder="Enter receiver's PayID" />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" type="number" min="0" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {balances.map((b) => (
                <option key={b.currencyCode} value={b.currencyCode}>
                  {b.currencyCode} (Available: {formatCurrency(b.balanceAvailable)})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Memo (optional)</label>
            <input className="form-input" value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment note" />
          </div>
          <button className="primary-btn" disabled={!isFormValid} onClick={() => setStep('review')}>
            Review Payment
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="payment-card">
          <h2>Review Payment</h2>
          <div className="review-details">
            <div className="review-row"><span>To:</span><span>{toCustomer}</span></div>
            <div className="review-row"><span>Amount:</span><span>{formatCurrency(parsedAmount)} {currency}</span></div>
            {memo && <div className="review-row"><span>Memo:</span><span>{memo}</span></div>}
          </div>
          <div className="button-group">
            <button className="secondary-btn" onClick={() => setStep('form')}>Back</button>
            <button className="primary-btn" onClick={handleCreatePayment}>Create Payment</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="payment-card processing">
          <div className="spinner" />
          <p>Processing...</p>
        </div>
      )}

      {step === 'confirm' && (
        <div className="payment-card">
          <h2>Confirm Payment</h2>
          <p className="confirm-note">Payment draft created. Please confirm to finalize.</p>
          <div className="review-details">
            <div className="review-row"><span>Reference:</span><span>{draftReference}</span></div>
            <div className="review-row"><span>To:</span><span>{toCustomer}</span></div>
            <div className="review-row"><span>Amount:</span><span>{formatCurrency(parsedAmount)} {currency}</span></div>
          </div>
          <div className="button-group">
            <button className="secondary-btn" onClick={resetForm}>Cancel</button>
            <button className="primary-btn confirm-btn" onClick={handleConfirmPayment}>Confirm &amp; Send</button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="payment-card success">
          <div className="success-icon">&#x2714;</div>
          <h2>Payment Sent!</h2>
          <div className="review-details">
            <div className="review-row"><span>Reference:</span><span>{draftReference}</span></div>
            <div className="review-row"><span>To:</span><span>{toCustomer}</span></div>
            <div className="review-row"><span>Amount:</span><span>{formatCurrency(parsedAmount)} {currency}</span></div>
          </div>
          <div className="button-group">
            <button className="primary-btn" onClick={resetForm}>Send Another</button>
            <button className="secondary-btn" onClick={() => window.location.href = '/history/payments'}>
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
