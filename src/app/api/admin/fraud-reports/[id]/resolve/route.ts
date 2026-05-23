import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { resolution, notes } = body

    if (!resolution || !['dismiss', 'uphold'].includes(resolution)) {
      return NextResponse.json({ error: 'resolution must be dismiss or uphold' }, { status: 400 })
    }

    // In demo mode, just return success
    return NextResponse.json({
      success: true,
      reportId: id,
      resolution,
      notes: notes || '',
      resolvedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Admin Fraud Report Resolve] Error:', error)
    return NextResponse.json({ error: 'Failed to resolve fraud report' }, { status: 500 })
  }
}
