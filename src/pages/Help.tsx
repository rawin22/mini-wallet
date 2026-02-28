import React, { useMemo, useState } from 'react';
import { HELP_SECTIONS, type HelpSection } from '../content/helpContent.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import '../styles/Help.css';

export const Help: React.FC = () => {
    const [query, setQuery] = useState('');
    const { t } = useLanguage();

    const filteredSections = useMemo<HelpSection[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return HELP_SECTIONS;
        }

        return HELP_SECTIONS
            .map((section) => {
                const sectionMatch =
                    t(section.titleKey).toLowerCase().includes(normalizedQuery) ||
                    t(section.introKey || '').toLowerCase().includes(normalizedQuery);

                const matchingItems = section.items.filter((item) => {
                    return (
                        t(item.labelKey).toLowerCase().includes(normalizedQuery) ||
                        t(item.descriptionKey).toLowerCase().includes(normalizedQuery)
                    );
                });

                if (sectionMatch) {
                    return section;
                }

                if (matchingItems.length > 0) {
                    return { ...section, items: matchingItems };
                }

                return null;
            })
            .filter((section): section is HelpSection => section !== null);
    }, [query, t]);

    return (
        <div className="help-page">
            <header className="help-header">
                <h1>{t('help.title')}</h1>
                <p>{t('help.subtitle')}</p>

                <div className="help-search-wrap">
                    <input
                        type="search"
                        className="help-search-input"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('help.searchPlaceholder')}
                        aria-label={t('help.searchAria')}
                    />
                </div>
            </header>

            {filteredSections.length === 0 && (
                <div className="help-empty">
                    {t('help.noResults', { query })}
                </div>
            )}

            <div className="help-grid">
                {filteredSections.map((section) => (
                    <article key={section.id} className="help-card">
                        <h2>{t(section.titleKey)}</h2>
                        {section.introKey && <p className="help-intro">{t(section.introKey)}</p>}

                        <ul className="help-list">
                            {section.items.map((item) => (
                                <li key={item.labelKey} className="help-item">
                                    <h3>{t(item.labelKey)}</h3>
                                    <p>{t(item.descriptionKey)}</p>
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </div>
    );
};
