// ============================================================================
// Predictly — Admin API: Scout Findings Management
// GET: List findings with filters (category, confidence, processed)
// POST: Mark finding as processed / link to market candidate
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_SCOUT_FINDINGS } from '@/lib/ai-employees'
import { validateWithSchema, scoutFindingUpdateSchema } from '@/lib/ai-employees-zod'
import type { ScoutFinding, Category } from '@/types'

// In-memory findings store
let findingsStore: ScoutFinding[] = [...MOCK_SCOUT_FINDINGS]

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as Category | null
    const minConfidence = searchParams.get('min_confidence')
    const processed = searchParams.get('processed')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let filtered = [...findingsStore]

    // Apply filters
    if (category) {
      filtered = filtered.filter((f) => f.category === category)
    }
    if (minConfidence) {
      const min = parseFloat(minConfidence)
      filtered = filtered.filter((f) => f.confidence >= min)
    }
    if (processed !== null && processed !== undefined) {
      const isProcessed = processed === 'true'
      filtered = filtered.filter((f) => f.processed === isProcessed)
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = filtered.length
    const findings = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      findings,
      total,
      limit,
      offset,
      unprocessed_count: findingsStore.filter((f) => !f.processed).length,
    })
  } catch (error) {
    console.error('[AI Employees Findings GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch findings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateWithSchema(scoutFindingUpdateSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update request', details: validation.errors },
        { status: 400 }
      )
    }

    const { finding_id, action, market_candidate_id } = validation.data!

    const findingIndex = findingsStore.findIndex((f) => f.id === finding_id)
    if (findingIndex === -1) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 })
    }

    const finding = { ...findingsStore[findingIndex] }

    if (action === 'mark_processed') {
      finding.processed = true
    } else if (action === 'link_candidate') {
      finding.processed = true
      finding.market_candidate_id = market_candidate_id!
    }

    findingsStore[findingIndex] = finding

    return NextResponse.json({
      success: true,
      finding,
      message: action === 'mark_processed'
        ? 'Finding marked as processed'
        : `Finding linked to candidate ${market_candidate_id}`,
    })
  } catch (error) {
    console.error('[AI Employees Findings POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update finding' }, { status: 500 })
  }
}
