import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/adminAuth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId } = await params
  const body = await req.json()
  const { currency, amount, reason } = body

  if (!currency || amount === undefined || !reason) {
    return NextResponse.json({ error: 'Currency, amount, and reason are required' }, { status: 400 })
  }

  if (currency !== 'gc' && currency !== 'sc') {
    return NextResponse.json({ error: 'Currency must be gc or sc' }, { status: 400 })
  }

  try {
    // Get current balance
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(currency === 'sc' ? 'sc_balance' : 'gc_balance', 'email')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const balanceField = currency === 'sc' ? 'sc_balance' : 'gc_balance'
    const currentBalance = user[balanceField] || 0
    const newBalance = currentBalance + amount

    // Update balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ [balanceField]: newBalance })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log the admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'BALANCE_ADJUST',
      target_user_id: userId,
      changes: {
        currency,
        previous_balance: currentBalance,
        new_balance: newBalance,
        adjustment: amount,
      },
      reason,
    })

    // Record transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: userId,
      type: 'ADMIN_ADJUST',
      amount: Math.abs(amount),
      currency: currency === 'sc' ? 'SC' : 'GOLD',
      status: 'completed',
      metadata: {
        admin_id: authResult.adminId,
        reason,
        balance_before: currentBalance,
        balance_after: newBalance,
      },
    })

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      adjustment: amount,
    })
  } catch (error) {
    console.error('Balance adjustment error:', error)
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 })
  }
}