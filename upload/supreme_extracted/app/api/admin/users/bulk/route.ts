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
  const { action, user_ids } = body

  if (!action || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
    return NextResponse.json({ error: 'Action and user_ids are required' }, { status: 400 })
  }

  try {
    let updateField: string | null = null

    switch (action) {
      case 'suspend':
        updateField = 'is_restricted'
        break
      case 'unsuspend':
        updateField = 'is_restricted'
        break
      case 'verify_kyc':
        updateField = 'kyc_status'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updateValue = action === 'suspend' ? true : action === 'unsuspend' ? false : 'verified'

    const { error } = await supabaseAdmin
      .from('users')
      .update({ [updateField!]: updateValue })
      .in('id', user_ids)

    if (error) throw error

    // Log bulk action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: `BULK_${action.toUpperCase()}`,
      changes: { user_ids, action },
      reason: `Bulk action: ${action} on ${user_ids.length} users`,
    })

    return NextResponse.json({
      success: true,
      affected: user_ids.length,
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}