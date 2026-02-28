import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import bankAccountsData from '../../data/bankAccounts.json';
import '../../styles/BankAccount.css';

type Tab = 'deposit' | 'linked';

interface CurrencyAccount {
  code: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftBic: string;
  iban: string | null;
  routingNumber: string | null;
  sortCode?: string;
  intermediaryBank: string | null;
}

interface CopiedState {
  [key: string]: boolean;
}

export const BankAccount: React.FC = () => {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('deposit');

  // Currency selection state
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    bankAccountsData.currencies[0]?.code || 'USD'
  );

  // Copy state for feedback
  const [copiedFields, setCopiedFields] = useState<CopiedState>({});

  const wpayId = user?.userId || '';

  // Get selected currency account details
  const selectedAccount = bankAccountsData.currencies.find(
    (c) => c.code === selectedCurrency
  ) as CurrencyAccount | undefined;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFields((prev) => ({ ...prev, [fieldName]: true }));
    setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [fieldName]: false }));
    }, 2000);
  };

  const copyAllDetails = () => {
    if (!selectedAccount) return;

    const details = [
      `Bank Name: ${selectedAccount.bankName}`,
      `Account Name: ${selectedAccount.accountName}`,
      `Account Number: ${selectedAccount.accountNumber}`,
      `SWIFT/BIC: ${selectedAccount.swiftBic}`,
      selectedAccount.iban ? `IBAN: ${selectedAccount.iban}` : null,
      selectedAccount.routingNumber ? `Routing Number: ${selectedAccount.routingNumber}` : null,
      selectedAccount.sortCode ? `Sort Code: ${selectedAccount.sortCode}` : null,
      `Payment Reference: ${wpayId}`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(details);
    setCopiedFields((prev) => ({ ...prev, all: true }));
    setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, all: false }));
    }, 2000);
  };

  const renderCopyButton = (value: string, fieldName: string) => (
    <button
      className={`btn-copy-inline ${copiedFields[fieldName] ? 'copied' : ''}`}
      onClick={() => copyToClipboard(value, fieldName)}
    >
      {copiedFields[fieldName] ? 'Copied!' : 'Copy'}
    </button>
  );

  return (
    <div className="bank-account-page">
      <div className="bank-account-header">
        <h1>Add Funds via Bank</h1>
        <p className="bank-account-subtitle">
          Wire transfer deposit instructions and linked accounts
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bank-account-tabs">
        <button
          className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit Instructions
        </button>
        <button
          className={`tab-btn ${activeTab === 'linked' ? 'active' : ''}`}
          onClick={() => setActiveTab('linked')}
        >
          Linked Accounts
        </button>
      </div>

      {/* Deposit Instructions Tab */}
      {activeTab === 'deposit' && (
        <div className="bank-account-card">
          <h2>Wire Transfer Details</h2>

          {/* Currency Selector */}
          <div className="currency-selector">
            <label>Select Deposit Currency</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {bankAccountsData.currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Details */}
          {selectedAccount && (
            <div className="bank-details">
              <div className="bank-details-row">
                <span className="label">Bank Name</span>
                <div className="value-container">
                  <span className="value">{selectedAccount.bankName}</span>
                  {renderCopyButton(selectedAccount.bankName, 'bankName')}
                </div>
              </div>

              <div className="bank-details-row">
                <span className="label">Account Name</span>
                <div className="value-container">
                  <span className="value">{selectedAccount.accountName}</span>
                  {renderCopyButton(selectedAccount.accountName, 'accountName')}
                </div>
              </div>

              <div className="bank-details-row">
                <span className="label">Account Number</span>
                <div className="value-container">
                  <span className="value mono">{selectedAccount.accountNumber}</span>
                  {renderCopyButton(selectedAccount.accountNumber, 'accountNumber')}
                </div>
              </div>

              <div className="bank-details-row">
                <span className="label">SWIFT/BIC</span>
                <div className="value-container">
                  <span className="value mono">{selectedAccount.swiftBic}</span>
                  {renderCopyButton(selectedAccount.swiftBic, 'swiftBic')}
                </div>
              </div>

              {selectedAccount.iban && (
                <div className="bank-details-row">
                  <span className="label">IBAN</span>
                  <div className="value-container">
                    <span className="value mono">{selectedAccount.iban}</span>
                    {renderCopyButton(selectedAccount.iban, 'iban')}
                  </div>
                </div>
              )}

              {selectedAccount.routingNumber && (
                <div className="bank-details-row">
                  <span className="label">Routing Number</span>
                  <div className="value-container">
                    <span className="value mono">{selectedAccount.routingNumber}</span>
                    {renderCopyButton(selectedAccount.routingNumber, 'routingNumber')}
                  </div>
                </div>
              )}

              {selectedAccount.sortCode && (
                <div className="bank-details-row">
                  <span className="label">Sort Code</span>
                  <div className="value-container">
                    <span className="value mono">{selectedAccount.sortCode}</span>
                    {renderCopyButton(selectedAccount.sortCode, 'sortCode')}
                  </div>
                </div>
              )}

              <div className="bank-details-row">
                <span className="label">Payment Reference</span>
                <div className="value-container">
                  <span className="value mono" style={{ color: 'var(--accent-blue)' }}>
                    {wpayId}
                  </span>
                  {renderCopyButton(wpayId, 'reference')}
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="important-notes">
            <h3>
              <span>⚠️</span> Important Information
            </h3>
            <ul>
              {bankAccountsData.depositInstructions.important.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          {/* Copy All Button */}
          <div className="copy-all-section">
            <button
              className="btn-copy-all"
              onClick={copyAllDetails}
            >
              {copiedFields.all ? 'Copied to Clipboard!' : 'Copy All Details'}
            </button>
          </div>
        </div>
      )}

      {/* Linked Accounts Tab */}
      {activeTab === 'linked' && (
        <div className="bank-account-card">
          <h2>Your Linked Bank Accounts</h2>

          <div className="linked-accounts-list">
            <div className="empty-state">
              <div className="empty-icon">🏦</div>
              <p>No linked bank accounts yet</p>
            </div>
          </div>

          <button className="btn-add-account" disabled>
            <span>+</span> Link a Bank Account
          </button>

          <div className="coming-soon-notice">
            <span className="notice-icon">i</span>
            <p>
              {bankAccountsData.linkedAccountsPlaceholder.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
