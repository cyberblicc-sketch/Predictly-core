// ============================================================================
// AI Swarm Tick Function
// Supreme Fusion Prediction Market
// Scheduled Edge Function - runs every 5 minutes via pg_cron
// Uses Groq API (Llama 3.3 70B) for agent decision-making
// ============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { analyzeMarket, validateApiKey } from './groq.ts'
import { AgentDecision, AI_SWARM_CONFIG, MarketForAnalysis } from './types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TradeResult {
  decision: AgentDecision
  status: 'executed' | 'failed'
  position_id?: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const groqApiKey = Deno.env.get('GROQ_API_KEY')!

  // Validate API key
  try {
    validateApiKey(groqApiKey)
  } catch (error) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Check if AI swarm is enabled (admin can disable via environment)
    const aiSwarmEnabled = Deno.env.get('AI_SWARM_ENABLED')
    if (aiSwarmEnabled === 'false') {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'AI Swarm is disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch all active markets with recent activity
    const { data: markets, error: marketsError } = await supabase
      .from('markets')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('volume_24h_sc', { ascending: false })
      .limit(AI_SWARM_CONFIG.max_markets_per_tick)

    if (marketsError) {
      throw marketsError
    }

    if (!markets || markets.length === 0) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'No active markets to analyze' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const allDecisions: AgentDecision[] = []
    const tradeResults: TradeResult[] = []
    let marketsAnalyzed = 0

    // Process each market
    for (const market of markets) {
      // Skip if market resolves in < 1 hour
      const hoursUntilExpiry = (new Date(market.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntilExpiry < AI_SWARM_CONFIG.min_hours_until_expiry) {
        continue
      }

      // Convert to market format for analysis
      const marketForAnalysis: MarketForAnalysis = {
        id: market.id,
        question: market.question,
        yes_probability: Number(market.yes_probability),
        no_probability: Number(market.no_probability),
        yes_pool: Number(market.yes_pool_sc),
        no_pool: Number(market.no_pool_sc),
        total_volume: Number(market.total_volume_sc),
        volume_24h: Number(market.volume_24h_sc),
        category: market.category_id?.toString() || 'general',
        expires_at: market.expires_at,
        resolution: market.resolution,
        status: market.status
      }

      // Get agent decisions from Groq
      const decisions = await analyzeMarket(marketForAnalysis, groqApiKey)
      marketsAnalyzed++

      if (decisions.length === 0) {
        continue
      }

      allDecisions.push(...decisions)

      // Execute trades (max 10 per tick)
      for (const decision of decisions) {
        if (tradeResults.length >= AI_SWARM_CONFIG.max_trades_per_tick) {
          break
        }

        // Skip if confidence is below threshold
        if (decision.confidence < AI_SWARM_CONFIG.min_confidence_threshold) {
          continue
        }

        // Execute trade
        const result = await executeTrade(supabase, decision)
        tradeResults.push(result)
      }

      if (tradeResults.length >= AI_SWARM_CONFIG.max_trades_per_tick) {
        break
      }
    }

    // Log execution summary
    const executedCount = tradeResults.filter(t => t.status === 'executed').length
    const failedCount = tradeResults.filter(t => t.status === 'failed').length

    console.log(`AI Swarm Tick: markets=${marketsAnalyzed}, decisions=${allDecisions.length}, executed=${executedCount}, failed=${failedCount}`)

    return new Response(JSON.stringify({
      ok: true,
      tick_at: new Date().toISOString(),
      markets_analyzed: marketsAnalyzed,
      decisions_generated: allDecisions.length,
      trades_executed: executedCount,
      trades_failed: failedCount,
      trades: tradeResults.map(t => ({
        agent: t.decision.agent,
        market_id: t.decision.market_id,
        side: t.decision.side,
        amount: t.decision.amount,
        confidence: t.decision.confidence,
        status: t.status,
        position_id: t.position_id,
        error: t.error
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('AI Swarm Tick Error:', error)
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Execute a single trade from AI agent decision
 */
async function executeTrade(
  supabase: any, 
  decision: AgentDecision
): Promise<TradeResult> {
  const aiUserId = AI_SWARM_CONFIG.ai_user_id

  try {
    // Check AI user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('sc_balance')
      .eq('id', aiUserId)
      .single()

    if (userError || !user) {
      throw new Error(`AI user not found: ${aiUserId}`)
    }

    if (Number(user.sc_balance) < decision.amount) {
      throw new Error(`Insufficient AI balance: ${user.sc_balance} < ${decision.amount}`)
    }

    // Execute trade via RPC
    const { data: result, error: tradeError } = await supabase.rpc('process_stake', {
      p_user_id: aiUserId,
      p_market_id: decision.market_id,
      p_side: decision.side,
      p_amount: decision.amount,
      p_currency: 'sc'
    })

    if (tradeError) {
      throw tradeError
    }

    // Log successful trade
    await supabase.from('ai_agent_trades').insert({
      agent_name: decision.agent,
      market_id: decision.market_id,
      side: decision.side,
      amount: decision.amount,
      reason: decision.reason,
      status: 'executed',
      execution_price: decision.confidence, // Using confidence as proxy for execution price
      executed_at: new Date().toISOString()
    })

    return {
      decision,
      status: 'executed',
      position_id: result?.position_id
    }

  } catch (error) {
    console.error(`Trade failed for ${decision.agent}:`, error)

    // Log failed trade
    await supabase.from('ai_agent_trades').insert({
      agent_name: decision.agent,
      market_id: decision.market_id,
      side: decision.side,
      amount: decision.amount,
      reason: decision.reason,
      status: 'failed'
    })

    return {
      decision,
      status: 'failed',
      error: error.message
    }
  }
}