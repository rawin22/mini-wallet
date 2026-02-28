import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { statementService } from '../api/statement.service.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { formatCurrency, formatDateTime } from '../utils/formatters.ts';
import type { StatementResponse } from '../types/statement.types.ts';
import '../styles/Statement.css';

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const today = (): string => new Date().toISOString().split('T')[0];
const allHistoryStart = (): string => '1970-01-01';

export const Statement: React.FC = () => {
  const { t } = useLanguage();
  const { accountId } = useParams<{ accountId: string }>();
  const [data, setData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());
  const [preset, setPreset] = useState('30');

  const handlePreset = (value: string) => {
    setPreset(value);
    setEndDate(today());
    if (value === '7') setStartDate(daysAgo(7));
    else if (value === '30') setStartDate(daysAgo(30));
    else if (value === '90') setStartDate(daysAgo(90));
    else if (value === 'all') setStartDate(allHistoryStart());
  };

  const fetchStatement = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await statementService.getStatement(accountId, startDate, endDate);
      setData(result);
    } catch (err) {
      setError(t('statement.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accountId, startDate, endDate, t]);

  useEffect(() => { fetchStatement(); }, [fetchStatement]);

  const info = data?.accountInfo;
  const entries = data?.entries || [];
  const totalDebit = entries.reduce((sum, e) => sum + (e.debitAmount || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.creditAmount || 0), 0);

  return (
    <div className="statement-page">
      <h1>{t('statement.title')}</h1>

      <div className="statement-controls">
        <div className="date-presets">
          {['7', '30', '90'].map((d) => (
            <button key={d} className={`preset-btn ${preset === d ? 'active' : ''}`}
              onClick={() => handlePreset(d)}>
              {t('statement.days', { days: d })}
            </button>
          ))}
          <button className={`preset-btn ${preset === 'all' ? 'active' : ''}`}
            onClick={() => handlePreset('all')}>{t('statement.all')}</button>
          <button className={`preset-btn ${preset === 'custom' ? 'active' : ''}`}
            onClick={() => setPreset('custom')}>{t('common.custom')}</button>
        </div>
        {preset === 'custom' && (
          <div className="custom-dates">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span>{t('common.to')}</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button className="fetch-btn" onClick={fetchStatement}>{t('common.fetch')}</button>
          </div>
        )}
      </div>

      {loading && <div className="loading-spinner"><div className="spinner" /><p>{t('statement.loading')}</p></div>}
      {error && <div className="error-box"><p>{error}</p></div>}

      {!loading && !error && info && (
        <>
          <div className="account-info-bar">
            <div><strong>{info.accountName}</strong> ({info.accountCurrencyCode})</div>
            <div>{t('statement.account')}: {info.accountNumber}</div>
            <div>{t('statement.opening')}: {formatCurrency(info.beginningBalance)} | {t('statement.closing')}: {formatCurrency(info.endingBalance)}</div>
          </div>

          {entries.length === 0 ? (
            <p className="no-data">{t('statement.noTransactions')}</p>
          ) : (
            <>
              <table className="statement-table">
                <thead>
                  <tr>
                    <th>{t('statement.date')}</th><th>{t('statement.type')}</th><th>{t('statement.description')}</th>
                    <th className="num">{t('statement.debit')}</th><th className="num">{t('statement.credit')}</th><th className="num">{t('statement.balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={i}>
                      <td>{formatDateTime(entry.transactionTime)}</td>
                      <td>{entry.transactionType}</td>
                      <td>{entry.description}</td>
                      <td className="num debit">{entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : ''}</td>
                      <td className="num credit">{entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''}</td>
                      <td className="num">{formatCurrency(entry.runningBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="statement-summary">
                <div className="summary-item debit">{t('statement.totalDebits')}: {formatCurrency(totalDebit)} {info.accountCurrencyCode}</div>
                <div className="summary-item credit">{t('statement.totalCredits')}: {formatCurrency(totalCredit)} {info.accountCurrencyCode}</div>
                <div className="summary-item net">{t('statement.netChange')}: {formatCurrency(totalCredit - totalDebit)} {info.accountCurrencyCode}</div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
