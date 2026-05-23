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

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'open'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const { data, error, count } = await supabaseAdmin
      .from('fraud_reports')
      .select(`
        *,
        reporter:users!reporter_id(id, email, handle),
        reported_user:user_profiles!reported_user_id(display_name, avatar_url),
        market:markets(id, title),
        resolver:users!resolved_by(id, email)
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      reports: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Fraud reports fetch error:', error)
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}