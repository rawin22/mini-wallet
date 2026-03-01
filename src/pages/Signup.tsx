import React, { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.ts';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import { SignupError, signupService } from '../api/signup.service.ts';
import type { NotaryNode, SignupFormConfig } from '../types/signup.types.ts';
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
    notaryNodeBranchId: string;
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
    notaryNodeBranchId: '',
};

const defaultFormConfig: SignupFormConfig = {
    isReferredByRequired: false,
    notaryNodes: [],
};

export const Signup: React.FC = () => {
    const [formData, setFormData] = useState<SignupFormState>(initialState);
    const [formConfig, setFormConfig] = useState<SignupFormConfig>(defaultFormConfig);
    const [isConfigLoading, setIsConfigLoading] = useState(true);
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

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const config = await signupService.loadSignupFormConfig();
                const fallbackNode = config.notaryNodes.find((node) => node.isDefault) ?? config.notaryNodes[0];

                setFormConfig(config);
                setFormData((prev) => ({
                    ...prev,
                    notaryNodeBranchId: fallbackNode?.branchId || prev.notaryNodeBranchId,
                }));
            } catch (loadError) {
                console.error('Failed to load signup configuration', loadError);
            } finally {
                setIsConfigLoading(false);
            }
        };

        void loadConfig();
    }, [t]);

    const toggleTheme = () => {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    };

    const updateField = (field: keyof SignupFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const extractServerErrorMessage = (error: unknown): string | undefined => {
        const readResponseDataMessage = (data: unknown): string | undefined => {
            if (!data || typeof data !== 'object') return undefined;

            const payload = data as {
                ErrorMessages?: unknown;
                errorMessages?: unknown;
                Problems?: unknown;
                problems?: unknown;
                message?: unknown;
                Message?: unknown;
                detail?: unknown;
                Detail?: unknown;
            };

            const upperErrors = Array.isArray(payload.ErrorMessages)
                ? payload.ErrorMessages.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                : [];
            if (upperErrors.length > 0) return upperErrors[0];

            const lowerErrors = Array.isArray(payload.errorMessages)
                ? payload.errorMessages.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                : [];
            if (lowerErrors.length > 0) return lowerErrors[0];

            const upperProblems = Array.isArray(payload.Problems) ? payload.Problems : [];
            for (const problem of upperProblems) {
                if (problem && typeof problem === 'object') {
                    const candidate = problem as {
                        message?: unknown;
                        Message?: unknown;
                        detail?: unknown;
                        Detail?: unknown;
                    };

                    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
                        return candidate.message;
                    }

                    if (typeof candidate.Message === 'string' && candidate.Message.trim().length > 0) {
                        return candidate.Message;
                    }

                    if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) {
                        return candidate.detail;
                    }

                    if (typeof candidate.Detail === 'string' && candidate.Detail.trim().length > 0) {
                        return candidate.Detail;
                    }
                }
            }

            const lowerProblems = Array.isArray(payload.problems) ? payload.problems : [];
            for (const problem of lowerProblems) {
                if (problem && typeof problem === 'object') {
                    const candidate = problem as {
                        message?: unknown;
                        Message?: unknown;
                        detail?: unknown;
                        Detail?: unknown;
                    };

                    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
                        return candidate.message;
                    }

                    if (typeof candidate.Message === 'string' && candidate.Message.trim().length > 0) {
                        return candidate.Message;
                    }

                    if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) {
                        return candidate.detail;
                    }

                    if (typeof candidate.Detail === 'string' && candidate.Detail.trim().length > 0) {
                        return candidate.Detail;
                    }
                }
            }

            if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
                return payload.message;
            }

            if (typeof payload.Message === 'string' && payload.Message.trim().length > 0) {
                return payload.Message;
            }

            if (typeof payload.detail === 'string' && payload.detail.trim().length > 0) {
                return payload.detail;
            }

            if (typeof payload.Detail === 'string' && payload.Detail.trim().length > 0) {
                return payload.Detail;
            }

            return undefined;
        };

        if (error instanceof SignupError) {
            const responseDataMessage = readResponseDataMessage((error as unknown as { response?: { data?: unknown } }).response?.data);
            if (responseDataMessage) return responseDataMessage;

            if (typeof error.message === 'string' && error.message.trim().length > 0 && error.message !== error.code) {
                return error.message;
            }
        }

        if (error && typeof error === 'object') {
            const maybeAxios = error as { response?: { data?: unknown }; message?: unknown };
            const responseDataMessage = readResponseDataMessage(maybeAxios.response?.data);
            if (responseDataMessage) return responseDataMessage;

            if (typeof maybeAxios.message === 'string' && maybeAxios.message.trim().length > 0) {
                return maybeAxios.message;
            }
        }

        return undefined;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formConfig.isReferredByRequired && !formData.referredBy.trim()) {
            setError(t('auth.referredByRequired'));
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }

        if (formConfig.passwordRegEx) {
            const passwordRegex = new RegExp(formConfig.passwordRegEx);
            if (!passwordRegex.test(formData.password)) {
                setError(formConfig.passwordRegExMessage || t('auth.signupFailed'));
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const signupResponse = await signupService.register(formData);
            setSuccess(t('auth.signupSuccess'));

            window.setTimeout(() => {
                if (signupResponse.redirectUrl.startsWith('http://') || signupResponse.redirectUrl.startsWith('https://')) {
                    window.location.assign(signupResponse.redirectUrl);
                    return;
                }

                navigate(signupResponse.redirectUrl, {
                    state: {
                        fromSignup: true,
                        message: signupResponse.message,
                    },
                });
            }, 700);
        } catch (submitError) {
            const serverMessage = extractServerErrorMessage(submitError);

            if (submitError instanceof SignupError) {
                if (submitError.code === 'missingBankCredentials') {
                    setError(t('auth.missingBankCredentials'));
                } else if (serverMessage) {
                    setError(serverMessage);
                } else if (submitError.code === 'usernameExists') {
                    setError(t('auth.usernameExists'));
                } else {
                    setError(t('auth.signupFailed'));
                }
            } else if (serverMessage) {
                setError(serverMessage);
            } else {
                setError(t('auth.signupFailed'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = isSubmitting || isConfigLoading;
    const notaryNodes: NotaryNode[] = formConfig.notaryNodes;

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

                        <label htmlFor="signup-referred-by" className={`signup-label ${formConfig.isReferredByRequired ? 'required' : ''}`}>{t('auth.referredBy')}</label>
                        <input
                            id="signup-referred-by"
                            className="signup-input"
                            type="text"
                            value={formData.referredBy}
                            onChange={(event) => updateField('referredBy', event.target.value)}
                            required={formConfig.isReferredByRequired}
                        />

                        <label htmlFor="signup-notary-node" className="signup-label required">{t('auth.notaryNode')}</label>
                        <select
                            id="signup-notary-node"
                            className="signup-input"
                            value={formData.notaryNodeBranchId}
                            onChange={(event) => updateField('notaryNodeBranchId', event.target.value)}
                            required
                        >
                            {notaryNodes.map((node) => (
                                <option key={node.branchId || node.name} value={node.branchId}>
                                    {node.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="signup-submit" disabled={isSubmitDisabled}>
                        {isSubmitDisabled ? t('auth.submitting') : t('auth.submit')}
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
