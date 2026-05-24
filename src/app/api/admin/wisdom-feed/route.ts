// ============================================================================
// Wisdom Feed Admin API — /api/admin/wisdom-feed
// List all clients with usage stats, create new clients
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import {
  MOCK_WISDOM_FEED_CLIENTS,
  TIER_CONFIG,
  generateApiKey,
  hashApiKey,
  getWisdomFeedUsageStats,
  MOCK_WISDOM_FEED_LOGS,
  apiLogs,
} from '@/lib/wisdom-feed'
import type { WisdomFeedClient } from '@/types'

// ── GET: List all clients with usage stats ───────────────────────────────────

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin session required' },
        { status: 401 }
      )
    }

    const clientsWithStats = MOCK_WISDOM_FEED_CLIENTS.map((client) => {
      const stats = getWisdomFeedUsageStats(client.id)
      return {
        ...client,
        usage_stats: stats,
      }
    })

    // Aggregate stats
    const totalRevenue = MOCK_WISDOM_FEED_CLIENTS
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.monthly_price, 0)

    const totalRequests = MOCK_WISDOM_FEED_CLIENTS.reduce((sum, c) => sum + c.total_requests, 0)

    const activeClients = MOCK_WISDOM_FEED_CLIENTS.filter((c) => c.status === 'active').length

    // Recent logs (combined mock + runtime logs)
    const recentLogs = [...apiLogs, ...MOCK_WISDOM_FEED_LOGS]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)

    // Revenue by tier
    const revenueByTier = {
      tier1: MOCK_WISDOM_FEED_CLIENTS.filter((c) => c.tier === 'tier1' && c.status === 'active').reduce((s, c) => s + c.monthly_price, 0),
      tier2: MOCK_WISDOM_FEED_CLIENTS.filter((c) => c.tier === 'tier2' && c.status === 'active').reduce((s, c) => s + c.monthly_price, 0),
      tier3: MOCK_WISDOM_FEED_CLIENTS.filter((c) => c.tier === 'tier3' && c.status === 'active').reduce((s, c) => s + c.monthly_price, 0),
    }

    return NextResponse.json({
      clients: clientsWithStats,
      stats: {
        total_revenue: totalRevenue,
        total_requests: totalRequests,
        active_clients: activeClients,
        total_clients: MOCK_WISDOM_FEED_CLIENTS.length,
        revenue_by_tier: revenueByTier,
      },
      recent_logs: recentLogs,
      tier_config: TIER_CONFIG,
    })
  } catch (error) {
    console.error('[Admin Wisdom Feed GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── POST: Create a new client ────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin session required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { company_name, contact_email, contact_name, tier } = body

    if (!company_name || !contact_email || !contact_name || !tier) {
      return NextResponse.json(
        { error: 'Bad request', message: 'company_name, contact_email, contact_name, and tier are required' },
        { status: 400 }
      )
    }

    if (!['tier1', 'tier2', 'tier3'].includes(tier)) {
      return NextResponse.json(
        { error: 'Bad request', message: 'tier must be tier1, tier2, or tier3' },
        { status: 400 }
      )
    }

    const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]
    const apiKey = generateApiKey()
    const apiKeyHash = await hashApiKey(apiKey)

    const newClient: WisdomFeedClient = {
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      company_name,
      contact_email,
      contact_name,
      tier,
      api_key: apiKey,
      api_key_hash: apiKeyHash,
      status: 'active',
      monthly_price: tierConfig.price,
      rate_limit_per_min: tierConfig.rate_limit,
      total_requests: 0,
      last_request_at: null,
      webhook_url: null,
      webhook_events: [],
      allowed_categories: ['Politics', 'Crypto', 'Sports', 'Tech', 'Economics', 'Pop Culture', 'Science', 'World', 'Stocks'],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 86_400_000).toISOString(),
    }

    MOCK_WISDOM_FEED_CLIENTS.push(newClient)

    // Return the API key in the response — only shown once!
    return NextResponse.json(
      {
        success: true,
        client: {
          ...newClient,
          api_key_masked: `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`,
        },
        api_key: apiKey, // Only returned on creation
        warning: 'This API key will only be shown once. Store it securely.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Admin Wisdom Feed POST] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
