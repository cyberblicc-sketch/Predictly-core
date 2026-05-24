import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_BOOSTED_MARKETS } from '@/lib/boosted'
import type { BoostedMarket, BoostPlacement, BoostStatus } from '@/types'

// In-memory store seeded from mock data (for demo purposes)
let boostedMarkets: BoostedMarket[] = [...MOCK_BOOSTED_MARKETS]

export async function GET() {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ boosts: boostedMarkets })
  } catch (error) {
    console.error('[Boosted Markets GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch boosted markets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { market_id, sponsor_name, placement, budget, start_date, end_date, market_title, market_emoji, target_categories, additional_liquidity } = body

    // Validate required fields
    if (!market_id || !sponsor_name || !placement || !budget || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: market_id, sponsor_name, placement, budget, start_date, end_date' },
        { status: 400 }
      )
    }

    // Validate placement
    const validPlacements: BoostPlacement[] = ['hero', 'featured', 'category_top', 'sidebar', 'ticker']
    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: `Invalid placement. Must be one of: ${validPlacements.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate budget
    if (typeof budget !== 'number' || budget <= 0) {
      return NextResponse.json({ error: 'Budget must be a positive number' }, { status: 400 })
    }

    const newBoost: BoostedMarket = {
      id: `boost-${Date.now()}`,
      market_id,
      market_title: market_title || 'Untitled Market',
      market_emoji: market_emoji || '📊',
      sponsor_name,
      sponsor_logo_url: null,
      placement,
      status: 'pending' as BoostStatus,
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      additional_liquidity: additional_liquidity || 0,
      start_date,
      end_date,
      cpc: 0,
      target_categories: target_categories || [],
      created_at: new Date().toISOString(),
    }

    boostedMarkets.push(newBoost)

    return NextResponse.json({ boost: newBoost }, { status: 201 })
  } catch (error) {
    console.error('[Boosted Markets POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create boosted market' }, { status: 500 })
  }
}
