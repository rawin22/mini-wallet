import React, { useMemo, useState } from 'react';
import { HELP_PAGE_SUBTITLE, HELP_PAGE_TITLE, HELP_SECTIONS, type HelpSection } from '../content/helpContent.ts';
import '../styles/Help.css';

export const Help: React.FC = () => {
    const [query, setQuery] = useState('');

    const filteredSections = useMemo<HelpSection[]>(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return HELP_SECTIONS;
        }

        return HELP_SECTIONS
            .map((section) => {
                const sectionMatch =
                    section.title.toLowerCase().includes(normalizedQuery) ||
                    section.intro?.toLowerCase().includes(normalizedQuery);

                const matchingItems = section.items.filter((item) => {
                    return (
                        item.label.toLowerCase().includes(normalizedQuery) ||
                        item.description.toLowerCase().includes(normalizedQuery)
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
    }, [query]);

    return (
        <div className="help-page">
            <header className="help-header">
                <h1>{HELP_PAGE_TITLE}</h1>
                <p>{HELP_PAGE_SUBTITLE}</p>

                <div className="help-search-wrap">
                    <input
                        type="search"
                        className="help-search-input"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search help topics..."
                        aria-label="Search help topics"
                    />
                </div>
            </header>

            {filteredSections.length === 0 && (
                <div className="help-empty">
                    No help topics match "{query}".
                </div>
            )}

            <div className="help-grid">
                {filteredSections.map((section) => (
                    <article key={section.id} className="help-card">
                        <h2>{section.title}</h2>
                        {section.intro && <p className="help-intro">{section.intro}</p>}

                        <ul className="help-list">
                            {section.items.map((item) => (
                                <li key={item.label} className="help-item">
                                    <h3>{item.label}</h3>
                                    <p>{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </div>
    );
};
