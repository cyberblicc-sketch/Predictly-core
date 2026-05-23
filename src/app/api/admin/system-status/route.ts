import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connectivity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let dbStatus = 'not_configured'
    let dbLatency = 0

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
        const startDb = Date.now()
        const { error: dbError } = await supabaseAdmin.from('users').select('id').limit(1)
        dbLatency = Date.now() - startDb
        dbStatus = dbError ? 'error' : 'operational'
      } catch {
        dbStatus = 'error'
      }
    }

    // Check Stripe connectivity
    let stripeStatus = 'not_configured'
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
        await stripe.balance.retrieve()
        stripeStatus = 'operational'
      } catch {
        stripeStatus = 'degraded'
      }
    }

    // Check Groq API
    let groqStatus = 'not_configured'
    if (process.env.GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
        })
        groqStatus = response.ok ? 'operational' : 'degraded'
      } catch {
        groqStatus = 'degraded'
      }
    }

    // Compile system info
    const systemStatus = {
      status: dbStatus === 'operational' ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbStatus,
        stripe: stripeStatus,
        groq: groqStatus,
        nextjs: 'operational' as const,
      },
      latency: {
        database_ms: dbLatency,
      },
      aiSwarm: {
        enabled: false,
        lastTickAt: null as string | null,
        dailyLoss: 0,
        pendingJobs: 0,
      },
      config: {
        house_fee: '2%',
        platform_fee: '1%',
        min_redeem_sc: '50',
        regular_redeem_sc: '60',
        referral_sc_reward: '20',
        referral_gc_reward: '20000',
      },
    }

    // Try to get live AI swarm config from database
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

        const { data: aiSettings } = await supabaseAdmin
          .from('ai_swarm_settings')
          .select('is_enabled, last_tick_at, daily_loss')
          .single()

        if (aiSettings) {
          systemStatus.aiSwarm = {
            enabled: aiSettings.is_enabled || false,
            lastTickAt: aiSettings.last_tick_at,
            dailyLoss: aiSettings.daily_loss || 0,
            pendingJobs: 0,
          }
        }

        const { count: pendingJobs } = await supabaseAdmin
          .from('ai_agent_trades')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')

        systemStatus.aiSwarm.pendingJobs = pendingJobs || 0
      } catch {
        // Database not available for live config, use defaults
      }
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error('System status error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve system status',
    }, { status: 500 })
  }
}
