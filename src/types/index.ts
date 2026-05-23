// ============================================================================
// Supreme Fusion — TypeScript interfaces
// Fuses Predictly's UI types with Supreme Fusion's backend types
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
