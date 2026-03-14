<div align="center">
  <img src="public/winstantpay-logo-light.png" alt="WinstantPay Logo" width="280" />

  <h1>WinstantPay Wallet — Minimal Version</h1>

  <p>A modern, multi-environment financial wallet with KYC verification, instant payments, and FX exchange — built for the GPWebApi ecosystem.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Axios-1.13.2-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Deploy-Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white" alt="Azure" />
    <img src="https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
    <img src="https://img.shields.io/badge/i18n-EN_%7C_FR-green?style=for-the-badge" alt="i18n" />
    <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License" />
  </p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Repo Structure](#repo-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System & Branding](#design-system--branding)
  - [Logos](#logos)
  - [Color Palette](#color-palette)
  - [Typography](#typography)
  - [Spacing & Border Radius](#spacing--border-radius)
  - [Gradients & Glows](#gradients--glows)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Architecture](#project-architecture)
  - [Routing](#routing)
  - [API Environments](#api-environments)
  - [Authentication Flow](#authentication-flow)
- [Deployment](#deployment)
- [Python Scripts](#python-scripts)
- [Internationalization](#internationalization)
- [Contributing](#contributing)

---

## Overview

**WinstantPay Mini-Wallet** is a full-featured financial frontend for the **GPWebApi** (Global Payments Web API). It guides users from account signup through KYC identity verification, and then provides a full wallet dashboard for managing multi-currency balances, instant payments, and FX deals.

```
Signup → Login → KYC Verification → Dashboard → Payments / FX / History
```

> **PoC Notice:** Bank-user service account credentials are stored in `.env` for proof-of-concept purposes. A secure backend proxy must replace this before any production deployment.

---

## Repo Structure

```
wallet-mono-repo/
├── mini-wallet/              # Main web application (React + TypeScript + Vite)
│   ├── .github/              # GitHub Actions CI/CD workflows
│   ├── docs/                 # Project documentation
│   │   ├── COPILOT.md        # Session restart guide
│   │   ├── IMPLEMENTATION_PLAN.md
│   │   ├── Signup.md         # Gold-standard workflow spec (25 API endpoints)
│   │   └── Scripts.md        # Python script reference
│   ├── public/               # Static assets (logos, favicon, FAQ)
│   ├── scripts/              # Python CLI test utilities + bash cURL helpers
│   ├── src/                  # Application source (~6,300 lines of TypeScript)
│   │   ├── api/              # Service layer (11 files)
│   │   ├── components/       # Reusable UI components (5 files)
│   │   ├── contexts/         # Context API state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lang/             # i18n translation files (EN / FR)
│   │   ├── pages/            # Page components (11 pages)
│   │   ├── styles/           # CSS files per page + globals
│   │   ├── types/            # TypeScript type definitions (10 files)
│   │   └── utils/            # Formatters, storage helpers
│   ├── .env.example          # Environment variable template
│   └── package.json
│
└── mini-mobile-wallet/       # Placeholder — future mobile app
```

---

## Features

| Feature | Description |
|---|---|
| **Multi-step Signup** | Username check → customer creation → user linking → access rights |
| **KYC Verification** | 4-step wizard: ID upload → selfie → review extracted data → confirmation |
| **Dashboard** | Multi-currency account balances with account switcher |
| **Instant Payments** | Two-step create-then-confirm payment flow |
| **FX Exchange** | Quote → review → book currency exchange deals |
| **Transaction History** | Paginated statement, payment history, FX conversion history |
| **Profile Management** | Edit profile, change password |
| **Dual Theme** | Light and dark mode with CSS variable theming |
| **Multilingual** | English and French, persisted in localStorage |
| **Multi-environment** | Switch between Beta / Demo / Production without redeployment |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.0 |
| Language | TypeScript (strict) | 5.9.3 |
| Build Tool | Vite | 7.2.4 |
| Routing | React Router DOM | 7.11.0 |
| HTTP Client | Axios | 1.13.2 |
| Linting | ESLint + typescript-eslint | 9.39.1 |
| Scripts | Python | 3.12 |
| Script Linting | Ruff | latest |
| Deployment | Azure Static Web Apps | — |
| CI/CD | GitHub Actions | — |

---

## Design System & Branding

This section serves as a **style guide** for derived projects (e.g., the upcoming mobile app).

### Logos

All logo assets live in `mini-wallet/public/`:

| File | Usage |
|---|---|
| `winstantpay-logo.png` (3.5 KB) | Default logo — use on dark backgrounds |
| `winstantpay-logo-light.png` (7.4 KB) | Light-mode logo — use on white/light backgrounds |
| `logo-icon.png` (6.4 KB) | Square icon / favicon — use for app icons, splash screens |
| `logo-icon-light.png` (6.4 KB) | Light-mode square icon |

**Mobile app recommendation:**
- Use `logo-icon.png` as the launch screen and app icon base.
- Use `winstantpay-logo-light.png` in the top nav header of light-mode screens.
- Use `winstantpay-logo.png` in the top nav header of dark-mode screens.

---

### Color Palette

The design system uses **CSS custom properties** with a full light/dark dual-theme. All values are sourced from `src/styles/globals.css`.

#### Accent Colors (Theme-Independent)

| Token | Hex | Swatch | Usage |
|---|---|---|---|
| `--accent-green` | `#4caf50` | 🟢 | Success states, positive balances, confirmations |
| `--accent-red` | `#ef5350` | 🔴 | Errors, destructive actions, negative amounts |
| `--accent-yellow` | `#ffa726` | 🟡 | Warnings, pending states |

#### Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#ffffff` | Page background |
| `--bg-secondary` | `#fefefe` | Sidebar / secondary surfaces |
| `--bg-card` | `#ffffff` | Cards, modals |
| `--text-primary` | `#111827` | Headlines, primary content |
| `--text-secondary` | `#374151` | Body text |
| `--text-muted` | `#4b5563` | Labels, hints, placeholders |
| `--accent-blue` | `#0284c7` | Primary CTA buttons, links |
| `--accent-teal` | `#0891b2` | Secondary actions, hover states |
| `--border-subtle` | `rgba(0,0,0,0.10)` | Dividers, input borders |
| `--border-accent` | `rgba(27,110,194,0.50)` | Focused inputs, active borders |

#### Dark Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0f1015` | Page background |
| `--bg-secondary` | `#1a1d29` | Sidebar / secondary surfaces |
| `--bg-card` | `rgba(37,40,54,0.6)` | Cards, modals (glassmorphism) |
| `--text-primary` | `#f0f0f5` | Headlines, primary content |
| `--text-secondary` | `#c0c3d6` | Body text |
| `--text-muted` | `#8b8fa8` | Labels, hints, placeholders |
| `--accent-blue` | `#1b6ec2` | Primary CTA buttons, links |
| `--accent-teal` | `#00d4ff` | Secondary actions, hover states, glows |
| `--border-subtle` | `rgba(255,255,255,0.10)` | Dividers, input borders |
| `--border-accent` | `rgba(27,110,194,0.30)` | Focused inputs, active borders |

---

### Typography

| Token | Value | Usage |
|---|---|---|
| `--font-primary` | `'Inter'`, system-ui fallback | All UI text |
| `--font-mono` | `'JetBrains Mono'`, `'Courier New'` | Code, reference numbers, transaction IDs |

**Inter weights used:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Mobile app recommendation:**
- Import Inter via Google Fonts or bundle as a local font.
- Use 700 weight for all headings with `letterSpacing: -0.5`.
- Use `tabular-nums` (or equivalent `fontVariant`) for monetary values to prevent layout shifts.

---

### Spacing & Border Radius

#### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | `4px` | Icon gaps, tight padding |
| `--space-sm` | `8px` | List item gaps, inner padding |
| `--space-md` | `16px` | Card padding, section gaps |
| `--space-lg` | `24px` | Section separators |
| `--space-xl` | `32px` | Page section margins |
| `--space-2xl` | `48px` | Hero / header spacing |

#### Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Inputs, small buttons |
| `--radius-md` | `12px` | Cards, modals |
| `--radius-lg` | `16px` | Large cards, bottom sheets |
| `--radius-xl` | `20px` | Feature sections |
| `--radius-full` | `9999px` | Pills, avatar badges, tags |

---

### Gradients & Glows

| Token | Value | Usage |
|---|---|---|
| `--gradient-blue` | `linear-gradient(135deg, #1b6ec2 0%, #00d4ff 100%)` | Primary hero sections, CTA buttons |
| `--gradient-teal` | `linear-gradient(135deg, #00d4ff 0%, #1b6ec2 100%)` | Reversed accent sections |
| `--gradient-green` | `linear-gradient(135deg, #4caf50 0%, #45a049 100%)` | Success banners, verified status |
| `--gradient-dark` *(dark)* | `linear-gradient(135deg, #1a1d29 0%, #252836 100%)` | Dark surface backgrounds |
| `--gradient-dark` *(light)* | `linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)` | Light surface backgrounds |

**Glow effects** (dark mode only):

| Token | Spread | Usage |
|---|---|---|
| `--glow-blue` | `0 0 40px rgba(27,110,194,0.4)` | Blue buttons/icons on hover |
| `--glow-teal` | `0 0 40px rgba(0,212,255,0.4)` | Teal accent elements |
| `--glow-green` | `0 0 40px rgba(76,175,80,0.4)` | Success/verified states |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Python** 3.12 *(optional — for CLI test scripts only)*

### Installation

```bash
cd mini-wallet
npm install
```

### Environment Variables

Copy the template and fill in your values:

```bash
cp .env.example .env
```

Key variables:

```dotenv
# API Backend
VITE_API_URL=https://www.bizcurrency.com:20500
VITE_API_CALLER_ID=<your-caller-id>

# Bank service account (PoC only — replace with backend proxy in production)
VITE_BANK_USERNAME=<bank-username>
VITE_BANK_PASSWORD=<bank-password>

# Signup configuration
VITE_ACCOUNT_REPRESENTATIVE_ID=<guid>
VITE_CUSTOMER_TEMPLATE_ID=<guid>
VITE_ACCESS_RIGHT_TEMPLATE_ID=<guid>
VITE_DEFAULT_COUNTRY_CODE=HK
VITE_DEFAULT_REGISTERING_EMAIL=register@worldkyc.com

# Notary nodes (JSON array — see .env.example)
VITE_SIGNUP_NOTARY_NODES=[...]
```

### Running Locally

```bash
# Start development server on port 4200
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Project Architecture

### Routing

| Route | Protection | Description |
|---|---|---|
| `/login` | Public | Authentication form |
| `/signup` | Public | Multi-step account creation |
| `/dashboard` | Protected | Wallet overview with balances |
| `/statement/:accountId` | Protected | Transaction history for account |
| `/pay-now` | Protected | Instant payment (create → confirm) |
| `/exchange` | Protected | FX deal (quote → review → book) |
| `/get-verified` | Protected | 4-step KYC wizard |
| `/profile` | Protected | User profile editor |
| `/change-password` | Protected | Password change form |
| `/help` | Protected | FAQ and support |
| `/history/payments` | Protected | Payment transaction history |
| `/history/convert` | Protected | FX conversion history |
| `/` | Redirect | → `/dashboard` when authenticated |

### API Environments

Switch between environments at runtime via the UI (stored in localStorage):

| Environment | Base URL | Purpose |
|---|---|---|
| **WKYC_BETA** | `https://www.bizcurrency.com:20500` | Default — World KYC Beta |
| **GPWEB_BETA** | `https://www.bizcurrency.com:20300` | Demo / testing |
| **GPWEB_PRODUCTION** | `https://www.bizcurrency.com:20500` | Production |

### Authentication Flow

```
1. POST /api/v1/Authenticate          → accessToken + refreshToken
2. All requests: Authorization: Bearer <accessToken>
3. Token expiry → POST /api/v1/Authenticate/Refresh
4. Tokens + user data stored in localStorage via AuthContext
```

**Signup uses a bank service account** (separate from end-user credentials) to orchestrate:
- Username availability check
- Customer creation from template
- User account creation
- Access right template assignment

---

## Deployment

The app deploys automatically to **Azure Static Web Apps** on every push to `main`:

```yaml
# .github/workflows/azure-static-web-apps-red-plant-0797ecc1e.yml
App Location:    /mini-wallet
Output Location: dist
```

SPA routing is handled by `public/staticwebapp.config.json` — all navigation falls back to `index.html`.

---

## Python Scripts

Located in `mini-wallet/scripts/` — useful for API testing and reference:

| Script | Purpose |
|---|---|
| `login.py` | Authenticate and print user info |
| `account_balances.py` | List wallet balances |
| `account_statement.py` | Fetch transaction history with date range |
| `currency_list.py` | List available payment currencies |
| `fx_currency_list.py` | List FX buy/sell currencies |
| `instant_payment.py` | End-to-end payment example |
| `fx_deal.py` | End-to-end FX deal example |

Setup:

```bash
cd mini-wallet/scripts
cp .env.example .env   # add credentials
pip install -r requirements.txt
python login.py
```

---

## Internationalization

Two languages supported, toggled via the navbar `LanguageSwitcher` and persisted in localStorage:

| Language | Code | Flag |
|---|---|---|
| English | `en` | 🇬🇧 |
| French | `fr` | 🇫🇷 |

Translation files: `src/lang/english.json` and `src/lang/french.json`. All UI strings must be added to **both** files.

---

## Contributing

This is a private repository. When resuming work:

1. Read `mini-wallet/docs/IMPLEMENTATION_PLAN.md` for current status and open tasks.
2. Read `mini-wallet/docs/Signup.md` for the canonical API contract.
3. Follow the constraints in `mini-wallet/docs/COPILOT.md`.
4. Keep i18n strings in sync across `english.json` and `french.json`.
5. Run `npm run build` and `npm run lint` before committing.

---

<div align="center">
  <sub>Built with the WinstantPay platform · Powered by GPWebApi</sub>
</div>
