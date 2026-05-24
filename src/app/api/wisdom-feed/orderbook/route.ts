// ============================================================================
// Wisdom Feed API — /orderbook endpoint (Tier 3 only)
// Returns raw order book data with bids/asks, pool sizes, and recent trades
// ============================================================================

import { NextResponse } from 'next/server'
import {
  findClientByApiKey,
  checkRateLimit,
  logApiRequest,
  getMockOrderBook,
} from '@/lib/wisdom-feed'

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

    // Find client
    const client = findClientByApiKey(apiKey)

    if (!client) {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: 'unknown',
        client_name: 'Unknown',
        endpoint: '/orderbook',
        method: 'GET',
        status_code: 401,
        response_time_ms: responseTime,
        error_message: 'Invalid API key',
      })

      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check tier — orderbook is Tier 3 only
    if (client.tier !== 'tier3') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/orderbook',
        method: 'GET',
        status_code: 403,
        response_time_ms: responseTime,
        error_message: 'Orderbook access requires Tier 3 (Institutional Feed)',
      })

      return NextResponse.json(
        { error: 'Forbidden', message: 'Orderbook access requires Tier 3 (Institutional Feed). Upgrade your plan for full order book data.' },
        { status: 403 }
      )
    }

    // Check if client is active
    if (client.status !== 'active') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/orderbook',
        method: 'GET',
        status_code: 403,
        response_time_ms: responseTime,
        error_message: `Account is ${client.status}`,
      })

      return NextResponse.json(
        { error: 'Forbidden', message: `Account is ${client.status}` },
        { status: 403 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(client.id, client.tier)
    if (!rateLimit.allowed) {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/orderbook',
        method: 'GET',
        status_code: 429,
        response_time_ms: responseTime,
        error_message: 'Rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Rate limit exceeded', message: `Limit: ${client.rate_limit_per_min} req/min` },
        { status: 429 }
      )
    }

    // Get market_id from query params (optional — if not provided, return all)
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('market_id')

    if (marketId) {
      const orderbook = getMockOrderBook(marketId)
      if (!orderbook) {
        const responseTime = Date.now() - startTime
        logApiRequest({
          client_id: client.id,
          client_name: client.company_name,
          endpoint: `/orderbook/${marketId}`,
          method: 'GET',
          status_code: 404,
          response_time_ms: responseTime,
          error_message: 'Market not found',
        })

        return NextResponse.json(
          { error: 'Not found', message: `Market ${marketId} not found` },
          { status: 404 }
        )
      }

      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: `/orderbook/${marketId}`,
        method: 'GET',
        status_code: 200,
        response_time_ms: responseTime,
        response_size_bytes: JSON.stringify(orderbook).length,
      })

      return NextResponse.json(
        { data: orderbook },
        {
          status: 200,
          headers: {
            'X-RateLimit-Limit': String(client.rate_limit_per_min),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      )
    }

    // Return all market orderbooks (summary)
    const allOrderbooks = []
    const { markets } = await import('@/lib/mockData')
    for (const market of markets.slice(0, 5)) {
      const ob = getMockOrderBook(market.id)
      if (ob) {
        allOrderbooks.push({
          market_id: market.id,
          question: market.question,
          spread: ob.spread,
          bids_count: ob.bids.length,
          asks_count: ob.asks.length,
          recent_trades_count: ob.recent_trades.length,
        })
      }
    }

    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/orderbook',
      method: 'GET',
      status_code: 200,
      response_time_ms: responseTime,
      response_size_bytes: JSON.stringify(allOrderbooks).length,
    })

    return NextResponse.json(
      {
        data: allOrderbooks,
        meta: {
          total_markets: allOrderbooks.length,
          tier: client.tier,
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(client.rate_limit_per_min),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    )
  } catch (error) {
    console.error('[Wisdom Feed /orderbook] Error:', error)
    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: 'unknown',
      client_name: 'Unknown',
      endpoint: '/orderbook',
      method: 'GET',
      status_code: 500,
      response_time_ms: responseTime,
      error_message: 'Internal server error',
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
