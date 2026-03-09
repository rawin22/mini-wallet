export interface HelpItem {
    labelKey: string;
    descriptionKey: string;
}

export interface HelpSection {
    id: string;
    titleKey: string;
    introKey?: string;
    items: HelpItem[];
}

export const HELP_SECTIONS: HelpSection[] = [
    {
        id: 'getting-started',
        titleKey: 'help.sections.gettingStarted.title',
        introKey: 'help.sections.gettingStarted.intro',
        items: [
            {
                labelKey: 'help.sections.gettingStarted.items.signIn.label',
                descriptionKey: 'help.sections.gettingStarted.items.signIn.description',
            },
            {
                labelKey: 'help.sections.gettingStarted.items.pickTheme.label',
                descriptionKey: 'help.sections.gettingStarted.items.pickTheme.description',
            },
            {
                labelKey: 'help.sections.gettingStarted.items.openDashboard.label',
                descriptionKey: 'help.sections.gettingStarted.items.openDashboard.description',
            },
        ],
    },
    {
        id: 'dashboard',
        titleKey: 'help.sections.dashboard.title',
        items: [
            {
                labelKey: 'help.sections.dashboard.items.hideZero.label',
                descriptionKey: 'help.sections.dashboard.items.hideZero.description',
            },
            {
                labelKey: 'help.sections.dashboard.items.viewStatement.label',
                descriptionKey: 'help.sections.dashboard.items.viewStatement.description',
            },
        ],
    },
    {
        id: 'payments',
        titleKey: 'help.sections.payments.title',
        items: [
            {
                labelKey: 'help.sections.payments.items.createPayment.label',
                descriptionKey: 'help.sections.payments.items.createPayment.description',
            },
            {
                labelKey: 'help.sections.payments.items.reviewConfirm.label',
                descriptionKey: 'help.sections.payments.items.reviewConfirm.description',
            },
        ],
    },
    {
        id: 'exchange',
        titleKey: 'help.sections.exchange.title',
        items: [
            {
                labelKey: 'help.sections.exchange.items.getQuote.label',
                descriptionKey: 'help.sections.exchange.items.getQuote.description',
            },
            {
                labelKey: 'help.sections.exchange.items.quoteExpiry.label',
                descriptionKey: 'help.sections.exchange.items.quoteExpiry.description',
            },
            {
                labelKey: 'help.sections.exchange.items.bookDeal.label',
                descriptionKey: 'help.sections.exchange.items.bookDeal.description',
            },
        ],
    },
    {
        id: 'history',
        titleKey: 'help.sections.history.title',
        items: [
            {
                labelKey: 'help.sections.history.items.paymentHistory.label',
                descriptionKey: 'help.sections.history.items.paymentHistory.description',
            },
            {
                labelKey: 'help.sections.history.items.exchangeHistory.label',
                descriptionKey: 'help.sections.history.items.exchangeHistory.description',
            },
        ],
    },
    {
        id: 'support',
        titleKey: 'help.sections.support.title',
        items: [
            {
                labelKey: 'help.sections.support.items.cantSignIn.label',
                descriptionKey: 'help.sections.support.items.cantSignIn.description',
            },
            {
                labelKey: 'help.sections.support.items.pageNotFound.label',
                descriptionKey: 'help.sections.support.items.pageNotFound.description',
            },
            {
                labelKey: 'help.sections.support.items.themeLogoWrong.label',
                descriptionKey: 'help.sections.support.items.themeLogoWrong.description',
            },
        ],
    },
];
