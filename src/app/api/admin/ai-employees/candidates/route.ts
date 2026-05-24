// ============================================================================
// Predictly — Admin API: Market Candidates Management (THE QUARANTINE LAYER)
// GET: List candidates with filters (status, category)
// POST: Create new candidate manually
// PUT: Approve/reject candidate (HUMAN APPROVAL REQUIRED!)
//
// CRITICAL RULES:
// - ALL agent-generated candidates default to pending_review
// - NEVER auto-publish. AI agents CANNOT approve candidates.
// - Only human admins can approve/reject via PUT endpoint
// - On approve: status → 'approved', then clerk agent can publish
// - On reject: status → 'rejected', must include review_notes
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_MARKET_CANDIDATES } from '@/lib/ai-employees'
import {
  validateCandidateCreation,
  validateCandidateReview,
} from '@/lib/ai-employees-zod'
import type { MarketCandidate, Category, MarketCandidateStatus } from '@/types'

// In-memory candidates store
let candidatesStore: MarketCandidate[] = [...MOCK_MARKET_CANDIDATES]
let candidateCounter = candidatesStore.length

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as MarketCandidateStatus | null
    const category = searchParams.get('category') as Category | null
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let filtered = [...candidatesStore]

    // Apply filters
    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }
    if (category) {
      filtered = filtered.filter((c) => c.category === category)
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = filtered.length
    const candidates = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      candidates,
      total,
      limit,
      offset,
      pending_review_count: candidatesStore.filter((c) => c.status === 'pending_review').length,
      approved_count: candidatesStore.filter((c) => c.status === 'approved').length,
      rejected_count: candidatesStore.filter((c) => c.status === 'rejected').length,
      quarantine_warning: 'ALL AI-generated candidates require human review before publishing. Auto-publish is DISABLED.',
    })
  } catch (error) {
    console.error('[AI Employees Candidates GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateCandidateCreation(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid candidate data', details: validation.errors },
        { status: 400 }
      )
    }

    const data = validation.data!

    // Validate probability sums
    const probSum = data.estimated_probabilities.reduce((a, b) => a + b, 0)
    if (Math.abs(probSum - 1) > 0.05) {
      return NextResponse.json(
        { error: 'Estimated probabilities must sum to approximately 1.0', sum: probSum },
        { status: 400 }
      )
    }

    candidateCounter++
    const newCandidate: MarketCandidate = {
      id: `mc-manual-${candidateCounter}`,
      scout_finding_id: data.scout_finding_id ?? null,
      question: data.question,
      short_title: data.short_title,
      description: data.description,
      category: data.category,
      outcomes: data.outcomes,
      estimated_probabilities: data.estimated_probabilities,
      resolution_criteria: data.resolution_criteria,
      resolver_source: data.resolver_source,
      close_date: data.close_date ?? null,
      suggested_liquidity: data.suggested_liquidity,
      semantic_hash: `sha256:manual-${candidateCounter}-${Date.now()}`,
      duplicate_of: null,
      // CRITICAL: New candidates ALWAYS start as pending_review
      // This is the QUARANTINE LAYER — no exceptions
      status: 'pending_review',
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null,
      published_market_id: null,
      created_at: new Date().toISOString(),
    }

    candidatesStore = [newCandidate, ...candidatesStore]

    return NextResponse.json({
      success: true,
      candidate: newCandidate,
      message: 'Market candidate created. Status: pending_review. Requires human approval before publishing.',
    })
  } catch (error) {
    console.error('[AI Employees Candidates POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateCandidateReview(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid review data', details: validation.errors },
        { status: 400 }
      )
    }

    const { candidate_id, action, review_notes, reviewed_by } = validation.data!

    const candidateIndex = candidatesStore.findIndex((c) => c.id === candidate_id)
    if (candidateIndex === -1) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const candidate = { ...candidatesStore[candidateIndex] }

    // Only pending_review candidates can be approved or rejected
    if (candidate.status !== 'pending_review') {
      return NextResponse.json(
        { error: `Cannot review candidate with status "${candidate.status}". Only pending_review candidates can be reviewed.` },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // On approve: status → 'approved', clerk agent can then publish
      candidate.status = 'approved'
      candidate.reviewed_by = reviewed_by
      candidate.reviewed_at = new Date().toISOString()
      candidate.review_notes = review_notes
      // Note: The candidate is NOT published yet. The clerk agent will handle
      // the actual publishing step after this approval.
    } else if (action === 'reject') {
      // On reject: status → 'rejected', review_notes is REQUIRED
      candidate.status = 'rejected'
      candidate.reviewed_by = reviewed_by
      candidate.reviewed_at = new Date().toISOString()
      candidate.review_notes = review_notes
    }

    candidatesStore[candidateIndex] = candidate

    return NextResponse.json({
      success: true,
      candidate,
      message: action === 'approve'
        ? 'Candidate approved. The Clerk agent will publish this market shortly.'
        : 'Candidate rejected. Reason recorded.',
    })
  } catch (error) {
    console.error('[AI Employees Candidates PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to review candidate' }, { status: 500 })
  }
}
