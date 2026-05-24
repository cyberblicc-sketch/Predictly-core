-- ============================================================================
-- Supreme Fusion Prediction Market
-- Migration 003: Additional Tables and Core RPC Functions
-- ============================================================================

-- ============================================================================
-- Site Configuration Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

-- Default site config values
INSERT INTO site_config (key, value, description) VALUES
  ('default_house_fee', '2', 'Default house fee percentage for new markets'),
  ('default_platform_fee', '1', 'Default platform fee percentage for new markets'),
  ('default_initial_liquidity', '10000', 'Default initial liquidity for new markets (SC)'),
  ('min_redeem_sc', '50', 'Minimum SC for gift card redemption'),
  ('regular_redeem_sc', '60', 'Minimum SC for regular USD redemption'),
  ('referral_sc_reward', '20', 'SC reward for referring a depositing user'),
  ('referral_gc_reward', '20000', 'GC reward for referring a depositing user'),
  ('ai_swarm_enabled', 'false', 'Enable/disable AI trading swarm'),
  ('ai_max_trades_per_tick', '10', 'Max AI trades per 5-minute tick'),
  ('ai_max_daily_loss', '50000', 'Max daily loss per AI agent (SC)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ============================================================================
-- AI Swarm Settings (Column-based for easier admin management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_swarm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  max_trades_per_tick INTEGER NOT NULL DEFAULT 10,
  max_daily_loss NUMERIC NOT NULL DEFAULT 50000,
  agent_budgets JSONB NOT NULL DEFAULT '{"momentum": 1000, "contrarian": 1000, "arbitrage": 1000, "sentiment": 1000}',
  last_tick_at TIMESTAMPTZ,
  daily_loss NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default AI settings
INSERT INTO ai_swarm_settings (id, is_enabled, max_trades_per_tick, max_daily_loss, agent_budgets)
VALUES ('00000000-0000-0000-0000-000000000001', false, 10, 50000, '{"momentum": 1000, "contrarian": 1000, "arbitrage": 1000, "sentiment": 1000}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Purchases Table (for tracking GC purchases for referral eligibility)
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC NOT NULL, -- USD amount
  gc_amount INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_session ON purchases(stripe_session_id);

-- ============================================================================
-- Core RPC Functions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- process_stake: Atomic stake placement with LMSR pricing
-- Handles both SC and GC currencies
-- Fee: 3% total (2% protocol + 1% publisher) deducted from pool on resolution
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_stake(
  p_user_id UUID,
  p_market_id TEXT,
  p_side TEXT,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'sc'
) RETURNS JSON AS $$
DECLARE
  v_current_balance NUMERIC;
  v_yes_pool NUMERIC;
  v_no_pool NUMERIC;
  v_cost NUMERIC;
  v_entry_prob NUMERIC;
  v_lmsr_b NUMERIC := 50;
  v_position_id UUID;
  v_new_balance NUMERIC;
  v_market_record RECORD;
  v_user_record RECORD;
  v_pool_field TEXT;
  v_pool_before NUMERIC;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF p_side NOT IN ('yes', 'no') THEN RAISE EXCEPTION 'Side must be yes or no'; END IF;
  IF p_currency NOT IN ('sc', 'gc') THEN RAISE EXCEPTION 'Currency must be sc or gc'; END IF;

  -- Get user with lock
  SELECT id, sc_balance, gc_balance, is_restricted INTO v_user_record
  FROM users WHERE id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  IF v_user_record.is_restricted THEN RAISE EXCEPTION 'Account is restricted'; END IF;

  -- Check balance
  IF p_currency = 'sc' THEN
    v_current_balance := v_user_record.sc_balance;
  ELSE
    v_current_balance := v_user_record.gc_balance;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %', v_current_balance;
  END IF;

  -- Get market with lock
  SELECT id, yes_pool, no_pool, status, closes_at INTO v_market_record
  FROM markets WHERE id = p_market_id FOR UPDATE;
  
  IF NOT FOUND THEN RAISE EXCEPTION 'Market not found'; END IF;
  IF v_market_record.status != 'open' THEN RAISE EXCEPTION 'Market is not open'; END IF;
  IF v_market_record.closes_at <= NOW() THEN RAISE EXCEPTION 'Market has closed'; END IF;

  -- Calculate LMSR cost
  -- Cost = B * ln((exp(yes/B) + exp(no/B)) / exp(my_pool/B))
  -- where my_pool is the pool on the opposite side
  IF p_side = 'yes' THEN
    v_cost := v_lmsr_b * ln((EXP(v_market_record.yes_pool / v_lmsr_b) + EXP(v_market_record.no_pool / v_lmsr_b)) / EXP(v_market_record.yes_pool / v_lmsr_b));
    v_entry_prob := v_market_record.yes_pool / (v_market_record.yes_pool + v_market_record.no_pool);
    v_pool_before := v_market_record.yes_pool;
  ELSE
    v_cost := v_lmsr_b * ln((EXP(v_market_record.yes_pool / v_lmsr_b) + EXP(v_market_record.no_pool / v_lmsr_b)) / EXP(v_market_record.no_pool / v_lmsr_b));
    v_entry_prob := v_market_record.no_pool / (v_market_record.yes_pool + v_market_record.no_pool);
    v_pool_before := v_market_record.no_pool;
  END IF;

  -- Cap cost at amount (can't pay more than stake)
  IF v_cost > p_amount THEN v_cost := p_amount; END IF;

  -- Deduct from user balance
  IF p_currency = 'sc' THEN
    UPDATE users SET sc_balance = sc_balance - p_amount WHERE id = p_user_id;
    v_new_balance := v_user_record.sc_balance - p_amount;
  ELSE
    UPDATE users SET gc_balance = gc_balance - p_amount WHERE id = p_user_id;
    v_new_balance := v_user_record.gc_balance - p_amount;
  END IF;

  -- Add to market pool
  IF p_side = 'yes' THEN
    UPDATE markets SET yes_pool = yes_pool + p_amount, trading_volume = trading_volume + p_amount WHERE id = p_market_id;
  ELSE
    UPDATE markets SET no_pool = no_pool + p_amount, trading_volume = trading_volume + p_amount WHERE id = p_market_id;
  END IF;

  -- Create position
  v_position_id := gen_random_uuid();
  INSERT INTO positions (id, user_id, market_id, side, stake, entry_price, current_value, pnl, is_settled, currency, pool_before)
  VALUES (v_position_id, p_user_id, p_market_id, p_side, p_amount, v_entry_prob, p_amount, 0, false, upper(p_currency), v_pool_before);

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, market_id, position_id, status, metadata)
  VALUES (p_user_id, 'STAKE', p_amount, upper(p_currency), p_market_id, v_position_id, 'completed',
    jsonb_build_object('position_id', v_position_id, 'side', p_side, 'cost', v_cost, 'entry_prob', v_entry_prob));

  RETURN jsonb_build_object(
    'position_id', v_position_id,
    'cost', v_cost,
    'entry_prob', v_entry_prob,
    'new_balance', v_new_balance,
    'current_probability', CASE WHEN p_side = 'yes' THEN (v_market_record.yes_pool + p_amount) / (v_market_record.yes_pool + v_market_record.no_pool + p_amount) ELSE v_market_record.yes_pool / (v_market_record.yes_pool + v_market_record.no_pool + p_amount) END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_stake TO authenticated;

-- ----------------------------------------------------------------------------
-- resolve_market: Atomic market resolution with payouts
-- Payout: Winners get (pool * (1 - fees)) / winner_pool * their_stake
-- Fees: 3% total (2% protocol + 1% publisher)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id TEXT,
  p_outcome TEXT,
  p_resolution_source TEXT DEFAULT ''
) RETURNS JSON AS $$
DECLARE
  v_market RECORD;
  v_winner_pool NUMERIC;
  v_loser_pool NUMERIC;
  v_total_pool NUMERIC;
  v_protocol_fee NUMERIC;
  v_publisher_fee NUMERIC;
  v_net_payout_pool NUMERIC;
  v_winning_positions RECORD;
  v_total_payout NUMERIC := 0;
  v_position_count INTEGER := 0;
BEGIN
  IF p_outcome NOT IN ('YES', 'NO') THEN RAISE EXCEPTION 'Outcome must be YES or NO'; END IF;

  -- Get market with lock
  SELECT * INTO v_market FROM markets WHERE id = p_market_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Market not found'; END IF;
  IF v_market.status != 'open' THEN RAISE EXCEPTION 'Market already resolved'; END IF;

  -- Determine winner/loser pools
  IF p_outcome = 'YES' THEN
    v_winner_pool := v_market.yes_pool;
    v_loser_pool := v_market.no_pool;
  ELSE
    v_winner_pool := v_market.no_pool;
    v_loser_pool := v_market.yes_pool;
  END IF;

  v_total_pool := v_market.yes_pool + v_market.no_pool;

  -- Calculate fees (3% of loser pool goes to house/platform)
  v_protocol_fee := v_loser_pool * 0.02;
  v_publisher_fee := v_loser_pool * 0.01;
  v_net_payout_pool := v_loser_pool - v_protocol_fee - v_publisher_fee;

  -- Update market status
  UPDATE markets SET
    status = 'resolved',
    resolved_outcome = p_outcome,
    resolution_source = p_resolution_source,
    resolved_at = NOW()
  WHERE id = p_market_id;

  -- Process winning positions
  FOR v_winning_positions IN
    SELECT p.id, p.user_id, p.stake, p.currency
    FROM positions p
    WHERE p.market_id = p_market_id AND p.side = p_outcome AND p.is_settled = false
  LOOP
    -- Calculate payout: (net_pool / winner_pool) * position_stake
    DECLARE
      v_payout NUMERIC;
      v_balance_field TEXT;
    BEGIN
      v_payout := (v_net_payout_pool / v_winner_pool) * v_winning_positions.stake;
      v_balance_field := CASE WHEN v_winning_positions.currency = 'SC' THEN 'sc_balance' ELSE 'gc_balance' END;

      -- Add payout to user
      EXECUTE format('UPDATE users SET %I = %I + %L WHERE id = %L', v_balance_field, v_balance_field, v_payout, v_winning_positions.user_id);

      -- Mark position settled
      UPDATE positions SET
        is_settled = true,
        settled_at = NOW(),
        payout = v_payout,
        pnl = v_payout - stake
      WHERE id = v_winning_positions.id;

      -- Log payout transaction
      INSERT INTO transactions (user_id, type, amount, currency, market_id, position_id, status, metadata)
      VALUES (v_winning_positions.user_id, 'PAYOUT', v_payout, v_winning_positions.currency, p_market_id, v_winning_positions.id, 'completed',
        jsonb_build_object('outcome', p_outcome, 'original_stake', v_winning_positions.stake));

      v_total_payout := v_total_payout + v_payout;
      v_position_count := v_position_count + 1;
    END;
  END LOOP;

  -- Log protocol fee
  INSERT INTO transactions (user_id, type, amount, currency, market_id, status, metadata)
  VALUES (NULL, 'PROTOCOL_FEE', v_protocol_fee, 'SC', p_market_id, 'completed',
    jsonb_build_object('market_id', p_market_id, 'outcome', p_outcome, 'fee_type', 'protocol'));

  -- Log publisher fee
  INSERT INTO transactions (user_id, type, amount, currency, market_id, status, metadata)
  VALUES (NULL, 'PUBLISHER_FEE', v_publisher_fee, 'SC', p_market_id, 'completed',
    jsonb_build_object('market_id', p_market_id, 'outcome', p_outcome, 'fee_type', 'publisher'));

  RETURN jsonb_build_object(
    'market_id', p_market_id,
    'outcome', p_outcome,
    'winner_pool', v_winner_pool,
    'loser_pool', v_loser_pool,
    'protocol_fee', v_protocol_fee,
    'publisher_fee', v_publisher_fee,
    'total_payout', v_total_payout,
    'positions_paid', v_position_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION resolve_market TO authenticated;

-- ----------------------------------------------------------------------------
-- apply_referral_reward: Reward referrer when referred user deposits
-- Reward: 20 SC + 20,000 GC
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_referral_reward(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_deposit_amount NUMERIC DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_referral RECORD;
  v_sc_reward NUMERIC := 20;
  v_gc_reward NUMERIC := 20000;
BEGIN
  -- Check if referral exists and is pending
  SELECT * INTO v_referral FROM referrals
  WHERE referrer_id = p_referrer_id AND referred_user_id = p_referred_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Create new referral record
    INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status, reward_sc, reward_gold, deposit_amount, completed_at)
    VALUES (p_referrer_id, p_referred_id, 'REF' || substr(gen_random_uuid()::text, 1, 8), 'completed', v_sc_reward, v_gc_reward, p_deposit_amount, NOW())
    RETURNING * INTO v_referral;
  ELSIF v_referral.status = 'pending' THEN
    -- Update existing pending referral
    UPDATE referrals SET status = 'completed', deposit_amount = p_deposit_amount, completed_at = NOW()
    WHERE id = v_referral.id;
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Referral already completed');
  END IF;

  -- Award SC to referrer
  UPDATE users SET sc_balance = sc_balance + v_sc_reward WHERE id = p_referrer_id;

  -- Award GC to referrer
  UPDATE users SET gc_balance = gc_balance + v_gc_reward WHERE id = p_referrer_id;

  -- Log transactions
  INSERT INTO transactions (user_id, type, amount, currency, related_user_id, status, metadata)
  VALUES (p_referrer_id, 'REFERRAL_REWARD', v_sc_reward, 'SC', p_referred_id, 'completed',
    jsonb_build_object('referral_id', v_referral.id, 'reward_type', 'sc'));

  INSERT INTO transactions (user_id, type, amount, currency, related_user_id, status, metadata)
  VALUES (p_referrer_id, 'REFERRAL_REWARD', v_gc_reward, 'GOLD', p_referred_id, 'completed',
    jsonb_build_object('referral_id', v_referral.id, 'reward_type', 'gc'));

  RETURN jsonb_build_object(
    'success', true,
    'sc_reward', v_sc_reward,
    'gc_reward', v_gc_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION apply_referral_reward TO authenticated;

-- ----------------------------------------------------------------------------
-- add_gold_coins: Add GC to user balance (for purchases and bonuses)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_gold_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT ''
) RETURNS void AS $$
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

  UPDATE users SET gc_balance = gc_balance + p_amount WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, amount, currency, status, metadata)
  VALUES (p_user_id, 'PURCHASE', p_amount, 'GOLD', 'completed',
    jsonb_build_object('reason', p_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_gold_coins TO authenticated;

-- ----------------------------------------------------------------------------
-- redeem_kyc: Convert SC to USD via Stripe (KYC required)
-- Minimum: 50 SC for gift cards, 60 SC for USD
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION redeem_kyc(
  p_user_id UUID,
  p_amount NUMERIC,
  p_redemption_type TEXT DEFAULT 'gift_card' -- 'gift_card' or 'usd'
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_min_amount NUMERIC;
  v_usd_amount NUMERIC;
  v_redemption_id UUID;
BEGIN
  -- Check KYC status
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  IF v_user.kyc_status != 'verified' THEN RAISE EXCEPTION 'KYC verification required'; END IF;
  IF v_user.is_restricted THEN RAISE EXCEPTION 'Account is restricted'; END IF;

  -- Determine minimum based on type
  IF p_redemption_type = 'gift_card' THEN
    v_min_amount := COALESCE(NULLIF((SELECT value FROM site_config WHERE key = 'min_redeem_sc'), '')::numeric, 50);
  ELSE
    v_min_amount := COALESCE(NULLIF((SELECT value FROM site_config WHERE key = 'regular_redeem_sc'), '')::numeric, 60);
  END IF;

  IF p_amount < v_min_amount THEN
    RAISE EXCEPTION 'Minimum redemption is % SC for %', v_min_amount, p_redemption_type;
  END IF;

  -- Check balance
  IF v_user.sc_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient SC balance. Available: %', v_user.sc_balance;
  END IF;

  -- Calculate USD (1 SC = $0.10 USD)
  v_usd_amount := p_amount * 0.10;

  -- Deduct SC
  UPDATE users SET sc_balance = sc_balance - p_amount WHERE id = p_user_id;

  -- Create redemption record
  v_redemption_id := gen_random_uuid();
  INSERT INTO redemption_requests (id, user_id, amount, usd_amount, status, redemption_type, created_at)
  VALUES (v_redemption_id, p_user_id, p_amount, v_usd_amount, 'pending', p_redemption_type, NOW());

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, status, metadata)
  VALUES (p_user_id, 'KYC_REDEMPTION', p_amount, 'SC', 'pending',
    jsonb_build_object('redemption_id', v_redemption_id, 'usd_amount', v_usd_amount, 'type', p_redemption_type));

  RETURN jsonb_build_object(
    'redemption_id', v_redemption_id,
    'sc_amount', p_amount,
    'usd_amount', v_usd_amount,
    'status', 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION redeem_kyc TO authenticated;

-- ----------------------------------------------------------------------------
-- update_market_probability: Recalculate market odds based on pool ratio
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_market_probability(p_market_id TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_yes_pool NUMERIC;
  v_no_pool NUMERIC;
  v_probability NUMERIC;
BEGIN
  SELECT yes_pool, no_pool INTO v_yes_pool, v_no_pool FROM markets WHERE id = p_market_id;

  IF v_yes_pool + v_no_pool = 0 THEN
    v_probability := 0.5;
  ELSE
    v_probability := v_yes_pool / (v_yes_pool + v_no_pool);
  END IF;

  UPDATE markets SET current_probability = v_probability, updated_at = NOW() WHERE id = p_market_id;

  RETURN v_probability;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_market_probability TO authenticated;

-- ----------------------------------------------------------------------------
-- create_market: Create a new prediction market
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_market(
  p_market_id TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT '',
  p_category TEXT DEFAULT 'events',
  p_question TEXT,
  p_outcome_type TEXT DEFAULT 'binary',
  p_creator_id UUID,
  p_closes_at TIMESTAMPTZ DEFAULT NULL,
  p_resolves_at TIMESTAMPTZ DEFAULT NULL,
  p_initial_liquidity NUMERIC DEFAULT 10000
) RETURNS JSON AS $$
DECLARE
  v_house_fee NUMERIC;
  v_platform_fee NUMERIC;
BEGIN
  -- Get default fees from config
  v_house_fee := COALESCE(NULLIF((SELECT value FROM site_config WHERE key = 'default_house_fee'), '')::numeric, 2);
  v_platform_fee := COALESCE(NULLIF((SELECT value FROM site_config WHERE key = 'default_platform_fee'), '')::numeric, 1);

  INSERT INTO markets (id, title, description, category, question, outcome_type, creator_id, status, house_fee_percentage, platform_fee_percentage, yes_pool, no_pool, closes_at, resolves_at, current_probability)
  VALUES (p_market_id, p_title, p_description, p_category, p_question, p_outcome_type, p_creator_id, 'open', v_house_fee, v_platform_fee, p_initial_liquidity, p_initial_liquidity, p_closes_at, p_resolves_at, 0.5);

  -- Log transaction
  INSERT INTO transactions (user_id, type, amount, currency, market_id, status, metadata)
  VALUES (p_creator_id, 'MARKET_CREATE', p_initial_liquidity, 'SC', p_market_id, 'completed',
    jsonb_build_object('title', p_title, 'category', p_category, 'initial_liquidity', p_initial_liquidity));

  RETURN jsonb_build_object('market_id', p_market_id, 'status', 'open', 'initial_liquidity', p_initial_liquidity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_market TO authenticated;

-- ----------------------------------------------------------------------------
-- refund_market_positions: Refund all positions when market is cancelled
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refund_market_positions(p_market_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_position RECORD;
  v_total_refunded NUMERIC := 0;
  v_count INTEGER := 0;
BEGIN
  FOR v_position IN
    SELECT id, user_id, stake, currency FROM positions WHERE market_id = p_market_id AND is_settled = false
  LOOP
    DECLARE
      v_balance_field TEXT := CASE WHEN v_position.currency = 'SC' THEN 'sc_balance' ELSE 'gc_balance' END;
    BEGIN
      EXECUTE format('UPDATE users SET %I = %I + %L WHERE id = %L', v_balance_field, v_balance_field, v_position.stake, v_position.user_id);

      UPDATE positions SET is_settled = true, settled_at = NOW(), payout = stake, pnl = 0 WHERE id = v_position.id;

      INSERT INTO transactions (user_id, type, amount, currency, market_id, position_id, status, metadata)
      VALUES (v_position.user_id, 'REFUND', v_position.stake, v_position.currency, p_market_id, v_position.id, 'completed',
        jsonb_build_object('reason', 'market_cancelled'));

      v_total_refunded := v_total_refunded + v_position.stake;
      v_count := v_count + 1;
    END;
  END LOOP;

  RETURN jsonb_build_object('refunded_count', v_count, 'total_refunded', v_total_refunded);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION refund_market_positions TO authenticated;

-- ----------------------------------------------------------------------------
-- Helper functions for admin stats
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_total_volume_24h()
RETURNS NUMERIC AS $$
DECLARE
  v_volume NUMERIC;
BEGIN
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_volume
  FROM transactions
  WHERE type IN ('STAKE', 'PAYOUT') AND created_at > NOW() - INTERVAL '24 hours';
  RETURN v_volume;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_active_users_count(p_days INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO v_count
  FROM transactions
  WHERE created_at > NOW() - (p_days || ' days')::interval AND user_id IS NOT NULL;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_total_volume_24h TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_users_count TO authenticated;