import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminAuth } from '@/lib/adminAuth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_swarm_config')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Return defaults if no config exists
    return NextResponse.json(data || {
      is_enabled: false,
      max_trades_per_tick: 10,
      max_daily_loss: 50000,
      agent_budgets: {
        momentum: 1000,
        contrarian: 1000,
        arbitrage: 1000,
        sentiment: 1000,
      },
    })
  } catch (error) {
    console.error('AI config fetch error:', error)
    return NextResponse.json({ error: 'Failed to load AI config' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  try {
    const updates = {
      is_enabled: body.is_enabled ?? false,
      max_trades_per_tick: body.max_trades_per_tick ?? 10,
      max_daily_loss: body.max_daily_loss ?? 50000,
      agent_budgets: body.agent_budgets || {
        momentum: 1000,
        contrarian: 1000,
        arbitrage: 1000,
        sentiment: 1000,
      },
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin
      .from('ai_swarm_config')
      .upsert(updates, { onConflict: 'id' })

    if (error) throw error

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: body.is_enabled ? 'AI_SWARM_ENABLE' : 'AI_SWARM_DISABLE',
      changes: updates,
      reason: 'AI Swarm configuration updated via admin settings',
    })

    return NextResponse.json({ success: true, ...updates })
  } catch (error) {
    console.error('AI config update error:', error)
    return NextResponse.json({ error: 'Failed to update AI config' }, { status: 500 })
  }
}