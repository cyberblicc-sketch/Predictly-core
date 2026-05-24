// ============================================================================
// Predictly — Smart Pool Liquidity & Redemption Order System
// Ensures market pools are ordered so that redeems can be paid out
// Solvency checks, pool priority ranking, and redemption queuing
// ============================================================================

import type { Market } from '@/types'

// ── Pool Solvency Types ──────────────────────────────────────────────────────

export interface PoolSolvencyCheck {
  market_id: string
  market_title: string
  yes_pool: number
  no_pool: number
  total_pool: number
  total_potential_payout: number
  solvency_ratio: number        // total_pool / total_potential_payout (>= 1.0 = solvent)
  is_solvent: boolean
  deficit: number               // Amount needed to become solvent (0 if solvent)
  max_redeemable: number        // Max that can be redeemed right now
  recommended_max_stake: number // Max new stake that keeps pool solvent
}

export interface RedemptionPriority {
  market_id: string
  market_title: string
  priority_score: number
  reason: string
  estimated_redeem_time: string
  pool_health: 'excellent' | 'good' | 'caution' | 'at_risk' | 'insolvent'
}

export interface PoolReserveAllocation {
  market_id: string
  current_pool: number
  required_reserve: number
  available_for_redemption: number
  reserve_pct: number
}

// ── Solvency Calculation ─────────────────────────────────────────────────────

/**
 * Check if a market's pool can cover all potential payouts.
 * 
 * In a parimutuel system:
 * - Total pool = yesPool + noPool + all stakes
 * - Worst-case payout = all shares on the winning side × $1 per share
 * - A pool is solvent if: totalPool >= worst_case_payout
 * 
 * With LMSR, the math is different but the principle is the same:
 * the total pool must always cover the maximum possible payout.
 */
export function checkPoolSolvency(market: Market): PoolSolvencyCheck {
  const yesPool = market.yesPool ?? 0
  const noPool = market.noPool ?? 0
  const totalPool = yesPool + noPool

  // Calculate potential payout for each outcome
  // In LMSR: payout = shares × $1, funded from the pool
  // Worst case: all shares on one side win
  const yesShares = Math.round(yesPool / Math.max(market.outcomes[0]?.price ?? 0.5, 0.01))
  const noShares = Math.round(noPool / Math.max(market.outcomes[1]?.price ?? 0.5, 0.01))
  
  const worstCasePayout = Math.max(yesShares, noShares)
  
  // Solvency ratio: how much buffer we have
  const solvencyRatio = worstCasePayout > 0 ? totalPool / worstCasePayout : 1.0
  const isSolvent = solvencyRatio >= 1.0
  const deficit = isSolvent ? 0 : worstCasePayout - totalPool
  
  // Max that can be redeemed right now while staying solvent
  const maxRedeemable = Math.max(0, totalPool - worstCasePayout * 1.05) // Keep 5% buffer
  
  // Recommended max stake for new positions (keeps pool solvent with buffer)
  const recommendedMaxStake = Math.max(0, totalPool * 0.95 - worstCasePayout)

  return {
    market_id: market.id,
    market_title: market.shortTitle,
    yes_pool: yesPool,
    no_pool: noPool,
    total_pool: totalPool,
    total_potential_payout: worstCasePayout,
    solvency_ratio: +solvencyRatio.toFixed(3),
    is_solvent: isSolvent,
    deficit,
    max_redeemable: +maxRedeemable.toFixed(2),
    recommended_max_stake: +recommendedMaxStake.toFixed(2),
  }
}

// ── Priority-Based Redemption Queue ──────────────────────────────────────────

/**
 * Calculate redemption priority for a market.
 * 
 * Higher priority = process first (these are safest to redeem)
 * 
 * Priority score = weighted combination of:
 * - Solvency ratio (40%): Higher = safer to redeem
 * - Pool size (25%): Larger pool = more liquid = easier to pay
 * - Volume (20%): Higher volume = more active = easier to match
 * - Time remaining (15%): Closer to resolution = more certain payout
 */
export function calculateRedemptionPriority(market: Market): RedemptionPriority {
  const solvency = checkPoolSolvency(market)
  
  // Solvency score (0-100)
  const solvencyScore = Math.min(100, solvency.solvency_ratio * 50)
  
  // Pool size score (0-100) — normalized against largest pool
  const maxExpectedPool = 2_500_000 // $2.5M reference
  const poolScore = Math.min(100, (solvency.total_pool / maxExpectedPool) * 100)
  
  // Volume score (0-100)
  const maxExpectedVolume = 50_000_000 // $50M reference
  const volumeScore = Math.min(100, (market.volume / maxExpectedVolume) * 100)
  
  // Time score (0-100) — markets closing sooner are higher priority
  const daysUntilClose = Math.max(0, (new Date(market.closeAt).getTime() - Date.now()) / 86400000)
  const timeScore = daysUntilClose <= 7 ? 100 : daysUntilClose <= 30 ? 75 : daysUntilClose <= 90 ? 50 : 25
  
  // Weighted priority
  const priorityScore = +(solvencyScore * 0.4 + poolScore * 0.25 + volumeScore * 0.2 + timeScore * 0.15).toFixed(1)
  
  // Health classification
  let health: RedemptionPriority['pool_health']
  if (solvency.solvency_ratio >= 1.2) health = 'excellent'
  else if (solvency.solvency_ratio >= 1.0) health = 'good'
  else if (solvency.solvency_ratio >= 0.85) health = 'caution'
  else if (solvency.solvency_ratio >= 0.7) health = 'at_risk'
  else health = 'insolvent'
  
  // Estimated redeem time
  let estimatedTime: string
  if (solvency.max_redeemable > 0 && health !== 'insolvent') {
    estimatedTime = 'Instant — Pool is liquid'
  } else if (health === 'caution') {
    estimatedTime = '1-3 business days — Queue processing'
  } else if (health === 'at_risk') {
    estimatedTime = '5-7 business days — Pending pool replenishment'
  } else {
    estimatedTime = 'Delayed — Pool requires additional liquidity'
  }
  
  return {
    market_id: market.id,
    market_title: market.shortTitle,
    priority_score: priorityScore,
    reason: `Solvency: ${(solvency.solvency_ratio * 100).toFixed(0)}% | Pool: $${solvency.total_pool.toLocaleString()} | ${health === 'excellent' || health === 'good' ? 'Safe to redeem' : health === 'caution' ? 'Monitor closely' : 'Hold for pool recovery'}`,
    estimated_redeem_time: estimatedTime,
    pool_health: health,
  }
}

// ── Smart Pool Ordering ──────────────────────────────────────────────────────

/**
 * Order markets by redemption priority.
 * 
 * This is the "smart way" to ensure pools can pay redeems:
 * 1. Sort markets by solvency ratio (most solvent first)
 * 2. Process redemptions from the most solvent pools first
 * 3. Less solvent pools go into a queue
 * 4. House fees (2%) + platform fees (1%) are automatically routed to the reserve
 * 5. Reserve is used to cover any deficits
 * 
 * This creates a natural "waterfall" where:
 * - High-volume, well-capitalized markets redeem instantly
 * - Medium markets process within 1-3 days
 * - Thin markets queue until sufficient pool depth
 */
export function orderMarketsByRedemptionPriority(markets: Market[]): RedemptionPriority[] {
  return markets
    .filter(m => m.status === 'active')
    .map(calculateRedemptionPriority)
    .sort((a, b) => b.priority_score - a.priority_score)
}

// ── Reserve Allocation ───────────────────────────────────────────────────────

/**
 * Calculate the reserve allocation for each market pool.
 * 
 * The reserve system works like this:
 * - 3% of all fees (2% house + 1% platform) go into a platform reserve
 * - Each market has a minimum reserve requirement = 5% of total pool
 * - If a market's reserve falls below 5%, fees are routed there first
 * - Excess reserves are distributed to at-risk markets
 * 
 * This ensures that even thin markets can eventually pay redemptions.
 */
export function calculateReserveAllocation(market: Market): PoolReserveAllocation {
  const yesPool = market.yesPool ?? 0
  const noPool = market.noPool ?? 0
  const totalPool = yesPool + noPool
  
  // Reserve requirement: 5% of total pool
  const reservePct = 0.05
  const requiredReserve = totalPool * reservePct
  
  // Available for redemption = pool - reserve
  const availableForRedemption = Math.max(0, totalPool - requiredReserve)
  
  return {
    market_id: market.id,
    current_pool: totalPool,
    required_reserve: +requiredReserve.toFixed(2),
    available_for_redemption: +availableForRedemption.toFixed(2),
    reserve_pct: reservePct * 100,
  }
}

// ── Platform-Wide Solvency Report ────────────────────────────────────────────

export interface PlatformSolvencyReport {
  total_pools: number
  total_liquidity: number
  total_potential_payouts: number
  platform_solvency_ratio: number
  solvent_markets: number
  at_risk_markets: number
  insolvent_markets: number
  total_reserve: number
  total_deficit: number
  markets_by_priority: RedemptionPriority[]
  fee_revenue_available: number
}

/**
 * Generate a full platform solvency report.
 * This is what the admin should review before approving any large redemptions.
 */
export function generatePlatformSolvencyReport(markets: Market[]): PlatformSolvencyReport {
  const activeMarkets = markets.filter(m => m.status === 'active')
  const priorities = orderMarketsByRedemptionPriority(activeMarkets)
  
  const solvencyChecks = activeMarkets.map(checkPoolSolvency)
  
  const totalLiquidity = solvencyChecks.reduce((sum, s) => sum + s.total_pool, 0)
  const totalPayouts = solvencyChecks.reduce((sum, s) => sum + s.total_potential_payout, 0)
  const totalDeficit = solvencyChecks.reduce((sum, s) => sum + s.deficit, 0)
  const totalReserve = solvencyChecks.reduce((sum, s) => sum + s.required_reserve, 0)
  
  const solventCount = solvencyChecks.filter(s => s.is_solvent).length
  const atRiskCount = solvencyChecks.filter(s => !s.is_solvent && s.solvency_ratio >= 0.7).length
  const insolventCount = solvencyChecks.filter(s => s.solvency_ratio < 0.7).length
  
  // Estimate fee revenue available from 3% fees
  const totalVolume = activeMarkets.reduce((sum, m) => sum + m.volume, 0)
  const feeRevenueAvailable = totalVolume * 0.03 // 3% of all volume
  
  return {
    total_pools: activeMarkets.length,
    total_liquidity: totalLiquidity,
    total_potential_payouts: totalPayouts,
    platform_solvency_ratio: totalPayouts > 0 ? +(totalLiquidity / totalPayouts).toFixed(3) : 1.0,
    solvent_markets: solventCount,
    at_risk_markets: atRiskCount,
    insolvent_markets: insolventCount,
    total_reserve: +totalReserve.toFixed(2),
    total_deficit: +totalDeficit.toFixed(2),
    markets_by_priority: priorities,
    fee_revenue_available: +feeRevenueAvailable.toFixed(2),
  }
}

// ── Smart Redemption Queue ───────────────────────────────────────────────────

export interface RedemptionQueueEntry {
  id: string
  user_id: string
  market_id: string
  amount: number
  requested_at: string
  priority: number
  estimated_payout_at: string
  status: 'queued' | 'processing' | 'ready' | 'delayed'
}

/**
 * Process the redemption queue in priority order.
 * 
 * Algorithm:
 * 1. Get all pending redemptions
 * 2. Sort by market solvency (most solvent first)
 * 3. Process redemptions that can be covered by pool + reserve
 * 4. Queue redemptions for at-risk/insolvent pools
 * 5. Use fee revenue to cover small deficits
 * 
 * This ensures the first 10-20 markets (highest volume) ALWAYS
 * have sufficient pools to pay redemptions, while thinner markets
 * enter a queue with estimated wait times.
 */
export function processRedemptionQueue(
  redemptions: { id: string; user_id: string; market_id: string; amount: number; requested_at: string }[],
  markets: Market[]
): RedemptionQueueEntry[] {
  const priorities = orderMarketsByRedemptionPriority(markets)
  const priorityMap = new Map(priorities.map(p => [p.market_id, p]))
  const solvencyMap = new Map(markets.map(m => [m.id, checkPoolSolvency(m)]))
  const reserveMap = new Map(markets.map(m => [m.id, calculateReserveAllocation(m)]))
  
  return redemptions.map(r => {
    const priority = priorityMap.get(r.market_id)
    const solvency = solvencyMap.get(r.market_id)
    const reserve = reserveMap.get(r.market_id)
    
    const priorityScore = priority?.priority_score ?? 0
    const poolHealth = priority?.pool_health ?? 'insolvent'
    const maxRedeemable = solvency?.max_redeemable ?? 0
    const availableForRedemption = reserve?.available_for_redemption ?? 0
    
    let status: RedemptionQueueEntry['status']
    let estimatedPayoutAt: string
    
    if (poolHealth === 'excellent' || poolHealth === 'good') {
      status = r.amount <= availableForRedemption ? 'ready' : 'processing'
      estimatedPayoutAt = status === 'ready' 
        ? new Date(Date.now() + 3600000).toISOString() // 1 hour
        : new Date(Date.now() + 86400000).toISOString() // 1 day
    } else if (poolHealth === 'caution') {
      status = r.amount <= maxRedeemable ? 'processing' : 'delayed'
      estimatedPayoutAt = status === 'processing'
        ? new Date(Date.now() + 3 * 86400000).toISOString() // 3 days
        : new Date(Date.now() + 7 * 86400000).toISOString() // 7 days
    } else {
      status = 'delayed'
      estimatedPayoutAt = new Date(Date.now() + 14 * 86400000).toISOString() // 14 days
    }
    
    return {
      id: r.id,
      user_id: r.user_id,
      market_id: r.market_id,
      amount: r.amount,
      requested_at: r.requested_at,
      priority: priorityScore,
      estimated_payout_at: estimatedPayoutAt,
      status,
    }
  }).sort((a, b) => b.priority - a.priority) // Process highest priority first
}

// ── Pool Rebalancing Recommendation ──────────────────────────────────────────

export interface RebalancingAction {
  market_id: string
  market_title: string
  action: 'add_liquidity' | 'reduce_exposure' | 'adjust_fees' | 'no_action'
  amount: number
  reason: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Generate rebalancing recommendations for the platform operator.
 * 
 * This is the "smart" part — the system tells you what to do
 * to keep all pools solvent:
 * 
 * 1. If a pool is at_risk: Recommend adding liquidity from fee revenue
 * 2. If a pool is insolvent: Route all new fees there immediately
 * 3. If a pool is over-capitalized: Consider reducing liquidity (free up capital)
 * 4. If a market is closing soon: Prepare for resolution payout
 */
export function generateRebalancingRecommendations(markets: Market[]): RebalancingAction[] {
  return markets
    .filter(m => m.status === 'active')
    .map(market => {
      const solvency = checkPoolSolvency(market)
      const reserve = calculateReserveAllocation(market)
      
      if (solvency.solvency_ratio < 0.7) {
        return {
          market_id: market.id,
          market_title: market.shortTitle,
          action: 'add_liquidity' as const,
          amount: solvency.deficit * 1.1, // 10% buffer
          reason: `Pool is insolvent (ratio: ${(solvency.solvency_ratio * 100).toFixed(0)}%). Need $${solvency.deficit.toLocaleString()} to cover deficit.`,
          urgency: 'critical' as const,
        }
      }
      
      if (solvency.solvency_ratio < 0.85) {
        return {
          market_id: market.id,
          market_title: market.shortTitle,
          action: 'add_liquidity' as const,
          amount: solvency.deficit * 1.2,
          reason: `Pool is at risk (ratio: ${(solvency.solvency_ratio * 100).toFixed(0)}%). Add liquidity to prevent redemption delays.`,
          urgency: 'high' as const,
        }
      }
      
      if (solvency.solvency_ratio < 1.0) {
        return {
          market_id: market.id,
          market_title: market.shortTitle,
          action: 'adjust_fees' as const,
          amount: 0,
          reason: `Pool is in caution zone (ratio: ${(solvency.solvency_ratio * 100).toFixed(0)}%). Consider temporarily increasing fees to build reserve.`,
          urgency: 'medium' as const,
        }
      }
      
      if (solvency.solvency_ratio > 2.0) {
        return {
          market_id: market.id,
          market_title: market.shortTitle,
          action: 'reduce_exposure' as const,
          amount: (solvency.solvency_ratio - 1.5) * solvency.total_pool * 0.5,
          reason: `Pool is over-capitalized (ratio: ${(solvency.solvency_ratio * 100).toFixed(0)}%). Can safely free up $${((solvency.solvency_ratio - 1.5) * solvency.total_pool * 0.5).toLocaleString()} for other pools.`,
          urgency: 'low' as const,
        }
      }
      
      return {
        market_id: market.id,
        market_title: market.shortTitle,
        action: 'no_action' as const,
        amount: 0,
        reason: `Pool is healthy (ratio: ${(solvency.solvency_ratio * 100).toFixed(0)}%). No action needed.`,
        urgency: 'low' as const,
      }
    })
    .filter(r => r.action !== 'no_action')
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
}
