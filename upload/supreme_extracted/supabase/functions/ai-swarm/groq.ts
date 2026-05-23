// ============================================================================
// AI Swarm System - Groq API Integration
// Supreme Fusion Prediction Market
// Uses Llama 3.3 70B Versatile (Free tier: 14k tokens/min)
// ============================================================================

import { AgentDecision, MarketForAnalysis, AGENT_CONFIGS } from './types.ts'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

/**
 * Call Groq API with market analysis prompt
 */
async function callGroq(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an AI trading agent analyzing prediction markets. Return ONLY valid JSON array with trading decisions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Generate agent decisions for a single market
 */
export async function analyzeMarket(
  market: MarketForAnalysis,
  apiKey: string
): Promise<AgentDecision[]> {
  const hoursUntilExpiry = (new Date(market.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)
  
  // Skip if market resolves too soon
  if (hoursUntilExpiry < AGENT_CONFIGS.momentum.skip_if_resolves_hours) {
    console.log(`Skipping market ${market.id} - resolves in ${hoursUntilExpiry.toFixed(1)} hours`)
    return []
  }

  const prompt = `You are an AI trading agent analyzing prediction markets.

Market: ${market.question}
Current Probability: ${(market.yes_probability * 100).toFixed(1)}% YES / ${(market.no_probability * 100).toFixed(1)}% NO
Pool Sizes: ${market.yes_pool} SC YES / ${market.no_pool} SC NO
24h Volume: ${market.volume_24h} SC
Category: ${market.category}
Expires: ${market.expires_at}

Analyze this market and provide trading decisions for 4 agents:
1. MOMENTUM: Follows price trends. Buy YES if probability rising, NO if falling.
2. CONTRARIAN: Bets against overreactions. Buy opposite of trend.
3. ARBITRAGE: Looks for mispricings across related markets.
4. SENTIMENT: Analyzes news/crypto signals for direction.

Each agent gets a budget of 1000 SC per tick.
Only execute if confidence > 0.7.
Skip if market resolves in < 1 hour.

Return JSON array with decisions:
[{"agent": "momentum", "market_id": "${market.id}", "side": "yes", "amount": 1000, "confidence": 0.85, "reason": "probability trending up with volume support"}]`

  try {
    const responseText = await callGroq(prompt, apiKey)
    
    // Parse JSON response
    let decisions: AgentDecision[] = JSON.parse(responseText)
    
    // Validate and filter decisions
    decisions = decisions.filter(d => {
      if (!['momentum', 'contrarian', 'arbitrage', 'sentiment'].includes(d.agent)) return false
      if (!['yes', 'no'].includes(d.side)) return false
      if (typeof d.amount !== 'number' || d.amount <= 0) return false
      if (typeof d.confidence !== 'number' || d.confidence < 0 || d.confidence > 1) return false
      return true
    })
    
    // Filter by confidence threshold
    const minConfidence = AGENT_CONFIGS.momentum.min_confidence
    decisions = decisions.filter(d => d.confidence >= minConfidence)
    
    return decisions
  } catch (error) {
    console.error(`Error analyzing market ${market.id}:`, error)
    return []
  }
}

/**
 * Analyze multiple markets and get combined decisions
 */
export async function analyzeMarkets(
  markets: MarketForAnalysis[],
  apiKey: string
): Promise<Map<string, AgentDecision[]>> {
  const results = new Map<string, AgentDecision[]>()
  
  for (const market of markets) {
    const decisions = await analyzeMarket(market, apiKey)
    if (decisions.length > 0) {
      results.set(market.id, decisions)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return results
}

/**
 * Validate that Groq API key is configured
 */
export function validateApiKey(apiKey: string | undefined): apiKey is string {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }
  if (apiKey.length < 10) {
    throw new Error('GROQ_API_KEY appears to be invalid')
  }
  return true
}

/**
 * Get estimated cost in tokens for a prompt
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Check if we're within rate limits (14k tokens/min free tier)
 */
export function withinRateLimit(estimatedTokens: number, recentTokensUsed: number): boolean {
  const limitPerMinute = 14000
  return (recentTokensUsed + estimatedTokens) <= limitPerMinute
}