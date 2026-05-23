import { NextResponse } from 'next/server'
import { mockAdminStats } from '@/lib/mockData'

export async function GET() {
  try {
    return NextResponse.json(mockAdminStats)
  } catch (error) {
    console.error('[Admin Stats] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
