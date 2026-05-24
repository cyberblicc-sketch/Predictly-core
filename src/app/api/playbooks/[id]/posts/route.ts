import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PLAYBOOK_POSTS, MOCK_PLAYBOOK_SUBSCRIPTIONS } from '@/lib/playbooks'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Check subscription status
  const isSubscribed = MOCK_PLAYBOOK_SUBSCRIPTIONS.some(
    s => s.playbook_id === id && s.user_id === 'u1' && s.status === 'active'
  )

  const allPosts = MOCK_PLAYBOOK_POSTS.filter(p => p.playbook_id === id)
  const posts = isSubscribed
    ? allPosts
    : allPosts.filter(p => p.is_free_preview)

  return NextResponse.json({
    posts,
    isSubscribed,
    totalPosts: allPosts.length,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      )
    }

    const newPost = {
      id: `post-${Date.now()}`,
      playbook_id: id,
      title: body.title,
      content: body.content,
      market_ids: body.market_ids ?? [],
      position_type: body.position_type ?? 'analysis',
      outcomes_shared: body.outcomes_shared ?? [],
      is_free_preview: body.is_free_preview ?? false,
      likes: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
