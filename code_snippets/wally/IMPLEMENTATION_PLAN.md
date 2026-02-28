# WinPay Wallet - Implementation Plan

## Current State Summary

### Completed Features ✅
- [x] **Login** - `/login` - Authentication flow
- [x] **Dashboard** - `/dashboard` - Balance overview, Recent Payments, Exchange Rates Widget
- [x] **Balances** - `/balances` - Multi-currency balance list with filtering
- [x] **Statement** - `/history/statement/:accountId` - Account transaction history
- [x] **Payments History** - `/history/payments` - Unified instant + wire payment history
- [x] **Theme System** - Light/Dark mode with CSS variables
- [x] **Exchange Rates Widget** - User currencies → USD/EUR/Gold conversions
- [x] **Withdraw (Cash-Out)** - `/withdraw` - Cash withdrawal at Cash Points with geolocation ✅
- [x] **Deposit (Cash-In)** - `/deposit` - Cash deposit via QR code display at Cash Points ✅
- [x] **Pay Now (P2P)** - `/pay-now` - Instant peer-to-peer payments by WPAY ID ✅
- [x] **Payment Wizard** - `/payment-wizard` - International wire transfers with FX quotes ✅
- [x] **Exchange** - `/exchange` - Quick currency exchange between user accounts ✅
- [x] **Convert History** - `/history/convert` - FX transaction history ✅

### Existing Services
- `auth.service.ts` - Authentication (Login, Refresh, Logout)
- `balance.service.ts` - Customer account balances
- `statement.service.ts` - Account statements
- `payment.service.ts` - Instant + Wire payment search

### Data Files
- `src/data/cashPoints.ts` - Mock cash point locations

---

## Outstanding Menu Items

---

### 1. ~~Withdraw (Cash-Out)~~ `/withdraw` - COMPLETED ✅

Cash-out via Instant Payment to Cash Point agents. User gets physical cash.

---

### 2. ~~Deposit (Cash-In)~~ `/deposit` - COMPLETED ✅

**Concept:** User deposits physical cash at a **Cash Point**. The user shows their WPAY_ID (alias) QR code to the cash point, and the cash point sends an instant payment TO the user.

**User Flow:**
1. Display user's WPAY_ID/alias as QR code
2. Show nearby Cash Points that accept deposits
3. User goes to Cash Point with cash
4. Cash Point scans user's QR code
5. Cash Point sends instant payment to user
6. User receives funds in wallet

**Implementation:**
- [x] Create page: `src/pages/Deposit.tsx`
- [x] Create styles: `src/styles/Deposit.css`
- [x] Add QR code generation library (`qrcode.react`)
- [x] Add route to `App.tsx`
- [x] Display user's WPAY ID from auth context
- [x] Add `/receive` redirect to `/deposit`

**Dependencies:**
```bash
npm install qrcode.react
```

**No outgoing API call needed** - User just displays their alias. The Cash Point initiates the payment.

---

### 3. ~~Pay Now (P2P Instant Payment)~~ `/pay-now` - COMPLETED ✅

**Concept:** Quick peer-to-peer instant transfer to another WinPay user by alias.

**User Flow:**
1. Enter recipient's WPAY_ID (alias)
2. Select currency and enter amount
3. Add optional memo
4. Review and confirm
5. Payment sent instantly

**Implementation:**
- [x] Create page: `src/pages/PayNow.tsx`
- [x] Create styles: `src/styles/PayNow.css`
- [x] Create service: `src/api/instant-payment.service.ts`
- [x] Create types: `src/types/instant-payment.types.ts`
- [x] Update config: `src/api/config.ts`
- [x] Add route to `App.tsx`

**API Endpoints:**
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Check Alias | GET | `/api/v1/CustomerAccountAliasList/Exists` | Verify recipient alias exists |
| Create | POST | `/api/v1/InstantPayment` | Create instant payment |
| Post | POST | `/api/v1/InstantPayment/Post` | Finalize instant payment |

**Request Schema:** `InstantPaymentCreateRequest`
```typescript
{
  fromCustomerAlias: string;  // Sender's alias
  toCustomerAlias: string;    // Recipient's alias
  amount: number;
  currencyCode: string;
  memo?: string;
}
```

---

### 4. ~~Payment Wizard (Foreign Wire Payment)~~ `/payment-wizard` - COMPLETED ✅

**Concept:** Multi-step guided flow for international wire payments with automatic FX conversion. Based on the Winstant Payment Feature PDF.

**User Flow (4 Steps):**

**Step 1: Payment Details**
- Select Destination Country (defaults to user's country of residence)
- Shows country info box (Local CCY, IBAN requirements, SWIFT info)
- Select remitting currency (defaults to destination's local currency)
- Select "From Account" (source currency, shows available balance)
- Enter amount in EITHER:
  - Destination currency (e.g., "Send 5,000 EUR")
  - OR source currency equivalent (e.g., "Send $2,000 worth of EUR")
- Select payment date

**Step 2: Beneficiary Selection**
- Show list of saved beneficiaries for selected country
- Filter by currency
- Option to "Add New Beneficiary"
- New beneficiary form: Name, Bank, IBAN/Account, SWIFT/BIC

**Step 3: FX Quote & Booking**
- Display FX quote with:
  - Amount debited (e.g., -5,633.00 USD)
  - Amount credited (e.g., +5,000.00 EUR)
  - Exchange rate (e.g., 1.1266 USD/EUR)
  - Countdown timer (e.g., "19 seconds remaining")
- "Book" button to lock the rate
- "Cancel" to go back

**Step 4: Review & Submit**
- Payment Reference (e.g., WIRE1000160)
- Status: "Submitted To Bank"
- Date, Destination Country, Amount, Currency
- Option to submit or save as draft (based on user access rights)

**Implementation:**
- [x] Create page: `src/pages/PaymentWizard.tsx` (single-file with all 4 steps)
- [x] Create styles: `src/styles/PaymentWizard.css`
- [x] Create types: `src/types/wire-payment.types.ts`
- [x] Create service: `src/api/wire-payment.service.ts` (includes FX + beneficiary operations)
- [x] Create reference data: `src/data/paymentReference.ts`
- [x] Add route to `App.tsx`

**API Endpoints:**

*Reference Data:*
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Countries | GET | `/api/v1/BankCountryList/PaymentCountries` | Available destination countries |
| Currencies | GET | `/api/v1/PaymentCurrencyList` | Available payment currencies |
| Country Info | GET | `/api/v1/CountryList` | Country details (IBAN format, etc.) |
| Bank Lookup | POST | `/api/v1/BankDirectory/Search` | Find bank by SWIFT/BIC |

*Beneficiary:*
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Search | POST | `/api/v1/PaymentTemplate/Search` | Get saved beneficiaries |
| Create | POST | `/api/v1/PaymentTemplate/FromPayment` | Save new beneficiary |

*FX Quote (Internal API):*
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Get Rate | GET | `/api/v1/ExchangeRate/TableRate/{base}/{quote}` | Get exchange rate |
| Get Quote | POST | `/api/v1/FXDealQuote` | Create FX quote (has expiry timer) |
| Book Quote | POST | `/api/v1/FXDealQuote/{id}/Book` | Lock the FX rate |

*Wire Payment:*
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Create | POST | `/api/v1/Payment` | Create wire payment |
| Validate | POST | `/api/v1/Payment/Validate` | Validate before creating |
| Submit | POST | `/api/v1/Payment/Submit` | Submit for processing |

**Scenarios from PDF:**
1. **Cross-currency**: EUR payment to France from USD account → FX conversion needed
2. **Specify source amount**: "Send $2,000 worth of EUR" → calculates EUR amount
3. **Same currency**: USD payment from USD account → no FX, "Or" field hidden

---

### 5. Receive `/receive` → MERGED WITH DEPOSIT

**Decision:** Receive page will be the same as Deposit - shows QR code for receiving instant payments.

**Implementation:**
- [ ] Route `/receive` redirects to `/deposit`
- [ ] OR: Create alias route in `App.tsx` pointing to same component

---

### 6. ~~History > Convert (FX History)~~ `/history/convert` - COMPLETED ✅

**Concept:** Show history of currency exchange transactions.

**Implementation:**
- [x] Create page: `src/pages/history/ConvertHistory.tsx`
- [x] Create styles: `src/styles/ConvertHistory.css`
- [x] Create types: `src/types/fx.types.ts`
- [x] Add searchDeals to `fx.service.ts`
- [x] Add route to `App.tsx`

**API Endpoints:**
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Search | POST | `/api/v1/FXDeal/Search` | Search FX deals |
| Get Details | GET | `/api/v1/FXDeal/{id}` | Get FX deal details |

---

### 7. ~~Exchange (Quick FX)~~ `/exchange` - COMPLETED ✅

**Concept:** Quick currency exchange between user's own accounts (no wire payment).

**User Flow:**
1. Select "Sell" currency (from user's balances)
2. Select "Buy" currency
3. Enter amount
4. Get live quote with timer (from Internal API)
5. Book the deal
6. Funds exchanged instantly

**Implementation:**
- [x] Create page: `src/pages/Exchange.tsx`
- [x] Create styles: `src/styles/Exchange.css`
- [x] Create service: `src/api/fx.service.ts`
- [x] Add route to `App.tsx`

**API Endpoints (Internal API only):**
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Sell Currencies | GET | `/api/v1/FXCurrencyList/Sell` | Currencies user can sell |
| Buy Currencies | GET | `/api/v1/FXCurrencyList/Buy` | Currencies user can buy |
| Get Rate | GET | `/api/v1/ExchangeRate/TableRate/{base}/{quote}` | Get exchange rate |
| Get Quote | POST | `/api/v1/FXDealQuote` | Create FX quote |
| Book + Deposit | POST | `/api/v1/FXDealQuote/{id}/BookAndInstantDepositThenPost` | Book and settle instantly |

---

### 8. ~~Add Funds > Bank Account~~ `/add-funds/bank` - COMPLETED ✅

**Decision:** Tabbed view with both deposit instructions AND linked bank accounts.

**Concept:**
- **Tab 1: Deposit Instructions** - Show WinPay bank account details where users send wire deposits
- **Tab 2: Linked Accounts** - Manage user's registered bank accounts for withdrawals

**Implementation:**
- [x] Create page: `src/pages/add-funds/BankAccount.tsx`
- [x] Create styles: `src/styles/BankAccount.css`
- [x] Create data file: `src/data/bankAccounts.json` - WinPay deposit bank details
- [x] Add route to `App.tsx`

**Data File: `src/data/bankAccounts.json`**
```json
{
  "depositInstructions": {
    "bankName": "WinPay Settlement Bank",
    "accountName": "WinPay Pte Ltd Client Account",
    "accountNumber": "123-456-789",
    "iban": "SG12WPAY0001234567890",
    "swiftBic": "WPAYGSGX",
    "bankAddress": "1 Raffles Place, Singapore 048616",
    "reference": "Use your WPAY_ID as reference"
  },
  "currencies": [
    { "code": "USD", "accountNumber": "USD-001-234567", "swiftBic": "WPAYGSGX" },
    { "code": "EUR", "accountNumber": "EUR-001-234567", "swiftBic": "WPAYGSGX" },
    { "code": "GBP", "accountNumber": "GBP-001-234567", "swiftBic": "WPAYGSGX" },
    { "code": "SGD", "accountNumber": "SGD-001-234567", "swiftBic": "WPAYGSGX" }
  ]
}
```

**UI Components:**
- [ ] `DepositInstructions.tsx` - Bank details for wire deposits
- [ ] `LinkedAccounts.tsx` - User's saved bank accounts

---

### 9. ~~Add Funds > Deposit Proof~~ `/add-funds/proof` - COMPLETED ✅

**Concept:** Upload proof of deposit (bank transfer receipt) for verification.

**Implementation:**
- [x] Create page: `src/pages/add-funds/DepositProof.tsx`
- [x] Create styles: `src/styles/DepositProof.css`
- [x] Create service: `src/api/file-attachment.service.ts`
- [x] Add route to `App.tsx`

**API Endpoints:**
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Upload | POST | `/api/v1/FileAttachment` | Upload proof document |
| List | GET | `/api/v1/FileAttachmentInfoList/{parentId}` | List attachments |
| Extract | POST | `/api/v1/FileAttachment/ExtractData/{id}` | AI document analysis |

---

### 10. ~~Add Funds > Deposit History~~ `/add-funds/history` - COMPLETED ✅

**Concept:** History of deposit records (wire deposits, not cash-in).

**Implementation:**
- [x] Create page: `src/pages/add-funds/DepositHistory.tsx`
- [x] Create styles: `src/styles/DepositHistory.css`
- [x] Create service: `src/api/deposit.service.ts`
- [x] Add route to `App.tsx`

**API Endpoints:**
| Action | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Search | POST | `/api/v1/Deposit/Search` | Search deposit records |
| Get | GET | `/api/v1/Deposit/{id}` | Get deposit details |

---

### 11. ~~Contact Us~~ `/contact` - COMPLETED ✅

**Decision:** Contact form (ticket submission) + FAQ page with address info.

**Concept:**
- **Contact Form** - Submit a support ticket
- **FAQ Section** - Link to FAQ page
- **Company Address** - From `address.json`

**Implementation:**
- [x] Create page: `src/pages/Contact.tsx`
- [x] Create styles: `src/styles/Contact.css`
- [x] Create data file: `src/data/address.json` - Company contact details
- [x] Create FAQ page: `public/faq.html` - Static FAQ page
- [x] Add route to `App.tsx`

**Data File: `src/data/address.json`**
```json
{
  "company": "WinPay Pte Ltd",
  "address": {
    "street": "1 Raffles Place",
    "building": "#20-01 One Raffles Place",
    "city": "Singapore",
    "postalCode": "048616",
    "country": "Singapore"
  },
  "contact": {
    "email": "support@winpay.com",
    "phone": "+65 6123 4567",
    "supportHours": "Mon-Fri 9:00 AM - 6:00 PM (SGT)"
  },
  "social": {
    "twitter": "https://twitter.com/winpay",
    "linkedin": "https://linkedin.com/company/winpay"
  }
}
```

**UI Components:**
- [ ] `ContactForm.tsx` - Ticket submission form
- [ ] `CompanyInfo.tsx` - Address and contact details
- [ ] `FAQLink.tsx` - Link to FAQ page

---

## Route Summary

```typescript
// Add to App.tsx
<Route path="/withdraw" element={<Withdraw />} />        // ✅ DONE
<Route path="/deposit" element={<Deposit />} />          // ✅ DONE
<Route path="/receive" element={<Navigate to="/deposit" />} />  // ✅ DONE - Redirect to deposit
<Route path="/pay-now" element={<PayNow />} />           // ✅ DONE
<Route path="/payment-wizard" element={<PaymentWizard />} />  // ✅ DONE
<Route path="/history/convert" element={<ConvertHistory />} />  // ✅ DONE
<Route path="/add-funds/bank" element={<BankAccount />} />  // ✅ DONE
<Route path="/add-funds/proof" element={<DepositProof />} />  // ✅ DONE
<Route path="/add-funds/history" element={<DepositHistory />} />  // ✅ DONE
<Route path="/exchange" element={<Exchange />} />        // ✅ DONE
<Route path="/contact" element={<Contact />} />           // ✅ DONE
```

---

## Data Files to Create

| File | Purpose | Status |
|------|---------|--------|
| `src/data/cashPoints.ts` | Mock cash point locations | ✅ Created (needs update) |
| `src/data/bankAccounts.json` | WinPay deposit bank details | ✅ Created |
| `src/data/address.json` | Company contact details | ✅ Created |
| `public/faq.html` | Static FAQ page | ✅ Created |

---

## Service Files to Create

| Service | File | APIs |
|---------|------|------|
| Instant Payment | `instant-payment.service.ts` | InstantPayment (for Pay Now, Withdraw) | ✅ Created |
| Wire Payment | `wire-payment.service.ts` | Payment (for Payment Wizard) | ✅ Created |
| FX/Exchange | `fx.service.ts` | FXDealQuote, FXDeal, ExchangeRate (Internal API) | ✅ Created |
| Beneficiary | `beneficiary.service.ts` | PaymentTemplate | ✅ (in wire-payment.service) |
| Deposit | `deposit.service.ts` | Deposit |
| File Attachment | `file-attachment.service.ts` | FileAttachment |
| Reference Data | `reference.service.ts` | CountryList, BankDirectory, CurrencyList |

---

## Cash Points Update

Update `src/data/cashPoints.ts` with new locations:

| # | Alias | Location | Country |
|---|-------|----------|---------|
| 1 | CASH_POINT_1 | Bangkok - Trendy Offices Sukhumvit | Thailand |
| 2 | CASH_POINT_2 | Bangkok - BKK Airport (Suvarnabhumi) | Thailand |
| 3 | CASH_POINT_3 | Bangkok - DMK Airport (Don Mueang) | Thailand |
| 4 | CASH_POINT_4 | Los Angeles | USA |
| 5 | CASH_POINT_5 | Las Vegas | USA |
| 6 | CASH_POINT_6 | Frankfurt | Germany |
| 7 | CASH_POINT_7 | Paris | France |
| 8 | CASH_POINT_8 | Dubai | UAE |
| 9 | CASH_POINT_9 | Hong Kong - Central | Hong Kong |
| 10 | CASH_POINT_10 | Tokyo - Shibuya | Japan |

---

## Suggested Implementation Order

### Phase 1: Cash In/Out (Uses existing Instant Payment API) ✅ COMPLETE
1. ~~**Withdraw**~~ - ✅ COMPLETED
2. ~~**Deposit**~~ - ✅ COMPLETED - Cash-in with QR code display
3. ~~**Pay Now**~~ - ✅ COMPLETED - P2P instant payment

### Phase 2: Wire Payments & FX ✅ COMPLETE
4. ~~**Payment Wizard**~~ - ✅ COMPLETED - Foreign wire payments with FX
5. ~~**Exchange**~~ - ✅ COMPLETED - Quick currency exchange (Internal API rates)
6. ~~**History > Convert**~~ - ✅ COMPLETED - FX transaction history

### Phase 3: Add Funds ✅ COMPLETE
7. ~~**Add Funds > Bank Account**~~ - ✅ COMPLETED - Deposit instructions + linked accounts
8. ~~**Add Funds > Deposit History**~~ - ✅ COMPLETED - Wire deposit history
9. ~~**Add Funds > Deposit Proof**~~ - ✅ COMPLETED - Upload proof documents

### Phase 4: Misc ✅ COMPLETE
10. ~~**Contact Us**~~ - ✅ COMPLETED - Contact form + FAQ + address
11. ~~**Receive**~~ - ✅ COMPLETED - Redirect to Deposit

---

## Dependencies to Add

```bash
npm install qrcode.react  # For QR code generation in Deposit page
```
