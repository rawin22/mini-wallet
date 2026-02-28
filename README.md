# Mini-Wallet

Python CLI scripts and API reference for the BizCurrency Global Payments wallet.
Use this as a blueprint for implementing the web application.

## Quick Start

```bash
# 1. Install dependencies
uv pip install requests python-dotenv

# 2. Configure credentials
cp scripts/.env.example scripts/.env
# Edit scripts/.env with your credentials

# 3. Run any script
cd scripts
python login.py
```

## Configuration

All scripts read from `scripts/.env` (auto-loaded via `python-dotenv`):

```env
WALLET_API_URL=https://www.bizcurrency.com:20500/api/v1
WALLET_CALLER_ID=12FDEC27-6E1F-4EC5-BF15-1C7E75A99117
WALLET_USERNAME=your_username
WALLET_PASSWORD=your_password
```

> **Security:** `scripts/.env` is in `.gitignore` and must never be committed.

## Scripts Overview

| Script | Purpose | API Endpoints |
|---|---|---|
| `api_client.py` | Shared module (auth, config, helpers) | `POST /Authenticate`, `GET /CustomerAccountBalance` |
| `login.py` | Authenticate and display user settings | `POST /Authenticate` |
| `account_balances.py` | View wallet balances across all currencies | `GET /CustomerAccountBalance/{customerId}` |
| `account_statement.py` | View transaction history for an account | `GET /CustomerAccountStatement` |
| `currency_list.py` | List available payment currencies | `GET /PaymentCurrencyList` |
| `fx_currency_list.py` | List available FX currencies (buy/sell) | `GET /FXCurrencyList/Buy`, `GET /FXCurrencyList/Sell` |
| `instant_payment.py` | Send an instant payment (two-step) | `POST /InstantPayment`, `PATCH /InstantPayment/Post` |
| `fx_deal.py` | Execute an FX deal (two-step) | `POST /FXDealQuote`, `PATCH /FXDealQuote/{id}/BookAndInstantDeposit` |

---

## API Reference

Base URL: `https://www.bizcurrency.com:20500/api/v1`

All endpoints (except Authenticate) require the header:
```
Authorization: Bearer <accessToken>
```

---

### 1. Authenticate

Obtain a bearer token and user settings.

**`POST /Authenticate`**

**Request body:**
```json
{
  "loginId": "string",
  "password": "string",
  "callerId": "GUID",
  "includeUserSettingsInResponse": true,
  "includeAccessRightsWithUserSettings": false
}
```

**Response:**
```json
{
  "tokens": {
    "accessToken": "JWT string",
    "accessTokenExpiresInMinutes": 1440,
    "refreshToken": "string",
    "refreshTokenExpiresInHours": 24
  },
  "userSettings": {
    "userId": "GUID",
    "userName": "string",
    "organizationId": "GUID (= customerId)",
    "organizationName": "string",
    "firstName": "string",
    "lastName": "string",
    "emailAddress": "string",
    "branchName": "string",
    "baseCurrencyCode": "string",
    "sessionTimeout": 72000
  },
  "problems": null
}
```

**Key fields for the web app:**
- `tokens.accessToken` -- store in session, attach as `Bearer` header to all subsequent calls
- `tokens.accessTokenExpiresInMinutes` -- schedule token refresh before expiry
- `userSettings.organizationId` -- this is the `customerId` used in balance/statement endpoints
- `userSettings.userName` -- the login ID / PayID used as `fromCustomer` in payments

---

### 2. Account Balances

Retrieve all currency balances for a customer.

**`GET /CustomerAccountBalance/{customerId}`**

**Response:**
```json
{
  "balances": [
    {
      "accountId": "GUID",
      "accountNumber": "string",
      "currencyCode": "USD",
      "balance": 100.00,
      "balanceAvailable": 95.00,
      "activeHoldsTotal": 5.00
    }
  ]
}
```

**Web app notes:**
- Display `balanceAvailable` as the primary balance (excludes holds)
- `accountId` is needed for the account statement endpoint
- `accountNumber` is the human-readable account reference

---

### 3. Account Statement

Retrieve transaction history for a specific account within a date range.

**`GET /CustomerAccountStatement`**

**Query parameters:**
| Parameter | Type | Description |
|---|---|---|
| `accountId` | GUID | From the balances response |
| `strStartDate` | string | Start date (`yyyy-MM-dd`) |
| `strEndDate` | string | End date (`yyyy-MM-dd`) |

**Response:**
```json
{
  "accountInfo": {
    "accountId": "GUID",
    "accountNumber": "string",
    "accountName": "string",
    "accountCurrencyCode": "USD",
    "accountCurrencyScale": 2,
    "beginningBalance": 100.00,
    "endingBalance": 150.00
  },
  "entries": [
    {
      "transactionTime": "2026-02-28T10:30:00.0000000",
      "transactionType": "string",
      "description": "string",
      "debitAmount": 0.00,
      "creditAmount": 50.00,
      "runningBalance": 150.00
    }
  ]
}
```

**Web app notes:**
- Use `accountCurrencyScale` for decimal formatting
- `entries` may be empty for periods with no activity
- `runningBalance` provides a per-row running total

---

### 4. Payment Currency List

List currencies available for instant payments.

**`GET /PaymentCurrencyList`**

**Response:**
```json
{
  "currencies": [
    {
      "currencyCode": "USD",
      "currencyName": "US Dollars",
      "currencyAmountScale": 2,
      "currencyRateScale": 4,
      "symbol": "$",
      "paymentCutoffTime": "15:00",
      "settlementDaysToAdd": 0
    }
  ],
  "problems": null
}
```

**Web app notes:**
- Use `currencyAmountScale` to set decimal precision on amount inputs
- `paymentCutoffTime` -- payments submitted after this time may settle next business day
- Cache this list per session (it rarely changes)

---

### 5. FX Currency Lists

List currencies available for FX deals, separated by buy and sell sides.

**`GET /FXCurrencyList/Buy`**
**`GET /FXCurrencyList/Sell`**

**Response (same structure for both):**
```json
{
  "currencies": [
    {
      "currencyCode": "WKYC",
      "currencyName": "WKYC Token",
      "currencyAmountScale": 8,
      "currencyRateScale": 4,
      "symbol": "",
      "paymentCutoffTime": "16:00",
      "settlementDaysToAdd": 0
    }
  ],
  "problems": null
}
```

**Web app notes:**
- Fetch both lists to populate buy/sell dropdowns
- Validate user selections against these lists before requesting a quote
- Note that `currencyAmountScale` can vary (e.g., 2 for USD, 8 for tokens)

---

### 6. Instant Payment (Two-Step)

Send money to another customer using their PayID. This is a two-step process:
create the payment, then confirm it.

#### Step 1: Create Payment

**`POST /InstantPayment`**

**Request body:**
```json
{
  "fromCustomer": "senderPayId",
  "toCustomer": "receiverPayId",
  "paymentTypeId": 1,
  "amount": 1.00,
  "currencyCode": "USD",
  "valueDate": "2026-02-28",
  "reasonForPayment": "string",
  "externalReference": "string",
  "memo": "string"
}
```

**Response:**
```json
{
  "payment": {
    "paymentId": "GUID",
    "paymentReference": "INST1004004",
    "timestamp": "base64 string"
  },
  "problems": null
}
```

#### Step 2: Confirm Payment

**`PATCH /InstantPayment/Post`**

**Request body:**
```json
{
  "instantPaymentId": "GUID (paymentId from Step 1)",
  "timestamp": "base64 string (from Step 1)"
}
```

**Response:**
```json
{
  "payment": null,
  "problems": null
}
```

**Web app notes:**
- `fromCustomer` is the authenticated user's `userName` (their PayID)
- `toCustomer` is the recipient's PayID -- validate this field in the UI
- The `timestamp` from Step 1 is an optimistic concurrency token -- pass it unchanged to Step 2
- Show a confirmation dialog between Step 1 and Step 2 (the payment is not final until Step 2)
- `paymentReference` (e.g., `INST1004004`) is the user-facing transaction reference

---

### 7. FX Deal (Two-Step)

Convert between currencies. This is a two-step process:
get a quote, then book it.

#### Step 1: Get Quote

**`POST /FXDealQuote`**

**Request body:**
```json
{
  "buyCurrencyCode": "WKYC",
  "sellCurrencyCode": "USD",
  "amount": 1.00,
  "amountCurrencyCode": "USD",
  "dealType": "SPOT",
  "windowOpenDate": "",
  "finalValueDate": "",
  "isForCurrencyCalculator": false
}
```

**Response:**
```json
{
  "quote": {
    "quoteId": "GUID",
    "quoteReference": "QUOT1008493",
    "quoteSequenceNumber": "1008493",
    "customerAccountNumber": "string",
    "dealType": "SPOT",
    "buyAmount": "49.25000000",
    "buyCurrencyCode": "WKYC",
    "sellAmount": "1.00",
    "sellCurrencyCode": "USD",
    "rate": "49.2500",
    "symbol": "USD/WKYC",
    "dealDate": "3/2/2026 12:00:00 AM",
    "valueDate": "3/4/2026 12:00:00 AM",
    "quoteTime": "2026-02-28T11:32:28.7900000",
    "expirationTime": "2026-02-28T11:33:58.7900000",
    "isForCurrencyCalculator": false
  },
  "problems": null
}
```

#### Step 2: Book Deal

**`PATCH /FXDealQuote/{quoteId}/BookAndInstantDeposit`**

No request body required. The `quoteId` is passed as a URL path parameter.

**Response:**
```json
{
  "fxDepositData": {
    "fxDealId": "GUID",
    "fxDealReference": "SPOT1000372",
    "depositId": "GUID",
    "depositReference": "DEPO1000673"
  },
  "problems": null
}
```

**Web app notes:**
- `amountCurrencyCode` must be one of the two currencies in the deal pair
- **Quotes expire** -- check `expirationTime` (typically ~90 seconds) and show a countdown in the UI
- Set `isForCurrencyCalculator: true` for preview/calculator mode (no booking allowed)
- Show the rate, buy/sell amounts, and expiration clearly before the user confirms
- `fxDealReference` and `depositReference` are the user-facing transaction references

---

## Error Handling

All endpoints return a `problems` field. When non-null, it contains error details:

```json
{
  "problems": {
    "message": "Error description"
  }
}
```

**Web app implementation:**
- Always check `problems` before processing the response payload
- HTTP 401 indicates an expired or invalid token -- redirect to login
- HTTP 4xx/5xx errors may not include a `problems` body -- handle both cases

---

## Architecture Notes for Web App

### Authentication Flow
1. User submits credentials via login form
2. Call `POST /Authenticate` with the `callerId` from server config
3. Store `accessToken` in a secure, httpOnly session cookie (never in localStorage)
4. Store `organizationId` (customerId) and `userName` (PayID) in the session
5. Set a timer to refresh the token before `accessTokenExpiresInMinutes`

### Suggested Page Structure
| Page | Endpoints Used |
|---|---|
| Login | `POST /Authenticate` |
| Dashboard / Balances | `GET /CustomerAccountBalance/{customerId}` |
| Account Statement | `GET /CustomerAccountBalance` (list accounts), `GET /CustomerAccountStatement` |
| Send Payment | `GET /PaymentCurrencyList`, `POST /InstantPayment`, `PATCH /InstantPayment/Post` |
| FX Exchange | `GET /FXCurrencyList/Buy`, `GET /FXCurrencyList/Sell`, `POST /FXDealQuote`, `PATCH /FXDealQuote/{id}/BookAndInstantDeposit` |

### Two-Step Transaction Pattern
Both Instant Payment and FX Deal follow a create-then-confirm pattern:
1. **Create** -- submit the transaction details, receive a reference and concurrency token
2. **Review** -- display the details to the user for confirmation
3. **Confirm** -- submit the confirmation to finalize the transaction

This pattern maps naturally to a modal or confirmation page in the web app.
Never auto-confirm -- always require explicit user action between steps.

---

## Project Structure

```
mini-wallet/
  scripts/
    .env                  # Credentials (git-ignored)
    api_client.py         # Shared: config, auth, helpers
    login.py              # Authenticate and show user info
    account_balances.py   # Display wallet balances
    account_statement.py  # Transaction history with date range
    currency_list.py      # Payment currency list
    fx_currency_list.py   # FX buy/sell currency lists
    instant_payment.py    # Send instant payment (two-step)
    fx_deal.py            # FX currency exchange (two-step)
  logs/
    ps1/                  # Original PowerShell scripts (reference)
    login.log             # API call/response examples
    instant_payment.log   # API call/response examples
  .ruff.toml              # Linter config
  pyproject.toml          # Project config
  .gitignore
```
