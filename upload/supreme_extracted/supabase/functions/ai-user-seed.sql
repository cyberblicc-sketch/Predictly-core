-- ============================================================================
// AI User Seed Data
// Supreme Fusion Prediction Market
// Creates the system AI agent user for automated trading
// ============================================================================

-- ============================================================================
// Create AI Agent User
-- ============================================================================
-- This user is used by the AI Swarm system for automated trading decisions
-- ID is fixed for consistency across deployments
-- User is marked as system user (not human) with no auth provider

INSERT INTO users (
  id,
  email,
  name,
  handle,
  password_hash,
  auth_provider,
  gc_balance,
  sc_balance,
  kyc_status,
  user_tier,
  age_verified,
  is_admin,
  is_publisher,
  is_system_user,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ai-agent@supreme-fusion.system',
  'AI Trading Agent',
  'ai-trading-agent',
  NULL, -- No password needed for system user
  'email', -- Default auth provider
  0, -- No GC balance needed
  100000, -- Initial SC balance of 100,000 for trading
  'verified', -- Pre-verified KYC status
  'platinum', -- Highest tier for priority processing
  TRUE, -- Age verified (system account)
  FALSE, -- Not an admin
  FALSE, -- Not a publisher
  TRUE, -- IS a system user (for identification)
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  sc_balance = 100000, -- Reset to 100k on conflict (can be adjusted)
  updated_at = NOW();

-- ============================================================================
// Create AI Agent Publisher Profile (optional - for tracking)
-- ============================================================================
-- Only if publisher profile doesn't exist

INSERT INTO publishers (
  id,
  user_id,
  handle,
  bio,
  tier,
  warmth_score,
  total_earned,
  markets_created,
  referral_code,
  verified,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000001',
  'ai-agent',
  'Automated AI trading agent using Groq-powered decision making. Executes momentum, contrarian, arbitrage, and sentiment strategies across prediction markets.',
  'anchor',
  100,
  0,
  0,
  'AIAGENT' || SUBSTRING(REPLACE(uuid_generate_v4()::text, '-', ''), 1, 8),
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
// Set initial AI balance (if user already exists)
-- ============================================================================

UPDATE users 
SET sc_balance = 100000 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
// Add system user flag column if it doesn't exist
-- ============================================================================
-- This is a safety measure - if the column doesn't exist, the insert above will still work

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_system_user'
  ) THEN
    ALTER TABLE users ADD COLUMN is_system_user BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
EXCEPTION
  WHEN undefined_column THEN
    -- Column might already exist in a different syntax, ignore
    NULL;
END $$;

-- ============================================================================
// Grant necessary permissions
-- ============================================================================

-- Grant AI user access to necessary functions
GRANT EXECUTE ON FUNCTION process_stake TO authenticated;

-- Allow AI user to read markets
GRANT SELECT ON markets TO authenticated;

-- Allow AI user to insert trades
GRANT INSERT ON ai_agent_trades TO authenticated;

-- ============================================================================
// Verify AI user setup
-- ============================================================================

SELECT 
  id,
  email,
  name,
  sc_balance,
  gc_balance,
  is_system_user,
  created_at
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
// AI Swarm Configuration
-- ============================================================================
-- Store AI swarm settings in a config table for easy adjustment

CREATE TABLE IF NOT EXISTS ai_swarm_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
// Function to update AI swarm config
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ai_swarm_config(
  p_key TEXT,
  p_value TEXT
) RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = p_value, updated_at = NOW() WHERE key = p_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Function to get AI swarm config
-- ============================================================================

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
// Disable AI Swarm (kill switch)
-- ============================================================================

CREATE OR REPLACE FUNCTION disable_ai_swarm()
RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = 'false', updated_at = NOW() WHERE key = 'enabled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Enable AI Swarm
-- ============================================================================

CREATE OR REPLACE FUNCTION enable_ai_swarm()
RETURNS void AS $$
BEGIN
  UPDATE ai_swarm_config SET value = 'true', updated_at = NOW() WHERE key = 'enabled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
// Check if AI Swarm is enabled
-- ============================================================================

CREATE OR REPLACE FUNCTION is_ai_swarm_enabled()
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled TEXT;
BEGIN
  SELECT value INTO v_enabled FROM ai_swarm_config WHERE key = 'enabled';
  RETURN v_enabled = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;