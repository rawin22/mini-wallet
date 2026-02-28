import React, { useState, useEffect } from 'react';
import { fxService } from '../api/fx.service.ts';
import { formatCountdown } from '../utils/formatters.ts';
import type { FxCurrency, FxQuote } from '../types/fx.types.ts';
import '../styles/FxDeal.css';

type Step = 'form' | 'quoting' | 'quote' | 'booking' | 'success' | 'expired';

export const FxDeal: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);

  const [buyCurrencies, setBuyCurrencies] = useState<FxCurrency[]>([]);
  const [sellCurrencies, setSellCurrencies] = useState<FxCurrency[]>([]);
  const [buyCcy, setBuyCcy] = useState('');
  const [sellCcy, setSellCcy] = useState('');
  const [amount, setAmount] = useState('');
  const [amountCcy, setAmountCcy] = useState('');

  const [quote, setQuote] = useState<FxQuote | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const [dealRef, setDealRef] = useState('');
  const [depositRef, setDepositRef] = useState('');

  // Fetch available currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const [buyRes, sellRes] = await Promise.all([
          fxService.getBuyCurrencies(),
          fxService.getSellCurrencies(),
        ]);
        setBuyCurrencies(buyRes.currencies || []);
        setSellCurrencies(sellRes.currencies || []);
        if (buyRes.currencies?.length) setBuyCcy(buyRes.currencies[0].currencyCode);
        if (sellRes.currencies?.length) {
          setSellCcy(sellRes.currencies[0].currencyCode);
          setAmountCcy(sellRes.currencies[0].currencyCode);
        }
      } catch (err) {
        setError('Failed to load currencies.');
        console.error(err);
      }
    };
    fetchCurrencies();
  }, []);

  // Countdown timer for quote expiration
  useEffect(() => {
    if (step !== 'quote' || !quote) return;
    const expiresAt = new Date(quote.expirationTime).getTime();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) setStep('expired');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, quote]);

  const handleGetQuote = async () => {
    setStep('quoting');
    setError(null);
    try {
      const result = await fxService.getQuote({
        buyCurrencyCode: buyCcy,
        sellCurrencyCode: sellCcy,
        amount: parseFloat(amount),
        amountCurrencyCode: amountCcy,
        dealType: 'SPOT',
        windowOpenDate: '',
        finalValueDate: '',
        isForCurrencyCalculator: false,
      });
      if (result.problems) {
        setError(String(result.problems));
        setStep('form');
        return;
      }
      setQuote(result.quote);
      setStep('quote');
    } catch (err) {
      setError('Failed to get quote. Please try again.');
      setStep('form');
      console.error(err);
    }
  };

  const handleBookDeal = async () => {
    if (!quote) return;
    setStep('booking');
    setError(null);
    try {
      const result = await fxService.bookDeal(quote.quoteId);
      if (result.problems) {
        setError(String(result.problems));
        setStep('quote');
        return;
      }
      setDealRef(result.fxDepositData.fxDealReference);
      setDepositRef(result.fxDepositData.depositReference);
      setStep('success');
    } catch (err) {
      setError('Failed to book deal. Please try again.');
      setStep('quote');
      console.error(err);
    }
  };

  const resetForm = () => {
    setStep('form');
    setQuote(null);
    setError(null);
  };

  const isFormValid = buyCcy && sellCcy && buyCcy !== sellCcy && parseFloat(amount) > 0 && amountCcy;

  const countdownClass = secondsRemaining > 30 ? 'green' : secondsRemaining > 10 ? 'yellow' : 'red';

  return (
    <div className="fx-deal-page">
      <h1>FX Exchange</h1>
      {error && <div className="error-box"><p>{error}</p></div>}

      {step === 'form' && (
        <div className="fx-card">
          <div className="fx-currencies-info">
            <div className="ccy-list">
              <h3>Buy Currencies</h3>
              {buyCurrencies.map((c) => <span key={c.currencyCode} className="ccy-tag">{c.currencyCode}</span>)}
            </div>
            <div className="ccy-list">
              <h3>Sell Currencies</h3>
              {sellCurrencies.map((c) => <span key={c.currencyCode} className="ccy-tag">{c.currencyCode}</span>)}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Buy Currency</label>
            <select className="form-input" value={buyCcy} onChange={(e) => setBuyCcy(e.target.value)}>
              {buyCurrencies.map((c) => <option key={c.currencyCode} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sell Currency</label>
            <select className="form-input" value={sellCcy} onChange={(e) => { setSellCcy(e.target.value); setAmountCcy(e.target.value); }}>
              {sellCurrencies.map((c) => <option key={c.currencyCode} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" type="number" min="0" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Amount Currency</label>
            <select className="form-input" value={amountCcy} onChange={(e) => setAmountCcy(e.target.value)}>
              <option value={buyCcy}>{buyCcy}</option>
              <option value={sellCcy}>{sellCcy}</option>
            </select>
          </div>
          <button className="primary-btn" disabled={!isFormValid} onClick={handleGetQuote}>Get Quote</button>
        </div>
      )}

      {step === 'quoting' && (
        <div className="fx-card processing"><div className="spinner" /><p>Requesting quote...</p></div>
      )}

      {step === 'quote' && quote && (
        <div className="fx-card">
          <h2>FX Quote</h2>
          <div className={`countdown ${countdownClass}`}>Expires in {formatCountdown(secondsRemaining)}</div>
          <div className="quote-details">
            <div className="quote-row"><span>Symbol:</span><span>{quote.symbol}</span></div>
            <div className="quote-row"><span>Rate:</span><span className="rate">{quote.rate}</span></div>
            <div className="quote-row"><span>Buy:</span><span>{quote.buyAmount} {quote.buyCurrencyCode}</span></div>
            <div className="quote-row"><span>Sell:</span><span>{quote.sellAmount} {quote.sellCurrencyCode}</span></div>
            <div className="quote-row"><span>Deal Type:</span><span>{quote.dealType}</span></div>
            <div className="quote-row"><span>Value Date:</span><span>{quote.valueDate}</span></div>
          </div>
          <div className="button-group">
            <button className="secondary-btn" onClick={resetForm}>Cancel</button>
            <button className="primary-btn" onClick={handleBookDeal}>Book Deal</button>
          </div>
        </div>
      )}

      {step === 'booking' && (
        <div className="fx-card processing"><div className="spinner" /><p>Booking deal...</p></div>
      )}

      {step === 'expired' && (
        <div className="fx-card">
          <div className="expired-icon">&#x23F0;</div>
          <h2>Quote Expired</h2>
          <p>The quote has expired. Please request a new one.</p>
          <button className="primary-btn" onClick={() => setStep('form')}>Get New Quote</button>
        </div>
      )}

      {step === 'success' && (
        <div className="fx-card success">
          <div className="success-icon">&#x2714;</div>
          <h2>Deal Booked!</h2>
          <div className="quote-details">
            <div className="quote-row"><span>Deal Reference:</span><span>{dealRef}</span></div>
            <div className="quote-row"><span>Deposit Reference:</span><span>{depositRef}</span></div>
            {quote && <>
              <div className="quote-row"><span>Bought:</span><span>{quote.buyAmount} {quote.buyCurrencyCode}</span></div>
              <div className="quote-row"><span>Sold:</span><span>{quote.sellAmount} {quote.sellCurrencyCode}</span></div>
              <div className="quote-row"><span>Rate:</span><span>{quote.rate}</span></div>
            </>}
          </div>
          <div className="button-group">
            <button className="primary-btn" onClick={resetForm}>New Exchange</button>
            <button className="secondary-btn" onClick={() => window.location.href = '/history/convert'}>
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
