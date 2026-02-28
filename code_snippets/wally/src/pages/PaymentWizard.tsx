import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import { wirePaymentService } from '../api/wire-payment.service';
import type { CustomerBalanceData } from '../types/balance.types';
import type { Beneficiary, FXQuote, PaymentCountry } from '../types/wire-payment.types';
import {
  getPaymentCountries,
  getPaymentCountry,
  calculateFXAmount,
} from '../data/paymentReference';
import '../styles/PaymentWizard.css';

type Step = 'details' | 'beneficiary' | 'quote' | 'confirm' | 'success';

interface PaymentDetails {
  destinationCountry: string;
  destinationCurrency: string;
  sourceCurrency: string;
  amount: string;
  amountType: 'destination' | 'source'; // Which amount the user entered
  valueDate: string;
  reasonForPayment: string;
}

export const PaymentWizard: React.FC = () => {
  const { user } = useAuth();

  // Step state
  const [step, setStep] = useState<Step>('details');

  // Reference data
  const [countries] = useState<PaymentCountry[]>(getPaymentCountries());
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);

  // Step 1: Payment details
  const [details, setDetails] = useState<PaymentDetails>({
    destinationCountry: '',
    destinationCurrency: '',
    sourceCurrency: '',
    amount: '',
    amountType: 'destination',
    valueDate: new Date().toISOString().split('T')[0],
    reasonForPayment: '',
  });

  // Step 2: Beneficiary
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    iban: '',
    swiftBic: '',
  });

  // Step 3: FX Quote
  const [quote, setQuote] = useState<FXQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteTimer, setQuoteTimer] = useState(0);
  const [quoteExpired, setQuoteExpired] = useState(false);

  // Step 4: Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load user balances
  useEffect(() => {
    const loadBalances = async () => {
      if (!user?.userId) return;

      setLoadingBalances(true);
      try {
        const response = await balanceService.getBalances(user.userId);
        const available = (response.balances || []).filter((b) => b.balanceAvailable > 0);
        setBalances(available);

        // Pre-select first currency
        if (available.length > 0) {
          setDetails((prev) => ({ ...prev, sourceCurrency: available[0].currencyCode }));
        }
      } catch (err) {
        console.error('Failed to load balances:', err);
      } finally {
        setLoadingBalances(false);
      }
    };

    loadBalances();
  }, [user?.userId]);

  // Update destination currency when country changes
  useEffect(() => {
    if (details.destinationCountry) {
      const country = getPaymentCountry(details.destinationCountry);
      if (country) {
        setDetails((prev) => ({ ...prev, destinationCurrency: country.localCurrency }));
      }
    }
  }, [details.destinationCountry]);

  // Load beneficiaries when moving to step 2
  const loadBeneficiaries = useCallback(async () => {
    if (!details.destinationCountry) return;

    setLoadingBeneficiaries(true);
    try {
      const response = await wirePaymentService.searchBeneficiaries(
        details.destinationCountry,
        details.destinationCurrency
      );
      setBeneficiaries(response.beneficiaries);
    } catch (err) {
      console.error('Failed to load beneficiaries:', err);
    } finally {
      setLoadingBeneficiaries(false);
    }
  }, [details.destinationCountry, details.destinationCurrency]);

  // Quote timer countdown
  useEffect(() => {
    if (!quote || quoteExpired) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(quote.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));

      setQuoteTimer(remaining);

      if (remaining <= 0) {
        setQuoteExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quote, quoteExpired]);

  // Get selected country info
  const selectedCountry = details.destinationCountry
    ? getPaymentCountry(details.destinationCountry)
    : null;

  // Get selected source balance
  const sourceBalance = balances.find((b) => b.currencyCode === details.sourceCurrency);

  // Check if FX is needed
  const needsFX = details.sourceCurrency !== details.destinationCurrency;

  // Calculate amounts based on input type
  const getCalculatedAmounts = () => {
    if (!details.amount || !details.sourceCurrency || !details.destinationCurrency) {
      return { sourceAmount: 0, destinationAmount: 0, rate: 1 };
    }

    const amount = parseFloat(details.amount);
    if (isNaN(amount)) return { sourceAmount: 0, destinationAmount: 0, rate: 1 };

    if (!needsFX) {
      return { sourceAmount: amount, destinationAmount: amount, rate: 1 };
    }

    const calc = calculateFXAmount(
      details.sourceCurrency,
      details.destinationCurrency,
      amount,
      details.amountType === 'source' ? 'sell' : 'buy'
    );

    return {
      sourceAmount: calc.sellAmount,
      destinationAmount: calc.buyAmount,
      rate: calc.rate,
    };
  };

  const calculated = getCalculatedAmounts();

  // Step navigation handlers
  const handleContinueToStep2 = async () => {
    if (!details.destinationCountry || !details.amount || !details.sourceCurrency) {
      setError('Please fill in all required fields');
      return;
    }

    if (calculated.sourceAmount > (sourceBalance?.balanceAvailable || 0)) {
      setError('Insufficient balance');
      return;
    }

    setError(null);
    await loadBeneficiaries();
    setStep('beneficiary');
  };

  const handleContinueToStep3 = async () => {
    if (!selectedBeneficiary && !newBeneficiary.name) {
      setError('Please select or add a beneficiary');
      return;
    }

    setError(null);

    // If FX needed, create quote
    if (needsFX) {
      setQuoteLoading(true);
      try {
        const response = await wirePaymentService.createFXQuote({
          sellCurrency: details.sourceCurrency,
          buyCurrency: details.destinationCurrency,
          ...(details.amountType === 'source'
            ? { sellAmount: parseFloat(details.amount) }
            : { buyAmount: parseFloat(details.amount) }),
        });

        setQuote(response.quote);
        setQuoteTimer(30);
        setQuoteExpired(false);
        setStep('quote');
      } catch (err) {
        setError('Failed to get FX quote. Please try again.');
      } finally {
        setQuoteLoading(false);
      }
    } else {
      // No FX needed, go directly to confirm
      setStep('confirm');
    }
  };

  const handleRefreshQuote = async () => {
    setQuoteLoading(true);
    setQuoteExpired(false);
    try {
      const response = await wirePaymentService.createFXQuote({
        sellCurrency: details.sourceCurrency,
        buyCurrency: details.destinationCurrency,
        ...(details.amountType === 'source'
          ? { sellAmount: parseFloat(details.amount) }
          : { buyAmount: parseFloat(details.amount) }),
      });

      setQuote(response.quote);
      setQuoteTimer(30);
    } catch (err) {
      setError('Failed to refresh quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleBookQuote = async () => {
    if (!quote) return;

    try {
      await wirePaymentService.bookFXQuote(quote.quoteId);
      setStep('confirm');
    } catch (err) {
      setError('Failed to book quote. Please try again.');
    }
  };

  const handleSubmitPayment = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const beneficiary = selectedBeneficiary || {
        name: newBeneficiary.name,
        bankName: newBeneficiary.bankName,
        accountNumber: newBeneficiary.accountNumber,
        iban: newBeneficiary.iban,
        swiftBic: newBeneficiary.swiftBic,
      };

      const response = await wirePaymentService.sendWirePayment({
        beneficiaryId: selectedBeneficiary?.id,
        beneficiaryName: beneficiary.name,
        beneficiaryBankName: beneficiary.bankName,
        beneficiaryAccountNumber: beneficiary.accountNumber,
        beneficiaryIban: beneficiary.iban,
        beneficiarySwiftBic: beneficiary.swiftBic,
        amount: quote?.buyAmount || calculated.destinationAmount,
        currencyCode: details.destinationCurrency,
        sourceCurrencyCode: details.sourceCurrency,
        sourceAmount: quote?.sellAmount || calculated.sourceAmount,
        fxQuoteId: quote?.quoteId,
        valueDate: details.valueDate,
        reasonForPayment: details.reasonForPayment,
      });

      setPaymentRef(response.paymentReference);
      setStep('success');
    } catch (err) {
      setError('Payment submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPayment = () => {
    setStep('details');
    setDetails({
      destinationCountry: '',
      destinationCurrency: '',
      sourceCurrency: balances[0]?.currencyCode || '',
      amount: '',
      amountType: 'destination',
      valueDate: new Date().toISOString().split('T')[0],
      reasonForPayment: '',
    });
    setSelectedBeneficiary(null);
    setNewBeneficiary({ name: '', bankName: '', accountNumber: '', iban: '', swiftBic: '' });
    setShowNewBeneficiaryForm(false);
    setQuote(null);
    setPaymentRef('');
    setError(null);
  };

  return (
    <div className="wizard-page">
      <div className="wizard-header">
        <h1>Wire Payment</h1>
        <p className="wizard-subtitle">Send international wire transfers</p>
      </div>

      {/* Progress Steps */}
      <div className="wizard-progress">
        {['details', 'beneficiary', 'quote', 'confirm'].map((s, i) => (
          <div
            key={s}
            className={`progress-step ${step === s ? 'active' : ''} ${['beneficiary', 'quote', 'confirm', 'success'].indexOf(step) > i ? 'completed' : ''
              }`}
          >
            <span className="step-number">{i + 1}</span>
            <span className="step-label">
              {s === 'details' && 'Details'}
              {s === 'beneficiary' && 'Beneficiary'}
              {s === 'quote' && (needsFX ? 'FX Quote' : 'Review')}
              {s === 'confirm' && 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {/* Step 1: Payment Details */}
        {step === 'details' && (
          <div className="wizard-card">
            <h2>Payment Details</h2>

            {loadingBalances ? (
              <div className="loading-state">Loading your accounts...</div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Destination Country</label>
                    <select
                      value={details.destinationCountry}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, destinationCountry: e.target.value }))
                      }
                      className="form-select"
                    >
                      <option value="">Select country...</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedCountry && (
                  <div className="country-info-box">
                    <div className="info-item">
                      <span className="info-label">Local Currency</span>
                      <span className="info-value">{selectedCountry.localCurrency}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">IBAN Required</span>
                      <span className="info-value">{selectedCountry.ibanRequired ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">SWIFT/BIC Required</span>
                      <span className="info-value">{selectedCountry.swiftRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Payment Currency</label>
                    <select
                      value={details.destinationCurrency}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, destinationCurrency: e.target.value }))
                      }
                      className="form-select"
                    >
                      <option value="">Select currency...</option>
                      {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'CHF'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>From Account</label>
                    <select
                      value={details.sourceCurrency}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, sourceCurrency: e.target.value }))
                      }
                      className="form-select"
                    >
                      {balances.map((b) => (
                        <option key={b.currencyCode} value={b.currencyCode}>
                          {b.currencyCode} - {b.balanceAvailable.toLocaleString()} available
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="amount-section">
                  <div className="form-group">
                    <label>
                      Amount in {details.amountType === 'destination' ? details.destinationCurrency || 'destination' : details.sourceCurrency || 'source'} currency
                    </label>
                    <div className="amount-input-wrapper">
                      <span className="currency-prefix">
                        {details.amountType === 'destination' ? details.destinationCurrency : details.sourceCurrency}
                      </span>
                      <input
                        type="number"
                        value={details.amount}
                        onChange={(e) => setDetails((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="amount-input"
                      />
                    </div>
                  </div>

                  {needsFX && (
                    <div className="amount-toggle">
                      <button
                        className={`toggle-btn ${details.amountType === 'destination' ? 'active' : ''}`}
                        onClick={() => setDetails((prev) => ({ ...prev, amountType: 'destination', amount: '' }))}
                      >
                        Send exact {details.destinationCurrency}
                      </button>
                      <button
                        className={`toggle-btn ${details.amountType === 'source' ? 'active' : ''}`}
                        onClick={() => setDetails((prev) => ({ ...prev, amountType: 'source', amount: '' }))}
                      >
                        Send from {details.sourceCurrency}
                      </button>
                    </div>
                  )}

                  {needsFX && details.amount && (
                    <div className="fx-preview">
                      <div className="fx-row">
                        <span>You send:</span>
                        <span className="debit">-{details.sourceCurrency} {calculated.sourceAmount.toLocaleString()}</span>
                      </div>
                      <div className="fx-row">
                        <span>Beneficiary receives:</span>
                        <span className="credit">+{details.destinationCurrency} {calculated.destinationAmount.toLocaleString()}</span>
                      </div>
                      <div className="fx-row rate">
                        <span>Indicative rate:</span>
                        <span>1 {details.sourceCurrency} = {calculated.rate.toFixed(4)} {details.destinationCurrency}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Value Date</label>
                    <input
                      type="date"
                      value={details.valueDate}
                      onChange={(e) => setDetails((prev) => ({ ...prev, valueDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reason for Payment (Optional)</label>
                    <input
                      type="text"
                      value={details.reasonForPayment}
                      onChange={(e) => setDetails((prev) => ({ ...prev, reasonForPayment: e.target.value }))}
                      placeholder="e.g., Invoice #12345"
                      className="form-input"
                    />
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <button
                  className="btn-primary"
                  onClick={handleContinueToStep2}
                  disabled={!details.destinationCountry || !details.amount || !details.sourceCurrency}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Beneficiary Selection */}
        {step === 'beneficiary' && (
          <div className="wizard-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('details')}>
                ← Back
              </button>
              <h2>Select Beneficiary</h2>
            </div>

            <div className="payment-summary-mini">
              <span>{details.destinationCurrency} {calculated.destinationAmount.toLocaleString()}</span>
              <span className="to-label">to</span>
              <span>{selectedCountry?.name}</span>
            </div>

            {loadingBeneficiaries ? (
              <div className="loading-state">Loading saved beneficiaries...</div>
            ) : (
              <>
                {beneficiaries.length > 0 && !showNewBeneficiaryForm && (
                  <div className="beneficiary-list">
                    <h3>Saved Beneficiaries</h3>
                    {beneficiaries.map((ben) => (
                      <div
                        key={ben.id}
                        className={`beneficiary-item ${selectedBeneficiary?.id === ben.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedBeneficiary(ben);
                          setShowNewBeneficiaryForm(false);
                        }}
                      >
                        <div className="ben-info">
                          <span className="ben-name">{ben.name}</span>
                          <span className="ben-bank">{ben.bankName}</span>
                          <span className="ben-account">{ben.iban || ben.accountNumber}</span>
                        </div>
                        {selectedBeneficiary?.id === ben.id && (
                          <span className="selected-check">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn-add-beneficiary"
                  onClick={() => {
                    setShowNewBeneficiaryForm(!showNewBeneficiaryForm);
                    setSelectedBeneficiary(null);
                  }}
                >
                  {showNewBeneficiaryForm ? 'Cancel' : '+ Add New Beneficiary'}
                </button>

                {showNewBeneficiaryForm && (
                  <div className="new-beneficiary-form">
                    <h3>New Beneficiary</h3>
                    <div className="form-group">
                      <label>Beneficiary Name</label>
                      <input
                        type="text"
                        value={newBeneficiary.name}
                        onChange={(e) => setNewBeneficiary((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={newBeneficiary.bankName}
                        onChange={(e) => setNewBeneficiary((prev) => ({ ...prev, bankName: e.target.value }))}
                        placeholder="Bank name"
                        className="form-input"
                      />
                    </div>
                    {selectedCountry?.ibanRequired ? (
                      <div className="form-group">
                        <label>IBAN</label>
                        <input
                          type="text"
                          value={newBeneficiary.iban}
                          onChange={(e) => setNewBeneficiary((prev) => ({ ...prev, iban: e.target.value }))}
                          placeholder={selectedCountry.ibanFormat || 'IBAN'}
                          className="form-input"
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Account Number</label>
                        <input
                          type="text"
                          value={newBeneficiary.accountNumber}
                          onChange={(e) => setNewBeneficiary((prev) => ({ ...prev, accountNumber: e.target.value }))}
                          placeholder="Account number"
                          className="form-input"
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>SWIFT/BIC Code</label>
                      <input
                        type="text"
                        value={newBeneficiary.swiftBic}
                        onChange={(e) => setNewBeneficiary((prev) => ({ ...prev, swiftBic: e.target.value.toUpperCase() }))}
                        placeholder="e.g., DEUTDEFF"
                        className="form-input"
                        maxLength={11}
                      />
                    </div>
                  </div>
                )}

                {error && <p className="error-message">{error}</p>}

                <button
                  className="btn-primary"
                  onClick={handleContinueToStep3}
                  disabled={(!selectedBeneficiary && !newBeneficiary.name) || quoteLoading}
                >
                  {quoteLoading ? 'Getting Quote...' : 'Continue'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 3: FX Quote */}
        {step === 'quote' && quote && (
          <div className="wizard-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('beneficiary')}>
                ← Back
              </button>
              <h2>Exchange Rate Quote</h2>
            </div>

            <div className="quote-box">
              <div className="quote-amounts">
                <div className="quote-row debit">
                  <span className="label">You Send</span>
                  <span className="amount">-{quote.sellCurrency} {quote.sellAmount.toLocaleString()}</span>
                </div>
                <div className="quote-row credit">
                  <span className="label">Beneficiary Receives</span>
                  <span className="amount">+{quote.buyCurrency} {quote.buyAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="quote-rate">
                <span className="rate-label">Exchange Rate</span>
                <span className="rate-value">
                  1 {quote.sellCurrency} = {quote.exchangeRate.toFixed(4)} {quote.buyCurrency}
                </span>
              </div>

              <div className={`quote-timer ${quoteTimer <= 10 ? 'warning' : ''} ${quoteExpired ? 'expired' : ''}`}>
                {quoteExpired ? (
                  <span>Quote expired</span>
                ) : (
                  <span>{quoteTimer} seconds remaining</span>
                )}
              </div>
            </div>

            {quoteExpired ? (
              <button className="btn-primary" onClick={handleRefreshQuote} disabled={quoteLoading}>
                {quoteLoading ? 'Refreshing...' : 'Get New Quote'}
              </button>
            ) : (
              <button className="btn-primary btn-book" onClick={handleBookQuote}>
                Book Rate & Continue
              </button>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <div className="wizard-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep(needsFX ? 'quote' : 'beneficiary')}>
                ← Back
              </button>
              <h2>Confirm Payment</h2>
            </div>

            <div className="confirm-details">
              <div className="confirm-section">
                <h3>Payment Amount</h3>
                <div className="confirm-row highlight">
                  <span>Amount</span>
                  <span className="value">
                    {details.destinationCurrency} {(quote?.buyAmount || calculated.destinationAmount).toLocaleString()}
                  </span>
                </div>
                {needsFX && (
                  <>
                    <div className="confirm-row">
                      <span>Debit Amount</span>
                      <span>{details.sourceCurrency} {(quote?.sellAmount || calculated.sourceAmount).toLocaleString()}</span>
                    </div>
                    <div className="confirm-row">
                      <span>Exchange Rate</span>
                      <span>{quote?.exchangeRate.toFixed(4) || calculated.rate.toFixed(4)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="confirm-section">
                <h3>Beneficiary</h3>
                <div className="confirm-row">
                  <span>Name</span>
                  <span>{selectedBeneficiary?.name || newBeneficiary.name}</span>
                </div>
                <div className="confirm-row">
                  <span>Bank</span>
                  <span>{selectedBeneficiary?.bankName || newBeneficiary.bankName}</span>
                </div>
                <div className="confirm-row">
                  <span>Account</span>
                  <span>{selectedBeneficiary?.iban || selectedBeneficiary?.accountNumber || newBeneficiary.iban || newBeneficiary.accountNumber}</span>
                </div>
                <div className="confirm-row">
                  <span>SWIFT/BIC</span>
                  <span>{selectedBeneficiary?.swiftBic || newBeneficiary.swiftBic}</span>
                </div>
              </div>

              <div className="confirm-section">
                <h3>Payment Details</h3>
                <div className="confirm-row">
                  <span>Value Date</span>
                  <span>{new Date(details.valueDate).toLocaleDateString()}</span>
                </div>
                {details.reasonForPayment && (
                  <div className="confirm-row">
                    <span>Reference</span>
                    <span>{details.reasonForPayment}</span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="btn-primary btn-submit"
              onClick={handleSubmitPayment}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="wizard-card success-card">
            <div className="success-icon">✓</div>
            <h2>Payment Submitted!</h2>

            <div className="reference-box">
              <p className="reference-label">Payment Reference</p>
              <p className="reference-number">{paymentRef}</p>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(paymentRef)}
              >
                Copy
              </button>
            </div>

            <div className="success-details">
              <div className="success-row">
                <span>Amount</span>
                <span>{details.destinationCurrency} {(quote?.buyAmount || calculated.destinationAmount).toLocaleString()}</span>
              </div>
              <div className="success-row">
                <span>To</span>
                <span>{selectedBeneficiary?.name || newBeneficiary.name}</span>
              </div>
              <div className="success-row">
                <span>Status</span>
                <span className="status-badge">Submitted to Bank</span>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={handleNewPayment}>
                New Payment
              </button>
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = '/history/payments')}
              >
                View Payment History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
