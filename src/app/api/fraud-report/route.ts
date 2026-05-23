import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { marketId, type, description } = body

    if (!marketId || !type || !description) {
      return NextResponse.json({ error: 'marketId, type, and description are required' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      reportId: `f-${Date.now()}`,
      marketId,
      type,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Fraud Report POST] Error:', error)
    return NextResponse.json({ error: 'Failed to submit fraud report' }, { status: 500 })
  }
}
