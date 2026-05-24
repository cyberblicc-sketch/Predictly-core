// ============================================================================
// Predictly — Admin API: Fraud Flag Management
// GET: List fraud flags with filters (severity, status, flag_type)
// POST: Update fraud flag (investigate, resolve, dismiss)
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { MOCK_FRAUD_FLAGS } from '@/lib/ai-employees'
import { validateFraudUpdate } from '@/lib/ai-employees-zod'
import type { FraudFlag, FraudFlagSeverity, FraudFlagStatus } from '@/types'

// In-memory fraud flags store
let fraudStore: FraudFlag[] = [...MOCK_FRAUD_FLAGS]

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') as FraudFlagSeverity | null
    const status = searchParams.get('status') as FraudFlagStatus | null
    const flagType = searchParams.get('flag_type') as FraudFlag['flag_type'] | null
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    let filtered = [...fraudStore]

    // Apply filters
    if (severity) {
      filtered = filtered.filter((f) => f.severity === severity)
    }
    if (status) {
      filtered = filtered.filter((f) => f.status === status)
    }
    if (flagType) {
      filtered = filtered.filter((f) => f.flag_type === flagType)
    }

    // Sort by risk_score descending (most urgent first)
    filtered.sort((a, b) => b.risk_score - a.risk_score)

    const total = filtered.length
    const flags = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      flags,
      total,
      limit,
      offset,
      open_count: fraudStore.filter((f) => f.status === 'open').length,
      critical_count: fraudStore.filter((f) => f.severity === 'critical').length,
      investigating_count: fraudStore.filter((f) => f.status === 'investigating').length,
    })
  } catch (error) {
    console.error('[AI Employees Fraud GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch fraud flags' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateFraudUpdate(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid fraud update', details: validation.errors },
        { status: 400 }
      )
    }

    const { flag_id, action, resolution, reviewed_by } = validation.data!

    const flagIndex = fraudStore.findIndex((f) => f.id === flag_id)
    if (flagIndex === -1) {
      return NextResponse.json({ error: 'Fraud flag not found' }, { status: 404 })
    }

    const flag = { ...fraudStore[flagIndex] }

    if (action === 'investigate') {
      if (flag.status !== 'open' && flag.status !== 'escalated') {
        return NextResponse.json(
          { error: `Cannot investigate flag with status "${flag.status}". Only open or escalated flags can be investigated.` },
          { status: 400 }
        )
      }
      flag.status = 'investigating'
      flag.reviewed_by = reviewed_by
      flag.reviewed_at = new Date().toISOString()
    } else if (action === 'resolve') {
      if (!resolution) {
        return NextResponse.json(
          { error: 'Resolution text is required when resolving a fraud flag' },
          { status: 400 }
        )
      }
      flag.status = 'resolved'
      flag.reviewed_by = reviewed_by
      flag.reviewed_at = new Date().toISOString()
      flag.resolution = resolution
    } else if (action === 'dismiss') {
      flag.status = 'dismissed'
      flag.reviewed_by = reviewed_by
      flag.reviewed_at = new Date().toISOString()
      flag.resolution = resolution ?? 'Dismissed by admin review'
    }

    fraudStore[flagIndex] = flag

    return NextResponse.json({
      success: true,
      flag,
      message: `Fraud flag ${action}d successfully`,
    })
  } catch (error) {
    console.error('[AI Employees Fraud POST] Error:', error)
    return NextResponse.json({ error: 'Failed to update fraud flag' }, { status: 500 })
  }
}
