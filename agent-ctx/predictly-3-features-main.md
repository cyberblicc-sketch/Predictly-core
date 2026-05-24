# Task: Build 3 Features for Predictly Platform

## Summary

Built three complete features for the Predictly prediction market platform:

1. **Boosted Markets (Sponsored Liquidity)** — Companies pay to feature their markets
2. **Withdrawal Speed Charges** — Tiered fee system based on withdrawal speed
3. **Insurance/Hedging on Positions** — Put-option-like insurance for prediction market bets

## Files Created/Modified

### Types (Modified)
- `src/types/index.ts` — Added BoostedMarket, WithdrawalFeeQuote, WithdrawalRequest, InsurancePolicy, InsuranceQuote types and associated enums

### Feature 1: Boosted Markets
- `src/lib/boosted.ts` — Mock data (6 boosted markets), BOOST_PLACEMENTS config, calculateBoostROI()
- `src/app/api/admin/boosted/route.ts` — GET/POST for listing/creating boosts (admin auth)
- `src/app/api/admin/boosted/[id]/route.ts` — GET/PUT/DELETE for single boost (admin auth)
- `src/components/market/BoostedBadge.tsx` — Animated badge with Zap icon, sponsor tooltip, placement-specific colors

### Feature 2: Withdrawal Speed Charges
- `src/lib/withdrawal.ts` — Fee calculation engine with instant/standard/scheduled tiers, MOCK_WITHDRAWAL_REQUESTS, generateEstimatedArrival()
- `src/app/api/withdrawal/fee-quote/route.ts` — GET fee quote by amount+speed
- `src/app/api/withdrawal/route.ts` — GET list withdrawals, POST create withdrawal
- `src/components/trade/WithdrawalModal.tsx` — Beautiful modal with speed selector, fee breakdown, destination picker, real-time fee quotes

### Feature 3: Insurance/Hedging
- `src/lib/insurance.ts` — Premium calculation engine, INSURANCE_TYPE_INFO, getRiskScore(), checkInsuranceTrigger(), MOCK_INSURANCE_POLICIES
- `src/app/api/insurance/quote/route.ts` — POST calculate insurance quote
- `src/app/api/insurance/route.ts` — GET list policies, POST purchase insurance
- `src/app/api/insurance/[id]/claim/route.ts` — POST claim a policy
- `src/app/(dashboard)/insurance/page.tsx` — Full insurance dashboard with active policies, get insurance form, history

### Main Page (Modified)
- `src/app/page.tsx` — Updated to showcase all 3 features with dedicated sections

### CSS (Modified)
- `src/app/globals.css` — Added custom-scrollbar, animate-pulse-subtle, animate-shimmer utility classes

## Key Design Decisions

- **Withdrawal fees**: Instant=4.5% for small amounts, 3.5% for mid-range, scales up for large amounts. Standard ~1%, Scheduled ~0.5%. Designed to be profitable but not exploitative.
- **Insurance premiums**: Full hedge 8-15%, Partial hedge 4-8%, Stop loss 2-5%. Position size discounts for >$1K/$5K/$10K. Underwriting model: collect ~8%, pay out ~3-4%.
- **Boosted markets**: 5 placement tiers with different CPC rates and minimum budgets. ROI calculation includes estimated traders and revenue projections.

## All Routes Verified
- ESLint passes (only errors in upload/ folder, not our code)
- Homepage compiles and renders successfully (GET / 200)
- All API routes use proper error handling and admin auth where required
