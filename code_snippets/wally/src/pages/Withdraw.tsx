import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { balanceService } from '../api/balance.service';
import type { CustomerBalanceData } from '../types/balance.types';
import {
  type CashPoint,
  getAvailableCountries,
  getCashPointsByService,
  getCashPointsNearby,
  COUNTRY_COORDINATES,
} from '../data/cashPoints';
import '../styles/Withdraw.css';

type Step = 'location' | 'cashpoint' | 'amount' | 'confirm' | 'success';

interface LocationState {
  loading: boolean;
  error: string | null;
  country: string | null;
  countryName: string | null;
  coordinates: { lat: number; lng: number } | null;
}

export const Withdraw: React.FC = () => {
  const { user } = useAuth();

  // Location state
  const [location, setLocation] = useState<LocationState>({
    loading: true,
    error: null,
    country: null,
    countryName: null,
    coordinates: null,
  });

  // Wizard state
  const [step, setStep] = useState<Step>('location');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cashPoints, setCashPoints] = useState<(CashPoint & { distance?: number })[]>([]);
  const [selectedCashPoint, setSelectedCashPoint] = useState<CashPoint | null>(null);

  // Amount state
  const [balances, setBalances] = useState<CustomerBalanceData[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Transaction state
  const [submitting, setSubmitting] = useState(false);
  const [transactionRef, setTransactionRef] = useState<string>('');

  const countries = getAvailableCountries();

  // Request browser geolocation on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation({
        loading: false,
        error: 'Geolocation is not supported by your browser',
        country: null,
        countryName: null,
        coordinates: null,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode using free API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          const countryCode = data.countryCode;
          const countryName = data.countryName;

          // Check if we have cash points in this country
          const availableCountry = countries.find((c) => c.code === countryCode);

          if (availableCountry) {
            setLocation({
              loading: false,
              error: null,
              country: countryCode,
              countryName: countryName,
              coordinates: { lat: latitude, lng: longitude },
            });
            setSelectedCountry(countryCode);

            // Get nearby cash points
            const nearby = getCashPointsNearby(latitude, longitude, 'cash_out');
            setCashPoints(nearby.filter((cp) => cp.country === countryCode));

            // Auto-advance to cash point selection
            setStep('cashpoint');
          } else {
            setLocation({
              loading: false,
              error: `No cash points available in ${countryName}. Please select a different country.`,
              country: countryCode,
              countryName: countryName,
              coordinates: { lat: latitude, lng: longitude },
            });
          }
        } catch {
          setLocation({
            loading: false,
            error: 'Could not determine your location. Please select manually.',
            country: null,
            countryName: null,
            coordinates: { lat: latitude, lng: longitude },
          });
        }
      },
      (error) => {
        let errorMessage = 'Could not get your location. Please select manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please select your country manually.';
        }
        setLocation({
          loading: false,
          error: errorMessage,
          country: null,
          countryName: null,
          coordinates: null,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Handle manual country selection
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const country = countries.find((c) => c.code === countryCode);

    // Get cash points for selected country
    const points = getCashPointsByService('cash_out', countryCode);

    // If we have coordinates, sort by distance
    if (location.coordinates) {
      const nearby = getCashPointsNearby(
        location.coordinates.lat,
        location.coordinates.lng,
        'cash_out'
      ).filter((cp) => cp.country === countryCode);
      setCashPoints(nearby);
    } else {
      // Use country center for rough distance
      const coords = COUNTRY_COORDINATES[countryCode];
      if (coords) {
        const nearby = getCashPointsNearby(coords.lat, coords.lng, 'cash_out').filter(
          (cp) => cp.country === countryCode
        );
        setCashPoints(nearby);
      } else {
        setCashPoints(points);
      }
    }

    setLocation((prev) => ({
      ...prev,
      country: countryCode,
      countryName: country?.name || countryCode,
    }));

    setStep('cashpoint');
  };

  // Handle cash point selection
  const handleCashPointSelect = async (cashPoint: CashPoint) => {
    setSelectedCashPoint(cashPoint);

    // Load user balances
    if (user?.userId) {
      setLoadingBalances(true);
      try {
        const response = await balanceService.getBalances(user.userId);
        // Filter to currencies supported by the cash point and with available balance
        const availableBalances = (response.balances || []).filter(
          (b) =>
            cashPoint.supportedCurrencies.includes(b.currencyCode) &&
            b.balanceAvailable > 0
        );
        setBalances(availableBalances);

        // Pre-select first available currency
        if (availableBalances.length > 0) {
          setSelectedCurrency(availableBalances[0].currencyCode);
        }
      } catch (error) {
        console.error('Failed to load balances:', error);
      } finally {
        setLoadingBalances(false);
      }
    }

    setStep('amount');
  };

  // Handle amount submission
  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const balance = balances.find((b) => b.currencyCode === selectedCurrency);
    if (!balance || parseFloat(amount) > balance.balanceAvailable) {
      alert('Insufficient balance');
      return;
    }

    setStep('confirm');
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (!selectedCashPoint || !user) return;

    setSubmitting(true);

    try {
      // TODO: Replace with actual instant payment API call
      // const result = await createInstantPayment({
      //   fromCustomerAlias: customerAlias,
      //   toCustomerAlias: selectedCashPoint.alias,
      //   amount: parseFloat(amount),
      //   currencyCode: selectedCurrency,
      //   memo: `Cash withdrawal at ${selectedCashPoint.name}`,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock reference
      const ref = `WD${Date.now().toString().slice(-8)}`;
      setTransactionRef(ref);
      setStep('success');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset wizard
  const handleNewWithdrawal = () => {
    setStep('location');
    setSelectedCashPoint(null);
    setAmount('');
    setTransactionRef('');
    detectLocation();
  };

  // Get selected balance
  const selectedBalance = balances.find((b) => b.currencyCode === selectedCurrency);

  return (
    <div className="withdraw-page">
      <div className="withdraw-header">
        <h1>Cash Withdrawal</h1>
        <p className="withdraw-subtitle">
          Get cash from a nearby WinPay Cash Point
        </p>
      </div>

      {/* Progress Steps */}
      <div className="withdraw-progress">
        <div className={`progress-step ${step === 'location' ? 'active' : ''} ${['cashpoint', 'amount', 'confirm', 'success'].includes(step) ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Location</span>
        </div>
        <div className={`progress-step ${step === 'cashpoint' ? 'active' : ''} ${['amount', 'confirm', 'success'].includes(step) ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Cash Point</span>
        </div>
        <div className={`progress-step ${step === 'amount' ? 'active' : ''} ${['confirm', 'success'].includes(step) ? 'completed' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Amount</span>
        </div>
        <div className={`progress-step ${step === 'confirm' || step === 'success' ? 'active' : ''} ${step === 'success' ? 'completed' : ''}`}>
          <span className="step-number">4</span>
          <span className="step-label">Confirm</span>
        </div>
      </div>

      <div className="withdraw-content">
        {/* Step 1: Location Detection */}
        {step === 'location' && (
          <div className="withdraw-card">
            <h2>Select Your Location</h2>

            {location.loading ? (
              <div className="location-detecting">
                <div className="location-spinner"></div>
                <p>Detecting your location...</p>
              </div>
            ) : (
              <>
                {location.error && (
                  <div className="location-error">
                    <span className="error-icon">!</span>
                    <p>{location.error}</p>
                  </div>
                )}

                <div className="country-selector">
                  <label>Select Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    className="country-select"
                  >
                    <option value="">-- Select a country --</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn-detect-location"
                  onClick={detectLocation}
                  disabled={location.loading}
                >
                  <span className="location-icon">📍</span>
                  Use My Location
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Cash Point Selection */}
        {step === 'cashpoint' && (
          <div className="withdraw-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('location')}>
                ← Back
              </button>
              <h2>Select Cash Point</h2>
            </div>

            <p className="selected-country">
              Showing cash points in <strong>{location.countryName}</strong>
            </p>

            <div className="cashpoint-list">
              {cashPoints.length === 0 ? (
                <div className="no-cashpoints">
                  <p>No cash points available in this area.</p>
                </div>
              ) : (
                cashPoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="cashpoint-item"
                    onClick={() => handleCashPointSelect(cp)}
                  >
                    <div className="cashpoint-info">
                      <h3>{cp.name}</h3>
                      <p className="cashpoint-address">{cp.address}</p>
                      <p className="cashpoint-hours">{cp.operatingHours}</p>
                      <div className="cashpoint-currencies">
                        {cp.supportedCurrencies.slice(0, 4).map((ccy) => (
                          <span key={ccy} className="currency-badge">
                            {ccy}
                          </span>
                        ))}
                        {cp.supportedCurrencies.length > 4 && (
                          <span className="currency-badge more">
                            +{cp.supportedCurrencies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    {cp.distance !== undefined && (
                      <div className="cashpoint-distance">
                        {cp.distance < 1
                          ? `${Math.round(cp.distance * 1000)}m`
                          : `${cp.distance.toFixed(1)}km`}
                      </div>
                    )}
                    <span className="cashpoint-arrow">→</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 3: Amount Entry */}
        {step === 'amount' && selectedCashPoint && (
          <div className="withdraw-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('cashpoint')}>
                ← Back
              </button>
              <h2>Enter Amount</h2>
            </div>

            <div className="selected-cashpoint-summary">
              <h3>{selectedCashPoint.name}</h3>
              <p>{selectedCashPoint.address}</p>
            </div>

            {loadingBalances ? (
              <div className="loading-balances">Loading your balances...</div>
            ) : balances.length === 0 ? (
              <div className="no-balances">
                <p>
                  You don't have any balance in currencies supported by this cash
                  point.
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => setStep('cashpoint')}
                >
                  Select Different Cash Point
                </button>
              </div>
            ) : (
              <>
                <div className="currency-selector">
                  <label>Currency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="currency-select"
                  >
                    {balances.map((b) => (
                      <option key={b.currencyCode} value={b.currencyCode}>
                        {b.currencyCode} - Available:{' '}
                        {b.balanceAvailable.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="amount-input-group">
                  <label>Amount to Withdraw</label>
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
                        !selectedBalance ||
                        quickAmount > selectedBalance.balanceAvailable
                      }
                    >
                      {quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-primary btn-continue"
                  onClick={handleAmountSubmit}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && selectedCashPoint && (
          <div className="withdraw-card">
            <div className="step-header">
              <button className="btn-back" onClick={() => setStep('amount')}>
                ← Back
              </button>
              <h2>Confirm Withdrawal</h2>
            </div>

            <div className="confirm-details">
              <div className="confirm-row">
                <span className="confirm-label">Amount</span>
                <span className="confirm-value amount">
                  {selectedCurrency} {parseFloat(amount).toLocaleString()}
                </span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Cash Point</span>
                <span className="confirm-value">{selectedCashPoint.name}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Address</span>
                <span className="confirm-value">{selectedCashPoint.address}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Hours</span>
                <span className="confirm-value">
                  {selectedCashPoint.operatingHours}
                </span>
              </div>

              {selectedCashPoint.phone && (
                <div className="confirm-row">
                  <span className="confirm-label">Phone</span>
                  <span className="confirm-value">{selectedCashPoint.phone}</span>
                </div>
              )}
            </div>

            <div className="confirm-notice">
              <span className="notice-icon">ℹ️</span>
              <p>
                After confirmation, visit the cash point and show your reference
                number to collect your cash.
              </p>
            </div>

            <button
              className="btn-primary btn-confirm"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && selectedCashPoint && (
          <div className="withdraw-card success-card">
            <div className="success-icon">✓</div>
            <h2>Withdrawal Confirmed!</h2>

            <div className="reference-box">
              <p className="reference-label">Your Reference Number</p>
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
                <span>Cash Point</span>
                <span>{selectedCashPoint.name}</span>
              </div>
              <div className="success-row">
                <span>Address</span>
                <span>{selectedCashPoint.address}</span>
              </div>
            </div>

            <div className="success-instructions">
              <h3>Next Steps:</h3>
              <ol>
                <li>Visit {selectedCashPoint.name}</li>
                <li>Show your reference number: <strong>{transactionRef}</strong></li>
                <li>Present valid ID</li>
                <li>Collect your cash</li>
              </ol>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={handleNewWithdrawal}>
                New Withdrawal
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
