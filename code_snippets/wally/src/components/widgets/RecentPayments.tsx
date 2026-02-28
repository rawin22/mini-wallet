import React from 'react';

interface Payment {
  id: string;
  type: 'incoming' | 'outgoing' | 'exchange';
  counterparty: string;
  amount: number;
  currencyCode: string;
  status: string;
  date: string;
}

interface RecentPaymentsProps {
  payments?: Payment[];
}

export const RecentPayments: React.FC<RecentPaymentsProps> = ({ payments = [] }) => {
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return '↓';
      case 'outgoing':
        return '↑';
      case 'exchange':
        return '⇄';
      default:
        return '•';
    }
  };

  const getPaymentClass = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'payment-incoming';
      case 'outgoing':
        return 'payment-outgoing';
      case 'exchange':
        return 'payment-exchange';
      default:
        return '';
    }
  };

  const formatAmount = (amount: number, currencyCode: string, type: string) => {
    const prefix = type === 'incoming' ? '+' : type === 'outgoing' ? '-' : '';
    return `${prefix}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyCode}`;
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h4>Recent Payments</h4>
      </div>
      <div className="widget-body">
        {payments.length === 0 ? (
          <p className="no-data">No recent payments found.</p>
        ) : (
          <ul className="payment-list">
            {payments.map((payment) => (
              <li key={payment.id} className="payment-item">
                <div className="payment-item-left">
                  <div className={`payment-icon ${getPaymentClass(payment.type)}`}>
                    {getPaymentIcon(payment.type)}
                  </div>
                  <div className="payment-info">
                    <div className="payment-counterparty">{payment.counterparty}</div>
                    <div className="payment-status">{payment.status}</div>
                  </div>
                </div>
                <div className="payment-amount">
                  {formatAmount(payment.amount, payment.currencyCode, payment.type)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
