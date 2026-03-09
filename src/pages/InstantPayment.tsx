import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { instantPaymentService } from '../api/instant-payment.service.ts';
import { balanceService } from '../api/balance.service.ts';
import { formatCurrency, todayDateString } from '../utils/formatters.ts';
import type { CustomerBalanceData } from '../types/balance.types.ts';
import '../styles/InstantPayment.css';

type Step = 'form' | 'review' | 'processing' | 'success';

export const InstantPayment: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);

  // Form fields
  const [toCustomer, setToCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [memo, setMemo] = useState('');

  // Result from API
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (!user) return;
    balanceService.getBalances(user.organizationId).then((data) => {
      const active = (data.balances || []).filter((b) => b.balanceAvailable > 0);
      setBalances(active);
      if (active.length > 0) setCurrency(active[0].currencyCode);
    }).catch(console.error);
  }, [user]);

  const handleSendPayment = async () => {
    if (!user) return;
    setStep('processing');
    setError(null);
    try {
      // Step 1: Create draft
      const createResult = await instantPaymentService.createPayment({
        fromCustomer: user.userName,
        toCustomer,
        paymentTypeId: 1,
        amount: parseFloat(amount),
        currencyCode: currency,
        valueDate: todayDateString(),
        reasonForPayment: t('payment.instantReason'),
        externalReference: '',
        memo,
      });

      if (createResult.problems) {
        setError(String(createResult.problems));
        setStep('review');
        return;
      }

      setPaymentReference(createResult.payment.paymentReference);

      // Step 2: Confirm immediately
      const confirmResult = await instantPaymentService.confirmPayment({
        instantPaymentId: createResult.payment.paymentId,
        timestamp: createResult.payment.timestamp,
      });

      if (confirmResult.problems) {
        setError(String(confirmResult.problems));
        setStep('review');
        return;
      }

      setStep('success');
    } catch (err) {
      setError(t('payment.failed'));
      setStep('review');
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
      <h1>{t('payment.title')}</h1>

      {error && <div className="error-box"><p>{error}</p></div>}

      {step === 'form' && (
        <div className="payment-card">
          <div className="form-group">
            <label className="form-label">{t('payment.receiverPayId')}</label>
            <input className="form-input" value={toCustomer} onChange={(e) => setToCustomer(e.target.value)}
              placeholder={t('payment.receiverPlaceholder')} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('payment.amount')}</label>
            <input className="form-input" type="number" min="0" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('payment.currency')}</label>
            <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {balances.map((b) => (
                <option key={b.currencyCode} value={b.currencyCode}>
                  {b.currencyCode} ({t('dashboard.available')}: {formatCurrency(b.balanceAvailable)})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('payment.memoOptional')}</label>
            <input className="form-input" value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder={t('payment.memoPlaceholder')} />
          </div>
          <button className="primary-btn" disabled={!isFormValid} onClick={() => setStep('review')}>
            {t('payment.reviewPayment')}
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="payment-card">
          <h2>{t('payment.reviewSend')}</h2>
          <div className="review-details">
            <div className="review-row"><span>{t('payment.to')}:</span><span>{toCustomer}</span></div>
            <div className="review-row"><span>{t('payment.amount')}:</span><span>{formatCurrency(parsedAmount)} {currency}</span></div>
            {memo && <div className="review-row"><span>{t('payment.memoOptional')}:</span><span>{memo}</span></div>}
          </div>
          <div className="button-group">
            <button className="secondary-btn" onClick={() => setStep('form')}>{t('common.back')}</button>
            <button className="primary-btn confirm-btn" onClick={handleSendPayment}>{t('payment.sendPayment')}</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="payment-card processing">
          <div className="spinner" />
          <p>{t('payment.processing')}</p>
        </div>
      )}

      {step === 'success' && (
        <div className="payment-card success">
          <div className="success-icon">&#x2714;</div>
          <h2>{t('payment.successTitle')}</h2>
          <div className="review-details">
            <div className="review-row"><span>{t('payment.reference')}:</span><span>{paymentReference}</span></div>
            <div className="review-row"><span>{t('payment.to')}:</span><span>{toCustomer}</span></div>
            <div className="review-row"><span>{t('payment.amount')}:</span><span>{formatCurrency(parsedAmount)} {currency}</span></div>
          </div>
          <div className="button-group">
            <button className="primary-btn" onClick={resetForm}>{t('payment.sendAnother')}</button>
            <button className="secondary-btn" onClick={() => window.location.href = '/history/payments'}>
              {t('payment.viewHistory')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
