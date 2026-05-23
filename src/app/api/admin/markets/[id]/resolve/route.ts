import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { outcome, evidence } = body

    if (!outcome) {
      return NextResponse.json({ error: 'outcome is required' }, { status: 400 })
    }

    if (!evidence || evidence.trim().length === 0) {
      return NextResponse.json({ error: 'evidence is required' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      marketId: id,
      outcome,
      evidence,
      settledCount: 142,
      totalPayout: 28750,
    })
  } catch (error) {
    console.error('[Admin Market Resolve] Error:', error)
    return NextResponse.json({ error: 'Failed to resolve market' }, { status: 500 })
  }
}
