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
  const { suspend } = body

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_restricted: suspend })
      .eq('id', userId)

    if (error) throw error

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: suspend ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
      target_user_id: userId,
      changes: { suspended: suspend },
      reason: body.reason || (suspend ? 'User suspended by admin' : 'User unsuspended by admin'),
    })

    return NextResponse.json({ success: true, suspended: suspend })
  } catch (error) {
    console.error('Suspend user error:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}