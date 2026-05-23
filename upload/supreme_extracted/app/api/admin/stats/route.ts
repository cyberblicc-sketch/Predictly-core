import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Parallel queries for dashboard stats
    const [
      userStats,
      marketStats,
      volumeStats,
      recentActivity,
      kycStats,
      topMarkets,
    ] = await Promise.all([
      // User stats
      supabaseAdmin.from('users').select('id, is_restricted, kyc_status', { count: 'exact', head: true }),
      // Open markets
      supabaseAdmin.from('markets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      // Total volume last 24h
      supabaseAdmin.rpc('get_total_volume_24h').single(),
      // Recent transactions
      supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false }).limit(10),
      // KYC pending
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
      // Top markets by volume
      supabaseAdmin.from('markets').select('id, title, trading_volume').eq('status', 'open').order('trading_volume', { ascending: false }).limit(5),
    ])

    // Fraud reports count
    const { count: fraudCount } = await supabaseAdmin
      .from('fraud_reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')

    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })

    // Active users (users with transaction in last 7 days)
    const { count: activeUsers } = await supabaseAdmin.rpc('get_active_users_count', { days: 7 })

    // Total platform fees collected
    const { data: feeData } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .in('type', ['PLATFORM_FEE', 'HOUSE_FEE'])

    const totalFees = feeData?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0

    // AI agent status
    const { data: agentConfig } = await supabaseAdmin
      .from('ai_swarm_config')
      .select('is_enabled, daily_loss_limit')
      .single()

    const volume24h = volumeStats?.data?.get_total_volume_24h || 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      openMarkets: marketStats?.count || 0,
      volume24h,
      totalFees,
      kycPending: kycStats?.count || 0,
      fraudReportsOpen: fraudCount || 0,
      aiEnabled: agentConfig?.is_enabled || false,
      aiDailyLimit: agentConfig?.daily_loss_limit || 50000,
      topMarkets: topMarkets?.data || [],
      recentActivity: recentActivity?.data || [],
      userGrowth: { registered: totalUsers || 0, active: activeUsers || 0 },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}