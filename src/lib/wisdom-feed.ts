// ============================================================================
// Predictly — Wisdom Feed API utility library
// Core utilities, tier config, mock data, and helpers for the B2B API system
// ============================================================================

import type {
  WisdomFeedTier,
  WisdomFeedClient,
  WisdomFeedLog,
  WisdomFeedUsageStats,
  WisdomFeedPricingTier,
} from '@/types'
import { markets, histories } from '@/lib/mockData'

// ── Tier Configuration ───────────────────────────────────────────────────────

export const TIER_CONFIG: Record<WisdomFeedTier, WisdomFeedPricingTier> = {
  tier1: {
    id: 'tier1',
    name: 'Delayed Feed',
    price: 500,
    description: '15-minute delayed probability feeds for basic market intelligence',
    features: [
      '15-minute delayed market data',
      'Probability feeds for all markets',
      'Market metadata & categories',
      'Email support',
      '100 requests per minute',
    ],
    rate_limit: 100,
    data_delay: '15 minutes',
    included_endpoints: ['/markets', '/markets/{id}'],
  },
  tier2: {
    id: 'tier2',
    name: 'Real-Time Feed',
    price: 5_000,
    description: 'Real-time probability feeds with historical data access',
    features: [
      'Real-time market data (no delay)',
      'Historical probability data',
      'All market metadata & categories',
      'Priority email support',
      '500 requests per minute',
    ],
    rate_limit: 500,
    data_delay: 'Real-time',
    included_endpoints: ['/markets', '/markets/{id}', '/historical', '/historical/{id}'],
  },
  tier3: {
    id: 'tier3',
    name: 'Institutional Feed',
    price: 25_000,
    description: 'Raw order book data, custom endpoints, and webhook support',
    features: [
      'Real-time market data (no delay)',
      'Historical probability data',
      'Raw order book data',
      'Custom endpoint access',
      'Webhook support',
      'Dedicated account manager',
      '2,000 requests per minute',
    ],
    rate_limit: 2_000,
    data_delay: 'Real-time',
    included_endpoints: ['/markets', '/markets/{id}', '/historical', '/historical/{id}', '/orderbook', '/orderbook/{id}', '/webhooks'],
  },
}

// ── In-Memory Rate Limit Store ───────────────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

// ── API Key Utilities ────────────────────────────────────────────────────────

export function generateApiKey(): string {
  const randomBytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }
  }
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `pf_live_${hex}`
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyApiKey(key: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashApiKey(key)
  return computedHash === storedHash
}

// ── Rate Limiting ────────────────────────────────────────────────────────────

export function checkRateLimit(clientId: string, tier: WisdomFeedTier): { allowed: boolean; remaining: number; resetAt: number } {
  const config = TIER_CONFIG[tier]
  const now = Date.now()
  const windowMs = 60_000 // 1 minute window

  const current = rateLimitStore.get(clientId)

  if (!current || now - current.windowStart > windowMs) {
    // New window
    rateLimitStore.set(clientId, { count: 1, windowStart: now })
    return { allowed: true, remaining: config.rate_limit - 1, resetAt: now + windowMs }
  }

  if (current.count >= config.rate_limit) {
    return { allowed: false, remaining: 0, resetAt: current.windowStart + windowMs }
  }

  current.count++
  return { allowed: true, remaining: config.rate_limit - current.count, resetAt: current.windowStart + windowMs }
}

// ── API Request Logging ──────────────────────────────────────────────────────

export const apiLogs: WisdomFeedLog[] = []

export function logApiRequest(params: {
  client_id: string
  client_name: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number
  request_size_bytes?: number
  response_size_bytes?: number
  ip_address?: string
  user_agent?: string
  error_message?: string | null
}): WisdomFeedLog {
  const log: WisdomFeedLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    client_id: params.client_id,
    client_name: params.client_name,
    endpoint: params.endpoint,
    method: params.method,
    status_code: params.status_code,
    response_time_ms: params.response_time_ms,
    request_size_bytes: params.request_size_bytes ?? 0,
    response_size_bytes: params.response_size_bytes ?? 0,
    ip_address: params.ip_address ?? '0.0.0.0',
    user_agent: params.user_agent ?? 'Unknown',
    error_message: params.error_message ?? null,
    created_at: new Date().toISOString(),
  }
  apiLogs.unshift(log)
  // Keep only the last 1000 logs in memory
  if (apiLogs.length > 1000) {
    apiLogs.pop()
  }
  return log
}

// ── Market Probability Feed Transformer ──────────────────────────────────────

export function getMarketProbabilityFeed(tier: WisdomFeedTier) {
  const now = new Date()

  return markets.map((market) => {
    const baseData = {
      id: market.id,
      question: market.question,
      short_title: market.shortTitle,
      category: market.category,
      tags: market.tags,
      outcomes: market.outcomes.map((o) => ({
        id: o.id,
        label: o.label,
        probability: o.price,
        volume: o.volume,
        delta_7d: o.delta7d,
      })),
      volume: market.volume,
      liquidity: market.liquidity,
      traders: market.traders,
      close_at: market.closeAt,
      status: market.status,
    }

    if (tier === 'tier1') {
      // Tier 1: add 15-minute delay marker
      return {
        ...baseData,
        data_delayed: true,
        delay_minutes: 15,
        as_of: new Date(now.getTime() - 15 * 60_000).toISOString(),
        feed_timestamp: now.toISOString(),
      }
    }

    if (tier === 'tier2') {
      // Tier 2: real-time data
      return {
        ...baseData,
        data_delayed: false,
        feed_timestamp: now.toISOString(),
      }
    }

    // Tier 3: full data with order book hints
    return {
      ...baseData,
      data_delayed: false,
      feed_timestamp: now.toISOString(),
      yes_pool: market.yesPool ?? null,
      no_pool: market.noPool ?? null,
      current_probability: market.currentProbability ?? null,
      house_fee_pct: market.houseFeePercentage ?? null,
      platform_fee_pct: market.platformFeePercentage ?? null,
    }
  })
}

// ── Mock Wisdom Feed Clients ─────────────────────────────────────────────────

export const MOCK_WISDOM_FEED_CLIENTS: WisdomFeedClient[] = [
  {
    id: 'wf-citadel',
    company_name: 'Citadel Securities',
    contact_email: 'api-team@citadel.com',
    contact_name: 'Marcus Chen',
    tier: 'tier3',
    api_key: 'pf_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    api_key_hash: 'hashed_citadel_key',
    status: 'active',
    monthly_price: 25_000,
    rate_limit_per_min: 2000,
    total_requests: 847_293,
    last_request_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    webhook_url: 'https://api.citadel.com/webhooks/predictly',
    webhook_events: ['market.created', 'market.probability_update', 'market.resolved'],
    allowed_categories: ['Politics', 'Crypto', 'Economics', 'Tech', 'World'],
    created_at: '2025-06-15T09:00:00Z',
    expires_at: '2027-06-15T09:00:00Z',
  },
  {
    id: 'wf-twosigma',
    company_name: 'Two Sigma Investments',
    contact_email: 'data-feeds@twosigma.com',
    contact_name: 'Dr. Sarah Patel',
    tier: 'tier3',
    api_key: 'pf_live_f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3',
    api_key_hash: 'hashed_twosigma_key',
    status: 'active',
    monthly_price: 25_000,
    rate_limit_per_min: 2000,
    total_requests: 612_487,
    last_request_at: new Date(Date.now() - 15 * 60_000).toISOString(),
    webhook_url: 'https://ingest.twosigma.com/predictly/webhook',
    webhook_events: ['market.probability_update', 'market.resolved'],
    allowed_categories: ['Politics', 'Economics', 'Sports', 'World', 'Science'],
    created_at: '2025-08-22T14:00:00Z',
    expires_at: '2027-08-22T14:00:00Z',
  },
  {
    id: 'wf-bloomberg',
    company_name: 'Bloomberg Intelligence',
    contact_email: 'alt-data@bloomberg.net',
    contact_name: 'James Rodriguez',
    tier: 'tier2',
    api_key: 'pf_live_11223344556677889900aabbccddeeff',
    api_key_hash: 'hashed_bloomberg_key',
    status: 'active',
    monthly_price: 5_000,
    rate_limit_per_min: 500,
    total_requests: 298_104,
    last_request_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    webhook_url: null,
    webhook_events: [],
    allowed_categories: ['Politics', 'Economics', 'Tech', 'Stocks', 'Crypto'],
    created_at: '2025-10-01T10:00:00Z',
    expires_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'wf-panthera',
    company_name: 'Panthera Research',
    contact_email: 'quant@panthera-research.io',
    contact_name: 'Anika Sharma',
    tier: 'tier2',
    api_key: 'pf_live_aabbccdd11223344aabbccdd11223344',
    api_key_hash: 'hashed_panthera_key',
    status: 'active',
    monthly_price: 5_000,
    rate_limit_per_min: 500,
    total_requests: 143_892,
    last_request_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    webhook_url: null,
    webhook_events: [],
    allowed_categories: ['Crypto', 'Tech', 'Science', 'Economics'],
    created_at: '2025-11-15T08:00:00Z',
    expires_at: '2026-11-15T08:00:00Z',
  },
  {
    id: 'wf-morningstar',
    company_name: 'Morningstar Data',
    contact_email: 'api-access@morningstar.com',
    contact_name: 'David Kim',
    tier: 'tier1',
    api_key: 'pf_live_99887766554433221100998877665544',
    api_key_hash: 'hashed_morningstar_key',
    status: 'suspended',
    monthly_price: 500,
    rate_limit_per_min: 100,
    total_requests: 24_503,
    last_request_at: new Date(Date.now() - 7 * 86400_000).toISOString(),
    webhook_url: null,
    webhook_events: [],
    allowed_categories: ['Politics', 'Economics'],
    created_at: '2026-01-10T12:00:00Z',
    expires_at: '2027-01-10T12:00:00Z',
  },
]

// ── Mock Wisdom Feed Logs ────────────────────────────────────────────────────

function generateMockLogs(): WisdomFeedLog[] {
  const clients = MOCK_WISDOM_FEED_CLIENTS
  const endpoints = ['/markets', '/markets/m-btc-200k', '/historical', '/historical/m-election-2028', '/orderbook', '/orderbook/m-btc-200k']
  const methods = ['GET', 'GET', 'GET', 'GET', 'GET', 'GET']
  const statusCodes = [200, 200, 200, 200, 200, 200, 200, 200, 200, 401, 429, 403, 500]
  const userAgents = [
    'python-requests/2.31.0',
    'axios/1.6.2',
    'curl/8.4.0',
    'node-fetch/3.3.2',
    'Go-http-client/1.1',
    'Jakarta Commons-HttpClient/3.1',
  ]
  const ips = ['52.14.23.101', '35.168.42.89', '44.224.11.203', '3.88.157.42', '54.162.88.14', '18.213.66.177']

  const logs: WisdomFeedLog[] = []
  const now = Date.now()

  for (let i = 0; i < 20; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)]
    const endpointIdx = Math.floor(Math.random() * endpoints.length)
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
    const isTier1Endpoint = endpointIdx >= 4 // orderbook endpoints
    const actualStatusCode = client.tier === 'tier1' && isTier1Endpoint ? 403 : statusCode

    logs.push({
      id: `log-mock-${i + 1}`,
      client_id: client.id,
      client_name: client.company_name,
      endpoint: endpoints[endpointIdx],
      method: methods[endpointIdx],
      status_code: actualStatusCode,
      response_time_ms: Math.floor(Math.random() * 300) + 20,
      request_size_bytes: Math.floor(Math.random() * 500) + 100,
      response_size_bytes: Math.floor(Math.random() * 50_000) + 2000,
      ip_address: ips[Math.floor(Math.random() * ips.length)],
      user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
      error_message: actualStatusCode === 403 ? 'Tier access denied' : actualStatusCode === 401 ? 'Invalid API key' : actualStatusCode === 429 ? 'Rate limit exceeded' : actualStatusCode === 500 ? 'Internal server error' : null,
      created_at: new Date(now - i * (Math.random() * 30 + 5) * 60_000).toISOString(),
    })
  }

  return logs
}

export const MOCK_WISDOM_FEED_LOGS: WisdomFeedLog[] = generateMockLogs()

// ── Usage Stats ──────────────────────────────────────────────────────────────

export function getWisdomFeedUsageStats(clientId: string): WisdomFeedUsageStats {
  const client = MOCK_WISDOM_FEED_CLIENTS.find((c) => c.id === clientId)

  // Generate deterministic daily request counts for the past 14 days
  const dailyRequests: { date: string; count: number }[] = []
  const now = Date.now()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now - i * 86_400_000)
    const seed = (clientId.charCodeAt(0) * 7 + i * 13) % 1000
    const base = client?.tier === 'tier3' ? 800 : client?.tier === 'tier2' ? 200 : 40
    const count = base + Math.floor((seed / 1000) * base * 0.5)
    dailyRequests.push({
      date: date.toISOString().split('T')[0],
      count,
    })
  }

  const totalToday = dailyRequests[dailyRequests.length - 1].count
  const totalMonth = dailyRequests.reduce((sum, d) => sum + d.count, 0)

  // Generate top endpoints
  const topEndpoints = [
    { endpoint: '/markets', count: Math.floor(totalMonth * 0.45) },
    { endpoint: '/markets/{id}', count: Math.floor(totalMonth * 0.25) },
    { endpoint: '/historical', count: Math.floor(totalMonth * 0.15) },
    { endpoint: '/orderbook', count: client?.tier === 'tier3' ? Math.floor(totalMonth * 0.1) : 0 },
  ].filter((e) => e.count > 0)

  return {
    client_id: clientId,
    total_requests_today: totalToday,
    total_requests_month: totalMonth,
    avg_response_time_ms: client?.tier === 'tier3' ? 45 : client?.tier === 'tier2' ? 78 : 120,
    error_rate: client?.status === 'suspended' ? 0.12 : 0.008,
    top_endpoints: topEndpoints,
    daily_requests: dailyRequests,
  }
}

// ── Order Book Generator (Tier 3) ───────────────────────────────────────────

export function getMockOrderBook(marketId: string) {
  const market = markets.find((m) => m.id === marketId)
  if (!market) return null

  const yesPrice = market.outcomes[0]?.price ?? 0.5
  const noPrice = 1 - yesPrice

  // Generate bid/ask levels
  const bids: { price: number; size: number; total: number }[] = []
  const asks: { price: number; size: number; total: number }[] = []
  let bidTotal = 0
  let askTotal = 0

  for (let i = 0; i < 10; i++) {
    const bidPrice = Math.max(0.01, yesPrice - 0.01 * (i + 1))
    const bidSize = Math.floor(Math.random() * 50_000) + 5_000
    bidTotal += bidSize
    bids.push({ price: +bidPrice.toFixed(4), size: bidSize, total: bidTotal })

    const askPrice = Math.min(0.99, yesPrice + 0.01 * (i + 1))
    const askSize = Math.floor(Math.random() * 50_000) + 5_000
    askTotal += askSize
    asks.push({ price: +askPrice.toFixed(4), size: askSize, total: askTotal })
  }

  // Generate recent trades
  const recentTrades: { side: 'buy' | 'sell'; price: number; size: number; timestamp: string }[] = []
  const now = Date.now()
  for (let i = 0; i < 15; i++) {
    recentTrades.push({
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      price: +(yesPrice + (Math.random() - 0.5) * 0.02).toFixed(4),
      size: Math.floor(Math.random() * 10_000) + 500,
      timestamp: new Date(now - i * 30_000).toISOString(),
    })
  }

  return {
    market_id: marketId,
    question: market.question,
    outcomes: {
      yes: { price: +yesPrice.toFixed(4), pool: market.yesPool ?? 0 },
      no: { price: +noPrice.toFixed(4), pool: market.noPool ?? 0 },
    },
    bids,
    asks,
    spread: +(asks[0]?.price - bids[0]?.price).toFixed(4) ?? 0,
    recent_trades: recentTrades,
    feed_timestamp: new Date().toISOString(),
  }
}

// ── Historical Data Transformer ──────────────────────────────────────────────

export function getHistoricalData(marketId: string, startDate?: string, endDate?: string) {
  const history = histories[marketId]
  if (!history) return null

  let filtered = history

  if (startDate) {
    const start = new Date(startDate).getTime()
    filtered = filtered.filter((p) => p.t >= start)
  }

  if (endDate) {
    const end = new Date(endDate).getTime()
    filtered = filtered.filter((p) => p.t <= end)
  }

  return {
    market_id: marketId,
    data_points: filtered.length,
    resolution: '1h',
    history: filtered.map((p) => ({
      timestamp: new Date(p.t).toISOString(),
      price: p.price,
      probability: p.price,
    })),
  }
}

// ── Client Finder by API Key ────────────────────────────────────────────────

export function findClientByApiKey(apiKey: string): WisdomFeedClient | undefined {
  return MOCK_WISDOM_FEED_CLIENTS.find((c) => c.api_key === apiKey && c.status === 'active')
}
