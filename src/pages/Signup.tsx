import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

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
    const navigate = useNavigate();
    const storedTheme = localStorage.getItem('app_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkTheme = storedTheme ? storedTheme === 'dark' : prefersDark;
    const logoSrc = isDarkTheme ? '/winstantpay-logo-light.png' : '/winstantpay-logo.png';

    const updateField = (field: keyof SignupFormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Password and Confirm Password must match.');
            return;
        }

        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 700));

        console.info('Dummy signup payload:', formData);
        setSuccess('Signup captured successfully (dummy flow). Backend process will be connected next.');
        setIsSubmitting(false);
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <header className="signup-header">
                    <img src={logoSrc} alt="WinstantPay" className="signup-brand-logo" />
                    <h1 className="signup-title">Sign Up with Us</h1>
                    <p className="signup-subtitle">Create your account</p>
                </header>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {error && <div className="signup-message error">{error}</div>}
                    {success && <div className="signup-message success">{success}</div>}

                    <div className="signup-grid">
                        <label htmlFor="signup-username" className="signup-label required">Username</label>
                        <input
                            id="signup-username"
                            className="signup-input"
                            type="text"
                            value={formData.username}
                            onChange={(event) => updateField('username', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-password" className="signup-label required">Password</label>
                        <input
                            id="signup-password"
                            className="signup-input"
                            type="password"
                            value={formData.password}
                            onChange={(event) => updateField('password', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-confirm-password" className="signup-label required">Confirm Password</label>
                        <input
                            id="signup-confirm-password"
                            className="signup-input"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-email" className="signup-label required">Email</label>
                        <input
                            id="signup-email"
                            className="signup-input"
                            type="email"
                            value={formData.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-cellphone" className="signup-label">Cellphone</label>
                        <input
                            id="signup-cellphone"
                            className="signup-input"
                            type="text"
                            value={formData.cellphone}
                            onChange={(event) => updateField('cellphone', event.target.value)}
                        />

                        <label htmlFor="signup-first-name" className="signup-label required">First Name</label>
                        <input
                            id="signup-first-name"
                            className="signup-input"
                            type="text"
                            value={formData.firstName}
                            onChange={(event) => updateField('firstName', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-last-name" className="signup-label required">Last Name</label>
                        <input
                            id="signup-last-name"
                            className="signup-input"
                            type="text"
                            value={formData.lastName}
                            onChange={(event) => updateField('lastName', event.target.value)}
                            required
                        />

                        <label htmlFor="signup-referred-by" className="signup-label">Referred By</label>
                        <input
                            id="signup-referred-by"
                            className="signup-input"
                            type="text"
                            value={formData.referredBy}
                            onChange={(event) => updateField('referredBy', event.target.value)}
                        />

                        <label htmlFor="signup-notary-node" className="signup-label required">Notary Node</label>
                        <select
                            id="signup-notary-node"
                            className="signup-input"
                            value={formData.notaryNode}
                            onChange={(event) => updateField('notaryNode', event.target.value)}
                            required
                        >
                            <option value="WinstantGold SX - Sint Maarten">WinstantGold SX - Sint Maarten</option>
                            <option value="WinstantGold US - United States">WinstantGold US - United States</option>
                            <option value="WinstantGold EU - Europe">WinstantGold EU - Europe</option>
                        </select>
                    </div>

                    <button type="submit" className="signup-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>

                <div className="signup-footer-links">
                    <span>Already have an account?</span>
                    <Link to="/login">Sign In</Link>
                    <button type="button" className="text-button" onClick={() => navigate('/login')}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};
