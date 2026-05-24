import { NextResponse } from 'next/server'
import { portfolio } from '@/lib/mockData'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // In demo mode, return the mock portfolio for any user
    void id
    return NextResponse.json(portfolio.positions)
  } catch (error) {
    console.error('[Admin User Positions] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}
