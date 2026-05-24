-- ============================================================================
-- SUPREME FUSION PREDICTION MARKET — Initial Database Schema
-- Dual-currency sweepstakes prediction market
-- Gold Coins (GC): purchased, entertainment-only, NO redemption value
-- Sweeps Coins (SC): free with GC purchase, redeemable for cash prizes
-- Parimutuel engine with LMSR bootstrapping
-- Creator revenue sharing (1% publisher fee)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE auth_provider AS ENUM ('email', 'google', 'apple');
CREATE TYPE kyc_status_type AS ENUM ('none', 'pending', 'verified', 'rejected');
CREATE TYPE user_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE market_status AS ENUM ('draft', 'active', 'paused', 'resolved', 'closed', 'invalid');
CREATE TYPE position_side AS ENUM ('yes', 'no');
CREATE TYPE currency_type AS ENUM ('sc', 'gc');
CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT', 'GC_PURCHASE', 'GC_BONUS', 'SC_BONUS_WITH_GC', 'DAILY_SC_CLAIM',
  'MAIL_SC_CLAIM', 'REFERRAL_SC', 'REFERRAL_REWARD', 'STAKE', 'PAYOUT',
  'EXIT', 'FEE_PROTOCOL', 'FEE_PUBLISHER', 'FEE_EXIT', 'REDEMPTION_REQUEST',
  'REDEMPTION_PROCESSED', 'KYC_REDEMPTION', 'WITHDRAWAL'
);
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'expired');
CREATE TYPE fraud_report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
CREATE TYPE redemption_method AS ENUM ('ach', 'check', 'paypal', 'gift_card');
CREATE TYPE redemption_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'completed');
CREATE TYPE ai_trade_status AS ENUM ('pending', 'executed', 'failed');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users with dual wallets
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT,
  handle TEXT UNIQUE,
  password_hash TEXT,
  auth_provider auth_provider DEFAULT 'email',
  
  -- Dual wallet system (currency isolation)
  gc_balance NUMERIC(16,2) NOT NULL DEFAULT 0,
  sc_balance NUMERIC(16,2) NOT NULL DEFAULT 0,
  
  -- KYC
  kyc_status kyc_status_type NOT NULL DEFAULT 'none',
  kyc_verified_at TIMESTAMPTZ,
  kyc_document_url TEXT,
  
  -- User tier
  user_tier user_tier NOT NULL DEFAULT 'bronze',
  
  -- Compliance
  age_verified BOOLEAN NOT NULL DEFAULT FALSE,
  jurisdiction TEXT,
  is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  self_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  exclusion_until TIMESTAMPTZ,
  
  -- Gamification
  daily_streak INTEGER NOT NULL DEFAULT 0,
  last_daily_claim TIMESTAMPTZ,
  total_wagered_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_wagered_gc NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_won_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  
  -- Referrals
  referral_code TEXT UNIQUE,
  referred_by_code TEXT,
  referral_bonus_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Stripe
  stripe_customer_id TEXT,
  
  -- Admin flags
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_publisher BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories for markets
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Markets with parimutuel pools
CREATE TABLE IF NOT EXISTS markets (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  
  -- Market lifecycle
  status market_status NOT NULL DEFAULT 'draft',
  
  -- Parimutuel pools (SC markets)
  yes_pool_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  no_pool_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  
  -- GC pools (entertainment mirror)
  yes_pool_gc NUMERIC(16,2) NOT NULL DEFAULT 0,
  no_pool_gc NUMERIC(16,2) NOT NULL DEFAULT 0,
  
  -- Implied probability (denormalized for fast reads)
  yes_probability NUMERIC(5,4) NOT NULL DEFAULT 0.5000,
  no_probability NUMERIC(5,4) NOT NULL DEFAULT 0.5000,
  
  -- Volume tracking
  total_volume_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_volume_gc NUMERIC(16,2) NOT NULL DEFAULT 0,
  volume_24h_sc NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_traders INTEGER NOT NULL DEFAULT 0,
  
  -- LMSR bootstrapping
  lmsr_active BOOLEAN NOT NULL DEFAULT TRUE,
  lmsr_b NUMERIC(8,2) NOT NULL DEFAULT 50,
  
  -- Resolution
  resolution TEXT CHECK (resolution IN ('yes', 'no', 'invalid', 'cancel', NULL)),
  resolution_date TIMESTAMPTZ,
  resolution_evidence TEXT,
  resolving_admin_id UUID REFERENCES users(id),
  
  -- Market safety score
  safety_score INTEGER NOT NULL DEFAULT 0,
  safety_checks JSONB NOT NULL DEFAULT '[]',
  
  -- Publisher/creator
  publisher_id UUID REFERENCES users(id),
  source_kind TEXT,
  source_url TEXT,
  invalidation_clause TEXT,
  rules_text TEXT,
  
  -- Timing
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Positions (bets with parimutuel + early exit support)
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  market_id TEXT NOT NULL REFERENCES markets(id),
  side position_side NOT NULL,
  
  -- Currency type (GC or SC — positions are currency-isolated)
  currency currency_type NOT NULL,
  
  -- Stake details
  stake NUMERIC(16,2) NOT NULL,
  entry_prob NUMERIC(5,4) NOT NULL,
  cost NUMERIC(16,2) NOT NULL,
  lmsr_subsidy NUMERIC(16,2) NOT NULL DEFAULT 0,
  
  -- Resolution
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  payout NUMERIC(16,2) NOT NULL DEFAULT 0,
  settled_at TIMESTAMPTZ,
  
  -- Early exit
  is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
  redemption_value NUMERIC(16,2),
  exit_fee NUMERIC(16,2) NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions (immutable ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type transaction_type NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  currency currency_type NOT NULL,
  balance_before NUMERIC(16,2) NOT NULL,
  balance_after NUMERIC(16,2) NOT NULL,
  market_id TEXT REFERENCES markets(id),
  position_id UUID REFERENCES positions(id),
  related_user_id UUID REFERENCES users(id),
  status transaction_status NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KYC Requests (separate audit trail)
CREATE TABLE IF NOT EXISTS kyc_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  status kyc_status_type NOT NULL DEFAULT 'pending',
  doc_type TEXT,
  doc_url TEXT,
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_user_id UUID REFERENCES users(id),
  referral_code TEXT NOT NULL,
  status referral_status NOT NULL DEFAULT 'pending',
  reward_sc NUMERIC(16,2) NOT NULL DEFAULT 20,
  reward_gold NUMERIC(16,2) NOT NULL DEFAULT 20000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deposit_amount NUMERIC(16,2) DEFAULT 0
);

-- Publisher profiles (extended user profile)
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  handle TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar TEXT,
  tier TEXT NOT NULL DEFAULT 'sprout' CHECK (tier IN ('sprout', 'spark', 'torch', 'anchor', 'legend')),
  warmth_score INTEGER NOT NULL DEFAULT 0,
  total_earned NUMERIC(16,2) NOT NULL DEFAULT 0,
  markets_created INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Publisher earnings (per-market fee records)
CREATE TABLE IF NOT EXISTS publisher_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publisher_id UUID NOT NULL REFERENCES publishers(id),
  market_id TEXT NOT NULL REFERENCES markets(id),
  amount NUMERIC(16,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements (publisher badges)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publisher_id UUID NOT NULL REFERENCES publishers(id),
  badge_key TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🏆',
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publisher_id, badge_key)
);

-- Share events (viral tracking)
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  market_id TEXT REFERENCES markets(id),
  position_id UUID REFERENCES positions(id),
  platform TEXT NOT NULL DEFAULT 'link',
  message TEXT,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shares_count INTEGER NOT NULL DEFAULT 0
);

-- Market comments (threaded)
CREATE TABLE IF NOT EXISTS market_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id TEXT NOT NULL REFERENCES markets(id),
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES market_comments(id),
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alpha signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  headline TEXT NOT NULL,
  summary TEXT,
  conviction_score NUMERIC(5,2) NOT NULL DEFAULT 50,
  category TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Redemption requests (SC → cash)
CREATE TABLE IF NOT EXISTS redemption_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount_sc NUMERIC(16,2) NOT NULL,
  amount_usd NUMERIC(16,2) NOT NULL,
  status redemption_status NOT NULL DEFAULT 'pending',
  method redemption_method NOT NULL DEFAULT 'ach',
  bank_info JSONB,
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id),
  target_market_id TEXT REFERENCES markets(id),
  changes JSONB DEFAULT '{}',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fraud reports
CREATE TABLE IF NOT EXISTS fraud_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  market_id TEXT REFERENCES markets(id),
  report_type TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status fraud_report_status NOT NULL DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Leaderboard cache
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  rank INTEGER NOT NULL,
  total_pnl NUMERIC(16,2) NOT NULL DEFAULT 0,
  win_count INTEGER NOT NULL DEFAULT 0,
  total_positions INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  this_month_pnl NUMERIC(16,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Agent trades
CREATE TABLE IF NOT EXISTS ai_agent_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  market_id TEXT NOT NULL REFERENCES markets(id),
  side position_side NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  reason TEXT,
  status ai_trade_status NOT NULL DEFAULT 'pending',
  execution_price NUMERIC(16,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- GC Purchase packages
CREATE TABLE IF NOT EXISTS gc_packages (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  gc_amount NUMERIC(16,2) NOT NULL,
  sc_bonus NUMERIC(16,2) NOT NULL,
  price_usd NUMERIC(8,2) NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- AMOE mail entries
CREATE TABLE IF NOT EXISTS amoe_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sc_credited NUMERIC(8,2) NOT NULL DEFAULT 0,
  user_id UUID REFERENCES users(id),
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_market ON positions(market_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_market ON positions(user_id, market_id);
CREATE INDEX IF NOT EXISTS idx_positions_market_side ON positions(market_id, side);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_created ON transactions(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category_id);
CREATE INDEX IF NOT EXISTS idx_markets_slug ON markets(slug);
CREATE INDEX IF NOT EXISTS idx_markets_expires ON markets(expires_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemption_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemption_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_reporter ON fraud_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_cache(rank);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_requests_updated_at
  BEFORE UPDATE ON kyc_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishers_updated_at
  BEFORE UPDATE ON publishers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_redemption_requests_updated_at
  BEFORE UPDATE ON redemption_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is publisher
CREATE OR REPLACE FUNCTION is_publisher_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND is_publisher = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS RLS POLICIES
-- ============================================================================

-- Users can see their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (except admin flags)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can see public profile (without balances and KYC)
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (TRUE);

-- ============================================================================
-- MARKETS RLS POLICIES
-- ============================================================================

-- Anyone can see active markets
CREATE POLICY "markets_select_active" ON markets
  FOR SELECT USING (status IN ('active', 'paused', 'resolved'));

-- Only admins and publishers can insert markets
CREATE POLICY "markets_insert_admin_publisher" ON markets
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()) OR is_publisher_user(auth.uid()));

-- Admins can update markets
CREATE POLICY "markets_update_admin" ON markets
  FOR UPDATE USING (is_admin_user(auth.uid()));

-- ============================================================================
-- POSITIONS RLS POLICIES
-- ============================================================================

-- Users can see their own positions
CREATE POLICY "positions_select_own" ON positions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own positions
CREATE POLICY "positions_insert_own" ON positions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users cannot update positions (settled via RPC)
CREATE POLICY "positions_no_update" ON positions
  FOR UPDATE USING (FALSE);

-- ============================================================================
-- TRANSACTIONS RLS POLICIES
-- ============================================================================

-- Users can see their own transactions
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions (via RPC)
CREATE POLICY "transactions_insert_own" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see all transactions
CREATE POLICY "transactions_select_admin" ON transactions
  FOR SELECT USING (is_admin_user(auth.uid()));

-- ============================================================================
-- REFERRALS RLS POLICIES
-- ============================================================================

-- Users can see their own referrals
CREATE POLICY "referrals_select_own" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Anyone authenticated can insert referrals
CREATE POLICY "referrals_insert_authenticated" ON referrals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- ADMIN_LOGS RLS POLICIES
-- ============================================================================

-- Only admins can see admin logs
CREATE POLICY "admin_logs_select_admin" ON admin_logs
  FOR SELECT USING (is_admin_user(auth.uid()));

-- Admins can insert admin logs
CREATE POLICY "admin_logs_insert_admin" ON admin_logs
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

-- ============================================================================
-- FRAUD_REPORTS RLS POLICIES
-- ============================================================================

-- Reporter or admin can see fraud reports
CREATE POLICY "fraud_reports_select" ON fraud_reports
  FOR SELECT USING (
    auth.uid() = reporter_id OR 
    is_admin_user(auth.uid())
  );

-- Any authenticated user can insert fraud reports
CREATE POLICY "fraud_reports_insert" ON fraud_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- REDEMPTION_REQUESTS RLS POLICIES
-- ============================================================================

-- Users can see their own redemption requests
CREATE POLICY "redemption_requests_select_own" ON redemption_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own redemption requests
CREATE POLICY "redemption_requests_insert_own" ON redemption_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see all redemption requests
CREATE POLICY "redemption_requests_select_admin" ON redemption_requests
  FOR SELECT USING (is_admin_user(auth.uid()));

-- Admins can update redemption requests
CREATE POLICY "redemption_requests_update_admin" ON redemption_requests
  FOR UPDATE USING (is_admin_user(auth.uid()));

-- ============================================================================
-- KYC_REQUESTS RLS POLICIES
-- ============================================================================

-- Users can see their own KYC requests
CREATE POLICY "kyc_requests_select_own" ON kyc_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own KYC requests
CREATE POLICY "kyc_requests_insert_own" ON kyc_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see all KYC requests
CREATE POLICY "kyc_requests_select_admin" ON kyc_requests
  FOR SELECT USING (is_admin_user(auth.uid()));

-- Admins can update KYC requests
CREATE POLICY "kyc_requests_update_admin" ON kyc_requests
  FOR UPDATE USING (is_admin_user(auth.uid()));

-- ============================================================================
-- INITIAL CATEGORIES SEED DATA
-- ============================================================================

INSERT INTO categories (name, slug, display_order, icon) VALUES
  ('Politics', 'politics', 1, '🏛️'),
  ('Sports', 'sports', 2, '🏟️'),
  ('Crypto', 'crypto', 3, '₿'),
  ('Technology', 'technology', 4, '💻'),
  ('Entertainment', 'entertainment', 5, '🎬'),
  ('Economics', 'economics', 6, '📊'),
  ('Science', 'science', 7, '🔬'),
  ('World', 'world', 8, '🌍')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- INITIAL GC PACKAGES SEED DATA
-- ============================================================================

INSERT INTO gc_packages (label, gc_amount, sc_bonus, price_usd, is_popular, sort_order) VALUES
  ('Starter Pack', 100, 20, 0.99, FALSE, 1),
  ('Bronze Pack', 500, 100, 4.99, FALSE, 2),
  ('Silver Pack', 1000, 250, 9.99, TRUE, 3),
  ('Gold Pack', 2500, 750, 24.99, FALSE, 4),
  ('Platinum Pack', 5000, 2000, 49.99, FALSE, 5)
ON CONFLICT DO NOTHING;