// ============================================================================
// Predictly — Admin API: Content Queue Management
// GET: List content items
// POST: Approve/publish content
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_CONTENT_QUEUE } from '@/lib/ai-employees'
import { validateContentAction } from '@/lib/ai-employees-zod'
import type { ContentQueue, ContentQueueStatus } from '@/types'

// In-memory content store
let contentStore: ContentQueue[] = [...MOCK_CONTENT_QUEUE]

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ContentQueueStatus | null
    const contentType = searchParams.get('content_type') as ContentQueue['content_type'] | null
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let filtered = [...contentStore]

    // Apply filters
    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }
    if (contentType) {
      filtered = filtered.filter((c) => c.content_type === contentType)
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = filtered.length
    const items = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      items,
      total,
      limit,
      offset,
      pending_count: contentStore.filter((c) => c.status === 'pending').length,
      ready_count: contentStore.filter((c) => c.status === 'ready').length,
      published_count: contentStore.filter((c) => c.status === 'published').length,
    })
  } catch (error) {
    console.error('[AI Employees Content GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch content queue' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateContentAction(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid content action', details: validation.errors },
        { status: 400 }
      )
    }

    const { content_id, action, reviewed_by } = validation.data!

    const contentIndex = contentStore.findIndex((c) => c.id === content_id)
    if (contentIndex === -1) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 })
    }

    const item = { ...contentStore[contentIndex] }

    if (action === 'approve') {
      // Move from pending/generating → ready
      if (item.status !== 'pending' && item.status !== 'generating') {
        return NextResponse.json(
          { error: `Cannot approve content with status "${item.status}"` },
          { status: 400 }
        )
      }
      item.status = 'ready'
    } else if (action === 'publish') {
      // Move from ready → published
      if (item.status !== 'ready') {
        return NextResponse.json(
          { error: `Cannot publish content with status "${item.status}". Content must be approved (ready) first.` },
          { status: 400 }
        )
      }
      item.status = 'published'
      item.published_at = new Date().toISOString()
    } else if (action === 'reject') {
      item.status = 'failed'
      item.metadata = {
        ...item.metadata,
        rejected_by: reviewed_by,
        rejected_at: new Date().toISOString(),
      }
    }

    contentStore[contentIndex] = item

    return NextResponse.json({
      success: true,
      item,
      message: action === 'approve'
        ? 'Content approved and ready for publishing'
        : action === 'publish'
          ? 'Content published successfully'
          : 'Content rejected',
    })
  } catch (error) {
    console.error('[AI Employees Content POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}
