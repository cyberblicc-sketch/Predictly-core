// ============================================================================
// Wisdom Feed Admin API — /api/admin/wisdom-feed/[id]
// Get, update, or delete a single Wisdom Feed client
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import {
  MOCK_WISDOM_FEED_CLIENTS,
  TIER_CONFIG,
  getWisdomFeedUsageStats,
  MOCK_WISDOM_FEED_LOGS,
  apiLogs,
} from '@/lib/wisdom-feed'

// ── GET: Get client details + usage stats ────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin session required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const client = MOCK_WISDOM_FEED_CLIENTS.find((c) => c.id === id)

    if (!client) {
      return NextResponse.json(
        { error: 'Not found', message: `Client ${id} not found` },
        { status: 404 }
      )
    }

    const stats = getWisdomFeedUsageStats(client.id)

    // Get recent logs for this client
    const clientLogs = [...apiLogs, ...MOCK_WISDOM_FEED_LOGS]
      .filter((l) => l.client_id === client.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    return NextResponse.json({
      client: {
        ...client,
        api_key_masked: `${client.api_key.slice(0, 12)}...${client.api_key.slice(-4)}`,
        api_key: undefined, // Never return full API key
      },
      usage_stats: stats,
      recent_logs: clientLogs,
    })
  } catch (error) {
    console.error('[Admin Wisdom Feed GET /id] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── PUT: Update client ───────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin session required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const client = MOCK_WISDOM_FEED_CLIENTS.find((c) => c.id === id)

    if (!client) {
      return NextResponse.json(
        { error: 'Not found', message: `Client ${id} not found` },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { tier, status, rate_limit_per_min, allowed_categories } = body

    // Update tier and related pricing
    if (tier && ['tier1', 'tier2', 'tier3'].includes(tier)) {
      const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG]
      client.tier = tier
      client.monthly_price = tierConfig.price
      client.rate_limit_per_min = tierConfig.rate_limit
    }

    // Update status
    if (status && ['active', 'suspended', 'cancelled'].includes(status)) {
      client.status = status as 'active' | 'suspended' | 'cancelled'
    }

    // Update rate limit override
    if (rate_limit_per_min && typeof rate_limit_per_min === 'number') {
      client.rate_limit_per_min = rate_limit_per_min
    }

    // Update allowed categories
    if (allowed_categories && Array.isArray(allowed_categories)) {
      client.allowed_categories = allowed_categories
    }

    return NextResponse.json({
      success: true,
      client: {
        ...client,
        api_key_masked: `${client.api_key.slice(0, 12)}...${client.api_key.slice(-4)}`,
        api_key: undefined,
      },
    })
  } catch (error) {
    console.error('[Admin Wisdom Feed PUT /id] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── DELETE: Cancel/suspend client ────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Admin session required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const client = MOCK_WISDOM_FEED_CLIENTS.find((c) => c.id === id)

    if (!client) {
      return NextResponse.json(
        { error: 'Not found', message: `Client ${id} not found` },
        { status: 404 }
      )
    }

    // Soft delete — set status to cancelled
    client.status = 'cancelled'

    return NextResponse.json({
      success: true,
      message: `Client ${client.company_name} has been cancelled`,
      client: {
        ...client,
        api_key_masked: `${client.api_key.slice(0, 12)}...${client.api_key.slice(-4)}`,
        api_key: undefined,
      },
    })
  } catch (error) {
    console.error('[Admin Wisdom Feed DELETE /id] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
