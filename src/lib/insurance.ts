// ============================================================================
// Predictly — Insurance/Hedging on Positions
// Premium calculation engine for position insurance
// ============================================================================

import type { InsuranceType, InsurancePolicy, InsuranceQuote } from '@/types'
import type { Position } from '@/types'

// ── Insurance Type Info ──────────────────────────────────────────────────────

export const INSURANCE_TYPE_INFO: Record<
  InsuranceType,
  { name: string; description: string; recommendation: string; emoji: string; color: string }
> = {
  full_hedge: {
    name: 'Full Hedge',
    description: '100% coverage that triggers if your position loses any value. Maximum protection — if the market moves against you, you get your full stake back.',
    recommendation: 'Best for large positions where you want complete peace of mind. Ideal for volatile markets or when you cannot afford any losses.',
    emoji: '🛡️',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  partial_hedge: {
    name: 'Partial Hedge',
    description: '50% coverage that triggers at 20% loss. Balances cost and protection — cheaper than full hedge while still covering significant downside.',
    recommendation: 'Great for medium-sized positions where you want some protection without paying full hedge premiums. Good for moderately volatile markets.',
    emoji: '⚖️',
    color: 'from-amber-500/20 to-yellow-500/20',
  },
  stop_loss: {
    name: 'Stop Loss',
    description: 'Triggers at a specific price point you choose. Like a safety net — only pays out if the price hits your trigger, keeping premiums lower.',
    recommendation: 'Perfect when you have a clear pain threshold. Cheapest option with targeted protection at your chosen price level.',
    emoji: '🛑',
    color: 'from-rose-500/20 to-red-500/20',
  },
}

// ── Risk Score Calculation ───────────────────────────────────────────────────

export function getRiskScore(marketId: string): number {
  // Deterministic risk scores based on market ID for demo consistency
  const riskMap: Record<string, number> = {
    'm-btc-200k': 72,
    'm-election-2028': 58,
    'm-fed-cut-jun': 45,
    'm-nba-champ': 35,
    'm-gpt-5-2026': 65,
    'm-ukraine-ceasefire': 78,
    'm-superbowl': 28,
    'm-recession-2026': 55,
    'm-spacex-mars': 82,
    'm-apple-ai-glasses': 50,
  }
  return riskMap[marketId] ?? 50
}

// ── Premium Calculation ──────────────────────────────────────────────────────
//
// Full Hedge:   8-15% base rate, scaled by volatility & time
// Partial Hedge: 4-8% base rate, scaled similarly
// Stop Loss:    2-5% base rate, depends on trigger distance
//
// Position size discounts:
//   >$1K: 5% off  |  >$5K: 10% off  |  >$10K: 15% off
//
// Underwriting profit model:
//   Collect ~8% in premiums, pay out ~3-4% in claims → 4-5% net profit

export function calculateInsuranceQuote(
  position: Position,
  type: InsuranceType,
  coveragePct: number = 100
): InsuranceQuote {
  const positionValue = position.stake ?? (position.shares * position.avgPrice)
  const riskScore = getRiskScore(position.marketId)
  const volatilityMultiplier = 0.8 + (riskScore / 100) * 0.6 // 0.8 to 1.4

  // Time decay: assume 30 days default, longer = higher premium
  const expiresInDays = 30
  const timeMultiplier = 1 + (expiresInDays / 365) * 0.3 // up to +30% for 1 year

  // Position size discount
  let sizeDiscount = 0
  if (positionValue > 10_000) sizeDiscount = 0.15
  else if (positionValue > 5_000) sizeDiscount = 0.10
  else if (positionValue > 1_000) sizeDiscount = 0.05

  let baseRate: number
  let triggerPrice: number

  switch (type) {
    case 'full_hedge':
      // 8-15% base rate depending on volatility
      baseRate = (0.08 + (riskScore / 100) * 0.07) * volatilityMultiplier * timeMultiplier
      // Triggers at any loss — trigger price = entry price
      triggerPrice = position.avgPrice
      break

    case 'partial_hedge':
      // 4-8% base rate
      baseRate = (0.04 + (riskScore / 100) * 0.04) * volatilityMultiplier * timeMultiplier
      // Triggers at 20% loss
      triggerPrice = position.avgPrice * 0.80
      break

    case 'stop_loss':
      // 2-5% base rate, depends on distance from trigger
      // Default trigger at 30% below current price
      const triggerDistance = 0.30
      const distanceMultiplier = 1 + (1 - triggerDistance) * 0.5 // Closer = higher premium
      baseRate = (0.02 + (riskScore / 100) * 0.03) * volatilityMultiplier * timeMultiplier * distanceMultiplier
      triggerPrice = position.currentPrice * (1 - triggerDistance)
      break
  }

  // Apply size discount
  baseRate = baseRate * (1 - sizeDiscount)

  // Scale by coverage percentage
  const coverageFactor = coveragePct / 100
  const premium = +(positionValue * baseRate * coverageFactor).toFixed(2)
  const premiumPct = +((premium / positionValue) * 100).toFixed(2)
  const coverageAmount = +(positionValue * coverageFactor).toFixed(2)

  // Generate recommendation
  let recommendation: string
  if (riskScore >= 70) {
    recommendation = 'High-risk position. Full Hedge recommended for maximum protection.'
  } else if (riskScore >= 45) {
    recommendation = 'Moderate risk. Partial Hedge offers good cost-to-coverage balance.'
  } else {
    recommendation = 'Lower risk position. Stop Loss provides affordable targeted protection.'
  }

  return {
    position_id: position.id,
    market_id: position.marketId,
    position_value: +positionValue.toFixed(2),
    insurance_type: type,
    coverage_pct: coveragePct,
    premium,
    premium_pct: premiumPct,
    trigger_price: +triggerPrice.toFixed(4),
    coverage_amount: coverageAmount,
    expires_in_days: expiresInDays,
    risk_score: riskScore,
    recommendation,
  }
}

// ── Check Insurance Trigger ──────────────────────────────────────────────────

export function checkInsuranceTrigger(
  policy: InsurancePolicy,
  currentPrice: number
): { triggered: boolean; payoutAmount: number } {
  switch (policy.insurance_type) {
    case 'full_hedge':
      // Triggers if position has lost any value (current < avg entry)
      if (currentPrice < policy.trigger_price) {
        const lossPct = (policy.trigger_price - currentPrice) / policy.trigger_price
        const payoutAmount = +(policy.coverage_amount * lossPct).toFixed(2)
        return { triggered: true, payoutAmount }
      }
      return { triggered: false, payoutAmount: 0 }

    case 'partial_hedge':
      // Triggers at 20% loss
      if (currentPrice <= policy.trigger_price) {
        const payoutAmount = +(policy.coverage_amount * 0.5).toFixed(2) // 50% coverage
        return { triggered: true, payoutAmount }
      }
      return { triggered: false, payoutAmount: 0 }

    case 'stop_loss':
      // Triggers at specific price point
      if (currentPrice <= policy.trigger_price) {
        const payoutAmount = +policy.coverage_amount.toFixed(2)
        return { triggered: true, payoutAmount }
      }
      return { triggered: false, payoutAmount: 0 }
  }
}

// ── Mock Insurance Policies ──────────────────────────────────────────────────

export const MOCK_INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'ins-1',
    user_id: 'u1',
    position_id: 'p1',
    market_id: 'm-btc-200k',
    market_title: 'Will Bitcoin reach $200,000 by end of 2026?',
    insurance_type: 'full_hedge',
    coverage_pct: 100,
    position_value: 2142.00,
    coverage_amount: 2142.00,
    premium: 214.20,
    premium_pct: 10.0,
    trigger_price: 0.51,
    current_price: 0.62,
    status: 'active',
    expires_at: '2026-04-15T00:00:00Z',
    created_at: '2026-03-15T10:00:00Z',
    claimed_at: null,
    payout: null,
  },
  {
    id: 'ins-2',
    user_id: 'u1',
    position_id: 'p4',
    market_id: 'm-recession-2026',
    market_title: 'US recession 2026',
    insurance_type: 'partial_hedge',
    coverage_pct: 50,
    position_value: 684.00,
    coverage_amount: 342.00,
    premium: 37.62,
    premium_pct: 5.5,
    trigger_price: 0.576,
    current_price: 0.68,
    status: 'active',
    expires_at: '2026-04-10T00:00:00Z',
    created_at: '2026-03-10T14:00:00Z',
    claimed_at: null,
    payout: null,
  },
  {
    id: 'ins-3',
    user_id: 'u1',
    position_id: 'p3',
    market_id: 'm-gpt-5-2026',
    market_title: 'GPT-5 before July 2026',
    insurance_type: 'stop_loss',
    coverage_pct: 100,
    position_value: 744.00,
    coverage_amount: 744.00,
    premium: 37.20,
    premium_pct: 5.0,
    trigger_price: 0.497,
    current_price: 0.71,
    status: 'active',
    expires_at: '2026-04-04T00:00:00Z',
    created_at: '2026-03-04T16:00:00Z',
    claimed_at: null,
    payout: null,
  },
  {
    id: 'ins-4',
    user_id: 'u1',
    position_id: 'p6',
    market_id: 'm-ukraine-ceasefire',
    market_title: 'Russia–Ukraine ceasefire 2026',
    insurance_type: 'full_hedge',
    coverage_pct: 100,
    position_value: 735.00,
    coverage_amount: 735.00,
    premium: 95.55,
    premium_pct: 13.0,
    trigger_price: 0.35,
    current_price: 0.41,
    status: 'active',
    expires_at: '2026-04-01T00:00:00Z',
    created_at: '2026-03-01T08:00:00Z',
    claimed_at: null,
    payout: null,
  },
  {
    id: 'ins-5',
    user_id: 'u1',
    position_id: 'p5',
    market_id: 'm-superbowl',
    market_title: 'Super Bowl LX',
    insurance_type: 'stop_loss',
    coverage_pct: 100,
    position_value: 126.00,
    coverage_amount: 126.00,
    premium: 5.04,
    premium_pct: 4.0,
    trigger_price: 0.168,
    current_price: 0.24,
    status: 'active',
    expires_at: '2026-04-28T00:00:00Z',
    created_at: '2026-02-28T11:00:00Z',
    claimed_at: null,
    payout: null,
  },
]
