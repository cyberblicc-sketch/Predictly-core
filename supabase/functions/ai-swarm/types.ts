// ============================================================================
// AI Swarm System - Agent Types and Strategies
// Supreme Fusion Prediction Market
// Uses Groq API (Llama 3.3 70B) for agent decision-making
// ============================================================================

/**
 * AI Agent Types
 * Each agent has a distinct trading strategy for prediction markets
 */
export type AgentType = 'momentum' | 'contrarian' | 'arbitrage' | 'sentiment'

/**
 * Trading sides
 */
export type TradeSide = 'yes' | 'no'

/**
 * Agent decision output from Groq analysis
 */
export interface AgentDecision {
  agent: AgentType
  market_id: string
  side: TradeSide
  amount: number  // Amount in SC
  confidence: number  // 0-1 confidence threshold
  reason: string  // Human-readable reasoning
}

/**
 * Market data structure for AI analysis
 */
export interface MarketForAnalysis {
  id: string
  question: string
  yes_probability: number
  no_probability: number
  yes_pool: number  // SC pool for YES
  no_pool: number   // SC pool for NO
  total_volume: number
  volume_24h: number
  category: string
  expires_at: string
  resolution?: string | null
  status: string
}

/**
 * Agent configuration and behavior rules
 */
export interface AgentConfig {
  name: AgentType
  description: string
  strategy: string
  budget_per_tick: number  // SC budget per 5-minute tick
  max_daily_amount: number // Max SC per agent per day
  min_confidence: number   // Minimum confidence to execute (0-1)
  skip_if_resolves_hours: number // Skip if market resolves within this many hours
}

/**
 * AI Swarm global configuration
 */
export const AI_SWARM_CONFIG = {
  // Tick configuration
  tick_interval_minutes: 5,
  max_trades_per_tick: 10,
  max_markets_per_tick: 20,
  
  // Budget limits
  budget_per_agent_per_tick: 1000,  // SC
  max_per_agent_per_day: 50000,     // SC
  
  // Thresholds
  min_confidence_threshold: 0.7,
  min_hours_until_expiry: 1,
  
  // AI User ID for trades (system user)
  ai_user_id: '00000000-0000-0000-0000-000000000001'
} as const

/**
 * Agent behavior definitions
 */
export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  momentum: {
    name: 'momentum',
    description: 'Follows price trends',
    strategy: 'Buy YES if probability is rising, buy NO if probability is falling. Momentum agents ride the trend.',
    budget_per_tick: 1000,
    max_daily_amount: 50000,
    min_confidence: 0.7,
    skip_if_resolves_hours: 1
  },
  contrarian: {
    name: 'contrarian',
    description: 'Bets against market overreactions',
    strategy: 'Buy opposite of the trend when markets overreact. Profitable when sentiment is too extreme.',
    budget_per_tick: 1000,
    max_daily_amount: 50000,
    min_confidence: 0.7,
    skip_if_resolves_hours: 1
  },
  arbitrage: {
    name: 'arbitrage',
    description: 'Exploits probability mismatches',
    strategy: 'Looks for mispricings between related markets or between prediction and actual probability.',
    budget_per_tick: 1000,
    max_daily_amount: 50000,
    min_confidence: 0.7,
    skip_if_resolves_hours: 1
  },
  sentiment: {
    name: 'sentiment',
    description: 'Analyzes news and social signals',
    strategy: 'Analyzes news headlines, social media sentiment, and market discussion for direction.',
    budget_per_tick: 1000,
    max_daily_amount: 50000,
    min_confidence: 0.7,
    skip_if_resolves_hours: 1
  }
}

/**
 * Trade execution result
 */
export interface TradeResult {
  success: boolean
  decision: AgentDecision
  position_id?: string
  cost?: number
  error?: string
}

/**
 * Daily AI trading statistics
 */
export interface DailyAgentStats {
  agent_name: AgentType
  executed_trades: number
  failed_trades: number
  total_amount: number
  total_cost: number
  last_trade_at: string | null
}

/**
 * AI Trade record from database
 */
export interface AITradeRecord {
  id: string
  agent_name: string
  market_id: string
  side: TradeSide
  amount: number
  reason: string
  status: 'pending' | 'executed' | 'failed'
  execution_price: number | null
  created_at: string
  executed_at: string | null
}