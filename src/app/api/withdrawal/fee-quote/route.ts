import { NextRequest, NextResponse } from 'next/server'
import { calculateWithdrawalFee } from '@/lib/withdrawal'
import type { WithdrawalSpeed } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amountParam = searchParams.get('amount')
    const speedParam = searchParams.get('speed')

    if (!amountParam || !speedParam) {
      return NextResponse.json(
        { error: 'Missing required query params: amount, speed' },
        { status: 400 }
      )
    }

    const amount = parseFloat(amountParam)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const validSpeeds: WithdrawalSpeed[] = ['instant', 'standard', 'scheduled']
    if (!validSpeeds.includes(speedParam as WithdrawalSpeed)) {
      return NextResponse.json(
        { error: `Invalid speed. Must be one of: ${validSpeeds.join(', ')}` },
        { status: 400 }
      )
    }

    const quote = calculateWithdrawalFee(amount, speedParam as WithdrawalSpeed)

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('[Withdrawal Fee Quote] Error:', error)
    return NextResponse.json({ error: 'Failed to calculate fee quote' }, { status: 500 })
  }
}
