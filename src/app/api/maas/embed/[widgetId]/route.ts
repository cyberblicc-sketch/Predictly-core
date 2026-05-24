// ============================================================================
// Predictly — Public MaaS Embed API: Returns widget market data
// ============================================================================

import { NextResponse } from 'next/server'
import { getMaasWidget, getMaasClient } from '@/lib/maas'

// Mock market data for embed rendering
const MOCK_MARKET_DATA: Record<string, {
  id: string
  question: string
  category: string
  probability: number
  volume: number
  traders: number
  closeAt: string
  outcomes: { label: string; probability: number; volume: number }[]
  sparkline: number[]
}> = {
  'mkt-super-bowl-58': {
    id: 'mkt-super-bowl-58',
    question: 'Who will win Super Bowl LVIII?',
    category: 'Sports',
    probability: 0.62,
    volume: 2840000,
    traders: 18432,
    closeAt: '2026-02-09T23:00:00Z',
    outcomes: [
      { label: 'Chiefs', probability: 0.38, volume: 1080000 },
      { label: '49ers', probability: 0.62, volume: 1760000 },
    ],
    sparkline: [0.45, 0.48, 0.52, 0.55, 0.58, 0.56, 0.62],
  },
  'mkt-nba-mvp-26': {
    id: 'mkt-nba-mvp-26',
    question: 'NBA MVP 2025-26 Season',
    category: 'Sports',
    probability: 0.34,
    volume: 980000,
    traders: 8921,
    closeAt: '2026-06-30T23:00:00Z',
    outcomes: [
      { label: 'Shai Gilgeous-Alexander', probability: 0.34, volume: 333000 },
      { label: 'Luka Dončić', probability: 0.28, volume: 274000 },
      { label: 'Nikola Jokić', probability: 0.22, volume: 216000 },
      { label: 'Other', probability: 0.16, volume: 157000 },
    ],
    sparkline: [0.22, 0.25, 0.29, 0.31, 0.30, 0.32, 0.34],
  },
  'mkt-fed-rate-jun26': {
    id: 'mkt-fed-rate-jun26',
    question: 'Fed rate decision June 2026: Cut?',
    category: 'Economics',
    probability: 0.72,
    volume: 4120000,
    traders: 32100,
    closeAt: '2026-06-18T18:00:00Z',
    outcomes: [
      { label: 'Rate Cut', probability: 0.72, volume: 2966000 },
      { label: 'No Change', probability: 0.28, volume: 1154000 },
    ],
    sparkline: [0.55, 0.58, 0.61, 0.65, 0.68, 0.70, 0.72],
  },
  'mkt-gdp-q2-26': {
    id: 'mkt-gdp-q2-26',
    question: 'Q2 2026 GDP growth > 3%?',
    category: 'Economics',
    probability: 0.41,
    volume: 1890000,
    traders: 14200,
    closeAt: '2026-07-15T12:00:00Z',
    outcomes: [
      { label: 'Above 3%', probability: 0.41, volume: 775000 },
      { label: 'Below 3%', probability: 0.59, volume: 1115000 },
    ],
    sparkline: [0.38, 0.40, 0.39, 0.42, 0.44, 0.43, 0.41],
  },
  'mkt-inflation-cpi-jun': {
    id: 'mkt-inflation-cpi-jun',
    question: 'CPI YoY June 2026 < 2.5%?',
    category: 'Economics',
    probability: 0.58,
    volume: 2210000,
    traders: 19400,
    closeAt: '2026-07-12T12:00:00Z',
    outcomes: [
      { label: 'Below 2.5%', probability: 0.58, volume: 1282000 },
      { label: 'Above 2.5%', probability: 0.42, volume: 928000 },
    ],
    sparkline: [0.50, 0.52, 0.54, 0.55, 0.57, 0.56, 0.58],
  },
  'mkt-unemployment-jun': {
    id: 'mkt-unemployment-jun',
    question: 'US Unemployment June 2026 < 4%?',
    category: 'Economics',
    probability: 0.67,
    volume: 1540000,
    traders: 11200,
    closeAt: '2026-07-05T12:00:00Z',
    outcomes: [
      { label: 'Below 4%', probability: 0.67, volume: 1032000 },
      { label: 'Above 4%', probability: 0.33, volume: 508000 },
    ],
    sparkline: [0.60, 0.62, 0.64, 0.63, 0.65, 0.66, 0.67],
  },
  'mkt-midterm-senate-26': {
    id: 'mkt-midterm-senate-26',
    question: 'Democrats win Senate in 2026?',
    category: 'Politics',
    probability: 0.44,
    volume: 3670000,
    traders: 42100,
    closeAt: '2026-11-03T23:00:00Z',
    outcomes: [
      { label: 'Democrats', probability: 0.44, volume: 1615000 },
      { label: 'Republicans', probability: 0.56, volume: 2055000 },
    ],
    sparkline: [0.40, 0.42, 0.43, 0.41, 0.42, 0.44, 0.44],
  },
  'mkt-btc-100k-eoy': {
    id: 'mkt-btc-100k-eoy',
    question: 'Bitcoin above $100K by end of 2026?',
    category: 'Crypto',
    probability: 0.53,
    volume: 8920000,
    traders: 54200,
    closeAt: '2026-12-31T23:59:00Z',
    outcomes: [
      { label: 'Above $100K', probability: 0.53, volume: 4728000 },
      { label: 'Below $100K', probability: 0.47, volume: 4192000 },
    ],
    sparkline: [0.40, 0.44, 0.48, 0.50, 0.52, 0.51, 0.53],
  },
  'mkt-eth-5k-q2': {
    id: 'mkt-eth-5k-q2',
    question: 'Ethereum above $5K by Q2 2026?',
    category: 'Crypto',
    probability: 0.31,
    volume: 3200000,
    traders: 21800,
    closeAt: '2026-06-30T23:59:00Z',
    outcomes: [
      { label: 'Above $5K', probability: 0.31, volume: 992000 },
      { label: 'Below $5K', probability: 0.69, volume: 2208000 },
    ],
    sparkline: [0.25, 0.28, 0.30, 0.29, 0.32, 0.33, 0.31],
  },
  'mkt-sol-200-q2': {
    id: 'mkt-sol-200-q2',
    question: 'Solana above $200 by Q2 2026?',
    category: 'Crypto',
    probability: 0.47,
    volume: 1800000,
    traders: 15400,
    closeAt: '2026-06-30T23:59:00Z',
    outcomes: [
      { label: 'Above $200', probability: 0.47, volume: 846000 },
      { label: 'Below $200', probability: 0.53, volume: 954000 },
    ],
    sparkline: [0.38, 0.40, 0.43, 0.45, 0.44, 0.46, 0.47],
  },
  'mkt-doge-1-q2': {
    id: 'mkt-doge-1-q2',
    question: 'Dogecoin above $1 by Q2 2026?',
    category: 'Crypto',
    probability: 0.18,
    volume: 5400000,
    traders: 38200,
    closeAt: '2026-06-30T23:59:00Z',
    outcomes: [
      { label: 'Above $1', probability: 0.18, volume: 972000 },
      { label: 'Below $1', probability: 0.82, volume: 4428000 },
    ],
    sparkline: [0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.18],
  },
  'mkt-gpt5-launch': {
    id: 'mkt-gpt5-launch',
    question: 'GPT-5 launches before July 2026?',
    category: 'Tech',
    probability: 0.64,
    volume: 4120000,
    traders: 28900,
    closeAt: '2026-07-01T00:00:00Z',
    outcomes: [
      { label: 'Launches', probability: 0.64, volume: 2637000 },
      { label: 'Doesn\'t launch', probability: 0.36, volume: 1483000 },
    ],
    sparkline: [0.50, 0.54, 0.57, 0.60, 0.62, 0.63, 0.64],
  },
  'mkt-apple-ai': {
    id: 'mkt-apple-ai',
    question: 'Apple announces standalone AI device in 2026?',
    category: 'Tech',
    probability: 0.22,
    volume: 1980000,
    traders: 14300,
    closeAt: '2026-12-31T23:59:00Z',
    outcomes: [
      { label: 'Announces', probability: 0.22, volume: 435600 },
      { label: 'Doesn\'t announce', probability: 0.78, volume: 1544400 },
    ],
    sparkline: [0.18, 0.20, 0.19, 0.21, 0.22, 0.21, 0.22],
  },
  'mkt-meta-llama4': {
    id: 'mkt-meta-llama4',
    question: 'Meta releases Llama 4 before Oct 2026?',
    category: 'Tech',
    probability: 0.71,
    volume: 2340000,
    traders: 17800,
    closeAt: '2026-10-01T00:00:00Z',
    outcomes: [
      { label: 'Releases', probability: 0.71, volume: 1661400 },
      { label: 'Doesn\'t release', probability: 0.29, volume: 678600 },
    ],
    sparkline: [0.55, 0.58, 0.62, 0.65, 0.68, 0.70, 0.71],
  },
  'mkt-agi-2030': {
    id: 'mkt-agi-2030',
    question: 'AGI achieved before 2030?',
    category: 'Tech',
    probability: 0.28,
    volume: 7800000,
    traders: 62100,
    closeAt: '2029-12-31T23:59:00Z',
    outcomes: [
      { label: 'AGI by 2030', probability: 0.28, volume: 2184000 },
      { label: 'No AGI by 2030', probability: 0.72, volume: 5616000 },
    ],
    sparkline: [0.20, 0.22, 0.24, 0.25, 0.26, 0.27, 0.28],
  },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params
    const widget = getMaasWidget(widgetId)

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const client = getMaasClient(widget.client_id)

    // Validate domain if Referer header is present
    if (client) {
      const referer = request.headers.get('Referer') ?? request.headers.get('Origin') ?? ''
      if (referer && client.embed_domains.length > 0) {
        try {
          const refererUrl = new URL(referer)
          const refererHost = refererUrl.hostname
          const isAllowed = client.embed_domains.some((domain) => {
            if (domain.startsWith('*.')) {
              return refererHost.endsWith(domain.slice(2)) || refererHost === domain.slice(2)
            }
            return refererHost === domain
          })
          if (!isAllowed) {
            return NextResponse.json(
              { error: 'Domain not authorized for this widget' },
              { status: 403, headers: corsHeaders }
            )
          }
        } catch {
          // Invalid referer URL, allow anyway
        }
      }

      // Check client status
      if (client.status === 'suspended' || client.status === 'cancelled') {
        return NextResponse.json(
          { error: 'Client account is not active' },
          { status: 403, headers: corsHeaders }
        )
      }
    }

    // Get market data for each market in the widget
    const markets = widget.market_ids
      .map((id) => MOCK_MARKET_DATA[id])
      .filter(Boolean)

    return NextResponse.json(
      {
        widget: {
          id: widget.id,
          type: widget.type,
          name: widget.name,
          config: widget.config,
          category: widget.category,
        },
        markets,
        branding: client?.custom_branding ?? null,
      },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('[MaaS API] GET /maas/embed/[widgetId] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
