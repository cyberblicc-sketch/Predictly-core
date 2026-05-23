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

  const { id: reportId } = await params
  const body = await req.json()
  const { resolution, resolution_notes } = body

  if (!resolution || !['resolved', 'dismissed'].includes(resolution)) {
    return NextResponse.json({ error: 'Resolution must be "resolved" or "dismissed"' }, { status: 400 })
  }

  try {
    // Get report details
    const { data: report, error: fetchError } = await supabaseAdmin
      .from('fraud_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (fetchError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update report status
    const { error: updateError } = await supabaseAdmin
      .from('fraud_reports')
      .update({
        status: resolution === 'resolved' ? 'investigated' : 'dismissed',
        resolution_notes: resolution_notes || '',
        resolved_by: authResult.adminId,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (updateError) throw updateError

    // If resolved with action needed, flag the user
    if (resolution === 'resolved' && report.reported_user_id) {
      // Suspend user pending review
      await supabaseAdmin
        .from('users')
        .update({ is_restricted: true })
        .eq('id', report.reported_user_id)

      // Log fraud flag action
      await supabaseAdmin.from('admin_logs').insert({
        admin_id: authResult.adminId,
        action: 'FRAUD_FLAG',
        target_user_id: report.reported_user_id,
        changes: {
          fraud_report_id: reportId,
          report_type: report.report_type,
        },
        reason: resolution_notes || 'User flagged due to fraud report resolution',
      })
    }

    // Log the resolution action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: authResult.adminId,
      action: 'DISPUTE_RESOLVE',
      target_user_id: report.reported_user_id,
      changes: {
        report_id: reportId,
        resolution,
        resolution_notes,
      },
      reason: `Fraud report ${resolution} by admin`,
    })

    return NextResponse.json({
      success: true,
      resolution,
      resolved_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Fraud report resolution error:', error)
    return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 })
  }
}