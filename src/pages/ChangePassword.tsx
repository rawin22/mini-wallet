import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { authService } from '../api/auth.service.ts';
import type { AxiosError } from 'axios';
import '../styles/profile.css';

export const ChangePassword: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const validate = (): string | null => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return t('profile.allFieldsRequired');
    }
    if (newPassword !== confirmPassword) {
      return t('auth.passwordMismatch');
    }
    if (user.passwordRegEx) {
      try {
        const regex = new RegExp(user.passwordRegEx);
        if (!regex.test(newPassword)) {
          return user.passwordRegExMessage || t('auth.passwordPolicyFailed');
        }
      } catch {
        // If regex is invalid, skip client-side validation
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword(user.userId, oldPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; problems?: string }>;
      const msg = axiosErr.response?.data?.message
        || axiosErr.response?.data?.problems
        || t('profile.changePasswordError');
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="profile-page">
        <h1 className="profile-title">{t('profile.changePasswordTitle')}</h1>
        <div className="profile-card cp-success-card">
          <div className="cp-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--accent-green)" strokeWidth="2" />
              <path d="M8 12l2.5 2.5L16 9" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="cp-success-message">{t('profile.passwordChanged')}</p>
          <button className="profile-btn primary-btn" onClick={() => navigate('/profile')}>
            {t('profile.backToProfile')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">{t('profile.changePasswordTitle')}</h1>

      <div className="profile-card">
        {user.passwordRegExMessage && (
          <div className="cp-policy-hint">
            {user.passwordRegExMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label className="cp-label">{t('profile.currentPassword')}</label>
            <div className="cp-input-wrap">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="cp-input"
                autoComplete="current-password"
              />
              <button type="button" className="cp-toggle-vis" onClick={() => setShowOld(!showOld)}
                aria-label={showOld ? t('auth.hidePassword') : t('auth.showPassword')}>
                {showOld ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">{t('profile.newPassword')}</label>
            <div className="cp-input-wrap">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="cp-input"
                autoComplete="new-password"
              />
              <button type="button" className="cp-toggle-vis" onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? t('auth.hidePassword') : t('auth.showPassword')}>
                {showNew ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">{t('profile.confirmNewPassword')}</label>
            <div className="cp-input-wrap">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="cp-input"
                autoComplete="new-password"
              />
              <button type="button" className="cp-toggle-vis" onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}>
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && <div className="cp-error">{error}</div>}

          <div className="cp-actions">
            <button type="button" className="profile-btn secondary-btn" onClick={() => navigate('/profile')}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="profile-btn primary-btn" disabled={submitting}>
              {submitting ? t('profile.changingPassword') : t('profile.changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
