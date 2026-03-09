import React, { useState, useEffect } from 'react';
import { fxHistoryService } from '../api/fx-history.service.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { formatDateTime } from '../utils/formatters.ts';
import type { FxDealSearchRecord } from '../types/fx.types.ts';
import '../styles/ConvertHistory.css';

export const ConvertHistory: React.FC = () => {
  const { t } = useLanguage();
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
        setError(t('history.exchangeLoadError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [t]);

  return (
    <div className="convert-history-page">
      <h1>{t('history.exchangeTitle')}</h1>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>{t('common.loading')}</p></div>}
      {error && <div className="error-box"><p>{error}</p></div>}

      {!loading && !error && (
        deals.length === 0 ? (
          <p className="no-data">{t('history.noDeals')}</p>
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
                      <span className="conversion-label">{t('history.sell')}</span>
                      <span className="conversion-amount">{deal.sellAmountTextWithCurrencyCode}</span>
                    </div>
                    <span className="conversion-arrow">&rarr;</span>
                    <div className="conversion-side buy">
                      <span className="conversion-label">{t('history.buy')}</span>
                      <span className="conversion-amount">{deal.buyAmountTextWithCurrencyCode}</span>
                    </div>
                  </div>
                  <div className="deal-meta">
                    <div className="meta-item">
                      <span className="meta-label">{t('history.rate')}</span>
                      <span className="meta-value">{deal.bookedRateTextWithCurrencyCodes}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{t('history.booked')}</span>
                      <span className="meta-value">{formatDateTime(deal.bookedTime)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{t('history.valueDate')}</span>
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
