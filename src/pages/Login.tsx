import React, { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import '../styles/Login.css';

const THEME_KEY = 'app_theme';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  });
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const logoSrc = theme === 'dark' ? '/winstantpay-logo-light.png' : '/winstantpay-logo.png';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <LanguageSwitcher className="auth-language-switcher" />
        <button className="auth-theme-toggle" onClick={toggleTheme} type="button" aria-label={t('auth.toggleTheme')}>
          {theme === 'light' ? `☀️ ${t('common.light')}` : `🌙 ${t('common.dark')}`}
        </button>

        <div className="login-header">
          <img src={logoSrc} alt="WinstantPay" className="login-brand-logo" />
          <p className="login-subtitle">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username" className="form-label">{t('auth.username')}</label>
            <input id="username" type="text" className="form-input" value={username}
              onChange={(e) => setUsername(e.target.value)} placeholder={t('auth.enterUsername')}
              required autoComplete="username" disabled={isLoading} />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('auth.password')}</label>
            <div className="password-input-wrapper">
              <input id="password" type={showPassword ? 'text' : 'password'} className="form-input"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.enterPassword')} required autoComplete="current-password" disabled={isLoading} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1} aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>
                {showPassword ? '\u{1F648}' : '\u{1F441}'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </button>

          <p className="login-link-row">
            {t('auth.newUser')} <Link to="/signup">{t('auth.createAccount')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
