-- ============================================================================
-- AI Swarm Cron Setup
-- Supreme Fusion Prediction Market
-- Schedules the AI Swarm Tick function to run every 5 minutes
-- ============================================================================

-- Enable pg_cron extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions for cron job execution
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON SCHEMA cron TO supabase_admin;

-- ============================================================================
-- Schedule: AI Swarm Tick (every 5 minutes)
-- ============================================================================
-- This cron job triggers the ai-swarm-tick Edge Function which:
-- 1. Fetches active markets
-- 2. Uses Groq API to generate agent decisions
-- 3. Executes up to 10 trades per tick
-- 4. Logs all trades to ai_agent_trades table

-- NOTE: Replace 'your-project-ref' and 'your-service-role-key' with actual values
-- The service role key is used for authentication to the Edge Function

SELECT cron.schedule(
  'ai-swarm-tick',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/ai-swarm-tick',
    headers := '{"Authorization": "Bearer your-service-role-key", "Content-Type": "application/json"}'
  );
  $$
);

-- ============================================================================
-- Verify scheduled jobs
-- ============================================================================
-- View all scheduled cron jobs
SELECT * FROM cron.job ORDER BY jobname;

-- ============================================================================
-- Manual Control Functions
-- ============================================================================

-- Stop AI Swarm (pause the cron job)
CREATE OR REPLACE FUNCTION pause_ai_swarm()
RETURNS void AS $$
BEGIN
  PERFORM cron.unschedule('ai-swarm-tick');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resume AI Swarm (restart the cron job)
CREATE OR REPLACE FUNCTION resume_ai_swarm()
RETURNS void AS $$
BEGIN
  SELECT cron.schedule(
    'ai-swarm-tick',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/ai-swarm-tick',
      headers := '{"Authorization": "Bearer your-service-role-key", "Content-Type": "application/json"}'
    );
    $$
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if AI Swarm is running
CREATE OR REPLACE FUNCTION is_ai_swarm_running()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'ai-swarm-tick'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AI Daily Spending Limit Tracking
-- ============================================================================
-- Track daily spending per agent to enforce 50k SC/day limit

CREATE TABLE IF NOT EXISTS ai_daily_spending (
  id SERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_name, date)
);

-- Function to check and update daily spending
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

-- Function to record AI spending
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
-- Cleanup old spending records (keep last 90 days)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_ai_spending()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_daily_spending WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;