-- ============================================================================
// AI Swarm System Migration
// Supreme Fusion Prediction Market
// Adds AI-specific tables and columns for automated trading
// ============================================================================

-- ============================================================================
// Add is_system_user column to users table
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_user BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_system ON users(is_system_user) WHERE is_system_user = TRUE;

-- ============================================================================
// AI Daily Spending Tracking Table
-- Track daily spending per agent to enforce 50k SC/day limit
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_daily_spending (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_name, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_spending_agent ON ai_daily_spending(agent_name);
CREATE INDEX IF NOT EXISTS idx_ai_daily_spending_date ON ai_daily_spending(date);

-- ============================================================================
// AI Swarm Configuration Table
// Store AI swarm settings for easy adjustment without code changes
// ============================================================================

CREATE TABLE IF NOT EXISTS ai_swarm_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default configuration values
INSERT INTO ai_swarm_config (key, value, description) VALUES
  ('enabled', 'true', 'Enable or disable AI trading'),
  ('max_trades_per_tick', '10', 'Maximum trades to execute per 5-minute tick'),
  ('max_markets_per_tick', '20', 'Maximum markets to analyze per tick'),
  ('budget_per_agent_per_tick', '1000', 'SC budget per agent per tick'),
  ('max_per_agent_per_day', '50000', 'Maximum SC per agent per day'),
  ('min_confidence_threshold', '0.7', 'Minimum confidence to execute trade'),
  ('min_hours_until_expiry', '1', 'Skip markets resolving within this many hours'),
  ('ai_user_id', '00000000-0000-0000-0000-000000000001', 'User ID for AI trades')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================================
// AI Daily Limit Check Function
-- ============================================================================

CREATE OR REPLACE FUNCTION check_ai_daily_limit(
  p_agent_name TEXT,
  p_amount NUMERIC
) RETURNS boolean AS $$
DECLARE
  v_today_spent NUMERIC;
  v_max_daily NUMERIC := 50000;
BEGIN
  SELECT COALESCE(total_amount, 0) INTO v_today_spent
  FROM ai_daily_spending
  WHERE agent_name = p_agent_name AND date = CURRENT_DATE;

  RETURN (v_today_spent + p_amount) <= v_max_daily;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Record AI Spending Function
-- ============================================================================

CREATE OR REPLACE FUNCTION record_ai_spending(
  p_agent_name TEXT,
  p_amount NUMERIC
) RETURNS void AS $$
BEGIN
  INSERT INTO ai_daily_spending (agent_name, date, total_amount, trade_count, last_updated)
  VALUES (p_agent_name, CURRENT_DATE, p_amount, 1, NOW())
  ON CONFLICT (agent_name, date)
  DO UPDATE SET
    total_amount = ai_daily_spending.total_amount + p_amount,
    trade_count = ai_daily_spending.trade_count + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// AI Swarm Control Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION disable_ai_swarm()
RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = 'false', updated_at = NOW() WHERE key = 'enabled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION enable_ai_swarm()
RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = 'true', updated_at = NOW() WHERE key = 'enabled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_ai_swarm_enabled()
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled TEXT;
BEGIN
  SELECT value INTO v_enabled FROM ai_swarm_config WHERE key = 'enabled';
  RETURN v_enabled = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_ai_swarm_config(
  p_key TEXT,
  p_value TEXT
) RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = p_value, updated_at = NOW() WHERE key = p_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_ai_swarm_config(p_key TEXT)
RETURNS TEXT AS $$
DECLARE
  v_value TEXT;
BEGIN
  SELECT value INTO v_value FROM ai_swarm_config WHERE key = p_key;
  RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Cleanup old spending records (keep last 90 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_ai_spending()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_daily_spending WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Grant permissions for AI functions
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_ai_daily_limit TO authenticated;
GRANT EXECUTE ON FUNCTION record_ai_spending TO authenticated;
GRANT EXECUTE ON FUNCTION disable_ai_swarm TO authenticated;
GRANT EXECUTE ON FUNCTION enable_ai_swarm TO authenticated;
GRANT EXECUTE ON FUNCTION is_ai_swarm_enabled TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_swarm_config TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_swarm_config TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_ai_spending TO authenticated;

GRANT SELECT ON ai_daily_spending TO authenticated;
GRANT SELECT ON ai_swarm_config TO authenticated;