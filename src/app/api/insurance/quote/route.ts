import { NextRequest, NextResponse } from 'next/server'
import { calculateInsuranceQuote } from '@/lib/insurance'
import type { InsuranceType } from '@/types'
import type { Position } from '@/types'
import { portfolio } from '@/lib/mockData'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { position_id, insurance_type, coverage_pct } = body

    if (!position_id || !insurance_type) {
      return NextResponse.json(
        { error: 'Missing required fields: position_id, insurance_type' },
        { status: 400 }
      )
    }

    // Validate insurance type
    const validTypes: InsuranceType[] = ['full_hedge', 'partial_hedge', 'stop_loss']
    if (!validTypes.includes(insurance_type)) {
      return NextResponse.json(
        { error: `Invalid insurance_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Find the position
    const position = portfolio.positions.find((p) => p.id === position_id) as Position | undefined
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Calculate the quote
    const coveragePct = coverage_pct ?? (insurance_type === 'partial_hedge' ? 50 : 100)
    const quote = calculateInsuranceQuote(position, insurance_type, coveragePct)

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('[Insurance Quote] Error:', error)
    return NextResponse.json({ error: 'Failed to calculate insurance quote' }, { status: 500 })
  }
}
