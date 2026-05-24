// ============================================================================
// Wisdom Feed API — /historical endpoint (Tier 2+)
// Returns historical probability data with date range filtering
// ============================================================================

import { NextResponse } from 'next/server'
import {
  findClientByApiKey,
  checkRateLimit,
  logApiRequest,
  getHistoricalData,
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
        endpoint: '/historical',
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

    // Check tier — historical data requires Tier 2 or Tier 3
    if (client.tier === 'tier1') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/historical',
        method: 'GET',
        status_code: 403,
        response_time_ms: responseTime,
        error_message: 'Historical data requires Tier 2 or higher',
      })

      return NextResponse.json(
        { error: 'Forbidden', message: 'Historical data access requires Tier 2 (Real-Time Feed) or Tier 3 (Institutional Feed). Upgrade your plan for historical probability data.' },
        { status: 403 }
      )
    }

    // Check if client is active
    if (client.status !== 'active') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/historical',
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
        endpoint: '/historical',
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const marketId = searchParams.get('market_id')
    const startDate = searchParams.get('start_date') ?? undefined
    const endDate = searchParams.get('end_date') ?? undefined
    const resolution = searchParams.get('resolution') ?? '1h'

    if (marketId) {
      // Return historical data for a specific market
      const historicalData = getHistoricalData(marketId, startDate, endDate)

      if (!historicalData) {
        const responseTime = Date.now() - startTime
        logApiRequest({
          client_id: client.id,
          client_name: client.company_name,
          endpoint: `/historical/${marketId}`,
          method: 'GET',
          status_code: 404,
          response_time_ms: responseTime,
          error_message: 'Market not found',
        })

        return NextResponse.json(
          { error: 'Not found', message: `No historical data found for market ${marketId}` },
          { status: 404 }
        )
      }

      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: `/historical/${marketId}`,
        method: 'GET',
        status_code: 200,
        response_time_ms: responseTime,
        response_size_bytes: JSON.stringify(historicalData).length,
      })

      return NextResponse.json(
        {
          data: { ...historicalData, resolution },
          meta: {
            tier: client.tier,
            market_id: marketId,
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
    }

    // Return list of markets with available historical data
    const { histories } = await import('@/lib/mockData')
    const availableMarkets = Object.keys(histories).map((id) => ({
      market_id: id,
      data_points: histories[id].length,
      earliest: new Date(histories[id][0].t).toISOString(),
      latest: new Date(histories[id][histories[id].length - 1].t).toISOString(),
    }))

    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/historical',
      method: 'GET',
      status_code: 200,
      response_time_ms: responseTime,
      response_size_bytes: JSON.stringify(availableMarkets).length,
    })

    return NextResponse.json(
      {
        data: availableMarkets,
        meta: {
          total_markets: availableMarkets.length,
          tier: client.tier,
          resolution,
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
    console.error('[Wisdom Feed /historical] Error:', error)
    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: 'unknown',
      client_name: 'Unknown',
      endpoint: '/historical',
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
