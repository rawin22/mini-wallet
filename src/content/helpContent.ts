export interface HelpItem {
  label: string;
  description: string;
}

export interface HelpSection {
  id: string;
  title: string;
  intro?: string;
  items: HelpItem[];
}

export const HELP_PAGE_TITLE = 'Help Center';
export const HELP_PAGE_SUBTITLE = 'Quick guidance for the main wallet flows. Update this file to maintain labels and help content in one place.';

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    intro: 'Use these first steps when a user opens the app for the first time.',
    items: [
      {
        label: 'Sign in',
        description: 'Use your username and password on the login page. If you are new, create an account first from the sign-up page.',
      },
      {
        label: 'Pick a theme',
        description: 'Use the Light/Dark switch on login or sign-up. Your theme preference is saved automatically.',
      },
      {
        label: 'Open dashboard',
        description: 'After sign in, you land on Dashboard where all balances are shown by currency account.',
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      {
        label: 'Hide zero balances',
        description: 'Use the checkbox in the top-right to only show accounts with non-zero available/total values.',
      },
      {
        label: 'View statement',
        description: 'Click any account card to open its statement with transaction history and date filters.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Pay Now',
    items: [
      {
        label: 'Create payment',
        description: 'Enter recipient PayID, amount, and currency, then continue to review before sending.',
      },
      {
        label: 'Review and confirm',
        description: 'Confirm details carefully. Once posted, payment status and reference appear in Payment History.',
      },
    ],
  },
  {
    id: 'exchange',
    title: 'Exchange (FX)',
    items: [
      {
        label: 'Get quote',
        description: 'Select buy/sell currencies and amount, then request a quote.',
      },
      {
        label: 'Quote expiry',
        description: 'Quotes have a countdown timer. If it expires, request a new quote before booking.',
      },
      {
        label: 'Book deal',
        description: 'Book the quote to complete exchange and generate references visible in Exchange History.',
      },
    ],
  },
  {
    id: 'history',
    title: 'History',
    items: [
      {
        label: 'Payment History',
        description: 'See sent payment records with date/time, reference, parties, amount, and status.',
      },
      {
        label: 'Exchange History',
        description: 'See booked FX deals, rates, conversion values, and value dates.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Troubleshooting',
    items: [
      {
        label: 'Can’t sign in',
        description: 'Check username/password carefully and verify API availability. Try again after a few seconds.',
      },
      {
        label: 'Page not found after deploy',
        description: 'Ensure staticwebapp.config.json exists in the deployed artifact for SPA route fallback.',
      },
      {
        label: 'Theme/logo looks wrong',
        description: 'Toggle theme once and refresh. The app saves theme under local storage key app_theme.',
      },
    ],
  },
];
