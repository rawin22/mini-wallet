import type { CustomerBalanceData } from '../types/balance.types';
import 'flag-icons/css/flag-icons.min.css';

interface BalanceCardProps {
  balance: CustomerBalanceData;
}

const BalanceCard = ({ balance }: BalanceCardProps) => {
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getCurrencyFlagCode = (currencyCode: string): string => {
    const currencyToCountry: { [key: string]: string } = {
      USD: 'us',
      EUR: 'eu',
      GBP: 'gb',
      JPY: 'jp',
      CHF: 'ch',
      CAD: 'ca',
      AUD: 'au',
      NZD: 'nz',
      CNY: 'cn',
      INR: 'in',
      SGD: 'sg',
      HKD: 'hk',
      SEK: 'se',
      NOK: 'no',
      DKK: 'dk',
      PLN: 'pl',
      CZK: 'cz',
      HUF: 'hu',
      RON: 'ro',
      BGN: 'bg',
      TRY: 'tr',
      BRL: 'br',
      MXN: 'mx',
      ZAR: 'za',
      THB: 'th',
      MYR: 'my',
      IDR: 'id',
      PHP: 'ph',
      KRW: 'kr',
      AED: 'ae',
      SAR: 'sa',
      QAR: 'qa',
      KWD: 'kw',
      BHD: 'bh',
      OMR: 'om',
    };
    return currencyToCountry[currencyCode] || 'un';
  };

  const hasActiveHolds = balance.activeHoldsTotal > 0;

  return (
    <div className="balance-card">
      <div className="balance-card-header">
        <span
          className={`fi fi-${getCurrencyFlagCode(balance.currencyCode)}`}
          style={{ fontSize: '2rem', marginRight: '0.75rem' }}
        ></span>
        <h3 className="balance-currency">{balance.currencyCode}</h3>
      </div>
      <div className="balance-card-body">
        <div className="balance-amount">
          <div className="balance-label">Available Balance</div>
          <div className="balance-value">
            {balance.currencyCode} {formatNumber(balance.balanceAvailable)}
          </div>
        </div>
        {hasActiveHolds && (
          <div className="balance-holds">
            <div className="holds-label">Active Holds</div>
            <div className="holds-value">
              {balance.currencyCode} {formatNumber(balance.activeHoldsTotal)}
            </div>
          </div>
        )}
      </div>
      <div className="balance-card-footer">
        <a href="#" className="view-statement-link">
          View Statement →
        </a>
      </div>
    </div>
  );
};

export default BalanceCard;
