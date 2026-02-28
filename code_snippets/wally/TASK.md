## Prompt to Continue Development

```
Please study the IMPLEMENTATION_PLAN.md file and continue implementing the next incomplete feature.

Rules:
1. Check which features are marked as COMPLETED (✅) vs pending
2. Implement ONE feature at a time
3. After completing each feature, STOP and summarize what was done
4. Do NOT commit - I will test and commit manually
5. Create all necessary files: page, styles, service (if needed), route
6. Follow existing code patterns and theme system (CSS variables)
7. Update IMPLEMENTATION_PLAN.md to mark the feature as complete

After implementing, tell me:
- What files were created/modified
- How to test the feature (URL path)
- Any dependencies to install (npm packages)
- The next Task
```

---

## Quick Reference

### Current Status
See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for full details.

### Completed Features
- [x] Login
- [x] Dashboard
- [x] Balances
- [x] Statement
- [x] Payments History
- [x] Theme System
- [x] Exchange Rates Widget
- [x] Withdraw (Cash-Out)

### Next Up (In Order)
1. Deposit (Cash-In) - `/deposit`
2. Pay Now (P2P) - `/pay-now`
3. Payment Wizard - `/payment-wizard`
4. Exchange - `/exchange`
5. History > Convert - `/history/convert`
6. Add Funds > Bank Account - `/add-funds/bank`
7. Add Funds > Deposit History - `/add-funds/history`
8. Add Funds > Deposit Proof - `/add-funds/proof`
9. Contact Us - `/contact`
10. Receive - `/receive` (redirect to deposit)

### Data Files Available
- `src/data/cashPoints.ts` - Cash point locations
- `src/data/bankAccounts.json` - Bank deposit details
- `src/data/address.json` - Company contact info
- `public/faq.html` - FAQ page

### Key Patterns
- Pages go in `src/pages/`
- Styles go in `src/styles/` (use CSS variables from globals.css)
- Services go in `src/api/`
- Routes added to `src/App.tsx`
- Use `useAuth()` for customer info

---

## Alternative Prompts

### Implement Specific Feature
```
Please implement the [FEATURE NAME] feature from IMPLEMENTATION_PLAN.md.
Stop after completion so I can test. Do not commit.
```

### Fix/Debug
```
Please check the [FEATURE] page at /[path]. [Describe issue].
```

### Style Adjustments
```
Please adjust the styling of [component/page]. [Describe changes].
Follow the theme system in globals.css.
```

---

## After Testing

Once you've tested a feature:
1. Run `npm run build` to check for errors
2. Commit with descriptive message: `feat: add [feature name]`
3. Then continue with the next prompt
