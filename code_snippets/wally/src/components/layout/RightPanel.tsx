import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../common/ActionButton';
import { RecentPayments } from '../widgets/RecentPayments';
import { PriorDeals } from '../widgets/PriorDeals';

export const RightPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const mockPayments = [
    {
      id: '1',
      type: 'outgoing' as const,
      counterparty: 'BARRET',
      amount: 200.0,
      currencyCode: 'USD',
      status: 'Completed',
      date: '2025-12-30',
    },
    {
      id: '2',
      type: 'incoming' as const,
      counterparty: 'CLOUD',
      amount: 150.0,
      currencyCode: 'EUR',
      status: 'Completed',
      date: '2025-12-29',
    },
    {
      id: '3',
      type: 'outgoing' as const,
      counterparty: 'TIFA',
      amount: 75.5,
      currencyCode: 'GBP',
      status: 'Pending',
      date: '2025-12-28',
    },
  ];

  const mockDeals = [
    {
      id: '1',
      reference: 'FX-2025-001',
      date: '2025-12-30',
      buyAmount: 1000.0,
      buyCurrency: 'EUR',
      sellAmount: 1100.0,
      sellCurrency: 'USD',
    },
    {
      id: '2',
      reference: 'FX-2025-002',
      date: '2025-12-29',
      buyAmount: 500.0,
      buyCurrency: 'GBP',
      sellAmount: 650.0,
      sellCurrency: 'USD',
    },
  ];

  const totalUSD = 9610.01;

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={`right-panel ${isOpen ? '' : 'collapsed'}`}>
      <button
        className="right-panel-toggle"
        onClick={togglePanel}
        aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
      >
        <span className="toggle-icon">{isOpen ? '›' : '‹'}</span>
      </button>

      <div className="right-panel-content">
        <div className="usd-equivalent-section">
          <div className="usd-equivalent-label">USD Equivalent</div>
          <div className="usd-equivalent-amount">
            {totalUSD.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="quick-actions-section">
          <div className="quick-actions-grid">
            <ActionButton icon="+" label="PayNow" onClick={() => navigate('/pay-now')} />
            <ActionButton icon="⇄" label="Convert" onClick={() => navigate('/exchange')} />
            <ActionButton icon="↑" label="Wire" onClick={() => navigate('/payment-wizard')} />
            <ActionButton icon="↓" label="Receive" onClick={() => navigate('/receive')} />
          </div>
        </div>

        <div className="widgets-section">
          <RecentPayments payments={mockPayments} />
          <PriorDeals deals={mockDeals} />
        </div>
      </div>
    </aside>
  );
};
