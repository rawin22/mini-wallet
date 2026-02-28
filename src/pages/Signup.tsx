import React, { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.ts';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import '../styles/Signup.css';

const THEME_KEY = 'app_theme';

interface SignupFormState {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    cellphone: string;
    firstName: string;
    lastName: string;
    referredBy: string;
    notaryNode: string;
}

const initialState: SignupFormState = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    cellphone: '',
    firstName: '',
    lastName: '',
    referredBy: '',
    notaryNode: 'WinstantGold SX - Sint Maarten',
};

export const Signup: React.FC = () => {
    const [formData, setFormData] = useState<SignupFormState>(initialState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    });
    const navigate = useNavigate();
    const { t } = useLanguage();
    const logoSrc = theme === 'dark' ? '/winstantpay-logo-light.png' : '/winstantpay-logo.png';

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    };

    const updateField = (field: keyof SignupFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }

        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 700));

        console.info('Dummy signup payload:', formData);
        setSuccess(t('auth.signupCaptured'));
        setIsSubmitting(false);
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <LanguageSwitcher className="auth-language-switcher" />
                <button className="auth-theme-toggle" onClick={toggleTheme} type="button" aria-label={t('auth.toggleTheme')}>
                    {theme === 'light' ? `☀️ ${t('common.light')}` : `🌙 ${t('common.dark')}`}
                </button>

                <header className="signup-header">
                    <img src={logoSrc} alt="WinstantPay" className="signup-brand-logo" />
                    <h1 className="signup-title">{t('auth.signupTitle')}</h1>
                    <p className="signup-subtitle">{t('auth.signupSubtitle')}</p>
                </header>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {error && <div className="signup-message error">{error}</div>}
                    {success && <div className="signup-message success">{success}</div>}

                    <div className="signup-grid">
                        <label htmlFor="signup-username" className="signup-label required">{t('auth.username')}</label>
                        <input
                            id="signup-username"
                            className="signup-input"
                            type="text"
                            value={formData.username}
                            onChange={(event) => updateField('username', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-password" className="signup-label required">{t('auth.password')}</label>
                        <input
                            id="signup-password"
                            className="signup-input"
                            type="password"
                            value={formData.password}
                            onChange={(event) => updateField('password', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-confirm-password" className="signup-label required">{t('auth.confirmPassword')}</label>
                        <input
                            id="signup-confirm-password"
                            className="signup-input"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-email" className="signup-label required">{t('auth.email')}</label>
                        <input
                            id="signup-email"
                            className="signup-input"
                            type="email"
                            value={formData.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-cellphone" className="signup-label">{t('auth.cellphone')}</label>
                        <input
                            id="signup-cellphone"
                            className="signup-input"
                            type="text"
                            value={formData.cellphone}
                            onChange={(event) => updateField('cellphone', event.target.value)}
                        />

                        <label htmlFor="signup-first-name" className="signup-label required">{t('auth.firstName')}</label>
                        <input
                            id="signup-first-name"
                            className="signup-input"
                            type="text"
                            value={formData.firstName}
                            onChange={(event) => updateField('firstName', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-last-name" className="signup-label required">{t('auth.lastName')}</label>
                        <input
                            id="signup-last-name"
                            className="signup-input"
                            type="text"
                            value={formData.lastName}
                            onChange={(event) => updateField('lastName', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-referred-by" className="signup-label">{t('auth.referredBy')}</label>
                        <input
                            id="signup-referred-by"
                            className="signup-input"
                            type="text"
                            value={formData.referredBy}
                            onChange={(event) => updateField('referredBy', event.target.value)}
                        />

                        <label htmlFor="signup-notary-node" className="signup-label required">{t('auth.notaryNode')}</label>
                        <select
                            id="signup-notary-node"
                            className="signup-input"
                            value={formData.notaryNode}
                            onChange={(event) => updateField('notaryNode', event.target.value)}
                            required
                        >
                            <option value="WinstantGold SX - Sint Maarten">{t('auth.notary.sx')}</option>
                            <option value="WinstantGold US - United States">{t('auth.notary.us')}</option>
                            <option value="WinstantGold EU - Europe">{t('auth.notary.eu')}</option>
                        </select>
                    </div>

                    <button type="submit" className="signup-submit" disabled={isSubmitting}>
                        {isSubmitting ? t('auth.submitting') : t('auth.submit')}
                    </button>
                </form>

                <div className="signup-footer-links">
                    <span>{t('auth.alreadyAccount')}</span>
                    <Link to="/login">{t('auth.signIn')}</Link>
                    <button type="button" className="text-button" onClick={() => navigate('/login')}>
                        {t('auth.backToLogin')}
                    </button>
                </div>
            </div>
        </div>
    );
};
