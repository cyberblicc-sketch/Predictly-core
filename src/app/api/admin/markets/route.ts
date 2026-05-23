import { NextResponse } from 'next/server'
import { markets } from '@/lib/mockData'

export async function GET() {
  try {
    return NextResponse.json(markets)
  } catch (error) {
    console.error('[Admin Markets GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, outcomes, closeDate } = body

    if (!title || !description || !category || !outcomes || !closeDate) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const newMarket = {
      id: `m-${Date.now()}`,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      question: title,
      shortTitle: title,
      description,
      category,
      tags: [],
      outcomes: outcomes.map((o: { label: string }, i: number) => ({
        id: `outcome-${i}`,
        label: o.label,
        price: 1 / outcomes.length,
        volume: 0,
        delta7d: 0,
      })),
      volume: 0,
      liquidity: 0,
      traders: 0,
      closeAt: closeDate,
      createdAt: new Date().toISOString(),
      resolver: 'Admin',
      imageColor: 'from-brand/30 to-yes/30',
      imageEmoji: '🎯',
      status: 'active' as const,
    }

    return NextResponse.json({ success: true, market: newMarket })
  } catch (error) {
    console.error('[Admin Markets POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 })
  }
}
