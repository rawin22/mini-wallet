import React from 'react';

interface FxDeal {
  id: string;
  reference: string;
  date: string;
  buyAmount: number;
  buyCurrency: string;
  sellAmount: number;
  sellCurrency: string;
}

interface PriorDealsProps {
  deals?: FxDeal[];
}

export const PriorDeals: React.FC<PriorDealsProps> = ({ deals = [] }) => {
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h4>Prior Deals</h4>
      </div>
      <div className="widget-body">
        {deals.length === 0 ? (
          <p className="no-data">No prior deals found.</p>
        ) : (
          <ul className="deal-list">
            {deals.map((deal) => (
              <li key={deal.id} className="deal-item-compact">
                <div className="deal-meta">
                  <span className="deal-ref">{deal.reference}</span>
                  <span className="deal-dt">{formatDate(deal.date)}</span>
                </div>
                <div className="deal-exchange">
                  <span className="deal-sell">
                    {formatAmount(deal.sellAmount)} {deal.sellCurrency}
                  </span>
                  <span className="deal-arrow">→</span>
                  <span className="deal-buy">
                    {formatAmount(deal.buyAmount)} {deal.buyCurrency}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
