# Dual-API Payment History Architecture

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│              PAYMENTS HISTORY PAGE                      │
│                                                          │
│  User clicks "History" → "Payments"                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Calls searchAllPayments()
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│         PAYMENT SERVICE (payment.service.ts)            │
│                                                          │
│  searchAllPayments() {                                  │
│    // Parallel API calls                               │
│    Promise.all([                                        │
│      searchInstantPayments(),  ◄────────────┐          │
│      searchWirePayments()      ◄──────────┐ │          │
│    ])                                      │ │          │
│  }                                         │ │          │
└────────────────────────────────────────────┼─┼──────────┘
                                             │ │
                  ┌──────────────────────────┘ │
                  │  ┌─────────────────────────┘
                  │  │
         ┌────────▼──▼────────┐
         │   BACKEND APIs     │
         └────────┬──┬─────────┘
                  │  │
    ┌─────────────┘  └──────────────┐
    │                                │
    ▼                                ▼
┌─────────────────────┐  ┌─────────────────────┐
│  INSTANT PAYMENTS   │  │   WIRE PAYMENTS     │
│  💸 API             │  │   🏦 API            │
│                     │  │                     │
│  /InstantPayment/   │  │  /Payment/Search    │
│  Search             │  │                     │
│                     │  │                     │
│  Returns:           │  │  Returns:           │
│  • Peer-to-peer     │  │  • Bank wires       │
│  • Alias → Alias    │  │  • To beneficiary   │
│  • Real-time        │  │  • 1-3 days         │
│  • Posted/Created   │  │  • Created/Released │
└─────────────────────┘  └─────────────────────┘
         │                        │
         └──────────┬─────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  NORMALIZE & MERGE   │
         │                      │
         │  • Convert to        │
         │    UnifiedPayment    │
         │  • Merge arrays      │
         │  • Sort by date      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   UNIFIED DISPLAY    │
         │                      │
         │  [💸 Instant] -3 USD │
         │  [🏦 Wire]   -500 EUR│
         │  [💸 Instant] +10 GBP│
         └──────────────────────┘
```

---

## DATA FLOW

### 1. Fetch Phase

```typescript
// Parallel API calls (faster!)
const [instantResponse, wireResponse] = await Promise.all([
  searchInstantPayments(),
  searchWirePayments()
]);
```

### 2. Normalize Phase

```typescript
// Convert instant payment
{
  paymentId: "abc-123",
  fromCustomerAlias: "ralf",
  toCustomerAlias: "inan",
  amount: 3.00,
  status: "Posted"
}
       ↓ normalize
{
  id: "abc-123",
  type: "instant",
  from: "ralf",
  to: "inan",
  amount: 3.00,
  statusDisplay: "Paid"
}

// Convert wire payment
{
  paymentId: "xyz-789",
  customerName: "John Doe",
  beneficiaryName: "ACME Corp",
  amount: 500.00,
  paymentStatusTypeName: "Released"
}
       ↓ normalize
{
  id: "xyz-789",
  type: "wire",
  from: "John Doe",
  to: "ACME Corp (Chase Bank)",
  amount: 500.00,
  statusDisplay: "Sent"
}
```

### 3. Merge & Sort Phase

```typescript
const allPayments = [
  ...instantPayments,
  ...wirePayments
].sort((a, b) => 
  new Date(b.createdTime) - new Date(a.createdTime)
);
```

---

## STATUS MAPPING

### Instant Payment Statuses

```
API Status    →  Display Status
─────────────────────────────────
Posted        →  Paid/Received (context-aware)
Created       →  Pending
Voided        →  Cancelled
```

### Wire Payment Statuses

```
API Status       →  Display Status
─────────────────────────────────
Created          →  Draft
Submitted        →  Processing
FundsApproved    →  Approved
Verified         →  Verified
Released         →  Sent
Voided           →  Cancelled
```

---

## ERROR HANDLING

### Graceful Degradation

```typescript
// If one API fails, show the other
const [instantResponse, wireResponse] = await Promise.all([
  searchInstantPayments().catch(err => {
    console.error('Instant payments failed:', err);
    return { records: { payments: [], totalCount: 0 } };
  }),
  searchWirePayments().catch(err => {
    console.error('Wire payments failed:', err);
    return { payments: [], totalCount: 0 };
  })
]);

// Still show available data!
```

---

## WHY TWO APIS?

| Aspect | Instant Payments | Wire Payments |
|--------|------------------|---------------|
| **Purpose** | Quick peer-to-peer transfers | Traditional bank transfers |
| **Data Model** | Simple (alias-based) | Complex (full beneficiary details) |
| **Speed** | Instant | Days |
| **Infrastructure** | Internal wallet system | External banking network |
| **Compliance** | Less regulated | Heavily regulated (KYC, AML) |

**Result:** Two separate systems, two separate APIs, but ONE unified user experience!

---

## PERFORMANCE CONSIDERATIONS

### Parallel Fetching

```
Traditional (sequential):
─────────────────────────
Instant API: 200ms
Wire API: 250ms
Total: 450ms ❌

Parallel (Promise.all):
─────────────────────────
Instant API: 200ms ┐
Wire API: 250ms    ┴─→ max(200, 250) = 250ms ✅
Total: 250ms (44% faster!)
```

### Pagination Strategy

- Each API has its own pagination
- Frontend merges results
- Total count = sum of both APIs
- **Limitation:** Can't guarantee exact page size due to merge

**Solution:** Fetch slightly more from each API (e.g., pageSize * 2) then slice client-side

---

## FUTURE ENHANCEMENTS

1. **Add more payment types** (e.g., SEPA, ACH)
2. **Unified search** across both APIs
3. **Export combined history** to CSV/PDF
4. **Advanced filters** (date range, amount range, status)
5. **Real-time updates** for instant payments
