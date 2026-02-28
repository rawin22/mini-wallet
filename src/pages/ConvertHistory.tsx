import React, { useState, useEffect } from 'react';
import { fxHistoryService } from '../api/fx-history.service.ts';
import { formatDateTime } from '../utils/formatters.ts';
import type { FxDealSearchRecord } from '../types/fx.types.ts';
import '../styles/ConvertHistory.css';

export const ConvertHistory: React.FC = () => {
  const [deals, setDeals] = useState<FxDealSearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fxHistoryService.searchDeals();
        setDeals(result.fxDeals || []);
      } catch (err) {
        setError('Failed to load exchange history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="convert-history-page">
      <h1>Exchange History</h1>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>}
      {error && <div className="error-box"><p>{error}</p></div>}

      {!loading && !error && (
        deals.length === 0 ? (
          <p className="no-data">No FX deals found.</p>
        ) : (
          <div className="deals-list">
            {deals.map((deal) => (
              <div key={deal.fxDealId} className="deal-card">
                <div className="deal-card-header">
                  <span className="deal-ref">{deal.fxDealReference}</span>
                  <span className="deal-type">{deal.fxDealTypeName}</span>
                </div>
                <div className="deal-card-body">
                  <div className="deal-conversion">
                    <div className="conversion-side sell">
                      <span className="conversion-label">Sell</span>
                      <span className="conversion-amount">{deal.sellAmountTextWithCurrencyCode}</span>
                    </div>
                    <span className="conversion-arrow">&rarr;</span>
                    <div className="conversion-side buy">
                      <span className="conversion-label">Buy</span>
                      <span className="conversion-amount">{deal.buyAmountTextWithCurrencyCode}</span>
                    </div>
                  </div>
                  <div className="deal-meta">
                    <div className="meta-item">
                      <span className="meta-label">Rate</span>
                      <span className="meta-value">{deal.bookedRateTextWithCurrencyCodes}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Booked</span>
                      <span className="meta-value">{formatDateTime(deal.bookedTime)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Value Date</span>
                      <span className="meta-value">{deal.finalValueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
