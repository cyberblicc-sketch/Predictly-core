import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PLAYBOOKS, MOCK_PLAYBOOK_SUBSCRIPTIONS } from '@/lib/playbooks'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const playbook = MOCK_PLAYBOOKS.find(p => p.id === id)

  if (!playbook) {
    return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
  }

  // Check if already subscribed
  const existing = MOCK_PLAYBOOK_SUBSCRIPTIONS.find(
    s => s.playbook_id === id && s.user_id === 'u1' && s.status === 'active'
  )

  if (existing) {
    return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
  }

  // Check if at capacity
  if (playbook.max_subscribers && playbook.subscriber_count >= playbook.max_subscribers) {
    return NextResponse.json({ error: 'Playbook is at maximum capacity' }, { status: 409 })
  }

  // Check balance for paid playbooks (mock user has 2500 SC)
  if (playbook.price_monthly > 0 && 2500 < playbook.price_monthly) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 })
  }

  // Create subscription
  const subscription = {
    id: `sub-${Date.now()}`,
    user_id: 'u1',
    playbook_id: id,
    status: 'active' as const,
    price_at_subscribe: playbook.price_monthly,
    current_price: playbook.price_monthly,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    auto_renew: true,
  }

  MOCK_PLAYBOOK_SUBSCRIPTIONS.push(subscription)

  return NextResponse.json({
    subscription,
    message: playbook.price_monthly > 0
      ? `Subscribed for ${playbook.price_monthly} SC/month`
      : 'Subscribed for free',
  }, { status: 201 })
}
