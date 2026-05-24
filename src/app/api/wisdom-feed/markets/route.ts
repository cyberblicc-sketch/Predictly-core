// ============================================================================
// Wisdom Feed API — /markets endpoint
// Returns market probability data based on client tier
// ============================================================================

import { NextResponse } from 'next/server'
import {
  findClientByApiKey,
  checkRateLimit,
  logApiRequest,
  getMarketProbabilityFeed,
} from '@/lib/wisdom-feed'

export async function GET(request: Request) {
  const startTime = Date.now()

  try {
    // Extract API key from Authorization header or query param
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
        { error: 'Unauthorized', message: 'API key required. Use Authorization: Bearer <key> or ?api_key=<key>' },
        { status: 401 }
      )
    }

    // Find client by API key
    const client = findClientByApiKey(apiKey)

    if (!client) {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: 'unknown',
        client_name: 'Unknown',
        endpoint: '/markets',
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

    // Check if client is active
    if (client.status !== 'active') {
      const responseTime = Date.now() - startTime
      logApiRequest({
        client_id: client.id,
        client_name: client.company_name,
        endpoint: '/markets',
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
        endpoint: '/markets',
        method: 'GET',
        status_code: 429,
        response_time_ms: responseTime,
        error_message: 'Rate limit exceeded',
      })

      return NextResponse.json(
        { error: 'Rate limit exceeded', message: `Limit: ${client.rate_limit_per_min} req/min. Reset at ${new Date(rateLimit.resetAt).toISOString()}` },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(client.rate_limit_per_min),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    // Get market data based on tier
    const data = getMarketProbabilityFeed(client.tier)
    const responseTime = Date.now() - startTime

    // Log the request
    logApiRequest({
      client_id: client.id,
      client_name: client.company_name,
      endpoint: '/markets',
      method: 'GET',
      status_code: 200,
      response_time_ms: responseTime,
      request_size_bytes: 0,
      response_size_bytes: JSON.stringify(data).length,
    })

    return NextResponse.json(
      {
        data,
        meta: {
          total_markets: data.length,
          tier: client.tier,
          data_delay: client.tier === 'tier1' ? '15 minutes' : 'real-time',
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(client.rate_limit_per_min),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    )
  } catch (error) {
    console.error('[Wisdom Feed /markets] Error:', error)
    const responseTime = Date.now() - startTime
    logApiRequest({
      client_id: 'unknown',
      client_name: 'Unknown',
      endpoint: '/markets',
      method: 'GET',
      status_code: 500,
      response_time_ms: responseTime,
      error_message: 'Internal server error',
    })

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
