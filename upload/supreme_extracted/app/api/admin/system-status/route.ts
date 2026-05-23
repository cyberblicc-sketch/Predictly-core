import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Check database connectivity
    const startDb = Date.now()
    const { error: dbError } = await supabaseAdmin.from('users').select('id').limit(1)
    const dbLatency = Date.now() - startDb

    // Check Stripe connectivity
    let stripeStatus = 'operational'
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
      await stripe.balance.retrieve()
    } catch {
      stripeStatus = 'degraded'
    }

    // Check Groq API
    let groqStatus = 'operational'
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
      })
      if (!response.ok) groqStatus = 'degraded'
    } catch {
      groqStatus = 'degraded'
    }

    // Get system config
    const { data: aiConfig } = await supabaseAdmin
      .from('ai_swarm_config')
      .select('is_enabled, last_tick_at, daily_loss')
      .single()

    const { data: siteConfig } = await supabaseAdmin
      .from('site_config')
      .select('key, value')
      .limit(20)

    // Count pending jobs
    const { count: pendingJobs } = await supabaseAdmin
      .from('ai_agent_trades')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: dbError ? 'error' : 'operational',
        stripe: stripeStatus,
        groq: groqStatus,
        edge_functions: 'operational',
      },
      latency: {
        database_ms: dbLatency,
      },
      aiSwarm: {
        enabled: aiConfig?.is_enabled || false,
        lastTickAt: aiConfig?.last_tick_at || null,
        dailyLoss: aiConfig?.daily_loss || 0,
        pendingJobs: pendingJobs || 0,
      },
      config: siteConfig?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {},
    })
  } catch (error) {
    console.error('System status error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve system status',
    }, { status: 500 })
  }
}