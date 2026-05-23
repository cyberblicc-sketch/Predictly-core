import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { suspended, reason } = body

    if (typeof suspended !== 'boolean') {
      return NextResponse.json({ error: 'suspended must be a boolean' }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      userId: id,
      suspended,
      reason,
    })
  } catch (error) {
    console.error('[Admin User Suspend] Error:', error)
    return NextResponse.json({ error: 'Failed to suspend/unsuspend user' }, { status: 500 })
  }
}
