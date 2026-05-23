# Task: Seed Script, Sign Out, Deposit Modal, OAuth Callback

## Summary
Completed all 4 tasks for the Predictly platform.

## Task 1: Database Seed Script
- Created `/home/z/my-project/prisma/seed.ts` with:
  - 9 categories (Politics, Crypto, Sports, Tech, Economics, Pop Culture, Science, World, Stocks)
  - Demo user (demo@predictly.io / demo1234) with 50,000 GC and 2,500 SC
  - Admin user (admin@predictly.io / admin1234) with diamond tier and isAdmin flag
  - 5 promo codes (WELCOME50, FREE5000GC, SCBONUS25, PREDICTLY2026, LAUNCH100)
  - 5 GC packages (Starter through Diamond)
  - 5 sample markets with category associations
  - Welcome transactions for demo user
- Used HMAC-SHA256 password hashing matching the signup API
- All operations are idempotent (upserts and existence checks)
- Added prisma.seed config to package.json
- Ran successfully: all data seeded

## Task 2: Sign Out Flow
- Updated Header.tsx's "Sign out" DropdownMenuItem to:
  - POST to /api/auth/signout with userId
  - DELETE /api/auth/session to clear cookie
  - Redirect to /signin page
  - Error handling with console.error

## Task 3: Deposit Modal
- Created `/home/z/my-project/src/components/trade/DepositModal.tsx`:
  - Dialog with 5 GC package cards (Starter through Diamond)
  - Each card shows GC amount, SC bonus, price, Buy button
  - Silver package marked as "Most Popular" with badge
  - Promo code input with Apply button
  - Link to /promotions page
  - Demo mode toasts on Buy/Apply actions
- Wired to Header's Deposit button (opens modal)
- Wired to MobileNav's Deposit button (closes nav, opens modal)
- Added onDeposit prop to MobileNav interface

## Task 4: OAuth Callback Route
- Updated `/home/z/my-project/src/app/(auth)/callback/route.ts`:
  - Creates a session token using the same HMAC-SHA256 method as session route
  - Sets predictly_session cookie on successful OAuth callback
  - Logs OAuth sign-in to auth_logs table
  - Handles error cases: OAuth errors, user not found, code exchange failures
  - Redirects to dashboard with session cookie set
