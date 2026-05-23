import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userIds, action } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    if (!action || !['suspend', 'unsuspend'].includes(action)) {
      return NextResponse.json({ error: 'action must be suspend or unsuspend' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      action,
      affectedCount: userIds.length,
      userIds,
    })
  } catch (error) {
    console.error('[Admin Users Bulk] Error:', error)
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 })
  }
}
