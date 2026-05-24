import { NextRequest, NextResponse } from 'next/server'
import { MOCK_INSURANCE_POLICIES, checkInsuranceTrigger } from '@/lib/insurance'

// In-memory store (same reference as the list route — in production, use a DB)
let insurancePolicies = [...MOCK_INSURANCE_POLICIES]

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const index = insurancePolicies.findIndex((p) => p.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    const policy = insurancePolicies[index]

    // Verify ownership (in production, check authenticated user)
    if (policy.user_id !== 'u1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if policy is active
    if (policy.status !== 'active') {
      return NextResponse.json(
        { error: `Policy is ${policy.status}. Only active policies can be claimed.` },
        { status: 400 }
      )
    }

    // Check if trigger condition is met
    const { triggered, payoutAmount } = checkInsuranceTrigger(policy, policy.current_price)

    if (!triggered) {
      return NextResponse.json(
        { error: 'Trigger condition not met. Current price has not reached the trigger threshold.' },
        { status: 400 }
      )
    }

    // Process the claim
    insurancePolicies[index] = {
      ...policy,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      payout: payoutAmount,
    }

    return NextResponse.json({
      success: true,
      policy: insurancePolicies[index],
      payout: payoutAmount,
      message: `Insurance claim processed. ${payoutAmount} SC will be credited to your account.`,
    })
  } catch (error) {
    console.error('[Insurance Claim] Error:', error)
    return NextResponse.json({ error: 'Failed to process insurance claim' }, { status: 500 })
  }
}
