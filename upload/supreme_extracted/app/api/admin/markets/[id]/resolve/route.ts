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
  const { outcome, resolution_source, reason } = body

  if (!outcome || (outcome !== 'YES' && outcome !== 'NO')) {
    return NextResponse.json({ error: 'Valid outcome (YES or NO) is required' }, { status: 400 })
  }

  try {
    // Use RPC to resolve market atomically
    const { data, error } = await supabaseAdmin.rpc('resolve_market', {
      p_market_id: marketId,
      p_outcome: outcome,
      p_resolution_source: resolution_source || '',
    })

    if (error) throw error

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'MARKET_RESOLVE',
      target_market_id: marketId,
      changes: { outcome, resolution_source },
      reason: reason || `Market resolved to ${outcome} by admin`,
    })

    return NextResponse.json({
      success: true,
      outcome,
      payout_summary: data,
    })
  } catch (error) {
    console.error('Market resolve error:', error)
    return NextResponse.json({ error: 'Failed to resolve market' }, { status: 500 })
  }
}