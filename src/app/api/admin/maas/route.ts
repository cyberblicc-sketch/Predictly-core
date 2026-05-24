// ============================================================================
// Predictly — Admin MaaS API: List & Create clients
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import {
  getMaasClients,
  getMaasAnalytics,
  getMaasWidgets,
  addMaasClient,
  generateMaaSApiKey,
  getMaasCategories,
} from '@/lib/maas'
import type { MaaSClient, MaaSPricingModel } from '@/types'

export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const clients = getMaasClients()
    const categories = getMaasCategories()

    // Attach analytics summary to each client
    const clientsWithAnalytics = clients.map((client) => {
      const analytics = getMaasAnalytics(client.id)
      const widgets = getMaasWidgets(client.id)
      return {
        ...client,
        analytics_summary: analytics
          ? {
              views_7d: analytics.total_views_7d,
              clicks_7d: analytics.total_clicks_7d,
              trades_7d: analytics.total_trades_7d,
              revenue_7d: analytics.total_revenue_7d,
            }
          : null,
        widget_count: widgets.length,
      }
    })

    // Global stats
    const totalViews7d = clientsWithAnalytics.reduce(
      (sum, c) => sum + (c.analytics_summary?.views_7d ?? 0),
      0
    )
    const totalRevenue7d = clientsWithAnalytics.reduce(
      (sum, c) => sum + (c.analytics_summary?.revenue_7d ?? 0),
      0
    )
    const totalTrades7d = clientsWithAnalytics.reduce(
      (sum, c) => sum + (c.analytics_summary?.trades_7d ?? 0),
      0
    )
    const totalEmbeds = clientsWithAnalytics.reduce((sum, c) => sum + c.widget_count, 0)

    return NextResponse.json({
      clients: clientsWithAnalytics,
      categories,
      stats: {
        total_clients: clients.length,
        active_clients: clients.filter((c) => c.status === 'active').length,
        total_embeds: totalEmbeds,
        total_views_7d: totalViews7d,
        total_revenue_7d: totalRevenue7d,
        total_trades_7d: totalTrades7d,
      },
    })
  } catch (err) {
    console.error('[MaaS API] GET /admin/maas error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      company_name,
      website,
      contact_email,
      contact_name,
      pricing_model,
      monthly_fee,
      revenue_share_pct,
      embed_domains,
      allowed_categories,
    } = body as {
      company_name: string
      website: string
      contact_email: string
      contact_name: string
      pricing_model: MaaSPricingModel
      monthly_fee?: number
      revenue_share_pct?: number
      embed_domains?: string[]
      allowed_categories?: string[]
    }

    if (!company_name || !website || !contact_email || !contact_name || !pricing_model) {
      return NextResponse.json(
        { error: 'Missing required fields: company_name, website, contact_email, contact_name, pricing_model' },
        { status: 400 }
      )
    }

    const apiKey = generateMaaSApiKey()
    const id = `client-${company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`

    const newClient: MaaSClient = {
      id,
      company_name,
      website,
      contact_email,
      contact_name,
      status: 'trial',
      pricing_model,
      monthly_fee: monthly_fee ?? 0,
      revenue_share_pct: revenue_share_pct ?? 0,
      embed_domains: embed_domains ?? [],
      allowed_categories: allowed_categories ?? [],
      custom_branding: {
        primary_color: '#6366F1',
        logo_url: null,
        font_family: null,
        hide_predictly_branding: false,
      },
      api_key: apiKey,
      total_embeds: 0,
      total_views: 0,
      total_trades_from_embed: 0,
      total_revenue_generated: 0,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    }

    addMaasClient(newClient)

    // Return client with API key (shown once)
    return NextResponse.json({
      client: newClient,
      api_key: apiKey,
      message: 'Client created successfully. Save the API key — it won\'t be shown again.',
    }, { status: 201 })
  } catch (err) {
    console.error('[MaaS API] POST /admin/maas error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
