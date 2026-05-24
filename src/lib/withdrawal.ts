// ============================================================================
// Predictly — Withdrawal Speed Charges
// Fee calculation engine for tiered withdrawal speeds
// ============================================================================

import type { WithdrawalSpeed, WithdrawalFeeQuote, WithdrawalRequest } from '@/types'

// ── Fee Calculation Engine ───────────────────────────────────────────────────
//
// Fee structure (designed to be profitable but not crazy):
//
// Standard (1-3 business days):
//   - Base fee: 1.0% (min $1.50)
//   - No speed fee
//   - Risk fee: 0.5% for amounts over $5,000
//
// Scheduled (5-7 business days):
//   - Base fee: 0.5% (min $1.00)
//   - No speed fee
//   - No risk fee
//
// Instant (under 1 hour):
//   - Base fee: 1.5% (min $2.00)
//   - Speed fee: 1.5% (premium for instant)
//   - Risk fee: 1.0% over $2K, 2.0% over $10K, 3.0% over $50K
//
// Total instant fee for various amounts:
//   $100:    $4.50  (4.5%)
//   $500:    $17.50 (3.5%)
//   $1,000:  $35.00 (3.5%)
//   $5,000:  $175.00 (3.5%)
//   $10,000: $500.00 (5.0%)
//   $50,000: $3,750.00 (7.5%)

export function calculateWithdrawalFee(
  amount: number,
  speed: WithdrawalSpeed
): WithdrawalFeeQuote {
  if (amount <= 0) {
    return {
      amount: 0,
      currency: 'SC',
      speed,
      fee: 0,
      fee_pct: 0,
      net_amount: 0,
      estimated_arrival: generateEstimatedArrival(speed),
      fee_breakdown: { base_fee: 0, speed_fee: 0, risk_fee: 0, total_fee: 0 },
    }
  }

  let baseFee = 0
  let speedFee = 0
  let riskFee = 0

  switch (speed) {
    case 'instant':
      baseFee = Math.max(amount * 0.015, 2.00)
      speedFee = amount * 0.015
      if (amount > 50_000) {
        riskFee = amount * 0.03
      } else if (amount > 10_000) {
        riskFee = amount * 0.02
      } else if (amount > 2_000) {
        riskFee = amount * 0.01
      }
      break

    case 'standard':
      baseFee = Math.max(amount * 0.01, 1.50)
      speedFee = 0
      if (amount > 5_000) {
        riskFee = amount * 0.005
      }
      break

    case 'scheduled':
      baseFee = Math.max(amount * 0.005, 1.00)
      speedFee = 0
      riskFee = 0
      break
  }

  const totalFee = +(baseFee + speedFee + riskFee).toFixed(2)
  const feePct = +((totalFee / amount) * 100).toFixed(2)
  const netAmount = +(amount - totalFee).toFixed(2)

  return {
    amount,
    currency: 'SC',
    speed,
    fee: totalFee,
    fee_pct: feePct,
    net_amount: netAmount,
    estimated_arrival: generateEstimatedArrival(speed),
    fee_breakdown: {
      base_fee: +baseFee.toFixed(2),
      speed_fee: +speedFee.toFixed(2),
      risk_fee: +riskFee.toFixed(2),
      total_fee: totalFee,
    },
  }
}

// ── Estimated Arrival ────────────────────────────────────────────────────────

export function generateEstimatedArrival(speed: WithdrawalSpeed): string {
  const now = new Date()

  switch (speed) {
    case 'instant': {
      const arrival = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour
      return arrival.toISOString()
    }
    case 'standard': {
      // 1-3 business days — add 3 calendar days for simplicity
      const arrival = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      return arrival.toISOString()
    }
    case 'scheduled': {
      // 5-7 business days — add 7 calendar days for simplicity
      const arrival = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return arrival.toISOString()
    }
  }
}

// ── Mock Withdrawal Requests ─────────────────────────────────────────────────

export const MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'wd-1',
    user_id: 'u1',
    amount: 500,
    currency: 'SC',
    speed: 'instant',
    fee: 17.50,
    net_amount: 482.50,
    status: 'completed',
    destination: 'Chase ****4821',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-05T11:20:00Z',
    created_at: '2026-03-05T10:20:00Z',
    processed_at: '2026-03-05T10:48:00Z',
  },
  {
    id: 'wd-2',
    user_id: 'u1',
    amount: 2000,
    currency: 'SC',
    speed: 'standard',
    fee: 22.50,
    net_amount: 1977.50,
    status: 'processing',
    destination: 'Chase ****4821',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-13T10:00:00Z',
    created_at: '2026-03-10T10:00:00Z',
    processed_at: null,
  },
  {
    id: 'wd-3',
    user_id: 'u1',
    amount: 150,
    currency: 'SC',
    speed: 'instant',
    fee: 6.75,
    net_amount: 143.25,
    status: 'completed',
    destination: '0x1a2b...9f8e',
    destination_type: 'crypto_wallet',
    estimated_arrival: '2026-03-08T15:30:00Z',
    created_at: '2026-03-08T14:30:00Z',
    processed_at: '2026-03-08T14:52:00Z',
  },
  {
    id: 'wd-4',
    user_id: 'u2',
    amount: 10000,
    currency: 'SC',
    speed: 'instant',
    fee: 500.00,
    net_amount: 9500.00,
    status: 'completed',
    destination: 'Bank of America ****3344',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-06T09:15:00Z',
    created_at: '2026-03-06T08:15:00Z',
    processed_at: '2026-03-06T08:57:00Z',
  },
  {
    id: 'wd-5',
    user_id: 'u2',
    amount: 750,
    currency: 'SC',
    speed: 'scheduled',
    fee: 3.75,
    net_amount: 746.25,
    status: 'pending',
    destination: 'Wells Fargo ****5567',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-18T12:00:00Z',
    created_at: '2026-03-11T12:00:00Z',
    processed_at: null,
  },
  {
    id: 'wd-6',
    user_id: 'u3',
    amount: 5000,
    currency: 'SC',
    speed: 'standard',
    fee: 75.00,
    net_amount: 4925.00,
    status: 'processing',
    destination: '0x4c5d...2a1b',
    destination_type: 'crypto_wallet',
    estimated_arrival: '2026-03-14T16:00:00Z',
    created_at: '2026-03-11T16:00:00Z',
    processed_at: null,
  },
  {
    id: 'wd-7',
    user_id: 'u1',
    amount: 300,
    currency: 'SC',
    speed: 'instant',
    fee: 10.50,
    net_amount: 289.50,
    status: 'failed',
    destination: 'Chase ****4821',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-09T20:00:00Z',
    created_at: '2026-03-09T19:00:00Z',
    processed_at: '2026-03-09T19:15:00Z',
  },
  {
    id: 'wd-8',
    user_id: 'u1',
    amount: 1200,
    currency: 'SC',
    speed: 'standard',
    fee: 12.00,
    net_amount: 1188.00,
    status: 'completed',
    destination: 'Chase ****4821',
    destination_type: 'bank_account',
    estimated_arrival: '2026-03-04T09:00:00Z',
    created_at: '2026-03-01T09:00:00Z',
    processed_at: '2026-03-03T14:00:00Z',
  },
]
