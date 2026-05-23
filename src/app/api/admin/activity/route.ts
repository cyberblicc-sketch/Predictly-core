import { NextResponse } from 'next/server'
import { mockAdminLogs } from '@/lib/mockData'

export async function GET() {
  try {
    return NextResponse.json(mockAdminLogs)
  } catch (error) {
    console.error('[Admin Activity] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
