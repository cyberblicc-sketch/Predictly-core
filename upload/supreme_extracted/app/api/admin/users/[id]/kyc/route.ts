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
  const { status } = body

  if (status !== 'verified' && status !== 'rejected') {
    return NextResponse.json({ error: 'Status must be verified or rejected' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        kyc_status: status,
        kyc_verified_at: status === 'verified' ? new Date().toISOString() : null,
      })
      .eq('id', userId)

    if (error) throw error

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'KYC_REVIEW',
      target_user_id: userId,
      changes: { new_kyc_status: status },
      reason: body.reason || `KYC ${status} by admin`,
    })

    return NextResponse.json({ success: true, kyc_status: status })
  } catch (error) {
    console.error('KYC update error:', error)
    return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 })
  }
}