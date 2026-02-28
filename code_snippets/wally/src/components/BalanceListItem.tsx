import React from 'react';
import type { CustomerBalanceData } from '../types/balance.types';
import 'flag-icons/css/flag-icons.min.css';
import '../styles/Balances.css';

interface BalanceListItemProps {
  balance: CustomerBalanceData;
  onViewStatement?: (accountId: string) => void;
}

export const BalanceListItem: React.FC<BalanceListItemProps> = ({
  balance,
  onViewStatement
}) => {
  const hasReserved = balance.activeHoldsTotal > 0;

  return (
    <div className="balance-list-item">
      {/* Left: Currency Info */}
      <div className="balance-info">
        <div className="currency-flag-wrapper">
          <span className={`fi fi-${getCurrencyFlag(balance.currencyCode)}`}></span>
        </div>
        <div className="currency-details">
          <div className="currency-name">
            <span className="currency-code">{balance.currencyCode}</span>
          </div>
          <div className="account-number">
            Account: {balance.accountNumber}
          </div>
        </div>
      </div>

      {/* Right: Balance Amounts */}
      <div className="balance-amounts">
        <div className="balance-available">
          {formatBalance(balance.balanceAvailable)} {balance.currencyCode}
        </div>
        {hasReserved && (
          <div className="balance-reserved">
            Reserved: {formatBalance(balance.activeHoldsTotal)} {balance.currencyCode}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="balance-actions">
        <button
          className="action-link"
          onClick={() => onViewStatement?.(balance.accountId)}
        >
          View Statement →
        </button>
      </div>
    </div>
  );
};

// Helper: Get country code for flag from currency code
function getCurrencyFlag(currencyCode: string): string {
  const flagMap: Record<string, string> = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
    'CHF': 'ch', 'CAD': 'ca', 'AUD': 'au', 'NZD': 'nz',
    'CNY': 'cn', 'INR': 'in', 'SGD': 'sg', 'HKD': 'hk',
    'SEK': 'se', 'NOK': 'no', 'DKK': 'dk', 'PLN': 'pl',
    'CZK': 'cz', 'HUF': 'hu', 'RON': 'ro', 'BGN': 'bg',
    'TRY': 'tr', 'ILS': 'il', 'ZAR': 'za', 'BRL': 'br',
    'MXN': 'mx', 'ARS': 'ar', 'CLP': 'cl', 'COP': 'co',
    'PEN': 'pe', 'THB': 'th', 'MYR': 'my', 'IDR': 'id',
    'PHP': 'ph', 'VND': 'vn', 'KRW': 'kr', 'TWD': 'tw',
    'AED': 'ae', 'SAR': 'sa', 'QAR': 'qa', 'KWD': 'kw',
    'BHD': 'bh', 'OMR': 'om', 'JOD': 'jo', 'EGP': 'eg',
    'MAD': 'ma', 'TND': 'tn', 'NGN': 'ng', 'KES': 'ke',
    // Crypto/Special (use generic icon or placeholder)
    'BTC': 'xx', 'ETH': 'xx', 'USDT': 'xx',
    'XAU': 'xx', 'XAG': 'xx', 'XPT': 'xx',
  };

  return flagMap[currencyCode] || 'xx';
}

// Helper: Format balance with commas
function formatBalance(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8, // Support crypto decimals
  });
}
