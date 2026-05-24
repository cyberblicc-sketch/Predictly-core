// ============================================================================
// Predictly — Admin MaaS Widgets API: List & Create widgets
// ============================================================================

import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/adminAuth'
import { getMaasWidgets, addMaasWidget, generateEmbedCode, getMaasClient } from '@/lib/maas'
import type { MaaSWidget } from '@/types'

export async function GET(request: Request) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id') ?? undefined

    const widgets = getMaasWidgets(clientId)
    return NextResponse.json({ widgets })
  } catch (err) {
    console.error('[MaaS API] GET /admin/maas/widgets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { client_id, name, type, market_ids, config } = body as {
      client_id: string
      name: string
      type: MaaSWidget['type']
      market_ids: string[]
      config?: Partial<MaaSWidget['config']>
      category?: string
    }

    if (!client_id || !name || !type || !market_ids?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, name, type, market_ids' },
        { status: 400 }
      )
    }

    const client = getMaasClient(client_id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const defaultConfig: MaaSWidget['config'] = {
      width: '800',
      height: '600',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Trade Now',
      cta_url: '',
      border_radius: '12px',
      hide_powered_by: false,
    }

    const widgetConfig: MaaSWidget['config'] = {
      ...defaultConfig,
      ...config,
    }

    const id = `wgt-${type}-${Date.now()}`
    const widget: MaaSWidget = {
      id,
      client_id,
      name,
      type,
      market_ids,
      category: body.category,
      config: widgetConfig,
      embed_code: '',
      views: 0,
      clicks: 0,
      ctr: 0,
      created_at: new Date().toISOString(),
    }

    widget.embed_code = generateEmbedCode(widget)
    addMaasWidget(widget)

    return NextResponse.json({ widget }, { status: 201 })
  } catch (err) {
    console.error('[MaaS API] POST /admin/maas/widgets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
