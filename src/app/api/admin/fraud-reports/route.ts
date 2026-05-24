import { NextResponse } from 'next/server'
import { mockFraudReports } from '@/lib/mockData'

export async function GET() {
  try {
    return NextResponse.json(mockFraudReports)
  } catch (error) {
    console.error('[Admin Fraud Reports GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch fraud reports' }, { status: 500 })
  }
}
