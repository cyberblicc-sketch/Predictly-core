import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_BOOSTED_MARKETS } from '@/lib/boosted'

// In-memory store (same reference as the list route — in production, use a DB)
let boostedMarkets = [...MOCK_BOOSTED_MARKETS]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const boost = boostedMarkets.find((b) => b.id === id)

    if (!boost) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }

    return NextResponse.json({ boost })
  } catch (error) {
    console.error('[Boosted Market GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch boost' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, budget } = body

    const index = boostedMarkets.findIndex((b) => b.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }

    // Update allowed fields
    if (status) {
      const validStatuses = ['pending', 'active', 'paused', 'completed', 'rejected']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      boostedMarkets[index] = { ...boostedMarkets[index], status }
    }

    if (budget !== undefined) {
      if (typeof budget !== 'number' || budget <= 0) {
        return NextResponse.json({ error: 'Budget must be a positive number' }, { status: 400 })
      }
      boostedMarkets[index] = { ...boostedMarkets[index], budget }
    }

    return NextResponse.json({ boost: boostedMarkets[index] })
  } catch (error) {
    console.error('[Boosted Market PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update boost' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const index = boostedMarkets.findIndex((b) => b.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Boost not found' }, { status: 404 })
    }

    // Mark as rejected rather than actually removing
    boostedMarkets[index] = { ...boostedMarkets[index], status: 'rejected' }

    return NextResponse.json({ success: true, message: 'Boost cancelled' })
  } catch (error) {
    console.error('[Boosted Market DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to cancel boost' }, { status: 500 })
  }
}
