import { NextRequest, NextResponse } from 'next/server'
import { calculateWithdrawalFee, MOCK_WITHDRAWAL_REQUESTS } from '@/lib/withdrawal'
import type { WithdrawalSpeed, WithdrawalRequest } from '@/types'

// In-memory store for demo
let withdrawalRequests: WithdrawalRequest[] = [...MOCK_WITHDRAWAL_REQUESTS]

export async function GET() {
  try {
    // In production, filter by authenticated user
    const userWithdrawals = withdrawalRequests.filter((w) => w.user_id === 'u1')

    return NextResponse.json({ withdrawals: userWithdrawals })
  } catch (error) {
    console.error('[Withdrawal GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, speed, destination, destination_type } = body

    // Validate required fields
    if (!amount || !speed || !destination || !destination_type) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, speed, destination, destination_type' },
        { status: 400 }
      )
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    // Validate speed
    const validSpeeds: WithdrawalSpeed[] = ['instant', 'standard', 'scheduled']
    if (!validSpeeds.includes(speed)) {
      return NextResponse.json(
        { error: `Invalid speed. Must be one of: ${validSpeeds.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate destination type
    const validDestTypes = ['bank_account', 'crypto_wallet']
    if (!validDestTypes.includes(destination_type)) {
      return NextResponse.json(
        { error: `Invalid destination_type. Must be one of: ${validDestTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check sufficient balance (mock: user has 2500 SC)
    const userBalance = 2500
    if (numAmount > userBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. You have ${userBalance} SC available.` },
        { status: 400 }
      )
    }

    // Calculate fee
    const feeQuote = calculateWithdrawalFee(numAmount, speed)

    // Create withdrawal request
    const newWithdrawal: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      user_id: 'u1',
      amount: numAmount,
      currency: 'SC',
      speed,
      fee: feeQuote.fee,
      net_amount: feeQuote.net_amount,
      status: 'pending',
      destination,
      destination_type,
      estimated_arrival: feeQuote.estimated_arrival,
      created_at: new Date().toISOString(),
      processed_at: null,
    }

    withdrawalRequests.push(newWithdrawal)

    return NextResponse.json({ withdrawal: newWithdrawal }, { status: 201 })
  } catch (error) {
    console.error('[Withdrawal POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 })
  }
}
