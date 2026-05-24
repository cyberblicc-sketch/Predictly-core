import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PLAYBOOKS, MOCK_PLAYBOOK_POSTS, MOCK_PLAYBOOK_SUBSCRIPTIONS } from '@/lib/playbooks'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const playbook = MOCK_PLAYBOOKS.find(p => p.id === id)

  if (!playbook) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  // Check if user is subscribed (mock: user u1)
  const isSubscribed = MOCK_PLAYBOOK_SUBSCRIPTIONS.some(
    s => s.playbook_id === id && s.user_id === 'u1' && s.status === 'active'
  )

  // Get posts — subscribed users see all, non-subscribers see only free preview
  const allPosts = MOCK_PLAYBOOK_POSTS.filter(p => p.playbook_id === id)
  const posts = isSubscribed
    ? allPosts
    : allPosts.filter(p => p.is_free_preview)

  return NextResponse.json({
    playbook,
    posts,
    isSubscribed,
    totalPosts: allPosts.length,
    freePostsCount: allPosts.filter(p => p.is_free_preview).length,
  })
}
