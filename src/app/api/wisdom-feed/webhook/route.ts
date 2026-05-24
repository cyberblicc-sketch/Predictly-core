// ============================================================================
// Wisdom Feed API — /webhook endpoint (Tier 3 only)
// Manage webhook registrations for real-time event notifications
// ============================================================================

import { NextResponse } from 'next/server'
import {
  findClientByApiKey,
  checkRateLimit,
  logApiRequest,
} from '@/lib/wisdom-feed'

// In-memory webhook store
const webhookStore = new Map<string, Array<{ id: string; url: string; events: string[]; created_at: string; secret: string }>>()

// Valid webhook events
const VALID_EVENTS = [
  'market.created',
  'market.probability_update',
  'market.resolved',
  'market.paused',
  'market.cancelled',
  'orderbook.update',
  'trade.large',
]

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    // Extract API key
    const authHeader = request.headers.get('Authorization')
    let apiKey: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.slice(7)
    }

    if (!apiKey) {
      const { searchParams } = new URL(request.url)
      apiKey = searchParams.get('api_key')
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      )
    }

    const client = findClientByApiKey(apiKey)

    if (!client) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Webhooks are Tier 3 only
    if (client.tier !== 'tier3') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/webhook',
        method: 'GET',
        status_code: 403,
        response_time_ms: responseTime,
        error_message: 'Webhook access requires Tier 3',
      })

      return NextResponse.json(
        { error: 'Forbidden', message: 'Webhook access requires Tier 3 (Institutional Feed)' },
        { status: 403 }
      )
    }

    if (client.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: `Account is ${client.status}` },
        { status: 403 }
      )
    }

    // Return client's webhooks
    const webhooks = webhookStore.get(client.id) ?? []

    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/webhook',
      method: 'GET',
      status_code: 200,
      response_time_ms: responseTime,
    })

    return NextResponse.json({
      data: webhooks,
      meta: { total: webhooks.length },
    })
  } catch (error) {
    console.error('[Wisdom Feed /webhook GET] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Extract API key
    const authHeader = request.headers.get('Authorization')
    let apiKey: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.slice(7)
    }

    if (!apiKey) {
      const { searchParams } = new URL(request.url)
      apiKey = searchParams.get('api_key')
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      )
    }

    const client = findClientByApiKey(apiKey)

    if (!client) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    }

    if (client.tier !== 'tier3') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Webhook access requires Tier 3 (Institutional Feed)' },
        { status: 403 }
      )
    }

    if (client.status !== 'active') {
      return NextResponse.json(
        { error: 'Forbidden', message: `Account is ${client.status}` },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { url, events } = body

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'url and events[] are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Bad request', message: 'Invalid webhook URL' },
        { status: 400 }
      )
    }

    // Validate events
    const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: 'Bad request', message: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${VALID_EVENTS.join(', ')}` },
        { status: 400 }
      )
    }

    // Check webhook limit (max 5 per client)
    const existing = webhookStore.get(client.id) ?? []
    if (existing.length >= 5) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Maximum 5 webhooks per client' },
        { status: 400 }
      )
    }

    // Create webhook
    const webhook = {
      id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      events,
      created_at: new Date().toISOString(),
      secret: `whsec_${Math.random().toString(36).slice(2, 18)}`,
    }

    existing.push(webhook)
    webhookStore.set(client.id, existing)

    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/webhook',
      method: 'POST',
      status_code: 201,
      response_time_ms: responseTime,
    })

    return NextResponse.json(
      { data: webhook, message: 'Webhook registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Wisdom Feed /webhook POST] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const startTime = Date.now()

  try {
    // Extract API key
    const authHeader = request.headers.get('Authorization')
    let apiKey: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.slice(7)
    }

    if (!apiKey) {
      const { searchParams } = new URL(request.url)
      apiKey = searchParams.get('api_key')
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      )
    }

    const client = findClientByApiKey(apiKey)

    if (!client) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    }

    if (client.tier !== 'tier3') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Webhook access requires Tier 3 (Institutional Feed)' },
        { status: 403 }
      )
    }

    // Parse request body for webhook ID
    const body = await request.json()
    const { webhook_id } = body

    if (!webhook_id) {
      return NextResponse.json(
        { error: 'Bad request', message: 'webhook_id is required' },
        { status: 400 }
      )
    }

    const existing = webhookStore.get(client.id) ?? []
    const index = existing.findIndex((w) => w.id === webhook_id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Not found', message: 'Webhook not found' },
        { status: 404 }
      )
    }

    existing.splice(index, 1)
    webhookStore.set(client.id, existing)

    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/webhook',
      method: 'DELETE',
      status_code: 200,
      response_time_ms: responseTime,
    })

    return NextResponse.json({ message: 'Webhook removed successfully' })
  } catch (error) {
    console.error('[Wisdom Feed /webhook DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
