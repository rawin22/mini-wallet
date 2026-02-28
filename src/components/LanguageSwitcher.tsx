import React from 'react';
import { useLanguage } from '../hooks/useLanguage.ts';

interface LanguageSwitcherProps {
    className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { language, languages, setLanguage, t } = useLanguage();

    return (
        <label className={`language-switcher ${className || ''}`.trim()}>
            <span className="sr-only">{t('common.language')}</span>
            <select
                className="language-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={t('common.language')}
            >
                {languages.map((item) => (
                    <option key={item.code} value={item.code}>
                        {item.flag} {item.nativeLabel}
                    </option>
                ))}
            </select>
        </label>
    );
};
