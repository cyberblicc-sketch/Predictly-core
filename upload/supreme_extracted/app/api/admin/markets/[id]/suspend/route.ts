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

  const { id: marketId } = await params
  const body = await req.json()
  const { suspend, reason } = body

  try {
    // Get current status
    const { data: market, error: fetchError } = await supabaseAdmin
      .from('markets')
      .select('status, title')
      .eq('id', marketId)
      .single()

    if (fetchError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    // Update market status
    const newStatus = suspend ? 'cancelled' : 'open'
    const { error } = await supabaseAdmin
      .from('markets')
      .update({ status: newStatus })
      .eq('id', marketId)

    if (error) throw error

    // If suspending, refund all open positions
    if (suspend) {
      await supabaseAdmin.rpc('refund_market_positions', {
        p_market_id: marketId,
      })
    }

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: suspend ? 'MARKET_SUSPEND' : 'MARKET_UNSUSPEND',
      target_market_id: marketId,
      changes: {
        previous_status: market.status,
        new_status: newStatus,
        action: suspend ? 'cancelled' : 'reopened',
      },
      reason: reason || (suspend ? 'Market suspended by admin' : 'Market reopened by admin'),
    })

    return NextResponse.json({
      success: true,
      suspended: suspend,
      new_status: newStatus,
    })
  } catch (error) {
    console.error('Market suspend error:', error)
    return NextResponse.json({ error: 'Failed to update market status' }, { status: 500 })
  }
}