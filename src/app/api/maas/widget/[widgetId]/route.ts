// ============================================================================
// Predictly — MaaS Widget HTML Renderer
// Serves a self-contained HTML page for iframe embedding
// ============================================================================

import { NextResponse } from 'next/server'
import { getMaasWidget, getMaasClient } from '@/lib/maas'

// Shared mock data (same as embed route)
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
  'mkt-super-bowl-58': { id: 'mkt-super-bowl-58', question: 'Who will win Super Bowl LVIII?', category: 'Sports', probability: 0.62, volume: 2840000, traders: 18432, closeAt: '2026-02-09T23:00:00Z', outcomes: [{ label: 'Chiefs', probability: 0.38, volume: 1080000 }, { label: '49ers', probability: 0.62, volume: 1760000 }], sparkline: [0.45, 0.48, 0.52, 0.55, 0.58, 0.56, 0.62] },
  'mkt-nba-mvp-26': { id: 'mkt-nba-mvp-26', question: 'NBA MVP 2025-26 Season', category: 'Sports', probability: 0.34, volume: 980000, traders: 8921, closeAt: '2026-06-30T23:00:00Z', outcomes: [{ label: 'Shai', probability: 0.34, volume: 333000 }, { label: 'Luka', probability: 0.28, volume: 274000 }, { label: 'Jokić', probability: 0.22, volume: 216000 }, { label: 'Other', probability: 0.16, volume: 157000 }], sparkline: [0.22, 0.25, 0.29, 0.31, 0.30, 0.32, 0.34] },
  'mkt-fed-rate-jun26': { id: 'mkt-fed-rate-jun26', question: 'Fed rate decision June 2026: Cut?', category: 'Economics', probability: 0.72, volume: 4120000, traders: 32100, closeAt: '2026-06-18T18:00:00Z', outcomes: [{ label: 'Rate Cut', probability: 0.72, volume: 2966000 }, { label: 'No Change', probability: 0.28, volume: 1154000 }], sparkline: [0.55, 0.58, 0.61, 0.65, 0.68, 0.70, 0.72] },
  'mkt-gdp-q2-26': { id: 'mkt-gdp-q2-26', question: 'Q2 2026 GDP growth > 3%?', category: 'Economics', probability: 0.41, volume: 1890000, traders: 14200, closeAt: '2026-07-15T12:00:00Z', outcomes: [{ label: 'Above 3%', probability: 0.41, volume: 775000 }, { label: 'Below 3%', probability: 0.59, volume: 1115000 }], sparkline: [0.38, 0.40, 0.39, 0.42, 0.44, 0.43, 0.41] },
  'mkt-inflation-cpi-jun': { id: 'mkt-inflation-cpi-jun', question: 'CPI YoY June 2026 < 2.5%?', category: 'Economics', probability: 0.58, volume: 2210000, traders: 19400, closeAt: '2026-07-12T12:00:00Z', outcomes: [{ label: 'Below 2.5%', probability: 0.58, volume: 1282000 }, { label: 'Above 2.5%', probability: 0.42, volume: 928000 }], sparkline: [0.50, 0.52, 0.54, 0.55, 0.57, 0.56, 0.58] },
  'mkt-unemployment-jun': { id: 'mkt-unemployment-jun', question: 'US Unemployment June 2026 < 4%?', category: 'Economics', probability: 0.67, volume: 1540000, traders: 11200, closeAt: '2026-07-05T12:00:00Z', outcomes: [{ label: 'Below 4%', probability: 0.67, volume: 1032000 }, { label: 'Above 4%', probability: 0.33, volume: 508000 }], sparkline: [0.60, 0.62, 0.64, 0.63, 0.65, 0.66, 0.67] },
  'mkt-midterm-senate-26': { id: 'mkt-midterm-senate-26', question: 'Democrats win Senate in 2026?', category: 'Politics', probability: 0.44, volume: 3670000, traders: 42100, closeAt: '2026-11-03T23:00:00Z', outcomes: [{ label: 'Democrats', probability: 0.44, volume: 1615000 }, { label: 'Republicans', probability: 0.56, volume: 2055000 }], sparkline: [0.40, 0.42, 0.43, 0.41, 0.42, 0.44, 0.44] },
  'mkt-btc-100k-eoy': { id: 'mkt-btc-100k-eoy', question: 'Bitcoin above $100K by end of 2026?', category: 'Crypto', probability: 0.53, volume: 8920000, traders: 54200, closeAt: '2026-12-31T23:59:00Z', outcomes: [{ label: 'Above $100K', probability: 0.53, volume: 4728000 }, { label: 'Below $100K', probability: 0.47, volume: 4192000 }], sparkline: [0.40, 0.44, 0.48, 0.50, 0.52, 0.51, 0.53] },
  'mkt-eth-5k-q2': { id: 'mkt-eth-5k-q2', question: 'Ethereum above $5K by Q2 2026?', category: 'Crypto', probability: 0.31, volume: 3200000, traders: 21800, closeAt: '2026-06-30T23:59:00Z', outcomes: [{ label: 'Above $5K', probability: 0.31, volume: 992000 }, { label: 'Below $5K', probability: 0.69, volume: 2208000 }], sparkline: [0.25, 0.28, 0.30, 0.29, 0.32, 0.33, 0.31] },
  'mkt-sol-200-q2': { id: 'mkt-sol-200-q2', question: 'Solana above $200 by Q2 2026?', category: 'Crypto', probability: 0.47, volume: 1800000, traders: 15400, closeAt: '2026-06-30T23:59:00Z', outcomes: [{ label: 'Above $200', probability: 0.47, volume: 846000 }, { label: 'Below $200', probability: 0.53, volume: 954000 }], sparkline: [0.38, 0.40, 0.43, 0.45, 0.44, 0.46, 0.47] },
  'mkt-doge-1-q2': { id: 'mkt-doge-1-q2', question: 'Dogecoin above $1 by Q2 2026?', category: 'Crypto', probability: 0.18, volume: 5400000, traders: 38200, closeAt: '2026-06-30T23:59:00Z', outcomes: [{ label: 'Above $1', probability: 0.18, volume: 972000 }, { label: 'Below $1', probability: 0.82, volume: 4428000 }], sparkline: [0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.18] },
  'mkt-gpt5-launch': { id: 'mkt-gpt5-launch', question: 'GPT-5 launches before July 2026?', category: 'Tech', probability: 0.64, volume: 4120000, traders: 28900, closeAt: '2026-07-01T00:00:00Z', outcomes: [{ label: 'Launches', probability: 0.64, volume: 2637000 }, { label: "Doesn't launch", probability: 0.36, volume: 1483000 }], sparkline: [0.50, 0.54, 0.57, 0.60, 0.62, 0.63, 0.64] },
  'mkt-apple-ai': { id: 'mkt-apple-ai', question: 'Apple announces standalone AI device in 2026?', category: 'Tech', probability: 0.22, volume: 1980000, traders: 14300, closeAt: '2026-12-31T23:59:00Z', outcomes: [{ label: 'Announces', probability: 0.22, volume: 435600 }, { label: "Doesn't announce", probability: 0.78, volume: 1544400 }], sparkline: [0.18, 0.20, 0.19, 0.21, 0.22, 0.21, 0.22] },
  'mkt-meta-llama4': { id: 'mkt-meta-llama4', question: 'Meta releases Llama 4 before Oct 2026?', category: 'Tech', probability: 0.71, volume: 2340000, traders: 17800, closeAt: '2026-10-01T00:00:00Z', outcomes: [{ label: 'Releases', probability: 0.71, volume: 1661400 }, { label: "Doesn't release", probability: 0.29, volume: 678600 }], sparkline: [0.55, 0.58, 0.62, 0.65, 0.68, 0.70, 0.71] },
  'mkt-agi-2030': { id: 'mkt-agi-2030', question: 'AGI achieved before 2030?', category: 'Tech', probability: 0.28, volume: 7800000, traders: 62100, closeAt: '2029-12-31T23:59:00Z', outcomes: [{ label: 'AGI by 2030', probability: 0.28, volume: 2184000 }, { label: 'No AGI by 2030', probability: 0.72, volume: 5616000 }], sparkline: [0.20, 0.22, 0.24, 0.25, 0.26, 0.27, 0.28] },
}

function buildSparklineSVG(data: number[], color: string, width = 120, height = 32): string {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ')
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"/></svg>`
}

function formatVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function renderWidgetHTML(
  widget: ReturnType<typeof getMaasWidget> & {},
  markets: typeof MOCK_MARKET_DATA[string][],
  clientBranding: { primary_color: string; hide_predictly_branding: boolean } | null,
  theme: 'light' | 'dark'
): string {
  const primaryColor = clientBranding?.primary_color ?? '#6366F1'
  const hideBranding = clientBranding?.hide_predictly_branding ?? false
  const isDark = theme === 'dark'

  const bg = isDark ? '#0A0B0F' : '#FFFFFF'
  const cardBg = isDark ? '#11131A' : '#F8F9FA'
  const text = isDark ? '#F5F7FA' : '#1A1A2E'
  const textMuted = isDark ? '#9098A8' : '#6B7280'
  const border = isDark ? '#1F2330' : '#E5E7EB'

  const firstMarket = markets[0]
  const pct = firstMarket ? Math.round(firstMarket.probability * 100) : 50

  function sparklineHtml(data: number[]): string {
    return buildSparklineSVG(data, primaryColor)
  }

  let content = ''

  switch (widget.type) {
    case 'probability_bar': {
      content = `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <span style="font-size:13px;font-weight:600;color:${text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;">${firstMarket?.question ?? 'Market'}</span>
          <div style="flex:1;height:8px;background:${isDark ? '#1F2330' : '#E5E7EB'};border-radius:4px;overflow:hidden;min-width:80px;">
            <div style="width:${pct}%;height:100%;background:${primaryColor};border-radius:4px;transition:width 0.5s ease;"></div>
          </div>
          <span style="font-size:14px;font-weight:700;color:${primaryColor};min-width:40px;text-align:right;">${pct}%</span>
          ${widget.config.show_timer && firstMarket ? `<span style="font-size:11px;color:${textMuted};">⏱ ${new Date(firstMarket.closeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>` : ''}
          ${widget.config.cta_text ? `<a href="${widget.config.cta_url || '#'}" target="_blank" style="font-size:12px;font-weight:600;color:${primaryColor};text-decoration:none;white-space:nowrap;">${widget.config.cta_text} →</a>` : ''}
        </div>`
      break
    }

    case 'ticker': {
      const items = markets.map((m) => `
        <div style="display:inline-flex;align-items:center;gap:8px;padding:0 24px;white-space:nowrap;">
          <span style="font-size:12px;font-weight:600;color:${text};">${m.question.length > 40 ? m.question.slice(0, 40) + '…' : m.question}</span>
          <span style="font-size:14px;font-weight:700;color:${primaryColor};">${Math.round(m.probability * 100)}%</span>
          <div style="width:60px;">${sparklineHtml(m.sparkline)}</div>
        </div>
      `).join('<span style="color:' + border + '">│</span>')
      content = `
        <div style="display:flex;align-items:center;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${bg};">
          <div style="display:flex;animation:scroll 30s linear infinite;">
            ${items}${items}
          </div>
        </div>
        <style>@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}</style>`
      break
    }

    case 'mini_card': {
      content = `
        <div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${cardBg};border-radius:${widget.config.border_radius};height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
          <div style="font-size:10px;font-weight:600;color:${primaryColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${firstMarket?.category ?? ''}</div>
          <div style="font-size:14px;font-weight:600;color:${text};line-height:1.3;margin-bottom:12px;">${firstMarket?.question ?? 'Market'}</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <span style="font-size:32px;font-weight:800;color:${primaryColor};">${pct}%</span>
            ${widget.config.show_sparkline && firstMarket ? `<div>${sparklineHtml(firstMarket.sparkline)}</div>` : ''}
          </div>
          ${widget.config.show_volume && firstMarket ? `<div style="font-size:11px;color:${textMuted};">Vol: ${formatVol(firstMarket.volume)}</div>` : ''}
          ${widget.config.show_traders && firstMarket ? `<div style="font-size:11px;color:${textMuted};">${formatNum(firstMarket.traders)} traders</div>` : ''}
          ${widget.config.show_timer && firstMarket ? `<div style="font-size:11px;color:${textMuted};margin-top:4px;">⏱ Ends ${new Date(firstMarket.closeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>` : ''}
          ${widget.config.cta_text ? `<a href="${widget.config.cta_url || '#'}" target="_blank" style="display:inline-block;margin-top:auto;padding:8px 16px;background:${primaryColor};color:#fff;font-size:12px;font-weight:600;border-radius:8px;text-decoration:none;text-align:center;">${widget.config.cta_text}</a>` : ''}
        </div>`
      break
    }

    case 'leaderboard': {
      const leaderboardData = [
        { rank: 1, name: 'PredictionKing', pnl: '+$12,450', winRate: '72%', streak: 8 },
        { rank: 2, name: 'MarketWhale', pnl: '+$9,820', winRate: '68%', streak: 5 },
        { rank: 3, name: 'SharpBettor', pnl: '+$7,340', winRate: '65%', streak: 3 },
        { rank: 4, name: 'DataDriven', pnl: '+$5,190', winRate: '61%', streak: 4 },
        { rank: 5, name: 'Contrarian', pnl: '+$4,870', winRate: '58%', streak: 2 },
      ]
      content = `
        <div style="padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${cardBg};border-radius:${widget.config.border_radius};height:100%;box-sizing:border-box;">
          <div style="font-size:16px;font-weight:700;color:${text};margin-bottom:16px;">🏆 Top Traders</div>
          ${leaderboardData.map((t) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid ${border};">
              <span style="font-size:14px;font-weight:700;color:${t.rank <= 3 ? primaryColor : textMuted};width:24px;">${t.rank}</span>
              <span style="font-size:13px;font-weight:600;color:${text};flex:1;">${t.name}</span>
              <span style="font-size:12px;font-weight:600;color:#00D284;">${t.pnl}</span>
              <span style="font-size:11px;color:${textMuted};">${t.winRate} WR</span>
            </div>
          `).join('')}
          ${widget.config.cta_text ? `<a href="${widget.config.cta_url || '#'}" target="_blank" style="display:block;margin-top:16px;padding:10px;background:${primaryColor};color:#fff;font-size:13px;font-weight:600;border-radius:8px;text-decoration:none;text-align:center;">${widget.config.cta_text}</a>` : ''}
        </div>`
      break
    }

    case 'multi_market': {
      content = `
        <div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${cardBg};border-radius:${widget.config.border_radius};height:100%;box-sizing:border-box;">
          <div style="font-size:14px;font-weight:700;color:${text};margin-bottom:12px;">${widget.name}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${markets.map((m) => `
              <div style="background:${bg};border-radius:8px;padding:12px;border:1px solid ${border};">
                <div style="font-size:11px;color:${textMuted};margin-bottom:4px;">${m.category}</div>
                <div style="font-size:12px;font-weight:600;color:${text};line-height:1.3;margin-bottom:8px;">${m.question.length > 50 ? m.question.slice(0, 50) + '…' : m.question}</div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:18px;font-weight:800;color:${primaryColor};">${Math.round(m.probability * 100)}%</span>
                  <div>${sparklineHtml(m.sparkline, 50, 20)}</div>
                </div>
                ${widget.config.show_volume ? `<div style="font-size:10px;color:${textMuted};margin-top:4px;">Vol: ${formatVol(m.volume)}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ${widget.config.cta_text ? `<a href="${widget.config.cta_url || '#'}" target="_blank" style="display:block;margin-top:12px;padding:10px;background:${primaryColor};color:#fff;font-size:12px;font-weight:600;border-radius:8px;text-decoration:none;text-align:center;">${widget.config.cta_text}</a>` : ''}
        </div>`
      break
    }

    case 'full_market':
    default: {
      const outcomesHtml = firstMarket?.outcomes.map((o) => `
        <div style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:13px;font-weight:600;color:${text};">${o.label}</span>
            <span style="font-size:13px;font-weight:700;color:${primaryColor};">${Math.round(o.probability * 100)}%</span>
          </div>
          <div style="height:6px;background:${isDark ? '#1F2330' : '#E5E7EB'};border-radius:3px;overflow:hidden;">
            <div style="width:${Math.round(o.probability * 100)}%;height:100%;background:${primaryColor};border-radius:3px;transition:width 0.5s ease;"></div>
          </div>
        </div>
      `).join('') ?? ''

      content = `
        <div style="padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${cardBg};border-radius:${widget.config.border_radius};height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
            <div>
              <div style="font-size:10px;font-weight:600;color:${primaryColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${firstMarket?.category ?? ''}</div>
              <div style="font-size:18px;font-weight:700;color:${text};line-height:1.3;">${firstMarket?.question ?? 'Market'}</div>
            </div>
            ${widget.config.show_sparkline && firstMarket ? `<div>${sparklineHtml(firstMarket.sparkline, 100, 40)}</div>` : ''}
          </div>
          <div style="margin-bottom:16px;">${outcomesHtml}</div>
          <div style="display:flex;gap:16px;margin-bottom:16px;">
            ${widget.config.show_volume && firstMarket ? `<div><div style="font-size:10px;color:${textMuted};text-transform:uppercase;">Volume</div><div style="font-size:14px;font-weight:600;color:${text};">${formatVol(firstMarket.volume)}</div></div>` : ''}
            ${widget.config.show_traders && firstMarket ? `<div><div style="font-size:10px;color:${textMuted};text-transform:uppercase;">Traders</div><div style="font-size:14px;font-weight:600;color:${text};">${formatNum(firstMarket.traders)}</div></div>` : ''}
            ${widget.config.show_timer && firstMarket ? `<div><div style="font-size:10px;color:${textMuted};text-transform:uppercase;">Ends</div><div style="font-size:14px;font-weight:600;color:${text};">${new Date(firstMarket.closeAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div>` : ''}
          </div>
          ${widget.config.cta_text ? `<a href="${widget.config.cta_url || '#'}" target="_blank" style="display:block;margin-top:auto;padding:12px;background:${primaryColor};color:#fff;font-size:14px;font-weight:600;border-radius:10px;text-decoration:none;text-align:center;">${widget.config.cta_text}</a>` : ''}
        </div>`
      break
    }
  }

  // Branding footer
  const brandingHtml = !hideBranding ? `
    <div style="text-align:center;padding:6px;font-size:10px;color:${textMuted};opacity:0.7;">
      Powered by <span style="font-weight:600;color:${primaryColor};">Predictly</span>
    </div>` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      background: ${bg}; 
      color: ${text}; 
      overflow: hidden;
      height: 100%;
    }
  </style>
</head>
<body>
  ${content}
  ${brandingHtml}
</body>
</html>`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params
    const widget = getMaasWidget(widgetId)

    if (!widget) {
      return new NextResponse(
        '<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#9098A8;"><div>Widget not found</div></body></html>',
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }

    const client = getMaasClient(widget.client_id)

    // Check client status
    if (client && (client.status === 'suspended' || client.status === 'cancelled')) {
      return new NextResponse(
        '<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#9098A8;"><div>This widget is currently unavailable</div></body></html>',
        { status: 403, headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Determine theme
    let theme: 'light' | 'dark' = 'dark'
    if (widget.config.theme === 'light') {
      theme = 'light'
    } else if (widget.config.theme === 'dark') {
      theme = 'dark'
    } else {
      // auto: check dark mode preference from query param or default to dark
      const url = new URL(request.url)
      theme = url.searchParams.get('theme') === 'light' ? 'light' : 'dark'
    }

    // Get market data
    const markets = widget.market_ids
      .map((id) => MOCK_MARKET_DATA[id])
      .filter(Boolean)

    const branding = client?.custom_branding ?? null

    const html = renderWidgetHTML(
      widget,
      markets,
      branding as { primary_color: string; hide_predictly_branding: boolean } | null,
      theme
    )

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[MaaS API] GET /maas/widget/[widgetId] error:', err)
    return new NextResponse(
      '<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#FF4D6D;"><div>Error rendering widget</div></body></html>',
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
