import React from 'react';
import type { UnifiedPayment } from '../types/payment.types';

interface PaymentListItemProps {
  payment: UnifiedPayment;
  currentUserAlias: string;
  onViewDetails?: (paymentId: string, paymentType: 'instant' | 'wire') => void;
  onRepeat?: (payment: UnifiedPayment) => void;
}

export const PaymentListItem: React.FC<PaymentListItemProps> = ({
  payment,
  currentUserAlias,
  onViewDetails,
  onRepeat,
}) => {
  // Determine payment direction (for instant payments)
  const isInstantPayment = payment.type === 'instant';
  const isOutgoing = isInstantPayment && payment.from.includes(currentUserAlias);

  // For wire payments, they are always outgoing
  const isWireOutgoing = payment.type === 'wire';

  // Format date/time
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge class
  const getStatusClass = (): string => {
    const status = payment.statusDisplay.toLowerCase();
    if (status.includes('paid') || status.includes('sent') || status.includes('received')) {
      return 'status-paid';
    }
    if (status.includes('pending') || status.includes('draft') || status.includes('processing')) {
      return 'status-pending';
    }
    if (status.includes('cancelled') || status.includes('voided')) {
      return 'status-cancelled';
    }
    return 'status-unknown';
  };

  // Get payment type icon
  const getPaymentIcon = (): string => {
    return payment.type === 'instant' ? '💸' : '🏦';
  };

  // Get payment type label
  const getPaymentTypeLabel = (): string => {
    return payment.type === 'instant' ? 'Instant' : 'Wire';
  };

  return (
    <div className="payment-list-item">
      {/* Date/Time + Type */}
      <div className="payment-datetime">
        <span className="payment-icon">{getPaymentIcon()}</span>
        <div className="datetime-wrapper">
          <span className="datetime-text">
            {formatDateTime(payment.createdTime)}
          </span>
          <span className={`payment-type-badge type-${payment.type}`}>
            {getPaymentTypeLabel()}
          </span>
        </div>
      </div>

      {/* From/To Info */}
      <div className="payment-parties">
        <div className="party-line">
          <span className="party-label">From:</span>
          <span className="party-value">{payment.from}</span>
        </div>
        <div className="party-line">
          <span className="party-label">To:</span>
          <span className="party-value">{payment.to}</span>
        </div>
        {payment.description && (
          <div className="party-line">
            <span className="party-label">Note:</span>
            <span className="party-description">{payment.description}</span>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className={`payment-amount ${(isOutgoing || isWireOutgoing) ? 'amount-debit' : 'amount-credit'}`}>
        {(isOutgoing || isWireOutgoing) ? '-' : '+'}{payment.amount.toFixed(2)} {payment.currency}
      </div>

      {/* Actions */}
      <div className="payment-actions">
        <button
          className="action-btn btn-details"
          onClick={() => onViewDetails?.(payment.id, payment.type)}
        >
          Details
        </button>

        {(isOutgoing || isWireOutgoing) && payment.statusDisplay.toLowerCase().includes('paid') && (
          <button
            className="action-btn btn-repeat"
            onClick={() => onRepeat?.(payment)}
          >
            Repeat
          </button>
        )}

        <span className={`status-badge ${getStatusClass()}`}>
          {payment.statusDisplay}
        </span>
      </div>
    </div>
  );
};
