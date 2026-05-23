# Supreme Fusion Prediction Market

A production-grade prediction market platform built with Next.js 16, Supabase, and AI-powered trading agents.

## Features

### Core Platform
- **Dual Currency System**: Gold Coins (GC) for purchased currency, Sweeps Coins (SC) for free promotional play
- **LMSR Market Making**: Automated liquidity provision using logarithmic market scoring rules
- **Atomic Transactions**: PostgreSQL RPC functions prevent double-spending and ensure consistency
- **KYC Integration**: Stripe Identity verification for redemption (min 50-60 SC)

### User Features
- Multi-authentication: Email, Google, Apple Sign-In, Phone OTP
- Referral System: Earn 20 SC + 20,000 GC when friends deposit
- Portfolio Tracking: Real-time P&L on positions
- Leaderboard: Global rankings by total winnings
- Social Sharing: Share prediction cards to Twitter, Telegram, Facebook
- Fraud Reporting: Report suspicious activity on any market

### Admin Dashboard
- User Management: Search, suspend, adjust balances, KYC review
- Market Management: Create, edit, resolve, suspend markets
- Dispute Resolution: Review and resolve fraud reports
- Audit Logs: Complete history of all admin actions
- AI Swarm Control: Enable/disable autonomous trading agents
- System Status: Real-time monitoring of all services

### AI Trading Agents
- **Momentum**: Follows price trends
- **Contrarian**: Bets against overreactions
- **Arbitrage**: Exploits cross-market gaps
- **Sentiment**: Analyzes news/social signals
- Rate limits: 10 trades/tick, 50k SC/day per agent

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL), Edge Functions |
| Database | PostgreSQL with Row Level Security (RLS) |
| Auth | Supabase Auth (email, Google, Apple, phone OTP) |
| Payments | Stripe (GC purchases, KYC verification, redemptions) |
| AI | Groq API (Llama 3 70B) for autonomous trading |
| Hosting | Vercel (frontend), Supabase (backend) |

## Project Structure

```
supreme-fusion/
├── app/
│   ├── (auth)/           # Authentication pages (signin, signup)
│   ├── (dashboard)/      # User dashboard pages
│   ├── admin/            # Admin panel pages
│   ├── api/              # API routes
│   │   ├── admin/        # Admin API endpoints
│   │   ├── fraud-report/ # User fraud reporting
│   │   └── webhooks/     # Stripe webhooks
│   ├── page.tsx          # Landing page
│   └── layout.tsx        # Root layout
├── components/
│   ├── market/           # MarketCard, ProbabilityChart
│   ├── ui/               # Button, Card, Input, Modal, etc.
│   └── layout/           # Header, Sidebar, Footer, Disclaimer
├── lib/
│   ├── auth.ts           # Authentication helpers
│   ├── supabase.ts       # Supabase client & RPC types
│   ├── adminAuth.ts      # Admin authentication
│   ├── stripe.ts         # Stripe integration
│   └── utils.ts          # Utility functions
├── supabase/
│   ├── migrations/       # Database schema migrations
│   └── functions/        # RPC function SQL files
├── types/
│   └── index.ts          # TypeScript type definitions
└── middleware.ts         # Route protection middleware
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `GROQ_API_KEY` - Groq API key for AI agents
- `ADMIN_PASSWORD` - Admin password for admin panel access

### 2. Database Setup

Run the migrations in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:
   - `001_initial.sql` - Core schema (users, markets, positions, transactions)
   - `002_ai_swarm.sql` - AI agent tables and functions
   - `003_rpc_functions_and_tables.sql` - RPC functions and additional tables

Or use the Supabase CLI:
```bash
supabase db push
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Deploy to Vercel

```bash
npm run build
vercel deploy
```

## Fee Structure

| Fee Type | Rate | Recipient |
|----------|------|-----------|
| Protocol Fee | 2% | Platform operational costs |
| Publisher Fee | 1% | Development team |
| Exit Fee | 2% | Applied to profitable early exits |
| **Total** | **3%** | On resolution |

## Redemption Minimums

- Gift Card Redemption: 50 SC minimum
- USD Bank Transfer: 60 SC minimum

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Admin account created
- [ ] AI agent user seeded (if using AI swarm)
- [ ] KYC flow tested with Stripe Identity
- [ ] Referral system verified
- [ ] Admin panel tested with all features
- [ ] Mobile responsiveness verified

## API Documentation

### Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/stats` | GET | Platform statistics |
| `/api/admin/users` | GET | List users with pagination |
| `/api/admin/users/[id]/adjust-balance` | POST | Adjust user balance |
| `/api/admin/users/[id]/suspend` | POST | Suspend/unsuspend user |
| `/api/admin/users/[id]/kyc` | POST | Approve/reject KYC |
| `/api/admin/markets` | GET/POST | List/create markets |
| `/api/admin/markets/[id]/resolve` | POST | Resolve market |
| `/api/admin/markets/[id]/suspend` | POST | Suspend market |
| `/api/admin/fraud-reports` | GET | List fraud reports |
| `/api/admin/fraud-reports/[id]/resolve` | POST | Resolve fraud report |
| `/api/admin/ai-config` | GET/POST | AI swarm configuration |
| `/api/admin/activity` | GET | Audit logs |

### User API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fraud-report` | GET/POST | Submit/view fraud reports |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

## License

Proprietary - All rights reserved