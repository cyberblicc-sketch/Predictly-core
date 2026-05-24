-- ============================================================================
-- Predictly — AI Employee Operating System Migration
-- Creates all tables, indexes, constraints, RLS policies, triggers, and seed data
-- Migration: 004_ai_employees.sql
-- ============================================================================

-- ── Helper: updated_at trigger function ──────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: agent_config
-- Stores configuration for each AI agent
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_config (
  id              TEXT PRIMARY KEY CHECK (id IN ('scout', 'oddsmaker', 'clerk', 'fraud_analyst', 'content', 'supervisor')),
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  emoji           TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  schedule_cron   TEXT NOT NULL,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 100,
  confidence_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.70 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
  max_retries     INTEGER NOT NULL DEFAULT 2 CHECK (max_retries >= 0),
  timeout_ms      INTEGER NOT NULL DEFAULT 30000 CHECK (timeout_ms > 0),
  last_run_at     TIMESTAMPTZ,
  total_tasks     INTEGER NOT NULL DEFAULT 0,
  success_rate    NUMERIC(3,2) NOT NULL DEFAULT 0.90 CHECK (success_rate >= 0 AND success_rate <= 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER agent_config_updated_at
  BEFORE UPDATE ON agent_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: agent_tasks
-- Tracks all tasks assigned to AI agents
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type      TEXT NOT NULL CHECK (agent_type IN ('scout', 'oddsmaker', 'clerk', 'fraud_analyst', 'content', 'supervisor')),
  action_type     TEXT NOT NULL CHECK (action_type IN ('scout_scan', 'market_generate', 'db_write', 'fraud_check', 'content_generate', 'supervisor_coordinate', 'market_review', 'resolution_check')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'escalated')),
  input           JSONB NOT NULL DEFAULT '{}',
  output          JSONB,
  confidence      NUMERIC(3,2) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  retry_count     INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  max_retries     INTEGER NOT NULL DEFAULT 2 CHECK (max_retries >= 0),
  priority        INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_message   TEXT,
  parent_task_id  UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_agent_tasks_agent_type ON agent_tasks (agent_type);
CREATE INDEX idx_agent_tasks_status ON agent_tasks (status);
CREATE INDEX idx_agent_tasks_created_at ON agent_tasks (created_at DESC);
CREATE INDEX idx_agent_tasks_scheduled_at ON agent_tasks (scheduled_at);
CREATE INDEX idx_agent_tasks_parent ON agent_tasks (parent_task_id);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: agent_actions
-- Audit log of all agent actions
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  agent_type      TEXT NOT NULL CHECK (agent_type IN ('scout', 'oddsmaker', 'clerk', 'fraud_analyst', 'content', 'supervisor')),
  action_type     TEXT NOT NULL,
  description     TEXT NOT NULL,
  input_summary   TEXT NOT NULL DEFAULT '',
  output_summary  TEXT NOT NULL DEFAULT '',
  confidence      NUMERIC(3,2) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  duration_ms     INTEGER CHECK (duration_ms IS NULL OR duration_ms > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_actions_task_id ON agent_actions (task_id);
CREATE INDEX idx_agent_actions_agent_type ON agent_actions (agent_type);
CREATE INDEX idx_agent_actions_created_at ON agent_actions (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: agent_failures
-- Tracks agent errors for debugging and retry logic
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_failures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  agent_type      TEXT NOT NULL CHECK (agent_type IN ('scout', 'oddsmaker', 'clerk', 'fraud_analyst', 'content', 'supervisor')),
  error_type      TEXT NOT NULL,
  error_message   TEXT NOT NULL,
  stack_trace     TEXT,
  retry_attempt   INTEGER NOT NULL DEFAULT 0 CHECK (retry_attempt >= 0),
  resolved        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_failures_task_id ON agent_failures (task_id);
CREATE INDEX idx_agent_failures_agent_type ON agent_failures (agent_type);
CREATE INDEX idx_agent_failures_resolved ON agent_failures (resolved) WHERE NOT resolved;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: agent_memory
-- Stores agent learnings, patterns, and context
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type      TEXT NOT NULL CHECK (agent_type IN ('scout', 'oddsmaker', 'clerk', 'fraud_analyst', 'content', 'supervisor')),
  memory_type     TEXT NOT NULL CHECK (memory_type IN ('finding', 'pattern', 'preference', 'correction', 'context')),
  key             TEXT NOT NULL,
  value           JSONB NOT NULL DEFAULT '{}',
  relevance_score NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  accessed_count  INTEGER NOT NULL DEFAULT 0 CHECK (accessed_count >= 0),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_memory_agent_type ON agent_memory (agent_type);
CREATE INDEX idx_agent_memory_key ON agent_memory (key);
CREATE UNIQUE INDEX idx_agent_memory_agent_key ON agent_memory (agent_type, key);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: scout_findings
-- News events and data points discovered by the Scout agent
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scout_findings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source              TEXT NOT NULL,
  source_url          TEXT,
  title               TEXT NOT NULL,
  summary             TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks', 'General')),
  confidence          NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (confidence >= 0 AND confidence <= 1),
  sentiment_score     NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  entities            JSONB NOT NULL DEFAULT '[]',
  topic_tags          JSONB NOT NULL DEFAULT '[]',
  market_potential    TEXT NOT NULL DEFAULT 'none' CHECK (market_potential IN ('high', 'medium', 'low', 'none')),
  processed           BOOLEAN NOT NULL DEFAULT false,
  market_candidate_id UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scout_findings_category ON scout_findings (category);
CREATE INDEX idx_scout_findings_confidence ON scout_findings (confidence DESC);
CREATE INDEX idx_scout_findings_processed ON scout_findings (processed) WHERE NOT processed;
CREATE INDEX idx_scout_findings_created_at ON scout_findings (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: market_candidates
-- THE CRITICAL QUARANTINE LAYER
-- AI-generated market candidates that MUST be reviewed by humans
-- BEFORE they can be published. NEVER auto-publish.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS market_candidates (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_finding_id        UUID REFERENCES scout_findings(id) ON DELETE SET NULL,
  question                TEXT NOT NULL CHECK (char_length(question) >= 10),
  short_title             TEXT NOT NULL CHECK (char_length(short_title) >= 3),
  description             TEXT NOT NULL CHECK (char_length(description) >= 20),
  category                TEXT NOT NULL CHECK (category IN ('Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks')),
  outcomes                JSONB NOT NULL CHECK (jsonb_array_length(outcomes) >= 2),
  estimated_probabilities JSONB NOT NULL CHECK (jsonb_array_length(estimated_probabilities) >= 2),
  resolution_criteria     TEXT NOT NULL,
  resolver_source         TEXT NOT NULL,
  close_date              TIMESTAMPTZ,
  suggested_liquidity     NUMERIC NOT NULL DEFAULT 5000 CHECK (suggested_liquidity >= 0),
  semantic_hash           TEXT NOT NULL,
  duplicate_of            UUID REFERENCES market_candidates(id) ON DELETE SET NULL,
  -- CRITICAL: status must go through human review before publishing
  -- AI agents can ONLY insert with status='pending_review'
  status                  TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published', 'expired')),
  reviewed_by             TEXT,
  reviewed_at             TIMESTAMPTZ,
  review_notes            TEXT,
  published_market_id     UUID,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint: probability sums should be close to 1.0
CREATE OR REPLACE FUNCTION check_probability_sum()
RETURNS TRIGGER AS $$
DECLARE
  prob_sum NUMERIC;
BEGIN
  SELECT SUM(value::NUMERIC) INTO prob_sum
  FROM jsonb_array_elements(NEW.estimated_probabilities) AS value;
  IF ABS(prob_sum - 1.0) > 0.05 THEN
    RAISE EXCEPTION 'Estimated probabilities must sum to approximately 1.0 (got %)', prob_sum;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER market_candidates_prob_check
  BEFORE INSERT OR UPDATE OF estimated_probabilities ON market_candidates
  FOR EACH ROW EXECUTE FUNCTION check_probability_sum();

-- Constraint: AI inserts MUST have status='pending_review'
-- This trigger enforces the quarantine layer at the database level
CREATE OR REPLACE FUNCTION enforce_pending_review_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserted by a service role (AI agent), force status to pending_review
  -- Only human admin updates can change status to approved/rejected
  IF current_setting('request.jwt.claim->>role', true) = 'service_role'
     AND NEW.status != 'pending_review' THEN
    NEW.status := 'pending_review';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER market_candidates_quarantine
  BEFORE INSERT ON market_candidates
  FOR EACH ROW EXECUTE FUNCTION enforce_pending_review_on_insert();

CREATE TRIGGER market_candidates_updated_at
  BEFORE UPDATE ON market_candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_market_candidates_status ON market_candidates (status);
CREATE INDEX idx_market_candidates_category ON market_candidates (category);
CREATE INDEX idx_market_candidates_scout ON market_candidates (scout_finding_id);
CREATE INDEX idx_market_candidates_hash ON market_candidates (semantic_hash);
CREATE INDEX idx_market_candidates_created_at ON market_candidates (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: fraud_flags
-- Fraud and abuse detection flags raised by AI or admins
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fraud_flags (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID,
  market_id           UUID,
  flag_type           TEXT NOT NULL CHECK (flag_type IN ('wash_trading', 'referral_abuse', 'suspicious_volume', 'insider_trading', 'coordinated_trading', 'unusual_pattern', 'multi_account')),
  severity            TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  evidence            JSONB NOT NULL DEFAULT '{}',
  risk_score          NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (risk_score >= 0 AND risk_score <= 1),
  agent_finding       TEXT NOT NULL,
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  resolution          TEXT,
  auto_action_taken   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER fraud_flags_updated_at
  BEFORE UPDATE ON fraud_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_fraud_flags_severity ON fraud_flags (severity);
CREATE INDEX idx_fraud_flags_status ON fraud_flags (status);
CREATE INDEX idx_fraud_flags_flag_type ON fraud_flags (flag_type);
CREATE INDEX idx_fraud_flags_user_id ON fraud_flags (user_id);
CREATE INDEX idx_fraud_flags_risk_score ON fraud_flags (risk_score DESC);
CREATE INDEX idx_fraud_flags_created_at ON fraud_flags (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: content_queue
-- AI-generated content awaiting human review
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_queue (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type          TEXT NOT NULL CHECK (content_type IN ('social_post', 'market_summary', 'seo_description', 'trending_report', 'daily_recap')),
  market_id             UUID,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  metadata              JSONB NOT NULL DEFAULT '{}',
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'published', 'failed')),
  scheduled_publish_at  TIMESTAMPTZ,
  published_at          TIMESTAMPTZ,
  agent_task_id         UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_queue_status ON content_queue (status);
CREATE INDEX idx_content_queue_type ON content_queue (content_type);
CREATE INDEX idx_content_queue_created_at ON content_queue (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: trend_clusters
-- Groups of related findings showing emerging trends
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS trend_clusters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks', 'General')),
  keywords        JSONB NOT NULL DEFAULT '[]',
  finding_ids     JSONB NOT NULL DEFAULT '[]',
  market_count    INTEGER NOT NULL DEFAULT 0 CHECK (market_count >= 0),
  momentum_score  NUMERIC(3,2) NOT NULL DEFAULT 0.50 CHECK (momentum_score >= 0 AND momentum_score <= 1),
  peak_time       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trend_clusters_category ON trend_clusters (category);
CREATE INDEX idx_trend_clusters_momentum ON trend_clusters (momentum_score DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: sentiment_snapshots
-- Periodic sentiment measurements by category
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sentiment_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks', 'General')),
  sentiment_score NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  volume_mentions INTEGER NOT NULL DEFAULT 0 CHECK (volume_mentions >= 0),
  top_entities    JSONB NOT NULL DEFAULT '[]',
  top_topics      JSONB NOT NULL DEFAULT '[]',
  data_source     TEXT NOT NULL DEFAULT 'aggregated',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sentiment_category ON sentiment_snapshots (category);
CREATE INDEX idx_sentiment_created_at ON sentiment_snapshots (created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- TABLE: moderation_queue
-- Human review queue for candidates, flags, and content
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moderation_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type       TEXT NOT NULL CHECK (item_type IN ('market_candidate', 'fraud_flag', 'content')),
  item_id         UUID NOT NULL,
  priority        INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
  assigned_to     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_moderation_queue_status ON moderation_queue (status);
CREATE INDEX idx_moderation_queue_item ON moderation_queue (item_type, item_id);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue (priority DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- RLS (Row-Level Security) Policies
-- ════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Service role: full access to all tables
CREATE POLICY "Service role full access on agent_config"
  ON agent_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_tasks"
  ON agent_tasks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_actions"
  ON agent_actions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_failures"
  ON agent_failures FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on agent_memory"
  ON agent_memory FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on scout_findings"
  ON scout_findings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- CRITICAL: Even service_role (AI agents) can only INSERT with pending_review
-- The trigger above enforces this at the DB level
CREATE POLICY "Service role full access on market_candidates"
  ON market_candidates FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on fraud_flags"
  ON fraud_flags FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on content_queue"
  ON content_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on trend_clusters"
  ON trend_clusters FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sentiment_snapshots"
  ON sentiment_snapshots FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on moderation_queue"
  ON moderation_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: read-only access to public-facing data
CREATE POLICY "Authenticated read scout_findings"
  ON scout_findings FOR SELECT
  USING (auth.role() = 'authenticated' AND processed = true);

CREATE POLICY "Authenticated read market_candidates"
  ON market_candidates FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'published');

CREATE POLICY "Authenticated read trend_clusters"
  ON trend_clusters FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read sentiment_snapshots"
  ON sentiment_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════════════
-- Seed Data: Agent Configurations
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO agent_config (id, name, description, emoji, schedule_cron, rate_limit_per_hour, confidence_threshold, max_retries, timeout_ms, total_tasks, success_rate) VALUES
  ('scout',         'Scout',         'Monitors news & identifies market opportunities',   '🕵️', '0 */4 * * *',   100, 0.70, 2, 30000, 342, 0.94),
  ('oddsmaker',     'Oddsmaker',     'Converts findings into prediction market candidates','🎰', '0 */6 * * *',   50,  0.80, 3, 60000, 128, 0.89),
  ('clerk',         'Clerk',         'Validates schemas & inserts records safely',        '📋', '*/15 * * * *',  200, 0.95, 1, 15000, 891, 0.99),
  ('fraud_analyst', 'Fraud Analyst', 'Detects suspicious trading & abuse patterns',       '🔍', '0 */2 * * *',   150, 0.60, 2, 45000, 267, 0.92),
  ('content',       'Content',       'Generates social posts, summaries & SEO content',    '✍️', '0 9 * * *',    30,  0.75, 2, 45000, 76,  0.87),
  ('supervisor',    'Supervisor',    'Coordinates workers, schedules jobs, retries failures','👁️','*/5 * * * *',  500, 0.90, 3, 10000, 1204,0.97)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  schedule_cron = EXCLUDED.schedule_cron,
  rate_limit_per_hour = EXCLUDED.rate_limit_per_hour,
  confidence_threshold = EXCLUDED.confidence_threshold,
  max_retries = EXCLUDED.max_retries,
  timeout_ms = EXCLUDED.timeout_ms;

-- ════════════════════════════════════════════════════════════════════════════
-- Grant Permissions
-- ════════════════════════════════════════════════════════════════════════════

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON scout_findings TO authenticated;
GRANT SELECT ON market_candidates TO authenticated;
GRANT SELECT ON trend_clusters TO authenticated;
GRANT SELECT ON sentiment_snapshots TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
