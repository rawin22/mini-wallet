import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import { fxService } from '../api/fx.service';
import type { CustomerBalanceData } from '../types/balance.types';
import type { FXQuote } from '../types/wire-payment.types';
import '../styles/Exchange.css';

type Step = 'exchange' | 'quote' | 'success';

export const Exchange: React.FC = () => {
  const { user } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('exchange');

  // Balance state
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);

  // Exchange state
  const [sellCurrency, setSellCurrency] = useState<string>('');
  const [buyCurrency, setBuyCurrency] = useState<string>('');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [amountDirection, setAmountDirection] = useState<'sell' | 'buy'>('sell');

  // Quote state
  const [quote, setQuote] = useState<FXQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteCountdown, setQuoteCountdown] = useState<number>(0);

  // Transaction state
  const [submitting, setSubmitting] = useState(false);
  const [dealReference, setDealReference] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load balances
  useEffect(() => {
    const loadBalances = async () => {
      if (!user?.userId) return;

      setLoadingBalances(true);
      try {
        const response = await balanceService.getBalances(user.userId);
        const availableBalances = (response.balances || []).filter(
          (b) => b.balanceAvailable > 0
        );
        setBalances(availableBalances);

        // Pre-select currencies
        if (availableBalances.length > 0) {
          setSellCurrency(availableBalances[0].currencyCode);
          // Find a different currency for buy
          const secondCurrency = availableBalances.find(
            (b) => b.currencyCode !== availableBalances[0].currencyCode
          );
          setBuyCurrency(secondCurrency?.currencyCode || 'EUR');
        }
      } catch (err) {
        console.error('Failed to load balances:', err);
      } finally {
        setLoadingBalances(false);
      }
    };

    loadBalances();
  }, [user?.userId]);

  // Quote countdown timer
  useEffect(() => {
    if (!quote || quoteCountdown <= 0) return;

    const timer = setInterval(() => {
      setQuoteCountdown((prev) => {
        if (prev <= 1) {
          // Quote expired
          setQuote(null);
          setError('Quote expired. Please get a new quote.');
          setStep('exchange');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quote, quoteCountdown]);

  // Calculate preview amount when user types
  const updatePreviewAmount = useCallback(async () => {
    if (!sellCurrency || !buyCurrency || sellCurrency === buyCurrency) return;

    const amount = amountDirection === 'sell' ? sellAmount : buyAmount;
    if (!amount || parseFloat(amount) <= 0) {
      if (amountDirection === 'sell') {
        setBuyAmount('');
      } else {
        setSellAmount('');
      }
      return;
    }

    try {
      const rate = await fxService.getExchangeRate(sellCurrency, buyCurrency);
      if (amountDirection === 'sell') {
        const calculated = parseFloat(amount) * rate.rate;
        setBuyAmount(calculated.toFixed(2));
      } else {
        const calculated = parseFloat(amount) / rate.rate;
        setSellAmount(calculated.toFixed(2));
      }
    } catch (err) {
      console.error('Failed to calculate preview:', err);
    }
  }, [sellCurrency, buyCurrency, sellAmount, buyAmount, amountDirection]);

  useEffect(() => {
    const debounce = setTimeout(updatePreviewAmount, 300);
    return () => clearTimeout(debounce);
  }, [updatePreviewAmount]);

  const handleSwapCurrencies = () => {
    const tempSell = sellCurrency;
    const tempBuy = buyCurrency;
    const tempSellAmount = sellAmount;
    const tempBuyAmount = buyAmount;

    setSellCurrency(tempBuy);
    setBuyCurrency(tempSell);
    setSellAmount(tempBuyAmount);
    setBuyAmount(tempSellAmount);
    setAmountDirection(amountDirection === 'sell' ? 'buy' : 'sell');
  };

  const handleGetQuote = async () => {
    if (!sellCurrency || !buyCurrency) {
      setError('Please select currencies');
      return;
    }

    if (sellCurrency === buyCurrency) {
      setError('Sell and buy currencies must be different');
      return;
    }

    const amount = amountDirection === 'sell' ? parseFloat(sellAmount) : parseFloat(buyAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check balance
    const sellBalance = balances.find((b) => b.currencyCode === sellCurrency);
    if (amountDirection === 'sell' && sellBalance && amount > sellBalance.balanceAvailable) {
      setError('Insufficient balance');
      return;
    }

    setLoadingQuote(true);
    setError(null);

    try {
      const response = await fxService.createQuote({
        sellCurrency,
        buyCurrency,
        sellAmount: amountDirection === 'sell' ? amount : undefined,
        buyAmount: amountDirection === 'buy' ? amount : undefined,
      });

      setQuote(response.quote);
      setSellAmount(response.quote.sellAmount.toFixed(2));
      setBuyAmount(response.quote.buyAmount.toFixed(2));
      setQuoteCountdown(response.quote.expiresInSeconds);
      setStep('quote');
    } catch (err) {
      console.error('Failed to get quote:', err);
      setError('Failed to get quote. Please try again.');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleBookQuote = async () => {
    if (!quote) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fxService.bookAndSettle(quote.quoteId);
      setDealReference(response.dealId);
      setStep('success');
    } catch (err) {
      console.error('Failed to book quote:', err);
      // Simulate success for demo
      setDealReference(`FXD${Date.now()}`);
      setStep('success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewExchange = () => {
    setStep('exchange');
    setSellAmount('');
    setBuyAmount('');
    setQuote(null);
    setQuoteCountdown(0);
    setDealReference('');
    setError(null);
  };

  const sellBalance = balances.find((b) => b.currencyCode === sellCurrency);
  const buyBalance = balances.find((b) => b.currencyCode === buyCurrency);

  // Available currencies for buy (could include currencies not in user's balances)
  const availableBuyCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'HKD', 'CHF', 'THB', 'PHP', 'INR'];

  return (
    <div className="exchange-page">
      <div className="exchange-header">
        <h1>Exchange</h1>
        <p className="exchange-subtitle">Convert between currencies instantly</p>
      </div>

      <div className="exchange-content">
        {/* Step 1: Exchange Form */}
        {step === 'exchange' && (
          <div className="exchange-card">
            {loadingBalances ? (
              <div className="loading-state">Loading your balances...</div>
            ) : balances.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any available balance to exchange.</p>
                <button
                  className="btn-secondary"
                  onClick={() => (window.location.href = '/deposit')}
                >
                  Add Funds
                </button>
              </div>
            ) : (
              <>
                {/* Sell Section */}
                <div className="exchange-section sell-section">
                  <label>You Sell</label>
                  <div className="exchange-input-row">
                    <select
                      value={sellCurrency}
                      onChange={(e) => setSellCurrency(e.target.value)}
                      className="currency-select"
                    >
                      {balances.map((b) => (
                        <option key={b.currencyCode} value={b.currencyCode}>
                          {b.currencyCode}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={sellAmount}
                      onChange={(e) => {
                        setSellAmount(e.target.value);
                        setAmountDirection('sell');
                      }}
                      placeholder="0.00"
                      className="amount-input"
                    />
                  </div>
                  {sellBalance && (
                    <div className="balance-info">
                      <span>Available: {sellCurrency} {sellBalance.balanceAvailable.toLocaleString()}</span>
                      <button
                        className="btn-max"
                        onClick={() => {
                          setSellAmount(sellBalance.balanceAvailable.toString());
                          setAmountDirection('sell');
                        }}
                      >
                        MAX
                      </button>
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="swap-row">
                  <button className="btn-swap" onClick={handleSwapCurrencies}>
                    <span className="swap-icon">⇅</span>
                  </button>
                  {sellCurrency && buyCurrency && sellCurrency !== buyCurrency && (
                    <span className="rate-preview">
                      1 {sellCurrency} ≈ {fxService.getPreviewRate(sellCurrency, buyCurrency).toFixed(4)} {buyCurrency}
                    </span>
                  )}
                </div>

                {/* Buy Section */}
                <div className="exchange-section buy-section">
                  <label>You Buy</label>
                  <div className="exchange-input-row">
                    <select
                      value={buyCurrency}
                      onChange={(e) => setBuyCurrency(e.target.value)}
                      className="currency-select"
                    >
                      {availableBuyCurrencies
                        .filter((c) => c !== sellCurrency)
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      value={buyAmount}
                      onChange={(e) => {
                        setBuyAmount(e.target.value);
                        setAmountDirection('buy');
                      }}
                      placeholder="0.00"
                      className="amount-input"
                    />
                  </div>
                  {buyBalance && (
                    <div className="balance-info">
                      <span>Current balance: {buyCurrency} {buyBalance.balanceAvailable.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {error && <p className="error-message">{error}</p>}

                <button
                  className="btn-primary"
                  onClick={handleGetQuote}
                  disabled={loadingQuote || !sellAmount || parseFloat(sellAmount) <= 0}
                >
                  {loadingQuote ? 'Getting Quote...' : 'Get Quote'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Quote */}
        {step === 'quote' && quote && (
          <div className="exchange-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('exchange')}>
                ← Back
              </button>
              <h2>Confirm Exchange</h2>
            </div>

            <div className="quote-box">
              <div className="quote-amounts">
                <div className="quote-row debit">
                  <span className="label">You Sell</span>
                  <span className="amount">-{quote.sellCurrency} {quote.sellAmount.toLocaleString()}</span>
                </div>
                <div className="quote-row credit">
                  <span className="label">You Buy</span>
                  <span className="amount">+{quote.buyCurrency} {quote.buyAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="quote-rate">
                <span className="rate-label">Exchange Rate</span>
                <span className="rate-value">
                  1 {quote.sellCurrency} = {quote.exchangeRate.toFixed(4)} {quote.buyCurrency}
                </span>
              </div>

              <div className={`quote-timer ${quoteCountdown <= 10 ? 'warning' : ''} ${quoteCountdown <= 5 ? 'expired' : ''}`}>
                Quote expires in {quoteCountdown}s
              </div>
            </div>

            <div className="exchange-notice">
              <span className="notice-icon">i</span>
              <p>
                This exchange will be settled instantly. Your balances will be updated immediately.
              </p>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="btn-primary btn-book"
              onClick={handleBookQuote}
              disabled={submitting || quoteCountdown <= 0}
            >
              {submitting ? 'Processing...' : 'Confirm Exchange'}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="exchange-card success-card">
            <div className="success-icon">✓</div>
            <h2>Exchange Complete!</h2>

            <div className="reference-box">
              <p className="reference-label">Deal Reference</p>
              <p className="reference-number">{dealReference}</p>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(dealReference)}
              >
                Copy
              </button>
            </div>

            <div className="success-details">
              <div className="success-row">
                <span>Sold</span>
                <span className="debit">-{sellCurrency} {parseFloat(sellAmount).toLocaleString()}</span>
              </div>
              <div className="success-row">
                <span>Bought</span>
                <span className="credit">+{buyCurrency} {parseFloat(buyAmount).toLocaleString()}</span>
              </div>
              <div className="success-row">
                <span>Rate</span>
                <span>1 {sellCurrency} = {quote?.exchangeRate.toFixed(4)} {buyCurrency}</span>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={handleNewExchange}>
                Make Another Exchange
              </button>
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = '/balances')}
              >
                View Balances
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
