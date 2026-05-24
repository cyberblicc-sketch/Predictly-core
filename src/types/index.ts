// ============================================================================
// Predictly — TypeScript interfaces
// Fuses Predictly's UI types with Predictly's backend types
// ============================================================================

// --- Categories ---

export type Category =
  | 'Politics' | 'Crypto' | 'Sports' | 'Tech' | 'Economics'
  | 'Pop Culture' | 'Science' | 'World' | 'Stocks'

// --- User ---

export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  gold_balance: number
  sweeps_balance: number
  kyc_status: 'none' | 'pending' | 'approved' | 'rejected'
  user_tier: 'starter' | 'bronze' | 'silver' | 'gold' | 'diamond'
  is_admin: boolean
  created_at: string
}

// --- Market ---

export interface Market {
  id: string
  slug: string
  question: string
  shortTitle: string
  description: string
  category: Category
  tags: string[]
  outcomes: MarketOutcome[]
  volume: number
  liquidity: number
  traders: number
  closeAt: string
  createdAt: string
  resolver: string
  imageColor: string
  imageEmoji: string
  trending?: boolean
  isNew?: boolean
  boosted?: {
    placement: BoostPlacement
    sponsorName: string
  }
  status: 'active' | 'paused' | 'resolved' | 'cancelled'
  resolvedOutcome?: string
  yesPool?: number
  noPool?: number
  currentProbability?: number
  houseFeePercentage?: number
  platformFeePercentage?: number
}

export interface MarketOutcome {
  id: string
  label: string
  price: number          // 0..1 — implied probability
  volume: number         // traded on this outcome
  delta7d: number        // 7-day delta in probability
}

// --- Position / Portfolio ---

export interface Position {
  id: string
  marketId: string
  marketTitle: string
  outcome: string
  side: 'YES' | 'NO' | 'OUTCOME'
  shares: number
  avgPrice: number
  currentPrice: number
  category: Category
  imageEmoji: string
  imageColor: string
  stake?: number
  pnl?: number
  currency?: 'GC' | 'SC'
  createdAt?: string
}

// --- Transaction ---

export interface Transaction {
  id: string
  userId: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'REFERRAL' | 'KYC_REWARD' | 'STAKE' | 'SETTLEMENT' | 'GC_PURCHASE' | 'SC_BONUS'
  amount: number
  currency: 'GC' | 'SC'
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  description: string
  createdAt: string
}

// --- Leaderboard ---

export interface LeaderboardEntry {
  rank: number
  user: string
  avatar: string
  pnl: number
  volume: number
  winRate: number
  positions: number
  streak: number
  badge?: 'whale' | 'sharp' | 'rising'
}

/** Backward-compatible alias */
export type LeaderboardRow = LeaderboardEntry

// --- Activity ---

export interface Activity {
  id: string
  user: string
  avatar: string
  side: string
  market: string
  marketTitle: string
  amount: number
  price: number
  timeAgo: string
}

// --- Referral ---

export interface Referral {
  id: string
  referrerId: string
  referredId: string
  status: 'PENDING' | 'COMPLETED'
  rewardClaimed: boolean
  createdAt: string
  referredUser?: { username: string; created_at: string }
}

// --- Trade ---

export type Currency = 'GC' | 'SC'

export interface TradeInput {
  marketId: string
  side: 'YES' | 'NO'
  stake: number
  currency: Currency
}

export interface FeeBreakdown {
  stake: number
  houseFee: number
  platformFee: number
  poolShare: number
  entryPrice: number
}

// --- Chart ---

export interface ChartDataPoint {
  t: number
  price: number
  volume?: number
}

// --- Portfolio ---

export interface PortfolioData {
  balance: number
  gcBalance: number
  scBalance: number
  deposited: number
  positions: Position[]
}

// --- Supabase RPC result types ---

export interface ProcessStakeResult {
  position_id: string
  cost: number
  entry_prob: number
  new_balance: number
  side: 'yes' | 'no'
  currency: 'sc' | 'gc'
}

export interface ResolveMarketResult {
  success: boolean
  outcome: string
  settled_count: number
  total_payout: number
  protocol_fee: number
  publisher_fee: number
  market_id: string
}

// --- AI Swarm types ---

export interface AITrade {
  id: string
  agent_name: string
  market_id: string
  side: 'yes' | 'no'
  amount: number
  reason: string
  status: 'pending' | 'executed' | 'failed'
  execution_price: number | null
  created_at: string
  executed_at: string | null
}

export interface AgentStats {
  agent_name: string
  executed_trades: number
  failed_trades: number
  total_amount: number
  success_rate: number
  last_trade_at: string | null
}

export interface AISwarmStatus {
  enabled: boolean
  running: boolean
  last_tick_at: string | null
  total_trades_today: number
  total_amount_today: number
}

// --- Admin types ---

export interface AdminStats {
  totalUsers: number
  activeMarkets: number
  totalVolume: number
  pendingKyc: number
  pendingRedemptions: number
  totalPayout: number
}

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_user_id?: string
  target_market_id?: string
  changes: Record<string, unknown>
  reason?: string
  created_at: string
}

export interface FraudReport {
  id: string
  reporter_id: string
  market_id: string
  reason: string
  evidence: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  created_at: string
  resolved_at?: string
  market?: Market
}

// --- Stripe / Payments ---

export type GCPackageId = 'starter' | 'bronze' | 'silver' | 'gold' | 'diamond'

export interface GCPackage {
  gc: number
  sc_bonus: number
  price: number
}

export interface GCPackages {
  [key in GCPackageId]: GCPackage
}

// --- Boosted Markets types ---

export type BoostStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected'
export type BoostPlacement = 'hero' | 'featured' | 'category_top' | 'sidebar' | 'ticker'

export interface BoostedMarket {
  id: string
  market_id: string
  market_title: string
  market_emoji: string
  sponsor_name: string
  sponsor_logo_url: string | null
  placement: BoostPlacement
  status: BoostStatus
  budget: number
  spent: number
  impressions: number
  clicks: number
  ctr: number
  additional_liquidity: number
  start_date: string
  end_date: string
  cpc: number
  target_categories: string[]
  created_at: string
}

// --- Withdrawal Speed types ---

export type WithdrawalSpeed = 'instant' | 'standard' | 'scheduled'
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface WithdrawalFeeQuote {
  amount: number
  currency: 'SC'
  speed: WithdrawalSpeed
  fee: number
  fee_pct: number
  net_amount: number
  estimated_arrival: string
  fee_breakdown: {
    base_fee: number
    speed_fee: number
    risk_fee: number
    total_fee: number
  }
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  amount: number
  currency: 'SC'
  speed: WithdrawalSpeed
  fee: number
  net_amount: number
  status: WithdrawalStatus
  destination: string
  destination_type: 'bank_account' | 'crypto_wallet'
  estimated_arrival: string
  created_at: string
  processed_at: string | null
}

// --- Insurance/Hedging types ---

export type InsuranceStatus = 'active' | 'expired' | 'claimed' | 'cancelled'
export type InsuranceType = 'full_hedge' | 'partial_hedge' | 'stop_loss'

export interface InsurancePolicy {
  id: string
  user_id: string
  position_id: string
  market_id: string
  market_title: string
  insurance_type: InsuranceType
  coverage_pct: number
  position_value: number
  coverage_amount: number
  premium: number
  premium_pct: number
  trigger_price: number
  current_price: number
  status: InsuranceStatus
  expires_at: string
  created_at: string
  claimed_at: string | null
  payout: number | null
}

export interface InsuranceQuote {
  position_id: string
  market_id: string
  position_value: number
  insurance_type: InsuranceType
  coverage_pct: number
  premium: number
  premium_pct: number
  trigger_price: number
  coverage_amount: number
  expires_in_days: number
  risk_score: number
  recommendation: string
}

// --- Playbooks Marketplace types ---

export type PlaybookStatus = 'active' | 'paused' | 'archived'
export type PlaybookTier = 'free' | 'basic' | 'premium' | 'elite'

export interface Playbook {
  id: string
  creator_id: string
  creator_username: string
  creator_avatar: string
  creator_badge?: 'whale' | 'sharp' | 'rising' | 'verified'
  title: string
  description: string
  cover_color: string
  cover_emoji: string
  category: Category
  tier: PlaybookTier
  price_monthly: number
  subscriber_count: number
  max_subscribers: number | null
  rating: number
  rating_count: number
  total_posts: number
  open_positions: number
  win_rate: number
  avg_return: number
  status: PlaybookStatus
  tags: string[]
  featured: boolean
  created_at: string
  last_post_at: string
}

export interface PlaybookPost {
  id: string
  playbook_id: string
  title: string
  content: string
  market_ids: string[]
  position_type: 'new_entry' | 'exit' | 'hold' | 'analysis'
  outcomes_shared: { market_id: string; side: 'YES' | 'NO'; shares: number; entry_price: number; current_price: number; pnl: number }[]
  is_free_preview: boolean
  likes: number
  comments_count: number
  created_at: string
}

export interface PlaybookSubscription {
  id: string
  user_id: string
  playbook_id: string
  status: 'active' | 'cancelled' | 'expired'
  price_at_subscribe: number
  current_price: number
  started_at: string
  expires_at: string
  auto_renew: boolean
}

export interface PlaybookCreator {
  id: string
  username: string
  avatar: string
  badge?: 'whale' | 'sharp' | 'rising' | 'verified'
  bio: string
  total_playbooks: number
  total_subscribers: number
  total_earnings: number
  win_rate: number
  avg_return: number
  verified_at: string | null
  specialties: Category[]
}

// --- Market-as-a-Service (MaaS) types ---

export type MaaSClientStatus = 'active' | 'trial' | 'suspended' | 'cancelled'
export type MaaSPricingModel = 'revenue_share' | 'flat_fee' | 'hybrid'

export interface MaaSClient {
  id: string
  company_name: string
  website: string
  contact_email: string
  contact_name: string
  status: MaaSClientStatus
  pricing_model: MaaSPricingModel
  monthly_fee: number
  revenue_share_pct: number
  embed_domains: string[]
  allowed_categories: string[]
  custom_branding: {
    primary_color: string
    logo_url: string | null
    font_family: string | null
    hide_predictly_branding: boolean
  }
  api_key: string
  total_embeds: number
  total_views: number
  total_trades_from_embed: number
  total_revenue_generated: number
  trial_ends_at: string | null
  created_at: string
}

export interface MaaSWidget {
  id: string
  client_id: string
  name: string
  type: 'full_market' | 'mini_card' | 'probability_bar' | 'leaderboard' | 'ticker' | 'multi_market'
  market_ids: string[]
  category?: string
  config: {
    width: string
    height: string
    theme: 'light' | 'dark' | 'auto'
    show_volume: boolean
    show_traders: boolean
    show_timer: boolean
    show_sparkline: boolean
    cta_text: string
    cta_url: string
    border_radius: string
    hide_powered_by: boolean
  }
  embed_code: string
  views: number
  clicks: number
  ctr: number
  created_at: string
}

export interface MaaSCategory {
  id: string
  name: string
  slug: string
  emoji: string
  market_count: number
  description: string
  is_premium: boolean
  monthly_addon_price: number
}

export interface MaaSAnalytics {
  client_id: string
  total_views_7d: number
  total_clicks_7d: number
  total_trades_7d: number
  total_revenue_7d: number
  views_by_day: { date: string; views: number; clicks: number; trades: number }[]
  top_widgets: { widget_id: string; widget_name: string; views: number; ctr: number }[]
  revenue_breakdown: { source: string; amount: number }[]
}

// --- Wisdom Feed API types ---

export type WisdomFeedTier = 'tier1' | 'tier2' | 'tier3'

export interface WisdomFeedClient {
  id: string
  company_name: string
  contact_email: string
  contact_name: string
  tier: WisdomFeedTier
  api_key: string
  api_key_hash: string
  status: 'active' | 'suspended' | 'cancelled'
  monthly_price: number
  rate_limit_per_min: number
  total_requests: number
  last_request_at: string | null
  webhook_url: string | null
  webhook_events: string[]
  allowed_categories: string[]
  created_at: string
  expires_at: string | null
}

export interface WisdomFeedLog {
  id: string
  client_id: string
  client_name: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number
  request_size_bytes: number
  response_size_bytes: number
  ip_address: string
  user_agent: string
  error_message: string | null
  created_at: string
}

export interface WisdomFeedUsageStats {
  client_id: string
  total_requests_today: number
  total_requests_month: number
  avg_response_time_ms: number
  error_rate: number
  top_endpoints: { endpoint: string; count: number }[]
  daily_requests: { date: string; count: number }[]
}

export interface WisdomFeedPricingTier {
  id: WisdomFeedTier
  name: string
  price: number
  description: string
  features: string[]
  rate_limit: number
  data_delay: string
  included_endpoints: string[]
}

// --- AI Employee System types ---

export type AgentType = 'scout' | 'oddsmaker' | 'clerk' | 'fraud_analyst' | 'content' | 'supervisor'
export type AgentTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'escalated'
export type AgentActionType = 'scout_scan' | 'market_generate' | 'db_write' | 'fraud_check' | 'content_generate' | 'supervisor_coordinate' | 'market_review' | 'resolution_check'
export type MarketCandidateStatus = 'pending_review' | 'approved' | 'rejected' | 'published' | 'expired'
export type FraudFlagSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FraudFlagStatus = 'open' | 'investigating' | 'resolved' | 'dismissed'
export type ContentQueueStatus = 'pending' | 'generating' | 'ready' | 'published' | 'failed'
export type ContentType = 'social_post' | 'market_summary' | 'seo_description' | 'trending_report' | 'daily_recap'

export interface AgentTask {
  id: string
  agent_type: AgentType
  action_type: AgentActionType
  status: AgentTaskStatus
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  confidence: number | null
  retry_count: number
  max_retries: number
  priority: number
  scheduled_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  parent_task_id: string | null
  created_at: string
}

export interface AgentAction {
  id: string
  task_id: string
  agent_type: AgentType
  action_type: AgentActionType
  description: string
  input_summary: string
  output_summary: string
  confidence: number | null
  duration_ms: number | null
  created_at: string
}

export interface AgentFailure {
  id: string
  task_id: string
  agent_type: AgentType
  error_type: string
  error_message: string
  stack_trace: string | null
  retry_attempt: number
  resolved: boolean
  created_at: string
}

export interface AgentMemory {
  id: string
  agent_type: AgentType
  memory_type: 'finding' | 'pattern' | 'preference' | 'correction' | 'context'
  key: string
  value: Record<string, unknown>
  relevance_score: number
  accessed_count: number
  expires_at: string | null
  created_at: string
}

export interface ScoutFinding {
  id: string
  source: string
  source_url: string | null
  title: string
  summary: string
  category: Category | 'General'
  confidence: number
  sentiment_score: number
  entities: string[]
  topic_tags: string[]
  market_potential: 'high' | 'medium' | 'low' | 'none'
  processed: boolean
  market_candidate_id: string | null
  created_at: string
}

export interface MarketCandidate {
  id: string
  scout_finding_id: string | null
  question: string
  short_title: string
  description: string
  category: Category
  outcomes: string[]
  estimated_probabilities: number[]
  resolution_criteria: string
  resolver_source: string
  close_date: string | null
  suggested_liquidity: number
  semantic_hash: string
  duplicate_of: string | null
  status: MarketCandidateStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  published_market_id: string | null
  created_at: string
}

export interface FraudFlag {
  id: string
  user_id: string | null
  market_id: string | null
  flag_type: 'wash_trading' | 'referral_abuse' | 'suspicious_volume' | 'insider_trading' | 'coordinated_trading' | 'unusual_pattern' | 'multi_account'
  severity: FraudFlagSeverity
  status: FraudFlagStatus
  evidence: Record<string, unknown>
  risk_score: number
  agent_finding: string
  reviewed_by: string | null
  reviewed_at: string | null
  resolution: string | null
  auto_action_taken: string | null
  created_at: string
}

export interface ContentQueue {
  id: string
  content_type: ContentType
  market_id: string | null
  title: string
  body: string
  metadata: Record<string, unknown>
  status: ContentQueueStatus
  scheduled_publish_at: string | null
  published_at: string | null
  agent_task_id: string | null
  created_at: string
}

export interface TrendCluster {
  id: string
  name: string
  category: Category | 'General'
  keywords: string[]
  finding_ids: string[]
  market_count: number
  momentum_score: number
  peak_time: string | null
  created_at: string
}

export interface SentimentSnapshot {
  id: string
  category: Category | 'General'
  sentiment_score: number
  volume_mentions: number
  top_entities: string[]
  top_topics: string[]
  data_source: string
  created_at: string
}

export interface ModerationQueue {
  id: string
  item_type: 'market_candidate' | 'fraud_flag' | 'content'
  item_id: string
  priority: number
  status: 'pending' | 'in_review' | 'resolved'
  assigned_to: string | null
  notes: string | null
  created_at: string
  resolved_at: string | null
}

export interface AgentConfig {
  id: AgentType
  name: string
  description: string
  emoji: string
  enabled: boolean
  schedule_cron: string
  rate_limit_per_hour: number
  confidence_threshold: number
  max_retries: number
  timeout_ms: number
  last_run_at: string | null
  total_tasks: number
  success_rate: number
}
