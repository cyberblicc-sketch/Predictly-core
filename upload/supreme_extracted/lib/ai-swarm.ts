// ============================================================================
// AI Agent Dashboard Helper Functions
// Supreme Fusion Prediction Market
// Client-side utilities for AI Swarm dashboard
// ============================================================================

import { supabase } from './supabase'

/**
 * AI Trade record from database
 */
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

/**
 * Agent statistics
 */
export interface AgentStats {
  agent_name: string
  executed_trades: number
  failed_trades: number
  total_amount: number
  success_rate: number
  last_trade_at: string | null
}

/**
 * Daily spending per agent
 */
export interface DailySpending {
  agent_name: string
  date: string
  total_amount: number
  trade_count: number
}

/**
 * AI Swarm overall status
 */
export interface AISwarmStatus {
  enabled: boolean
  running: boolean
  last_tick_at: string | null
  total_trades_today: number
  total_amount_today: number
}

/**
 * Get recent AI trades
 */
export async function getAITrades(limit = 50): Promise<AITrade[]> {
  const { data, error } = await supabase
    .from('ai_agent_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching AI trades:', error)
    return []
  }

  return data || []
}

/**
 * Get AI trades for a specific market
 */
export async function getAITradesByMarket(marketId: string): Promise<AITrade[]> {
  const { data, error } = await supabase
    .from('ai_agent_trades')
    .select('*')
    .eq('market_id', marketId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching AI trades for market:', error)
    return []
  }

  return data || []
}

/**
 * Get aggregated statistics per agent
 */
export async function getAgentStats(): Promise<Record<string, AgentStats>> {
  const { data, error } = await supabase
    .from('ai_agent_trades')
    .select('agent_name, status, amount, executed_at')

  if (error) {
    console.error('Error fetching agent stats:', error)
    return {}
  }

  const stats: Record<string, AgentStats> = {
    momentum: { agent_name: 'momentum', executed_trades: 0, failed_trades: 0, total_amount: 0, success_rate: 0, last_trade_at: null },
    contrarian: { agent_name: 'contrarian', executed_trades: 0, failed_trades: 0, total_amount: 0, success_rate: 0, last_trade_at: null },
    arbitrage: { agent_name: 'arbitrage', executed_trades: 0, failed_trades: 0, total_amount: 0, success_rate: 0, last_trade_at: null },
    sentiment: { agent_name: 'sentiment', executed_trades: 0, failed_trades: 0, total_amount: 0, success_rate: 0, last_trade_at: null }
  }

  data?.forEach((trade: any) => {
    if (!stats[trade.agent_name]) return
    
    if (trade.status === 'executed') {
      stats[trade.agent_name].executed_trades++
      stats[trade.agent_name].total_amount += Number(trade.amount)
      if (trade.executed_at && (!stats[trade.agent_name].last_trade_at || trade.executed_at > stats[trade.agent_name].last_trade_at)) {
        stats[trade.agent_name].last_trade_at = trade.executed_at
      }
    } else if (trade.status === 'failed') {
      stats[trade.agent_name].failed_trades++
    }
  })

  // Calculate success rates
  Object.values(stats).forEach(agent => {
    const total = agent.executed_trades + agent.failed_trades
    agent.success_rate = total > 0 ? agent.executed_trades / total : 0
  })

  return stats
}

/**
 * Get today's trading activity
 */
export async function getTodayActivity(): Promise<{
  total_trades: number
  total_amount: number
  by_agent: Record<string, { trades: number, amount: number }>
}> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('ai_agent_trades')
    .select('agent_name, status, amount, created_at')
    .gte('created_at', today)

  if (error) {
    console.error('Error fetching today activity:', error)
    return { total_trades: 0, total_amount: 0, by_agent: {} }
  }

  const result = {
    total_trades: 0,
    total_amount: 0,
    by_agent: {} as Record<string, { trades: number, amount: number }>
  }

  data?.forEach((trade: any) => {
    if (trade.status === 'executed') {
      result.total_trades++
      result.total_amount += Number(trade.amount)
      
      if (!result.by_agent[trade.agent_name]) {
        result.by_agent[trade.agent_name] = { trades: 0, amount: 0 }
      }
      result.by_agent[trade.agent_name].trades++
      result.by_agent[trade.agent_name].amount += Number(trade.amount)
    }
  })

  return result
}

/**
 * Check if AI trading is allowed (daily limit check)
 */
export async function canTrade(agentName: string, amount: number): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_ai_daily_limit', {
      p_agent_name: agentName,
      p_amount: amount
    })

  if (error) {
    console.error('Error checking daily limit:', error)
    return false
  }

  return data === true
}

/**
 * Get AI user balance
 */
export async function getAIUserBalance(): Promise<{ sc_balance: number; gc_balance: number } | null> {
  const AI_USER_ID = '00000000-0000-0000-0000-000000000001'
  
  const { data, error } = await supabase
    .from('users')
    .select('sc_balance, gc_balance')
    .eq('id', AI_USER_ID)
    .single()

  if (error) {
    console.error('Error fetching AI user balance:', error)
    return null
  }

  return {
    sc_balance: Number(data.sc_balance),
    gc_balance: Number(data.gc_balance)
  }
}

/**
 * Get AI daily spending by agent
 */
export async function getDailySpending(): Promise<DailySpending[]> {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('ai_daily_spending')
    .select('*')
    .eq('date', today)
    .order('total_amount', { ascending: false })

  if (error) {
    console.error('Error fetching daily spending:', error)
    return []
  }

  return data || []
}

/**
 * Subscribe to AI trade updates (real-time)
 */
export function subscribeToAITrades(
  callback: (trade: AITrade) => void
): () => void {
  const subscription = supabase
    .channel('ai-trades-realtime')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'ai_agent_trades'
    }, (payload) => {
      callback(payload.new as AITrade)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(subscription)
  }
}

/**
 * Format currency for display
 */
export function formatSC(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SC'
}

/**
 * Get agent display name
 */
export function getAgentDisplayName(agentName: string): string {
  const names: Record<string, string> = {
    momentum: '📈 Momentum',
    contrarian: '🔄 Contrarian',
    arbitrage: '⚖️ Arbitrage',
    sentiment: '📰 Sentiment'
  }
  return names[agentName] || agentName
}

/**
 * Get agent strategy description
 */
export function getAgentStrategy(agentName: string): string {
  const strategies: Record<string, string> = {
    momentum: 'Follows price trends. Buys YES when probability rising, NO when falling.',
    contrarian: 'Bets against market overreactions. Profitable when sentiment is too extreme.',
    arbitrage: 'Exploits probability mismatches across related markets.',
    sentiment: 'Analyzes news and social signals for market direction.'
  }
  return strategies[agentName] || 'Unknown strategy'
}