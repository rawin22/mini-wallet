import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { verificationService } from '../api/verification.service.ts';
import '../styles/profile.css';

interface VLinkDisplay {
  id: string;
  reference: string;
  name: string;
  statusId: number;
  statusName: string;
  url: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vlinks, setVlinks] = useState<VLinkDisplay[]>([]);
  const [vlinkLoading, setVlinkLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const searchResults = await verificationService.searchVerifiedLinks();
        if (searchResults.length === 0) {
          setVlinks([]);
          return;
        }

        // For each VLink, fetch full details to get the URL
        const displays: VLinkDisplay[] = [];
        for (const vl of searchResults) {
          const id = (vl.verifiedLinkId ?? vl.VerifiedLinkId) as string;
          const ref = (vl.verifiedLinkReference ?? vl.VerifiedLinkReference) as string;
          const name = (vl.verifiedLinkName ?? vl.VerifiedLinkName) as string;
          const statusId = (vl.verifiedLinkStatusTypeId ?? vl.VerifiedLinkStatusTypeId) as number;
          const statusName = (vl.verifiedLinkStatusTypeName ?? vl.VerifiedLinkStatusTypeName) as string;

          let url = '';
          try {
            const full = await verificationService.getVerifiedLink(id);
            url = (full?.verifiedLinkUrl ?? full?.VerifiedLinkUrl ?? '') as string;
          } catch {
            // If GET fails, leave URL empty
          }

          displays.push({ id, reference: ref, name, statusId, statusName, url });
        }
        setVlinks(displays);
      } catch {
        setVlinks([]);
      } finally {
        setVlinkLoading(false);
      }
    })();
  }, []);

  if (!user) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusClass = (statusId: number) => {
    if (statusId === 2) return 'badge-green';
    if (statusId === 1) return 'badge-pending';
    return 'badge-red';
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">{t('profile.title')}</h1>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <h2 className="profile-fullname">{user.firstName} {user.lastName}</h2>
          <p className="profile-username">@{user.userName}</p>
        </div>
      </div>

      <div className="profile-card">
        <h3 className="profile-section-title">{t('profile.accountInfo')}</h3>
        <div className="profile-field">
          <span className="profile-label">{t('profile.username')}</span>
          <span className="profile-value">{user.userName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.email')}</span>
          <span className="profile-value">{user.emailAddress}</span>
        </div>
        {user.phone && (
          <div className="profile-field">
            <span className="profile-label">{t('profile.phone')}</span>
            <span className="profile-value">{user.phone}</span>
          </div>
        )}
      </div>

      <div className="profile-card">
        <h3 className="profile-section-title">{t('profile.personalInfo')}</h3>
        <div className="profile-field">
          <span className="profile-label">{t('profile.firstName')}</span>
          <span className="profile-value">{user.firstName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.lastName')}</span>
          <span className="profile-value">{user.lastName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.organization')}</span>
          <span className="profile-value">{user.organizationName}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.branch')}</span>
          <span className="profile-value">{user.branchName}</span>
        </div>
      </div>

      {(user.customerWKYCLevel !== undefined || user.wkycId) && (
        <div className="profile-card">
          <h3 className="profile-section-title">{t('profile.verification')}</h3>
          {user.customerWKYCLevel !== undefined && (
            <div className="profile-field">
              <span className="profile-label">{t('profile.wkycLevel')}</span>
              <span className="profile-value">{user.customerWKYCLevel}</span>
            </div>
          )}
          {user.customerTrustScore !== undefined && (
            <div className="profile-field">
              <span className="profile-label">{t('profile.trustScore')}</span>
              <span className="profile-value">{user.customerTrustScore}</span>
            </div>
          )}
          {user.wkycId && (
            <div className="profile-field">
              <span className="profile-label">{t('profile.wkycId')}</span>
              <span className="profile-value">{user.wkycId}</span>
            </div>
          )}
        </div>
      )}

      {/* Verified Links */}
      <div className="profile-card">
        <h3 className="profile-section-title">{t('profile.verifiedLinks')}</h3>
        {vlinkLoading ? (
          <p className="profile-vlink-loading">{t('common.loading')}</p>
        ) : vlinks.length === 0 ? (
          <p className="profile-vlink-empty">{t('profile.noVlinks')}</p>
        ) : (
          vlinks.map((vl) => (
            <div key={vl.id} className="profile-vlink-item">
              <div className="profile-field">
                <span className="profile-label">{t('profile.vlinkReference')}</span>
                <span className="profile-value">{vl.reference}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{t('profile.vlinkName')}</span>
                <span className="profile-value">{vl.name}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">{t('profile.vlinkStatus')}</span>
                <span className={`profile-badge ${statusClass(vl.statusId)}`}>{vl.statusName}</span>
              </div>
              {vl.url && (
                <div className="profile-field profile-field-url">
                  <span className="profile-label">{t('profile.vlinkUrl')}</span>
                  <span className="profile-value profile-vlink-url">
                    <a href={vl.url} target="_blank" rel="noopener noreferrer">{vl.url}</a>
                    <button
                      className="profile-copy-btn"
                      onClick={() => copyToClipboard(vl.url, vl.id)}
                      title={t('verification.copy')}
                    >
                      {copied === vl.id ? '✓' : '⧉'}
                    </button>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="profile-card">
        <h3 className="profile-section-title">{t('profile.settings')}</h3>
        <div className="profile-field">
          <span className="profile-label">{t('profile.baseCurrency')}</span>
          <span className="profile-value">{user.baseCurrencyCode}</span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.language')}</span>
          <span className="profile-value">{user.cultureCode}</span>
        </div>
      </div>

      <div className="profile-card">
        <h3 className="profile-section-title">{t('profile.status')}</h3>
        <div className="profile-field">
          <span className="profile-label">{t('profile.enabled')}</span>
          <span className={`profile-badge ${user.isEnabled ? 'badge-green' : 'badge-red'}`}>
            {user.isEnabled ? t('profile.yes') : t('profile.no')}
          </span>
        </div>
        <div className="profile-field">
          <span className="profile-label">{t('profile.lockedOut')}</span>
          <span className={`profile-badge ${user.isLockedOut ? 'badge-red' : 'badge-green'}`}>
            {user.isLockedOut ? t('profile.yes') : t('profile.no')}
          </span>
        </div>
        {user.lastLoginTime && (
          <div className="profile-field">
            <span className="profile-label">{t('profile.lastLogin')}</span>
            <span className="profile-value">{formatDate(user.lastLoginTime)}</span>
          </div>
        )}
        {user.lastPasswordChangedTime && (
          <div className="profile-field">
            <span className="profile-label">{t('profile.lastPasswordChange')}</span>
            <span className="profile-value">{formatDate(user.lastPasswordChangedTime)}</span>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button className="profile-btn primary-btn" onClick={() => navigate('/change-password')}>
          {t('profile.changePassword')}
        </button>
      </div>
    </div>
  );
};
