import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/adminAuth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { enabled } = body

  try {
    const { error } = await supabaseAdmin
      .from('ai_swarm_config')
      .update({
        is_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000001')

    if (error) {
      // Try insert if update affects 0 rows
      if (error.code === 'PGRST116') {
        await supabaseAdmin.from('ai_swarm_config').insert({
          id: '00000000-0000-0000-0000-000000000001',
          is_enabled: enabled,
          max_trades_per_tick: 10,
          max_daily_loss: 50000,
          agent_budgets: { momentum: 1000, contrarian: 1000, arbitrage: 1000, sentiment: 1000 },
        })
      } else {
        throw error
      }
    }

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: enabled ? 'AI_SWARM_ENABLE' : 'AI_SWARM_DISABLE',
      changes: { is_enabled: enabled },
      reason: `AI Swarm ${enabled ? 'enabled' : 'disabled'} via admin panel`,
    })

    return NextResponse.json({ success: true, is_enabled: enabled })
  } catch (error) {
    console.error('AI toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle AI Swarm' }, { status: 500 })
  }
}