// ============================================================================
// Predictly — AI Employee Operating System
// Core utility library with agent configs, mock data, and helper functions
// ============================================================================

import type {
  AgentType,
  AgentConfig,
  AgentTask,
  AgentAction,
  AgentFailure,
  AgentMemory,
  ScoutFinding,
  MarketCandidate,
  FraudFlag,
  ContentQueue,
  TrendCluster,
  SentimentSnapshot,
  ModerationQueue,
  Category,
} from '@/types'

// ── Agent Configurations ─────────────────────────────────────────────────────

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  scout: {
    id: 'scout',
    name: 'Scout',
    description: 'Monitors news & identifies market opportunities',
    emoji: '🕵️',
    enabled: true,
    schedule_cron: '0 */4 * * *',
    rate_limit_per_hour: 100,
    confidence_threshold: 0.7,
    max_retries: 2,
    timeout_ms: 30_000,
    last_run_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    total_tasks: 342,
    success_rate: 0.94,
  },
  oddsmaker: {
    id: 'oddsmaker',
    name: 'Oddsmaker',
    description: 'Converts findings into prediction market candidates',
    emoji: '🎰',
    enabled: true,
    schedule_cron: '0 */6 * * *',
    rate_limit_per_hour: 50,
    confidence_threshold: 0.8,
    max_retries: 3,
    timeout_ms: 60_000,
    last_run_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    total_tasks: 128,
    success_rate: 0.89,
  },
  clerk: {
    id: 'clerk',
    name: 'Clerk',
    description: 'Validates schemas & inserts records safely',
    emoji: '📋',
    enabled: true,
    schedule_cron: '*/15 * * * *',
    rate_limit_per_hour: 200,
    confidence_threshold: 0.95,
    max_retries: 1,
    timeout_ms: 15_000,
    last_run_at: new Date(Date.now() - 10 * 60_000).toISOString(),
    total_tasks: 891,
    success_rate: 0.99,
  },
  fraud_analyst: {
    id: 'fraud_analyst',
    name: 'Fraud Analyst',
    description: 'Detects suspicious trading & abuse patterns',
    emoji: '🔍',
    enabled: true,
    schedule_cron: '0 */2 * * *',
    rate_limit_per_hour: 150,
    confidence_threshold: 0.6,
    max_retries: 2,
    timeout_ms: 45_000,
    last_run_at: new Date(Date.now() - 90 * 60_000).toISOString(),
    total_tasks: 267,
    success_rate: 0.92,
  },
  content: {
    id: 'content',
    name: 'Content',
    description: 'Generates social posts, summaries & SEO content',
    emoji: '✍️',
    enabled: true,
    schedule_cron: '0 9 * * *',
    rate_limit_per_hour: 30,
    confidence_threshold: 0.75,
    max_retries: 2,
    timeout_ms: 45_000,
    last_run_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    total_tasks: 76,
    success_rate: 0.87,
  },
  supervisor: {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Coordinates workers, schedules jobs, retries failures',
    emoji: '👁️',
    enabled: true,
    schedule_cron: '*/5 * * * *',
    rate_limit_per_hour: 500,
    confidence_threshold: 0.9,
    max_retries: 3,
    timeout_ms: 10_000,
    last_run_at: new Date(Date.now() - 3 * 60_000).toISOString(),
    total_tasks: 1204,
    success_rate: 0.97,
  },
}

// ── Mock Agent Tasks (20 samples) ───────────────────────────────────────────

export const MOCK_AGENT_TASKS: AgentTask[] = [
  {
    id: 'task-001',
    agent_type: 'scout',
    action_type: 'scout_scan',
    status: 'completed',
    input: { source: 'news_api', query: 'Federal Reserve policy' },
    output: { findings_count: 3, top_category: 'Economics' },
    confidence: 0.85,
    retry_count: 0,
    max_retries: 2,
    priority: 5,
    scheduled_at: new Date(Date.now() - 50 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 48 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 50 * 60_000).toISOString(),
  },
  {
    id: 'task-002',
    agent_type: 'oddsmaker',
    action_type: 'market_generate',
    status: 'completed',
    input: { finding_id: 'sf-001', category: 'Crypto' },
    output: { candidate_id: 'mc-001', probability_set: [0.65, 0.35] },
    confidence: 0.82,
    retry_count: 0,
    max_retries: 3,
    priority: 4,
    scheduled_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 118 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 115 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: 'task-001',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'task-003',
    agent_type: 'clerk',
    action_type: 'db_write',
    status: 'completed',
    input: { table: 'market_candidates', record_id: 'mc-001' },
    output: { inserted: true, validation_passed: true },
    confidence: 0.98,
    retry_count: 0,
    max_retries: 1,
    priority: 6,
    scheduled_at: new Date(Date.now() - 114 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 114 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 113 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: 'task-002',
    created_at: new Date(Date.now() - 114 * 60_000).toISOString(),
  },
  {
    id: 'task-004',
    agent_type: 'fraud_analyst',
    action_type: 'fraud_check',
    status: 'completed',
    input: { user_id: 'u-7823', time_window: '24h' },
    output: { flags_found: 1, risk_score: 0.78 },
    confidence: 0.72,
    retry_count: 0,
    max_retries: 2,
    priority: 7,
    scheduled_at: new Date(Date.now() - 95 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 93 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 90 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 95 * 60_000).toISOString(),
  },
  {
    id: 'task-005',
    agent_type: 'content',
    action_type: 'content_generate',
    status: 'completed',
    input: { content_type: 'daily_recap', date: '2026-05-23' },
    output: { content_id: 'cq-005', word_count: 342 },
    confidence: 0.8,
    retry_count: 0,
    max_retries: 2,
    priority: 3,
    scheduled_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 300 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 297 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: 'task-006',
    agent_type: 'supervisor',
    action_type: 'supervisor_coordinate',
    status: 'completed',
    input: { action: 'retry_failed', target_task: 'task-007' },
    output: { retried: true, new_task_id: 'task-014' },
    confidence: 0.95,
    retry_count: 0,
    max_retries: 3,
    priority: 8,
    scheduled_at: new Date(Date.now() - 10 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 10 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 9 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
  {
    id: 'task-007',
    agent_type: 'scout',
    action_type: 'scout_scan',
    status: 'failed',
    input: { source: 'twitter_api', query: 'election polls' },
    output: null,
    confidence: null,
    retry_count: 2,
    max_retries: 2,
    priority: 4,
    scheduled_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 180 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 178 * 60_000).toISOString(),
    error_message: 'Twitter API rate limit exceeded. Retry limit reached.',
    parent_task_id: null,
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'task-008',
    agent_type: 'oddsmaker',
    action_type: 'market_generate',
    status: 'running',
    input: { finding_id: 'sf-004', category: 'Politics' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 3,
    priority: 5,
    scheduled_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 1 * 60_000).toISOString(),
    completed_at: null,
    error_message: null,
    parent_task_id: 'task-001',
    created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    id: 'task-009',
    agent_type: 'clerk',
    action_type: 'db_write',
    status: 'pending',
    input: { table: 'market_candidates', record_id: 'mc-004' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 1,
    priority: 6,
    scheduled_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    started_at: null,
    completed_at: null,
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 1 * 60_000).toISOString(),
  },
  {
    id: 'task-010',
    agent_type: 'fraud_analyst',
    action_type: 'fraud_check',
    status: 'pending',
    input: { market_id: 'm-btc-200k', check_type: 'volume_anomaly' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 2,
    priority: 7,
    scheduled_at: new Date(Date.now() + 3 * 60_000).toISOString(),
    started_at: null,
    completed_at: null,
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'task-011',
    agent_type: 'scout',
    action_type: 'scout_scan',
    status: 'completed',
    input: { source: 'reddit_api', query: 'crypto trends' },
    output: { findings_count: 5, top_category: 'Crypto' },
    confidence: 0.79,
    retry_count: 0,
    max_retries: 2,
    priority: 4,
    scheduled_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 360 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 357 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'task-012',
    agent_type: 'content',
    action_type: 'content_generate',
    status: 'pending',
    input: { content_type: 'social_post', market_id: 'm-fed-cut-jun' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 2,
    priority: 3,
    scheduled_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    started_at: null,
    completed_at: null,
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
  {
    id: 'task-013',
    agent_type: 'supervisor',
    action_type: 'supervisor_coordinate',
    status: 'running',
    input: { action: 'schedule_next_batch' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 3,
    priority: 9,
    scheduled_at: new Date(Date.now() - 1 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 0.5 * 60_000).toISOString(),
    completed_at: null,
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 1 * 60_000).toISOString(),
  },
  {
    id: 'task-014',
    agent_type: 'scout',
    action_type: 'scout_scan',
    status: 'completed',
    input: { source: 'news_api', query: 'election polls 2028' },
    output: { findings_count: 2, top_category: 'Politics' },
    confidence: 0.88,
    retry_count: 0,
    max_retries: 2,
    priority: 4,
    scheduled_at: new Date(Date.now() - 8 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 7 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: 'task-006',
    created_at: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
  {
    id: 'task-015',
    agent_type: 'oddsmaker',
    action_type: 'market_review',
    status: 'completed',
    input: { candidate_id: 'mc-003' },
    output: { reviewed: true, semantic_hash_match: false },
    confidence: 0.91,
    retry_count: 0,
    max_retries: 3,
    priority: 5,
    scheduled_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 240 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 238 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'task-016',
    agent_type: 'fraud_analyst',
    action_type: 'fraud_check',
    status: 'escalated',
    input: { user_id: 'u-4521', flag_type: 'multi_account' },
    output: { risk_score: 0.92, linked_accounts: 4 },
    confidence: 0.68,
    retry_count: 1,
    max_retries: 2,
    priority: 9,
    scheduled_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 120 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 118 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'task-017',
    agent_type: 'clerk',
    action_type: 'resolution_check',
    status: 'completed',
    input: { market_id: 'm-super-bowl-lix', resolution_source: 'ESPN' },
    output: { resolved: true, outcome: 'Eagles Win' },
    confidence: 0.99,
    retry_count: 0,
    max_retries: 1,
    priority: 8,
    scheduled_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 480 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 479 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'task-018',
    agent_type: 'content',
    action_type: 'content_generate',
    status: 'failed',
    input: { content_type: 'seo_description', market_ids: ['m-btc-200k'] },
    output: null,
    confidence: null,
    retry_count: 2,
    max_retries: 2,
    priority: 2,
    scheduled_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
    started_at: new Date(Date.now() - 60 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 58 * 60_000).toISOString(),
    error_message: 'LLM API timeout. Content generation exceeded 45s limit.',
    parent_task_id: null,
    created_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
  {
    id: 'task-019',
    agent_type: 'supervisor',
    action_type: 'supervisor_coordinate',
    status: 'completed',
    input: { action: 'health_check', agents: ['all'] },
    output: { healthy_agents: 6, degraded_agents: 0 },
    confidence: 0.99,
    retry_count: 0,
    max_retries: 3,
    priority: 10,
    scheduled_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    started_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    completed_at: new Date(Date.now() - 14 * 60_000).toISOString(),
    error_message: null,
    parent_task_id: null,
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: 'task-020',
    agent_type: 'oddsmaker',
    action_type: 'market_generate',
    status: 'cancelled',
    input: { finding_id: 'sf-009', category: 'Pop Culture' },
    output: null,
    confidence: null,
    retry_count: 0,
    max_retries: 3,
    priority: 2,
    scheduled_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    started_at: null,
    completed_at: null,
    error_message: 'Cancelled by supervisor: duplicate market candidate detected',
    parent_task_id: null,
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
]

// ── Mock Scout Findings (10 samples) ────────────────────────────────────────

export const MOCK_SCOUT_FINDINGS: ScoutFinding[] = [
  {
    id: 'sf-001',
    source: 'Reuters',
    source_url: 'https://reuters.com/article/fed-rate-decision-2026',
    title: 'Federal Reserve Signals Rate Cut in June Meeting',
    summary: 'Fed Chair hints at potential rate reduction amid cooling inflation data. Markets pricing in 78% probability of 25bps cut.',
    category: 'Economics',
    confidence: 0.92,
    sentiment_score: 0.65,
    entities: ['Federal Reserve', 'Jerome Powell'],
    topic_tags: ['interest rates', 'inflation', 'monetary policy'],
    market_potential: 'high',
    processed: true,
    market_candidate_id: 'mc-001',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'sf-002',
    source: 'CoinDesk',
    source_url: 'https://coindesk.com/bitcoin-etf-record-inflows',
    title: 'Bitcoin ETF Records $2.1B Single-Day Inflows',
    summary: 'BlackRock IBIT ETF sees record institutional inflows, pushing BTC price above $150K for first time.',
    category: 'Crypto',
    confidence: 0.88,
    sentiment_score: 0.82,
    entities: ['Bitcoin', 'BlackRock', 'IBIT'],
    topic_tags: ['bitcoin', 'ETF', 'institutional'],
    market_potential: 'high',
    processed: true,
    market_candidate_id: 'mc-002',
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'sf-003',
    source: 'AP News',
    source_url: 'https://apnews.com/article/spacex-starship-orbit',
    title: 'SpaceX Starship Completes First Orbital Flight Successfully',
    summary: 'Starship reaches orbit on third attempt, with booster successfully returning to launch pad. Mars timeline accelerated.',
    category: 'Tech',
    confidence: 0.95,
    sentiment_score: 0.91,
    entities: ['SpaceX', 'Starship', 'NASA'],
    topic_tags: ['space', 'rocket', 'Mars'],
    market_potential: 'high',
    processed: true,
    market_candidate_id: 'mc-003',
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'sf-004',
    source: 'FiveThirtyEight',
    source_url: 'https://fivethirtyeight.com/2028-senate-map',
    title: '2028 Senate Map Favors Democrats in Early Projections',
    summary: 'Early electoral analysis suggests Democrats could flip 3-4 Senate seats in 2028 midterms based on current polling.',
    category: 'Politics',
    confidence: 0.74,
    sentiment_score: 0.45,
    entities: ['Senate', 'DNC', 'RNC'],
    topic_tags: ['elections', 'Senate', '2028'],
    market_potential: 'high',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'sf-005',
    source: 'ESPN',
    source_url: 'https://espn.com/nba/draft-prospects-2026',
    title: 'Cooper Flagg Declares for 2026 NBA Draft',
    summary: 'Duke superstar Cooper Flagg officially declares for the draft, expected to be #1 overall pick by multiple mock drafts.',
    category: 'Sports',
    confidence: 0.97,
    sentiment_score: 0.7,
    entities: ['Cooper Flagg', 'NBA', 'Duke'],
    topic_tags: ['NBA', 'draft', 'basketball'],
    market_potential: 'medium',
    processed: true,
    market_candidate_id: 'mc-004',
    created_at: new Date(Date.now() - 10 * 3600_000).toISOString(),
  },
  {
    id: 'sf-006',
    source: 'The Verge',
    source_url: 'https://theverge.com/gpt5-release-date-rumor',
    title: 'OpenAI GPT-5 Launch Expected Before July 4th',
    summary: 'Multiple sources confirm OpenAI planning GPT-5 release with significant reasoning improvements. Enterprise rollout first.',
    category: 'Tech',
    confidence: 0.71,
    sentiment_score: 0.78,
    entities: ['OpenAI', 'GPT-5', 'Sam Altman'],
    topic_tags: ['AI', 'LLM', 'GPT'],
    market_potential: 'high',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
  {
    id: 'sf-007',
    source: 'Bloomberg',
    source_url: 'https://bloomberg.com/ethereum-pectra-upgrade',
    title: 'Ethereum Pectra Upgrade Boosts Staking Rewards 40%',
    summary: 'Ethereum\'s latest hard fork increases validator rewards, potentially drawing more institutional stakers.',
    category: 'Crypto',
    confidence: 0.83,
    sentiment_score: 0.75,
    entities: ['Ethereum', 'Vitalik Buterin'],
    topic_tags: ['Ethereum', 'staking', 'DeFi'],
    market_potential: 'medium',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 14 * 3600_000).toISOString(),
  },
  {
    id: 'sf-008',
    source: 'WHO Briefing',
    source_url: null,
    title: 'New H5N1 Vaccine Shows 87% Efficacy in Phase 3 Trials',
    summary: 'WHO announces promising results from Phase 3 clinical trials for next-generation avian flu vaccine.',
    category: 'Science',
    confidence: 0.86,
    sentiment_score: 0.55,
    entities: ['WHO', 'H5N1', 'Moderna'],
    topic_tags: ['vaccine', 'pandemic', 'health'],
    market_potential: 'medium',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 18 * 3600_000).toISOString(),
  },
  {
    id: 'sf-009',
    source: 'TMZ',
    source_url: 'https://tmz.com/taylor-swift-new-album-rumor',
    title: 'Taylor Swift Rumored to Drop Surprise Album This Summer',
    summary: 'Unconfirmed reports suggest Swift has been recording in secret studios. No official announcement yet.',
    category: 'Pop Culture',
    confidence: 0.42,
    sentiment_score: 0.88,
    entities: ['Taylor Swift'],
    topic_tags: ['music', 'celebrity', 'album'],
    market_potential: 'low',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 20 * 3600_000).toISOString(),
  },
  {
    id: 'sf-010',
    source: 'Nature',
    source_url: 'https://nature.com/articles/fusion-breakthrough-2026',
    title: 'Nuclear Fusion Reactor Sustains Plasma for 10 Minutes',
    summary: 'MIT spinoff Commonwealth Fusion Systems achieves record plasma duration, bringing commercial fusion closer to reality.',
    category: 'Science',
    confidence: 0.91,
    sentiment_score: 0.93,
    entities: ['Commonwealth Fusion Systems', 'MIT'],
    topic_tags: ['fusion', 'energy', 'climate'],
    market_potential: 'medium',
    processed: false,
    market_candidate_id: null,
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
]

// ── Mock Market Candidates (8 samples, ALL pending_review) ──────────────────

export const MOCK_MARKET_CANDIDATES: MarketCandidate[] = [
  {
    id: 'mc-001',
    scout_finding_id: 'sf-001',
    question: 'Will the Federal Reserve cut interest rates at the June 2026 FOMC meeting?',
    short_title: 'Fed Rate Cut June 2026',
    description: 'This market resolves YES if the Federal Open Market Committee votes to decrease the federal funds rate at its June 2026 meeting. Resolution based on official FOMC statement.',
    category: 'Economics',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.78, 0.22],
    resolution_criteria: 'Official FOMC press release from federalreserve.gov following June 2026 meeting',
    resolver_source: 'Federal Reserve',
    close_date: '2026-06-18T00:00:00Z',
    suggested_liquidity: 5000,
    semantic_hash: 'sha256:a1b2c3d4e5f6',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'mc-002',
    scout_finding_id: 'sf-002',
    question: 'Will Bitcoin reach $200,000 before August 1, 2026?',
    short_title: 'BTC $200K by Aug 2026',
    description: 'This market resolves YES if the price of Bitcoin (BTC/USD) reaches or exceeds $200,000 on any major exchange before August 1, 2026.',
    category: 'Crypto',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.45, 0.55],
    resolution_criteria: 'CoinGecko VWAP price for BTC/USD must touch $200,000 or higher',
    resolver_source: 'CoinGecko',
    close_date: '2026-08-01T00:00:00Z',
    suggested_liquidity: 10000,
    semantic_hash: 'sha256:b2c3d4e5f6a1',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'mc-003',
    scout_finding_id: 'sf-003',
    question: 'Will SpaceX successfully land a Starship on Mars before 2030?',
    short_title: 'SpaceX Mars Landing by 2030',
    description: 'Resolves YES if SpaceX confirms a successful Starship landing on the surface of Mars before January 1, 2030.',
    category: 'Tech',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.25, 0.75],
    resolution_criteria: 'Official SpaceX confirmation via press release or social media',
    resolver_source: 'SpaceX',
    close_date: '2029-12-31T23:59:59Z',
    suggested_liquidity: 8000,
    semantic_hash: 'sha256:c3d4e5f6a1b2',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'mc-004',
    scout_finding_id: 'sf-005',
    question: 'Will Cooper Flagg be the #1 overall pick in the 2026 NBA Draft?',
    short_title: 'Flagg #1 Pick 2026 NBA Draft',
    description: 'Resolves YES if Cooper Flagg is selected as the first overall pick in the 2026 NBA Draft.',
    category: 'Sports',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.85, 0.15],
    resolution_criteria: 'Official NBA Draft selection announcement on ESPN broadcast',
    resolver_source: 'NBA/ESPN',
    close_date: '2026-06-26T00:00:00Z',
    suggested_liquidity: 3000,
    semantic_hash: 'sha256:d4e5f6a1b2c3',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 10 * 3600_000).toISOString(),
  },
  {
    id: 'mc-005',
    scout_finding_id: 'sf-006',
    question: 'Will OpenAI release GPT-5 before July 4, 2026?',
    short_title: 'GPT-5 Release by July 4',
    description: 'Resolves YES if OpenAI officially releases GPT-5 (or equivalent next-generation model) with public API access before July 4, 2026.',
    category: 'Tech',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.62, 0.38],
    resolution_criteria: 'OpenAI blog post or API changelog confirming GPT-5 general availability',
    resolver_source: 'OpenAI',
    close_date: '2026-07-04T00:00:00Z',
    suggested_liquidity: 6000,
    semantic_hash: 'sha256:e5f6a1b2c3d4',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
  {
    id: 'mc-006',
    scout_finding_id: 'sf-004',
    question: 'Will Democrats win a Senate majority in the 2028 elections?',
    short_title: 'Dem Senate Majority 2028',
    description: 'Resolves YES if the Democratic Party holds 51 or more Senate seats after the 2028 election results are certified.',
    category: 'Politics',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.55, 0.45],
    resolution_criteria: 'Official election certification from each state secretary of state',
    resolver_source: 'AP News',
    close_date: '2028-11-15T00:00:00Z',
    suggested_liquidity: 7500,
    semantic_hash: 'sha256:f6a1b2c3d4e5',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'mc-007',
    scout_finding_id: 'sf-007',
    question: 'Will Ethereum staking APR exceed 5% by September 2026?',
    short_title: 'ETH Staking APR >5% Sep 2026',
    description: 'Resolves YES if the average Ethereum validator staking annual percentage rate exceeds 5% at any point before September 1, 2026.',
    category: 'Crypto',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.38, 0.62],
    resolution_criteria: 'Beaconcha.in or equivalent validator reward tracking service',
    resolver_source: 'Beaconcha.in',
    close_date: '2026-09-01T00:00:00Z',
    suggested_liquidity: 4000,
    semantic_hash: 'sha256:a1c3e5f7b2d4',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 14 * 3600_000).toISOString(),
  },
  {
    id: 'mc-008',
    scout_finding_id: 'sf-010',
    question: 'Will a commercial fusion reactor produce net positive energy by 2028?',
    short_title: 'Fusion Net Energy by 2028',
    description: 'Resolves YES if any commercial fusion reactor demonstrably produces more energy than it consumes (Q>1) in a sustained reaction before January 1, 2028.',
    category: 'Science',
    outcomes: ['Yes', 'No'],
    estimated_probabilities: [0.18, 0.82],
    resolution_criteria: 'Peer-reviewed publication in Nature or Science confirming sustained Q>1',
    resolver_source: 'Nature',
    close_date: '2027-12-31T23:59:59Z',
    suggested_liquidity: 5000,
    semantic_hash: 'sha256:b2d4f6a1c3e5',
    duplicate_of: null,
    status: 'pending_review',
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    published_market_id: null,
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
]

// ── Mock Fraud Flags (6 samples) ────────────────────────────────────────────

export const MOCK_FRAUD_FLAGS: FraudFlag[] = [
  {
    id: 'ff-001',
    user_id: 'u-7823',
    market_id: 'm-btc-200k',
    flag_type: 'wash_trading',
    severity: 'high',
    status: 'open',
    evidence: { trade_pairs: 12, volume_ratio: 8.3, time_window: '2h', same_ip_trades: 9 },
    risk_score: 0.85,
    agent_finding: 'Detected 12 buy/sell pairs between accounts u-7823 and u-7825 within 2 hours, originating from the same IP address. Volume ratio 8.3x above normal.',
    reviewed_by: null,
    reviewed_at: null,
    resolution: null,
    auto_action_taken: 'rate_limited',
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'ff-002',
    user_id: 'u-3291',
    market_id: null,
    flag_type: 'referral_abuse',
    severity: 'medium',
    status: 'investigating',
    evidence: { referrals_created: 47, self_referral_suspects: 8, bonus_claimed: 2350 },
    risk_score: 0.62,
    agent_finding: 'User created 47 referral accounts in 14 days. 8 accounts share similar device fingerprints. Claimed 2,350 SC in referral bonuses.',
    reviewed_by: 'admin-001',
    reviewed_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
    resolution: null,
    auto_action_taken: 'referral_bonus_frozen',
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'ff-003',
    user_id: null,
    market_id: 'm-election-2028',
    flag_type: 'suspicious_volume',
    severity: 'critical',
    status: 'open',
    evidence: { volume_spike: '450%', unusual_accounts: 23, time_before_resolution: '6h' },
    risk_score: 0.93,
    agent_finding: '450% volume spike on election market 6 hours before expected resolution. 23 new accounts with KYC minimum deposits driving volume.',
    reviewed_by: null,
    reviewed_at: null,
    resolution: null,
    auto_action_taken: 'market_paused',
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: 'ff-004',
    user_id: 'u-4521',
    market_id: null,
    flag_type: 'multi_account',
    severity: 'high',
    status: 'escalated',
    evidence: { linked_accounts: 4, shared_payment: true, shared_device: true, total_balances: 15200 },
    risk_score: 0.78,
    agent_finding: 'Four accounts sharing same payment method and device fingerprint. Combined SC balance 15,200. Possible Sybil attack for promo exploitation.',
    reviewed_by: null,
    reviewed_at: null,
    resolution: null,
    auto_action_taken: 'accounts_flagged',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'ff-005',
    user_id: 'u-9102',
    market_id: 'm-fed-cut-jun',
    flag_type: 'insider_trading',
    severity: 'medium',
    status: 'investigating',
    evidence: { large_positions_before_news: 3, timing_correlation: 'within_5_min', profit_potential: 8500 },
    risk_score: 0.55,
    agent_finding: 'User placed 3 large positions within 5 minutes of Fed leak appearing on social media. Potential profit $8,500. Timing correlation suspicious but not conclusive.',
    reviewed_by: 'admin-002',
    reviewed_at: new Date(Date.now() - 30 * 60_000).toISOString(),
    resolution: null,
    auto_action_taken: null,
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
  {
    id: 'ff-006',
    user_id: 'u-6745',
    market_id: 'm-nba-champ',
    flag_type: 'unusual_pattern',
    severity: 'low',
    status: 'dismissed',
    evidence: { betting_pattern: 'contrarian_heavy', win_rate: '72%', streak: '5_wins' },
    risk_score: 0.28,
    agent_finding: 'User shows consistent contrarian betting pattern with high win rate. Could be skilled bettor rather than abuse. No evidence of manipulation.',
    reviewed_by: 'admin-001',
    reviewed_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
    resolution: 'Legitimate skilled bettor. No action required.',
    auto_action_taken: null,
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
]

// ── Mock Content Queue (5 samples) ──────────────────────────────────────────

export const MOCK_CONTENT_QUEUE: ContentQueue[] = [
  {
    id: 'cq-001',
    content_type: 'social_post',
    market_id: 'm-btc-200k',
    title: 'Bitcoin Breakout: Will BTC Hit $200K?',
    body: '🚀 Bitcoin is surging! With record ETF inflows and institutional adoption, the $200K milestone is within reach. What do you think — are we witnessing history? Place your prediction on Predictly!',
    metadata: { platform: 'twitter', character_count: 198, hashtags: ['#Bitcoin', '#BTC200K', '#Predictly'] },
    status: 'pending',
    scheduled_publish_at: new Date(Date.now() + 2 * 3600_000).toISOString(),
    published_at: null,
    agent_task_id: 'task-005',
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'cq-002',
    content_type: 'market_summary',
    market_id: 'm-fed-cut-jun',
    title: 'Fed Rate Decision: June 2026 Market Analysis',
    body: 'The Federal Reserve is signaling a potential rate cut at its June FOMC meeting. With inflation cooling to 2.1%, markets are pricing in a 78% probability of a 25bps reduction. This summary covers the key data points, market reactions, and what it means for prediction market participants.',
    metadata: { word_count: 456, seo_keywords: ['fed rate cut', 'june 2026', 'interest rates'] },
    status: 'ready',
    scheduled_publish_at: null,
    published_at: null,
    agent_task_id: 'task-005',
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: 'cq-003',
    content_type: 'seo_description',
    market_id: 'm-election-2028',
    title: '2028 Senate Elections: Predict the Outcome',
    body: 'Predict whether Democrats will secure a Senate majority in the 2028 elections. Live odds, expert analysis, and real-time market data on Predictly.',
    metadata: { character_count: 142, target_keyword: '2028 senate elections predictions' },
    status: 'generating',
    scheduled_publish_at: null,
    published_at: null,
    agent_task_id: 'task-012',
    created_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
  {
    id: 'cq-004',
    content_type: 'trending_report',
    market_id: null,
    title: 'Trending Markets: May 24, 2026',
    body: 'Today\'s hottest markets: 1) Fed Rate Cut June (+45% volume) 2) BTC $200K (+120% volume) 3) SpaceX Mars Landing (+30% new traders). Crypto markets dominate trading activity with 62% of total volume.',
    metadata: { markets_featured: 3, top_category: 'Crypto' },
    status: 'pending',
    scheduled_publish_at: new Date(Date.now() + 4 * 3600_000).toISOString(),
    published_at: null,
    agent_task_id: null,
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'cq-005',
    content_type: 'daily_recap',
    market_id: null,
    title: 'Daily Recap: May 23, 2026',
    body: 'Markets closed strong with Bitcoin leading the charge. The Fed Rate Cut market saw record participation. New user signups up 23% week-over-week. Total platform volume: $2.4M. Notable resolutions: Super Bowl LIX market settled (Eagles Win).',
    metadata: { total_volume: 2400000, new_users: 847, markets_resolved: 1 },
    status: 'published',
    scheduled_publish_at: null,
    published_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    agent_task_id: 'task-005',
    created_at: new Date(Date.now() - 10 * 3600_000).toISOString(),
  },
]

// ── Mock Trend Clusters (4 samples) ────────────────────────────────────────

export const MOCK_TREND_CLUSTERS: TrendCluster[] = [
  {
    id: 'tc-001',
    name: 'Crypto Bull Run 2026',
    category: 'Crypto',
    keywords: ['bitcoin', 'ETF', 'institutional', 'ATH', 'halving'],
    finding_ids: ['sf-002', 'sf-007'],
    market_count: 8,
    momentum_score: 0.87,
    peak_time: new Date(Date.now() - 2 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
  {
    id: 'tc-002',
    name: 'Fed Policy Shift',
    category: 'Economics',
    keywords: ['fed', 'rate cut', 'inflation', 'FOMC', 'monetary policy'],
    finding_ids: ['sf-001'],
    market_count: 5,
    momentum_score: 0.74,
    peak_time: new Date(Date.now() - 4 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
  },
  {
    id: 'tc-003',
    name: 'Space & AI Tech Boom',
    category: 'Tech',
    keywords: ['SpaceX', 'Starship', 'GPT-5', 'OpenAI', 'fusion'],
    finding_ids: ['sf-003', 'sf-006', 'sf-010'],
    market_count: 6,
    momentum_score: 0.81,
    peak_time: new Date(Date.now() - 6 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
  {
    id: 'tc-004',
    name: '2028 Election Cycle',
    category: 'Politics',
    keywords: ['Senate', '2028', 'midterms', 'Democrats', 'Republicans'],
    finding_ids: ['sf-004'],
    market_count: 3,
    momentum_score: 0.52,
    peak_time: new Date(Date.now() - 8 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 72 * 3600_000).toISOString(),
  },
]

// ── Mock Sentiment Snapshots (6 samples) ───────────────────────────────────

export const MOCK_SENTIMENT_SNAPSHOTS: SentimentSnapshot[] = [
  {
    id: 'ss-001',
    category: 'Crypto',
    sentiment_score: 0.78,
    volume_mentions: 12400,
    top_entities: ['Bitcoin', 'Ethereum', 'BlackRock'],
    top_topics: ['ETF inflows', 'BTC price', 'staking rewards'],
    data_source: 'twitter_reddit_news',
    created_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
  {
    id: 'ss-002',
    category: 'Economics',
    sentiment_score: 0.65,
    volume_mentions: 8900,
    top_entities: ['Federal Reserve', 'Jerome Powell'],
    top_topics: ['rate cut', 'inflation', 'FOMC'],
    data_source: 'news_api',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'ss-003',
    category: 'Politics',
    sentiment_score: 0.42,
    volume_mentions: 5600,
    top_entities: ['Senate', 'DNC', 'RNC'],
    top_topics: ['2028 elections', 'Senate map', 'midterms'],
    data_source: 'news_api',
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
  },
  {
    id: 'ss-004',
    category: 'Tech',
    sentiment_score: 0.85,
    volume_mentions: 15200,
    top_entities: ['SpaceX', 'OpenAI', 'GPT-5'],
    top_topics: ['Starship', 'AI models', 'fusion energy'],
    data_source: 'twitter_reddit_news',
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'ss-005',
    category: 'Sports',
    sentiment_score: 0.71,
    volume_mentions: 6800,
    top_entities: ['NBA', 'Cooper Flagg', 'NFL'],
    top_topics: ['NBA Draft', 'playoffs', 'Super Bowl'],
    data_source: 'reddit_news',
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'ss-006',
    category: 'General',
    sentiment_score: 0.58,
    volume_mentions: 32000,
    top_entities: ['Bitcoin', 'Federal Reserve', 'SpaceX'],
    top_topics: ['markets', 'AI', 'economy'],
    data_source: 'aggregated',
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString(),
  },
]

// ── Mock Moderation Queue (5 samples) ──────────────────────────────────────

export const MOCK_MODERATION_QUEUE: ModerationQueue[] = [
  {
    id: 'mq-001',
    item_type: 'market_candidate',
    item_id: 'mc-001',
    priority: 8,
    status: 'pending',
    assigned_to: null,
    notes: null,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'mq-002',
    item_type: 'market_candidate',
    item_id: 'mc-002',
    priority: 7,
    status: 'pending',
    assigned_to: null,
    notes: null,
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'mq-003',
    item_type: 'fraud_flag',
    item_id: 'ff-003',
    priority: 10,
    status: 'in_review',
    assigned_to: 'admin-001',
    notes: 'Critical volume spike. Paused market pending investigation.',
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'mq-004',
    item_type: 'content',
    item_id: 'cq-001',
    priority: 5,
    status: 'pending',
    assigned_to: null,
    notes: null,
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'mq-005',
    item_type: 'market_candidate',
    item_id: 'mc-006',
    priority: 6,
    status: 'in_review',
    assigned_to: 'admin-002',
    notes: 'Political market — needs compliance review before approval.',
    created_at: new Date(Date.now() - 8 * 3600_000).toISOString(),
    resolved_at: null,
  },
]

// ── Mock Agent Failures (3 samples) ────────────────────────────────────────

export const MOCK_AGENT_FAILURES: AgentFailure[] = [
  {
    id: 'af-001',
    task_id: 'task-007',
    agent_type: 'scout',
    error_type: 'RateLimitError',
    error_message: 'Twitter API rate limit exceeded. Remaining: 0, Reset at: 2026-05-24T04:00:00Z',
    stack_trace: 'Error: Rate limit exceeded\n  at TwitterClient.get (/node_modules/twitter-api/index.ts:142:11)\n  at ScoutAgent.scan (./agents/scout.ts:87:23)',
    retry_attempt: 2,
    resolved: false,
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
  {
    id: 'af-002',
    task_id: 'task-018',
    agent_type: 'content',
    error_type: 'TimeoutError',
    error_message: 'LLM API timeout. Content generation exceeded 45s limit.',
    stack_trace: 'Error: Request timeout\n  at LLMClient.generate (/node_modules/llm-sdk/client.ts:201:9)\n  at ContentAgent.generate (./agents/content.ts:56:18)',
    retry_attempt: 2,
    resolved: false,
    created_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
  {
    id: 'af-003',
    task_id: 'task-020',
    agent_type: 'oddsmaker',
    error_type: 'DuplicateError',
    error_message: 'Market candidate with semantic hash sha256:abc123 already exists as mc-011',
    stack_trace: null,
    retry_attempt: 0,
    resolved: true,
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
]

// ── Mock Agent Memory (5 samples) ──────────────────────────────────────────

export const MOCK_AGENT_MEMORY: AgentMemory[] = [
  {
    id: 'am-001',
    agent_type: 'scout',
    memory_type: 'pattern',
    key: 'crypto_surge_pattern',
    value: { description: 'BTC price movements >5% in 24h always trigger high-traffic market interest', observed_count: 14 },
    relevance_score: 0.91,
    accessed_count: 23,
    expires_at: null,
    created_at: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'am-002',
    agent_type: 'oddsmaker',
    memory_type: 'correction',
    key: 'political_market_bias',
    value: { description: 'Initial probability estimates for political markets tend to overestimate favorites by 8-12%. Adjust calibration.', corrected_by: 'admin-001' },
    relevance_score: 0.85,
    accessed_count: 12,
    expires_at: null,
    created_at: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'am-003',
    agent_type: 'fraud_analyst',
    memory_type: 'finding',
    key: 'wash_trading_ip_pattern',
    value: { description: 'Wash trading accounts often share first 3 octets of IP address', confidence: 0.88 },
    relevance_score: 0.79,
    accessed_count: 34,
    expires_at: null,
    created_at: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'am-004',
    agent_type: 'content',
    memory_type: 'preference',
    key: 'optimal_post_length',
    value: { description: 'Social posts between 150-220 characters have 34% higher engagement', platform: 'twitter' },
    relevance_score: 0.72,
    accessed_count: 8,
    expires_at: new Date(Date.now() + 30 * 24 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'am-005',
    agent_type: 'supervisor',
    memory_type: 'context',
    key: 'peak_hours',
    value: { description: 'Highest market activity between 9-11 AM EST and 7-9 PM EST. Schedule high-priority tasks during these windows.', timezone: 'EST' },
    relevance_score: 0.88,
    accessed_count: 45,
    expires_at: null,
    created_at: new Date(Date.now() - 10 * 24 * 3600_000).toISOString(),
  },
]

// ── Mock Agent Actions (for activity timeline) ─────────────────────────────

export const MOCK_AGENT_ACTIONS: AgentAction[] = [
  {
    id: 'aa-001',
    task_id: 'task-001',
    agent_type: 'scout',
    action_type: 'scout_scan',
    description: 'Scanned Reuters, AP News, and Bloomberg for emerging events',
    input_summary: 'Sources: 3 news APIs | Query: Fed policy, crypto, tech',
    output_summary: '3 findings extracted | Top: Fed rate cut signal (0.92 confidence)',
    confidence: 0.85,
    duration_ms: 3200,
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: 'aa-002',
    task_id: 'task-002',
    agent_type: 'oddsmaker',
    action_type: 'market_generate',
    description: 'Generated market candidate from Fed rate cut finding',
    input_summary: 'Finding: sf-001 | Category: Economics',
    output_summary: 'Candidate mc-001 created | Est. probabilities: [0.78, 0.22]',
    confidence: 0.82,
    duration_ms: 8500,
    created_at: new Date(Date.now() - 115 * 60_000).toISOString(),
  },
  {
    id: 'aa-003',
    task_id: 'task-004',
    agent_type: 'fraud_analyst',
    action_type: 'fraud_check',
    description: 'Analyzed user u-7823 trading patterns for wash trading',
    input_summary: 'User: u-7823 | Window: 24h | Market: m-btc-200k',
    output_summary: '1 flag raised | Risk score: 0.78 | Auto-action: rate_limited',
    confidence: 0.72,
    duration_ms: 12400,
    created_at: new Date(Date.now() - 90 * 60_000).toISOString(),
  },
  {
    id: 'aa-004',
    task_id: 'task-005',
    agent_type: 'content',
    action_type: 'content_generate',
    description: 'Generated daily recap content for May 23',
    input_summary: 'Type: daily_recap | Date: 2026-05-23',
    output_summary: 'Content cq-005 created | 342 words | Published successfully',
    confidence: 0.80,
    duration_ms: 15200,
    created_at: new Date(Date.now() - 297 * 60_000).toISOString(),
  },
  {
    id: 'aa-005',
    task_id: 'task-006',
    agent_type: 'supervisor',
    action_type: 'supervisor_coordinate',
    description: 'Retried failed scout task for election polls scan',
    input_summary: 'Action: retry_failed | Target: task-007',
    output_summary: 'New task task-014 created | Scout rescheduled',
    confidence: 0.95,
    duration_ms: 800,
    created_at: new Date(Date.now() - 9 * 60_000).toISOString(),
  },
  {
    id: 'aa-006',
    task_id: 'task-003',
    agent_type: 'clerk',
    action_type: 'db_write',
    description: 'Validated and inserted market candidate mc-001 into database',
    input_summary: 'Table: market_candidates | Record: mc-001',
    output_summary: 'Validation passed | Insert successful',
    confidence: 0.98,
    duration_ms: 450,
    created_at: new Date(Date.now() - 113 * 60_000).toISOString(),
  },
  {
    id: 'aa-007',
    task_id: 'task-014',
    agent_type: 'scout',
    action_type: 'scout_scan',
    description: 'Rescanned news sources for 2028 election polls',
    input_summary: 'Sources: 2 news APIs | Query: election polls 2028',
    output_summary: '2 findings extracted | Top: Senate map projections (0.88 confidence)',
    confidence: 0.88,
    duration_ms: 4100,
    created_at: new Date(Date.now() - 6 * 60_000).toISOString(),
  },
  {
    id: 'aa-008',
    task_id: 'task-019',
    agent_type: 'supervisor',
    action_type: 'supervisor_coordinate',
    description: 'Performed system health check across all agents',
    input_summary: 'Action: health_check | Agents: all',
    output_summary: 'All 6 agents healthy | 0 degraded',
    confidence: 0.99,
    duration_ms: 1200,
    created_at: new Date(Date.now() - 14 * 60_000).toISOString(),
  },
]

// ── Utility Functions ──────────────────────────────────────────────────────

/**
 * Get the current status of a specific agent.
 */
export function getAgentStatus(agentType: AgentType): 'running' | 'idle' | 'error' {
  const runningTasks = MOCK_AGENT_TASKS.filter(
    (t) => t.agent_type === agentType && t.status === 'running'
  )
  if (runningTasks.length > 0) return 'running'

  const recentFailures = MOCK_AGENT_FAILURES.filter(
    (f) => f.agent_type === agentType && !f.resolved
  )
  if (recentFailures.length > 0) return 'error'

  return 'idle'
}

/**
 * Get the number of pending tasks in the queue.
 */
export function getTaskQueueLength(): number {
  return MOCK_AGENT_TASKS.filter((t) => t.status === 'pending').length
}

/**
 * Get the overall system health score (0-1).
 */
export function getSystemHealth(): number {
  const config = Object.values(AGENT_CONFIGS)
  const enabledAgents = config.filter((a) => a.enabled).length
  const totalAgents = config.length

  const recentCompleted = MOCK_AGENT_TASKS.filter(
    (t) => t.status === 'completed' && Date.now() - new Date(t.completed_at!).getTime() < 24 * 3600_000
  ).length
  const recentFailed = MOCK_AGENT_TASKS.filter(
    (t) => t.status === 'failed' && Date.now() - new Date(t.created_at).getTime() < 24 * 3600_000
  ).length

  const agentHealth = enabledAgents / totalAgents
  const taskHealth = recentCompleted / Math.max(recentCompleted + recentFailed, 1)

  return agentHealth * 0.4 + taskHealth * 0.6
}

/**
 * Check if an agent can execute a new task (rate limit, config check).
 */
export function canAgentExecute(agentType: AgentType): { canExecute: boolean; reason?: string } {
  const config = AGENT_CONFIGS[agentType]
  if (!config) return { canExecute: false, reason: 'Unknown agent type' }
  if (!config.enabled) return { canExecute: false, reason: 'Agent is disabled' }

  const recentTasks = MOCK_AGENT_TASKS.filter(
    (t) => t.agent_type === agentType && t.status === 'running'
  )
  if (recentTasks.length >= 3) return { canExecute: false, reason: 'Too many concurrent tasks' }

  return { canExecute: true }
}

/**
 * Validate a market candidate has all required fields.
 * AI-generated candidates MUST NOT have status other than 'pending_review'.
 */
export function validateMarketCandidate(candidate: Partial<MarketCandidate>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!candidate.question || candidate.question.trim().length < 10) {
    errors.push('Question must be at least 10 characters')
  }
  if (!candidate.short_title || candidate.short_title.trim().length < 3) {
    errors.push('Short title must be at least 3 characters')
  }
  if (!candidate.description || candidate.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters')
  }
  if (!candidate.category) {
    errors.push('Category is required')
  }
  if (!candidate.outcomes || candidate.outcomes.length < 2) {
    errors.push('At least 2 outcomes are required')
  }
  if (!candidate.estimated_probabilities || candidate.estimated_probabilities.length < 2) {
    errors.push('Estimated probabilities must match outcomes count')
  }
  if (candidate.estimated_probabilities) {
    const sum = candidate.estimated_probabilities.reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 1) > 0.05) {
      errors.push('Estimated probabilities must sum to approximately 1.0')
    }
  }
  if (!candidate.resolution_criteria) {
    errors.push('Resolution criteria is required')
  }
  if (!candidate.resolver_source) {
    errors.push('Resolver source is required')
  }
  if (candidate.suggested_liquidity !== undefined && candidate.suggested_liquidity < 0) {
    errors.push('Suggested liquidity must be non-negative')
  }

  // CRITICAL: AI-generated candidates can NEVER bypass the review queue
  if (candidate.status && candidate.status !== 'pending_review') {
    errors.push('AI-generated candidates MUST have status "pending_review". Direct approval is not allowed.')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Format a confidence score for display.
 */
export function formatConfidence(confidence: number | null): string {
  if (confidence === null) return '—'
  return `${Math.round(confidence * 100)}%`
}

/**
 * Get a human-readable status badge color class.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'published':
    case 'resolved':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'running':
    case 'generating':
    case 'in_review':
    case 'investigating':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/20'
    case 'pending':
    case 'pending_review':
      return 'bg-sky-500/15 text-sky-600 border-sky-500/20'
    case 'failed':
    case 'rejected':
    case 'dismissed':
      return 'bg-red-500/15 text-red-600 border-red-500/20'
    case 'cancelled':
    case 'expired':
      return 'bg-gray-500/15 text-gray-500 border-gray-500/20'
    case 'escalated':
      return 'bg-orange-500/15 text-orange-600 border-orange-500/20'
    case 'approved':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'ready':
      return 'bg-violet-500/15 text-violet-600 border-violet-500/20'
    case 'open':
      return 'bg-red-500/15 text-red-600 border-red-500/20'
    default:
      return 'bg-gray-500/15 text-gray-500 border-gray-500/20'
  }
}

/**
 * Get severity badge color class.
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-600/15 text-red-700 border-red-600/25'
    case 'high':
      return 'bg-orange-500/15 text-orange-600 border-orange-500/20'
    case 'medium':
      return 'bg-amber-500/15 text-amber-600 border-amber-500/20'
    case 'low':
      return 'bg-sky-500/15 text-sky-600 border-sky-500/20'
    default:
      return 'bg-gray-500/15 text-gray-500 border-gray-500/20'
  }
}

/**
 * Format relative time from an ISO date string.
 */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  if (diffMs < 60_000) return 'just now'
  if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m ago`
  if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)}h ago`
  return `${Math.floor(diffMs / 86400_000)}d ago`
}

/**
 * Get the category emoji.
 */
export function getCategoryEmoji(category: Category | 'General'): string {
  const emojiMap: Record<string, string> = {
    Politics: '🏛️',
    Crypto: '₿',
    Sports: '⚽',
    Tech: '💻',
    Economics: '📊',
    'Pop Culture': '🎬',
    Science: '🔬',
    World: '🌍',
    Stocks: '📈',
    General: '📌',
  }
  return emojiMap[category] ?? '📌'
}
