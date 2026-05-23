import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  try {
    const session = await auth.getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const {
      report_type,
      reported_user_id,
      market_id,
      description,
      evidence_urls,
    } = body

    if (!report_type || !description) {
      return NextResponse.json({ error: 'Report type and description are required' }, { status: 400 })
    }

    // Validate report type
    const validTypes = ['suspicious_activity', 'market_manipulation', 'unfair_payout', 'spam', 'other']
    if (!validTypes.includes(report_type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Create the fraud report
    const { data, error } = await supabase
      .from('fraud_reports')
      .insert({
        reporter_id: session.user.id,
        reported_user_id: reported_user_id || null,
        market_id: market_id || null,
        report_type,
        description,
        evidence_urls: evidence_urls || [],
        status: 'open',
      })
      .select()
      .single()

    if (error) throw error

    // Notify admins (in production, this would send an email or push notification)
    console.log(`Fraud report created: ${data.id} by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      report_id: data.id,
      message: 'Your report has been submitted. Our team will review it shortly.',
    })
  } catch (error: unknown) {
    console.error('Fraud report error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'open'

    const { data, error } = await supabase
      .from('fraud_reports')
      .select(`
        *,
        reporter:user_profiles!reporter_id(display_name, avatar_url),
        reported_user:user_profiles!reported_user_id(display_name),
        market:markets(title)
      `)
      .eq('reporter_id', session.user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ reports: data || [] })
  } catch (error) {
    console.error('Fraud report fetch error:', error)
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}