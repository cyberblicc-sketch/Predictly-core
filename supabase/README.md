# Supreme Fusion - Supabase Backend

This directory contains the complete Supabase backend configuration for the Supreme Fusion Prediction Market platform.

## Structure

```
supabase/
├── config.toml              # Supabase project configuration
├── migrations/
│   └── 001_initial.sql      # Complete database schema
└── functions/
    ├── process_stake.sql    # Atomic stake placement
    ├── resolve_market.sql   # Market resolution & settlement
    ├── apply_referral_reward.sql  # Referral bonus awards
    ├── redeem_kyc.sql       # KYC redemption requests
    ├── update_market_probability.sql  # Recalculate odds
    ├── redeem_position.sql  # Early exit from positions
    └── create_user_with_referral.sql  # User registration
```

## Database Schema

The schema includes:

### Core Tables
- **users** - User accounts with dual wallet (GC/SC), KYC, referral system
- **markets** - Prediction markets with parimutuel pools
- **positions** - User bets/stakes on markets
- **transactions** - Immutable ledger of all balance changes
- **categories** - Market categories with icons

### Supporting Tables
- **referrals** - Referral tracking and rewards
- **redemption_requests** - KYC redemption requests
- **admin_logs** - Admin action audit trail
- **fraud_reports** - User fraud reports
- **publisher_earnings** - Publisher fee tracking
- **leaderboard_cache** - Cached leaderboard data
- **ai_agent_trades** - AI trading agent activity
- **social_shares** - Social share tracking
- **kyc_requests** - KYC document requests

## RPC Functions

### process_stake
Atomic stake placement with FOR UPDATE row locking. Handles both SC and GC positions with LMSR bootstrapping.

```typescript
supabase.rpc('process_stake', {
  p_user_id: 'uuid',
  p_market_id: 'text',
  p_side: 'yes' | 'no',
  p_amount: number,
  p_currency: 'sc' | 'gc'
})
```

### resolve_market
Resolves a market and settles all positions. Calculates payouts for winners proportionally.

```typescript
supabase.rpc('resolve_market', {
  p_market_id: 'text',
  p_outcome: 'yes' | 'no' | 'invalid' | 'cancel',
  p_resolution_source: 'text',
  p_admin_id: 'uuid'
})
```

### apply_referral_reward
Awards 20 SC + 20,000 GOLD to referrer when referred user deposits.

```typescript
supabase.rpc('apply_referral_reward', {
  p_referrer_id: 'uuid',
  p_referred_user_id: 'uuid',
  p_deposit_amount: number
})
```

### redeem_kyc
Processes KYC redemption request. Requires KYC verification and minimum balance.

```typescript
supabase.rpc('redeem_kyc', {
  p_user_id: 'uuid',
  p_amount_sc: number,
  p_method: 'ach' | 'check' | 'paypal' | 'gift_card'
})
```

### update_market_probability
Recalculates market odds based on pool ratios.

```typescript
supabase.rpc('update_market_probability', {
  p_market_id: 'text'
})
```

### redeem_position
Early exit from a position with exit fee calculation.

```typescript
supabase.rpc('redeem_position', {
  p_position_id: 'uuid',
  p_user_id: 'uuid'
})
```

## Row Level Security (RLS)

The schema implements comprehensive RLS policies:

- **users**: SELECT (own row or public profile without balances), UPDATE (own row)
- **markets**: SELECT (all active), INSERT (admin/publisher only)
- **positions**: SELECT (own), INSERT (own), UPDATE (none)
- **transactions**: SELECT (own), INSERT (own), SELECT (admin all)
- **admin_logs**: SELECT (admin only)
- **fraud_reports**: SELECT (reporter or admin), INSERT (any authenticated)

## Setup Instructions

### 1. Link to Supabase Project
```bash
supabase link --project-ref your-project-ref
```

### 2. Push Migrations
```bash
supabase db push
```

### 3. Deploy Functions (if using edge functions)
```bash
supabase functions deploy
```

### 4. Set Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.

## Fee Structure

- **Protocol Fee**: 2% of winning pool
- **Publisher Fee**: 1% of winning pool
- **Exit Fee**: 2% of profit on early exit
- **Total House Edge**: 3% on resolution

## LMSR Configuration

- **LMSR Threshold**: 100 SC (below this uses LMSR pricing)
- **LMSR B Parameter**: 50 (liquidity constant)

## KYC Requirements

- Minimum redemption: 50 SC (gift cards), 60 SC (other methods)
- SC to USD rate: $0.01 per SC
- KYC status must be 'verified' to redeem

## Referral Program

- Referrer receives: 20 SC + 20,000 GOLD
- When referred user makes first deposit
- Referral code format: `REF-XXXXXXNNNN`

## Auth Providers

The project supports:
- Email/Password authentication
- Google OAuth
- Apple Sign-In

Configure these in `config.toml` and your Supabase dashboard.

## Development

For local development, use Supabase CLI:
```bash
supabase start    # Start local Supabase
supabase status   # Check status
supabase logs     # View logs
```

## Production Checklist

1. [ ] Generate new JWT secret
2. [ ] Configure Google OAuth credentials
3. [ ] Configure Apple Sign-In credentials
4. [ ] Set up proper CORS redirect URLs
5. [ ] Enable email confirmation if needed
6. [ ] Review RLS policies
7. [ ] Set up proper database backups
8. [ ] Configure storage bucket for KYC documents