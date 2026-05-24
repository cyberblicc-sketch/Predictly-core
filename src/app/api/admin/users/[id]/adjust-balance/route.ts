import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { currency, amount, reason } = body

    if (!currency || !['GC', 'SC'].includes(currency)) {
      return NextResponse.json({ error: 'currency must be GC or SC' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json({ error: 'amount must be a non-zero number' }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      userId: id,
      currency,
      amount,
      reason,
      newBalance: currency === 'GC' ? 50000 + amount : 2500 + amount,
    })
  } catch (error) {
    console.error('[Admin Adjust Balance] Error:', error)
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 })
  }
}
