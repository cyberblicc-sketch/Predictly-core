// ============================================================================
// Predictly — Admin MaaS API: Single client CRUD
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { getMaasClient, updateMaasClient, getMaasAnalytics, getMaasWidgets } from '@/lib/maas'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const client = getMaasClient(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const analytics = getMaasAnalytics(id)
    const widgets = getMaasWidgets(id)

    return NextResponse.json({
      client,
      analytics: analytics ?? null,
      widgets,
    })
  } catch (err) {
    console.error('[MaaS API] GET /admin/maas/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const client = getMaasClient(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.status !== undefined) updates.status = body.status
    if (body.pricing_model !== undefined) updates.pricing_model = body.pricing_model
    if (body.monthly_fee !== undefined) updates.monthly_fee = body.monthly_fee
    if (body.revenue_share_pct !== undefined) updates.revenue_share_pct = body.revenue_share_pct
    if (body.embed_domains !== undefined) updates.embed_domains = body.embed_domains
    if (body.allowed_categories !== undefined) updates.allowed_categories = body.allowed_categories

    if (body.custom_branding !== undefined) {
      updates.custom_branding = {
        ...client.custom_branding,
        ...body.custom_branding,
      }
    }

    const updated = updateMaasClient(id, updates as Partial<typeof client>)
    return NextResponse.json({ client: updated })
  } catch (err) {
    console.error('[MaaS API] PUT /admin/maas/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const client = getMaasClient(id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Instead of truly deleting, cancel the client
    const updated = updateMaasClient(id, { status: 'cancelled' })
    return NextResponse.json({
      client: updated,
      message: 'Client cancelled successfully.',
    })
  } catch (err) {
    console.error('[MaaS API] DELETE /admin/maas/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
