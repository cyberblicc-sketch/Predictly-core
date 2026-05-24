import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { suspended } = body

    if (typeof suspended !== 'boolean') {
      return NextResponse.json({ error: 'suspended must be a boolean' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      marketId: id,
      suspended,
      status: suspended ? 'paused' : 'active',
    })
  } catch (error) {
    console.error('[Admin Market Suspend] Error:', error)
    return NextResponse.json({ error: 'Failed to suspend/unsuspend market' }, { status: 500 })
  }
}
