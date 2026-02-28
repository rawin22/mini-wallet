import React, { useEffect, useState } from 'react';
import '../../styles/ExchangeRatesWidget.css';

interface CurrencyConversion {
  currency: string;
  currencyName: string;
  countryCode: string;
  toUSD: number;
  toEUR: number;
  goldPriceInCurrency: number;
}

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

interface ExchangeRatesWidgetProps {
  visibleCurrencies: string[];
}

const GOLD_PRICE_USD = 2650; // Mock gold price per oz in USD

const CURRENCY_FLAGS: { [key: string]: string } = {
  USD: 'us',
  EUR: 'eu',
  GBP: 'gb',
  JPY: 'jp',
  CHF: 'ch',
  CAD: 'ca',
  AUD: 'au',
  SGD: 'sg',
  THB: 'th',
  MYR: 'my',
  IDR: 'id',
  PHP: 'ph',
  VND: 'vn',
  INR: 'in',
  CNY: 'cn',
  HKD: 'hk',
  KRW: 'kr',
  TWD: 'tw',
};

const CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CHF: 'Swiss Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong',
  INR: 'Indian Rupee',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  TWD: 'Taiwan Dollar',
};

export const ExchangeRatesWidget: React.FC<ExchangeRatesWidgetProps> = ({
  visibleCurrencies,
}) => {
  const [conversions, setConversions] = useState<CurrencyConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch rates from USD base
        const response = await fetch(
          'https://api.frankfurter.app/latest?from=USD'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }

        const data: FrankfurterResponse = await response.json();

        console.log('📊 API Response:', data);
        console.log('🔍 Requested currencies:', visibleCurrencies);
        console.log('✅ Available rates:', Object.keys(data.rates));

        // Get EUR rate for conversions
        const rateUsdToEur = data.rates.EUR || 1;

        // Calculate conversions for each visible currency
        const currencyConversions: CurrencyConversion[] = visibleCurrencies
          .filter((currency) => {
            // USD is the base currency, so it won't be in rates - handle it separately
            if (currency === 'USD') return true;

            const available = data.rates[currency] !== undefined;
            if (!available) {
              console.warn(`⚠️ Currency ${currency} not available in API`);
            }
            return available;
          })
          .map((currency) => {
            // Special handling for USD (base currency)
            if (currency === 'USD') {
              return {
                currency: 'USD',
                currencyName: CURRENCY_NAMES['USD'] || 'US Dollar',
                countryCode: CURRENCY_FLAGS['USD'] || 'us',
                toUSD: 1, // 1 USD = 1 USD
                toEUR: rateUsdToEur, // 1 USD = X EUR
                goldPriceInCurrency: GOLD_PRICE_USD, // Gold price in USD
              };
            }

            const rateUsdToCurrency = data.rates[currency];

            return {
              currency,
              currencyName: CURRENCY_NAMES[currency] || currency,
              countryCode: CURRENCY_FLAGS[currency] || 'un',
              // Value of 1 user currency in USD
              toUSD: 1 / rateUsdToCurrency,
              // Value of 1 user currency in EUR
              toEUR: rateUsdToEur / rateUsdToCurrency,
              // Price of 1 oz Gold in user's currency
              goldPriceInCurrency: GOLD_PRICE_USD * rateUsdToCurrency,
            };
          });

        console.log('💱 Conversions created:', currencyConversions);
        setConversions(currencyConversions);
      } catch (err) {
        console.error('Exchange rates fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load rates');
      } finally {
        setLoading(false);
      }
    };

    if (visibleCurrencies.length > 0) {
      fetchExchangeRates();

      // Refresh rates every 5 minutes
      const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [visibleCurrencies]);

  const formatCurrency = (value: number): string => {
    // Special formatting for large numbers (like Indonesian Rupiah)
    if (value > 1000) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  if (loading) {
    return (
      <div className="exchange-rates-widget">
        <div className="widget-header">
          <h3 className="widget-title">💱 Currency Converter</h3>
          <span className="subtitle">Your currencies to USD, EUR & Gold</span>
        </div>
        <div className="loading-state">
          <div className="spinner-small"></div>
          <p>Loading rates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exchange-rates-widget">
        <div className="widget-header">
          <h3 className="widget-title">💱 Currency Converter</h3>
          <span className="subtitle">Your currencies to USD, EUR & Gold</span>
        </div>
        <div className="error-state">
          <p className="error-text">⚠️ {error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="exchange-rates-widget">
        <div className="widget-header">
          <h3 className="widget-title">💱 Currency Converter</h3>
          <span className="subtitle">Your currencies to USD, EUR & Gold</span>
        </div>
        <div className="empty-state">
          <p>No currencies available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exchange-rates-widget">
      <div className="widget-header">
        <h3 className="widget-title">💱 Currency Converter</h3>
        <span className="subtitle">Your currencies to USD, EUR & Gold</span>
      </div>

      <div className="conversions-grid">
        {conversions.map((conversion) => (
          <div key={conversion.currency} className="conversion-card">
            <div className="conversion-card-header">
              <span
                className={`fi fi-${conversion.countryCode} flag-icon-large`}
                title={conversion.currency}
              ></span>
              <div className="currency-info">
                <div className="currency-code">{conversion.currency}</div>
                <div className="currency-name">{conversion.currencyName}</div>
              </div>
            </div>

            <div className="conversion-rates">
              {/* To USD */}
              <div className="conversion-row">
                <div className="conversion-label">
                  <span className="fi fi-us flag-icon-small"></span>
                  <span>USD</span>
                </div>
                <div className="conversion-value">
                  ${formatCurrency(conversion.toUSD)}
                </div>
              </div>

              {/* To EUR */}
              <div className="conversion-row">
                <div className="conversion-label">
                  <span className="fi fi-eu flag-icon-small"></span>
                  <span>EUR</span>
                </div>
                <div className="conversion-value">
                  €{formatCurrency(conversion.toEUR)}
                </div>
              </div>

              {/* Gold Price */}
              <div className="conversion-row gold-row">
                <div className="conversion-label">
                  <span className="gold-icon">🪙</span>
                  <span>Gold</span>
                </div>
                <div className="conversion-value gold-value">
                  {conversion.currency === 'USD' ? '$' : ''}
                  {conversion.currency === 'EUR' ? '€' : ''}
                  {conversion.currency === 'GBP' ? '£' : ''}
                  {conversion.currency === 'JPY' ? '¥' : ''}
                  {!['USD', 'EUR', 'GBP', 'JPY'].includes(conversion.currency)
                    ? conversion.currency + ' '
                    : ''}
                  {formatCurrency(
                    conversion.goldPriceInCurrency
                  )}
                  <span className="per-oz">/oz</span>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <span className="base-note">1 {conversion.currency} =</span>
            </div>
          </div>
        ))}
      </div>

      <div className="widget-footer">
        <span className="data-source">
          Data from{' '}
          <a
            href="https://www.frankfurter.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Frankfurter API
          </a>
        </span>
        <span className="refresh-info">
          Gold: ${GOLD_PRICE_USD}/oz • Updates every 5 min
        </span>
      </div>
    </div>
  );
};
