import { NextRequest, NextResponse } from 'next/server'
import { MOCK_INSURANCE_POLICIES, calculateInsuranceQuote } from '@/lib/insurance'
import type { InsurancePolicy, InsuranceType } from '@/types'
import type { Position } from '@/types'
import { portfolio } from '@/lib/mockData'

// In-memory store for demo
let insurancePolicies: InsurancePolicy[] = [...MOCK_INSURANCE_POLICIES]

export async function GET() {
  try {
    // In production, filter by authenticated user
    const userPolicies = insurancePolicies.filter((p) => p.user_id === 'u1')

    return NextResponse.json({ policies: userPolicies })
  } catch (error) {
    console.error('[Insurance GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch insurance policies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { position_id, insurance_type, coverage_pct } = body

    if (!position_id || !insurance_type) {
      return NextResponse.json(
        { error: 'Missing required fields: position_id, insurance_type' },
        { status: 400 }
      )
    }

    // Validate insurance type
    const validTypes: InsuranceType[] = ['full_hedge', 'partial_hedge', 'stop_loss']
    if (!validTypes.includes(insurance_type)) {
      return NextResponse.json(
        { error: `Invalid insurance_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Find the position
    const position = portfolio.positions.find((p) => p.id === position_id) as Position | undefined
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Calculate premium
    const coveragePct = coverage_pct ?? (insurance_type === 'partial_hedge' ? 50 : 100)
    const quote = calculateInsuranceQuote(position, insurance_type, coveragePct)

    // Check sufficient balance (mock: user has 2500 SC)
    const userBalance = 2500
    if (quote.premium > userBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Premium is ${quote.premium} SC but you have ${userBalance} SC.` },
        { status: 400 }
      )
    }

    // Create the policy
    const newPolicy: InsurancePolicy = {
      id: `ins-${Date.now()}`,
      user_id: 'u1',
      position_id: position.id,
      market_id: position.marketId,
      market_title: position.marketTitle,
      insurance_type,
      coverage_pct: coveragePct,
      position_value: quote.position_value,
      coverage_amount: quote.coverage_amount,
      premium: quote.premium,
      premium_pct: quote.premium_pct,
      trigger_price: quote.trigger_price,
      current_price: position.currentPrice,
      status: 'active',
      expires_at: new Date(Date.now() + quote.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      claimed_at: null,
      payout: null,
    }

    insurancePolicies.push(newPolicy)

    return NextResponse.json({ policy: newPolicy }, { status: 201 })
  } catch (error) {
    console.error('[Insurance POST] Error:', error)
    return NextResponse.json({ error: 'Failed to purchase insurance' }, { status: 500 })
  }
}
