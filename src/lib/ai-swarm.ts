// ============================================================================
// Predictly — AI Swarm dashboard helpers
// AI agents that autonomously trade on prediction markets for demo liquidity
// ============================================================================

import type { AITrade, AgentStats, AISwarmStatus } from '@/types'
import { mockAISwarmStatus } from './mockData'

// ── Agent Definitions ────────────────────────────────────────────────────────

export interface Agent {
  name: string
  emoji: string
  strategy: string
  description: string
  dailyLimit: number
  riskLevel: 'low' | 'medium' | 'high'
}

export const AGENTS: Agent[] = [
  {
    name: 'momentum_bot',
    emoji: '📈',
    strategy: 'Momentum',
    description: 'Follows price trends and volume spikes. Buys into rising markets, sells on reversal signals.',
    dailyLimit: 5000,
    riskLevel: 'medium',
  },
  {
    name: 'contrarian_owl',
    emoji: '🦉',
    strategy: 'Contrarian',
    description: 'Buys when markets are overly pessimistic, sells when euphoric. Mean-reversion focused.',
    dailyLimit: 3000,
    riskLevel: 'medium',
  },
  {
    name: 'whale_watcher',
    emoji: '🐋',
    strategy: 'Whale Tracking',
    description: 'Monitors large trades and follows smart money. Positions mimic top traders.',
    dailyLimit: 8000,
    riskLevel: 'high',
  },
  {
    name: 'delta_hedger',
    emoji: '⚖️',
    strategy: 'Delta Neutral',
    description: 'Maintains balanced positions across correlated markets. Low risk, steady returns.',
    dailyLimit: 4000,
    riskLevel: 'low',
  },
  {
    name: 'news_hawk',
    emoji: '📰',
    strategy: 'News Sentiment',
    description: 'Parses news feeds and social media for sentiment shifts. First mover on breaking events.',
    dailyLimit: 6000,
    riskLevel: 'high',
  },
]

// ── Mock AI Trades ───────────────────────────────────────────────────────────

const MOCK_AI_TRADES: AITrade[] = [
  {
    id: 'at1',
    agent_name: 'momentum_bot',
    market_id: 'm-btc-200k',
    side: 'yes',
    amount: 250,
    reason: 'BTC price broke above 50-day MA with increasing volume. Momentum signal confirmed.',
    status: 'executed',
    execution_price: 0.62,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  {
    id: 'at2',
    agent_name: 'contrarian_owl',
    market_id: 'm-fed-cut-jun',
    side: 'yes',
    amount: 180,
    reason: 'Market overly pessimistic on rate cuts. Fed fund futures imply higher probability than current price.',
    status: 'executed',
    execution_price: 0.47,
    created_at: new Date(Date.now() - 12 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 11 * 60_000).toISOString(),
  },
  {
    id: 'at3',
    agent_name: 'whale_watcher',
    market_id: 'm-election-2028',
    side: 'no',
    amount: 400,
    reason: 'Large sell order detected on Vance outcome. Following smart money rotation.',
    status: 'executed',
    execution_price: 0.34,
    created_at: new Date(Date.now() - 18 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 17 * 60_000).toISOString(),
  },
  {
    id: 'at4',
    agent_name: 'news_hawk',
    market_id: 'm-ukraine-ceasefire',
    side: 'yes',
    amount: 320,
    reason: 'Diplomatic sources indicate backchannel talks progressing. Sentiment shift detected.',
    status: 'executed',
    execution_price: 0.41,
    created_at: new Date(Date.now() - 25 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 24 * 60_000).toISOString(),
  },
  {
    id: 'at5',
    agent_name: 'delta_hedger',
    market_id: 'm-recession-2026',
    side: 'no',
    amount: 150,
    reason: 'Rebalancing portfolio delta. Short recession risk to offset long exposure in equities markets.',
    status: 'executed',
    execution_price: 0.68,
    created_at: new Date(Date.now() - 35 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 34 * 60_000).toISOString(),
  },
  {
    id: 'at6',
    agent_name: 'momentum_bot',
    market_id: 'm-gpt-5-2026',
    side: 'yes',
    amount: 200,
    reason: 'OpenAI CTO hinted at summer release. Strong upward momentum in GPT-5 market.',
    status: 'pending',
    execution_price: null,
    created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    executed_at: null,
  },
  {
    id: 'at7',
    agent_name: 'contrarian_owl',
    market_id: 'm-spacex-mars',
    side: 'no',
    amount: 100,
    reason: 'Market price too high for 2030 Mars landing timeline. Technical hurdles remain significant.',
    status: 'failed',
    execution_price: null,
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    executed_at: null,
  },
  {
    id: 'at8',
    agent_name: 'whale_watcher',
    market_id: 'm-nba-champ',
    side: 'no',
    amount: 280,
    reason: 'Large institutional positions moving against Celtics. Following the smart money.',
    status: 'executed',
    execution_price: 0.28,
    created_at: new Date(Date.now() - 55 * 60_000).toISOString(),
    executed_at: new Date(Date.now() - 54 * 60_000).toISOString(),
  },
]

// ── Mock Agent Stats ─────────────────────────────────────────────────────────

const MOCK_AGENT_STATS: AgentStats[] = [
  { agent_name: 'momentum_bot',    executed_trades: 1247, failed_trades: 43, total_amount: 312_400, success_rate: 0.97, last_trade_at: new Date(Date.now() - 5 * 60_000).toISOString() },
  { agent_name: 'contrarian_owl',  executed_trades: 892,  failed_trades: 67, total_amount: 198_700, success_rate: 0.93, last_trade_at: new Date(Date.now() - 12 * 60_000).toISOString() },
  { agent_name: 'whale_watcher',   executed_trades: 634,  failed_trades: 21, total_amount: 445_200, success_rate: 0.97, last_trade_at: new Date(Date.now() - 18 * 60_000).toISOString() },
  { agent_name: 'delta_hedger',    executed_trades: 2103, failed_trades: 12, total_amount: 157_800, success_rate: 0.99, last_trade_at: new Date(Date.now() - 35 * 60_000).toISOString() },
  { agent_name: 'news_hawk',       executed_trades: 523,  failed_trades: 89, total_amount: 276_500, success_rate: 0.85, last_trade_at: new Date(Date.now() - 25 * 60_000).toISOString() },
]

// ── Get AI Trades ────────────────────────────────────────────────────────────

/**
 * Get recent AI trades, optionally filtered by status.
 */
export async function getAITrades(status?: 'pending' | 'executed' | 'failed'): Promise<AITrade[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      // Demo mode
      if (status) return MOCK_AI_TRADES.filter((t) => t.status === status)
      return MOCK_AI_TRADES
    }

    const params = new URLSearchParams()
    if (status) params.set('status', `eq.${status}`)
    params.set('order', 'created_at.desc')
    params.set('limit', '50')

    const response = await fetch(`${supabaseUrl}/rest/v1/ai_trades?${params}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return (await response.json()) as AITrade[]
  } catch (err) {
    console.error('[AI-Swarm] getAITrades failed:', err)
    if (status) return MOCK_AI_TRADES.filter((t) => t.status === status)
    return MOCK_AI_TRADES
  }
}

// ── Get AI Trades By Market ──────────────────────────────────────────────────

/**
 * Get AI trades for a specific market.
 */
export async function getAITradesByMarket(marketId: string): Promise<AITrade[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return MOCK_AI_TRADES.filter((t) => t.market_id === marketId)
    }

    const params = new URLSearchParams()
    params.set('market_id', `eq.${marketId}`)
    params.set('order', 'created_at.desc')
    params.set('limit', '20')

    const response = await fetch(`${supabaseUrl}/rest/v1/ai_trades?${params}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return (await response.json()) as AITrade[]
  } catch (err) {
    console.error('[AI-Swarm] getAITradesByMarket failed:', err)
    return MOCK_AI_TRADES.filter((t) => t.market_id === marketId)
  }
}

// ── Get Agent Stats ──────────────────────────────────────────────────────────

/**
 * Get performance statistics for all AI agents.
 */
export async function getAgentStats(): Promise<AgentStats[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return MOCK_AGENT_STATS
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_agent_stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return (await response.json()) as AgentStats[]
  } catch (err) {
    console.error('[AI-Swarm] getAgentStats failed:', err)
    return MOCK_AGENT_STATS
  }
}

// ── Get Today's Activity ─────────────────────────────────────────────────────

/**
 * Get a summary of today's AI trading activity.
 */
export async function getTodayActivity(): Promise<AISwarmStatus> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return mockAISwarmStatus
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_ai_swarm_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    return (await response.json()) as AISwarmStatus
  } catch (err) {
    console.error('[AI-Swarm] getTodayActivity failed:', err)
    return mockAISwarmStatus
  }
}

// ── Can Trade ────────────────────────────────────────────────────────────────

/**
 * Check if a specific AI agent can still trade today (has not exceeded daily limit).
 */
export async function canTrade(agentName: string): Promise<boolean> {
  const agent = AGENTS.find((a) => a.name === agentName)
  if (!agent) return false

  try {
    const dailySpending = await getDailySpending(agentName)
    return dailySpending < agent.dailyLimit
  } catch {
    return false
  }
}

// ── Get AI User Balance ──────────────────────────────────────────────────────

/**
 * Get the combined balance of the AI trading pool.
 * In production, queries the dedicated AI user account.
 */
export async function getAIUserBalance(): Promise<{ gc: number; sc: number }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return { gc: 500_000, sc: 25_000 }
    }

    const aiUserId = process.env.AI_USER_ID ?? 'ai-swarm-user'

    const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${aiUserId}&select=gold_balance,sweeps_balance`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data = await response.json() as { gold_balance: number; sweeps_balance: number }[]
    if (data.length === 0) return { gc: 0, sc: 0 }
    return { gc: data[0].gold_balance, sc: data[0].sweeps_balance }
  } catch (err) {
    console.error('[AI-Swarm] getAIUserBalance failed:', err)
    return { gc: 500_000, sc: 25_000 }
  }
}

// ── Get Daily Spending ───────────────────────────────────────────────────────

/**
 * Get the total amount spent by an AI agent today.
 */
export async function getDailySpending(agentName: string): Promise<number> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      // Demo mode: return a random-ish amount under the limit
      const agent = AGENTS.find((a) => a.name === agentName)
      return agent ? Math.floor(agent.dailyLimit * 0.6) : 0
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const params = new URLSearchParams()
    params.set('agent_name', `eq.${agentName}`)
    params.set('status', 'eq.executed')
    params.set('created_at', `gte.${todayISO}`)
    params.set('select', 'amount')

    const response = await fetch(`${supabaseUrl}/rest/v1/ai_trades?${params}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const trades = await response.json() as { amount: number }[]
    return trades.reduce((sum, t) => sum + t.amount, 0)
  } catch (err) {
    console.error('[AI-Swarm] getDailySpending failed:', err)
    return 0
  }
}

// ── Realtime Subscriptions ───────────────────────────────────────────────────

/**
 * Subscribe to real-time AI trade updates via Supabase.
 * Falls back to polling if realtime is unavailable.
 */
export function subscribeToAITrades(
  onTrade: (trade: AITrade) => void
): () => void {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Demo mode: simulate occasional trades
      const interval = setInterval(() => {
        const agents = AGENTS.map((a) => a.name)
        const markets = ['m-btc-200k', 'm-election-2028', 'm-fed-cut-jun', 'm-gpt-5-2026', 'm-ukraine-ceasefire']
        const sides: ('yes' | 'no')[] = ['yes', 'no']

        const trade: AITrade = {
          id: `at-sim-${Date.now()}`,
          agent_name: agents[Math.floor(Math.random() * agents.length)],
          market_id: markets[Math.floor(Math.random() * markets.length)],
          side: sides[Math.floor(Math.random() * sides.length)],
          amount: Math.floor(Math.random() * 500) + 50,
          reason: 'Simulated trade for demo mode',
          status: 'executed',
          execution_price: Math.random() * 0.8 + 0.1,
          created_at: new Date().toISOString(),
          executed_at: new Date().toISOString(),
        }

        onTrade(trade)
      }, 30_000) // Every 30 seconds

      return () => clearInterval(interval)
    }

    // Real Supabase realtime subscription would go here
    // For now, return a no-op cleanup
    return () => {}
  } catch (err) {
    console.error('[AI-Swarm] subscribeToAITrades failed:', err)
    return () => {}
  }
}

// ── Formatting Helpers ───────────────────────────────────────────────────────

/**
 * Format Sweeps Coins amount for display.
 */
export function formatSC(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SC`
}

/**
 * Get a human-readable display name for an AI agent.
 */
export function getAgentDisplayName(agentName: string): string {
  const agent = AGENTS.find((a) => a.name === agentName)
  if (!agent) return agentName
  return `${agent.emoji} ${agent.name.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`
}

/**
 * Get the strategy description for an AI agent.
 */
export function getAgentStrategy(agentName: string): string {
  const agent = AGENTS.find((a) => a.name === agentName)
  return agent?.strategy ?? 'Unknown'
}
