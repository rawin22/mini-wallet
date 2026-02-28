# WinPay Wallet - Clarifications

## All Questions Resolved ✅

---

### 1. Add Funds > Bank Account (`/add-funds/bank`) - RESOLVED ✅

**Decision:** Option C - Both (Tabbed view with deposit instructions and linked accounts)

**Implementation:**
- Created `src/data/bankAccounts.json` with:
  - WinPay deposit bank details for wire transfers
  - Currency-specific account numbers (USD, EUR, GBP, SGD, THB, HKD)
  - Linked accounts placeholder for future feature

---

### 2. Receive (`/receive`) - RESOLVED ✅

**Decision:** Option A - Same as Deposit (merged)

**Implementation:**
- Route `/receive` will redirect to `/deposit`
- Both show QR code for receiving instant payments

---

### 3. Contact Us (`/contact`) - RESOLVED ✅

**Decision:** Options B + D - Contact Form + FAQ page

**Implementation:**
- Created `src/data/address.json` with:
  - Company info (WinPay Pte Ltd)
  - Headquarters address (Singapore)
  - Contact details (email, phone, support hours)
  - Regional offices (Thailand, Hong Kong)
  - Ticket categories for contact form
- Created `public/faq.html` with:
  - Searchable FAQ page
  - Categories: Getting Started, Deposits & Withdrawals, Payments, Security
  - Dark theme styling matching app

---

### 4. Cash Point Mock Data - RESOLVED ✅

**Decision:** Updated locations as specified

**Implementation:** Updated `src/data/cashPoints.ts` with:

| # | Alias | Location | Country |
|---|-------|----------|---------|
| 1 | CASH_POINT_1 | Bangkok - Trendy Offices Sukhumvit | Thailand |
| 2 | CASH_POINT_2 | Bangkok - Suvarnabhumi Airport (BKK) | Thailand |
| 3 | CASH_POINT_3 | Bangkok - Don Mueang Airport (DMK) | Thailand |
| 4 | CASH_POINT_4 | Los Angeles | USA |
| 5 | CASH_POINT_5 | Las Vegas | USA |
| 6 | CASH_POINT_6 | Frankfurt | Germany |
| 7 | CASH_POINT_7 | Paris | France |
| 8 | CASH_POINT_8 | Dubai | UAE |
| 9 | CASH_POINT_9 | Hong Kong - Central | Hong Kong |
| 10 | CASH_POINT_10 | Tokyo - Shibuya | Japan |

---

### 5. Exchange Rate Source for Trading - RESOLVED ✅

**Decision:** Option A - Internal API only

**Implementation:**
- Use `GET /api/v1/ExchangeRate/TableRate/{base}/{quote}` for rates
- Use `POST /api/v1/FXDealQuote` for quotes with expiry timer
- ExchangeRatesWidget (dashboard) continues to use Frankfurter for display only

---

## Data Files Created

| File | Purpose |
|------|---------|
| `src/data/cashPoints.ts` | Cash point locations (10 points) |
| `src/data/bankAccounts.json` | WinPay deposit bank details |
| `src/data/address.json` | Company contact information |
| `public/faq.html` | Static FAQ page |

---

## Next Steps

All clarifications have been addressed. Ready to proceed with implementation:

1. **Phase 1:** Deposit, Pay Now (uses instant payment API)
2. **Phase 2:** Payment Wizard, Exchange (uses FX API)
3. **Phase 3:** Add Funds pages (uses data files created)
4. **Phase 4:** Contact page (uses address.json + FAQ link)
