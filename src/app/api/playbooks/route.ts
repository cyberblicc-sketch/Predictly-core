import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PLAYBOOKS, filterPlaybooks } from '@/lib/playbooks'
import type { Category, PlaybookTier } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const category = searchParams.get('category') as Category | 'All' | null
  const tier = searchParams.get('tier') as PlaybookTier | 'all' | null
  const search = searchParams.get('search') ?? undefined
  const sort = (searchParams.get('sort') as 'popular' | 'newest' | 'rating' | 'return') ?? 'popular'
  const creatorId = searchParams.get('creatorId') ?? undefined
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '12', 10)))

  const filtered = filterPlaybooks(MOCK_PLAYBOOKS, {
    category: category ?? undefined,
    tier: tier ?? undefined,
    search,
    sort,
    creatorId,
  })

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    playbooks: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category' },
        { status: 400 }
      )
    }

    const newPlaybook = {
      id: `pb-${Date.now()}`,
      creator_id: 'creator-whale',
      creator_username: 'whale.eth',
      creator_avatar: '🐋',
      creator_badge: 'whale' as const,
      title: body.title,
      description: body.description,
      cover_color: body.cover_color ?? 'from-amber-500/30 to-orange-500/30',
      cover_emoji: body.cover_emoji ?? '📝',
      category: body.category,
      tier: body.tier ?? 'free',
      price_monthly: body.price_monthly ?? 0,
      subscriber_count: 0,
      max_subscribers: body.max_subscribers ?? null,
      rating: 0,
      rating_count: 0,
      total_posts: 0,
      open_positions: 0,
      win_rate: 0,
      avg_return: 0,
      status: 'active' as const,
      tags: body.tags ?? [],
      featured: false,
      created_at: new Date().toISOString(),
      last_post_at: new Date().toISOString(),
    }

    return NextResponse.json({ playbook: newPlaybook }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
