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

  try {
    const updates: Record<string, string | number> = {}

    if (body.default_house_fee !== undefined) {
      updates.default_house_fee = body.default_house_fee
    }
    if (body.default_platform_fee !== undefined) {
      updates.default_platform_fee = body.default_platform_fee
    }
    if (body.default_initial_liquidity !== undefined) {
      updates.default_initial_liquidity = body.default_initial_liquidity
    }
    if (body.min_redeem_sc !== undefined) {
      updates.min_redeem_sc = body.min_redeem_sc
    }
    if (body.regular_redeem_sc !== undefined) {
      updates.regular_redeem_sc = body.regular_redeem_sc
    }

    // Upsert each config value
    for (const [key, value] of Object.entries(updates)) {
      await supabaseAdmin
        .from('site_config')
        .upsert(
          { key, value: String(value) },
          { onConflict: 'key' }
        )
    }

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'CONFIG_UPDATE',
      changes: updates,
      reason: 'Site configuration updated via admin settings',
    })

    return NextResponse.json({ success: true, updated: Object.keys(updates) })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}