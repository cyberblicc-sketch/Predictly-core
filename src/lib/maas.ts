// ============================================================================
// Predictly — Market-as-a-Service (MaaS) library
// Mock data, utilities, and widget presets for the MaaS admin system
// ============================================================================

import type {
  MaaSClient,
  MaaSWidget,
  MaaSCategory,
  MaaSAnalytics,
  MaaSPricingModel,
} from '@/types'

// ── Categories ──────────────────────────────────────────────────────────────

export const MOCK_MAAS_CATEGORIES: MaaSCategory[] = [
  {
    id: 'cat-politics',
    name: 'Politics',
    slug: 'politics',
    emoji: '🏛️',
    market_count: 142,
    description: 'US & global elections, legislation, policy outcomes, and political events.',
    is_premium: false,
    monthly_addon_price: 0,
  },
  {
    id: 'cat-sports',
    name: 'Sports',
    slug: 'sports',
    emoji: '⚽',
    market_count: 238,
    description: 'NFL, NBA, soccer, tennis, and major sporting event outcomes.',
    is_premium: true,
    monthly_addon_price: 99,
  },
  {
    id: 'cat-crypto',
    name: 'Crypto',
    slug: 'crypto',
    emoji: '₿',
    market_count: 97,
    description: 'Bitcoin price levels, token launches, DeFi events, and regulatory moves.',
    is_premium: true,
    monthly_addon_price: 149,
  },
  {
    id: 'cat-tech',
    name: 'Tech',
    slug: 'tech',
    emoji: '💻',
    market_count: 184,
    description: 'Product launches, AI milestones, startup valuations, and tech industry events.',
    is_premium: true,
    monthly_addon_price: 99,
  },
  {
    id: 'cat-economics',
    name: 'Economics',
    slug: 'economics',
    emoji: '📊',
    market_count: 76,
    description: 'Fed decisions, GDP forecasts, inflation data, and macroeconomic indicators.',
    is_premium: true,
    monthly_addon_price: 149,
  },
  {
    id: 'cat-pop-culture',
    name: 'Pop Culture',
    slug: 'pop-culture',
    emoji: '🎬',
    market_count: 312,
    description: 'Box office, awards, celebrity events, TV shows, and viral moments.',
    is_premium: true,
    monthly_addon_price: 49,
  },
  {
    id: 'cat-science',
    name: 'Science',
    slug: 'science',
    emoji: '🔬',
    market_count: 53,
    description: 'Space missions, breakthroughs, climate milestones, and research outcomes.',
    is_premium: true,
    monthly_addon_price: 49,
  },
  {
    id: 'cat-world',
    name: 'World',
    slug: 'world',
    emoji: '🌍',
    market_count: 168,
    description: 'Geopolitical events, international conflicts, treaties, and global affairs.',
    is_premium: true,
    monthly_addon_price: 99,
  },
]

// ── Clients ─────────────────────────────────────────────────────────────────

export const MOCK_MAAS_CLIENTS: MaaSClient[] = [
  {
    id: 'client-espn',
    company_name: 'ESPN',
    website: 'https://espn.com',
    contact_email: 'partnerships@espn.com',
    contact_name: 'Sarah Mitchell',
    status: 'active',
    pricing_model: 'revenue_share',
    monthly_fee: 0,
    revenue_share_pct: 0.15,
    embed_domains: ['espn.com', '*.espn.com', 'espn.co.uk'],
    allowed_categories: ['sports', 'pop-culture'],
    custom_branding: {
      primary_color: '#D00000',
      logo_url: 'https://espncdn.com/logo.png',
      font_family: 'Inter',
      hide_predictly_branding: true,
    },
    api_key: 'pf_maas_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    total_embeds: 12,
    total_views: 2847390,
    total_trades_from_embed: 89432,
    total_revenue_generated: 142950,
    trial_ends_at: null,
    created_at: '2025-08-15T10:30:00Z',
  },
  {
    id: 'client-bloomberg',
    company_name: 'Bloomberg',
    website: 'https://bloomberg.com',
    contact_email: 'api-access@bloomberg.net',
    contact_name: 'James Chen',
    status: 'active',
    pricing_model: 'flat_fee',
    monthly_fee: 5000,
    revenue_share_pct: 0,
    embed_domains: ['bloomberg.com', '*.bloomberg.com'],
    allowed_categories: ['economics', 'crypto', 'tech', 'politics'],
    custom_branding: {
      primary_color: '#3B82F6',
      logo_url: 'https://bloomberg.com/logo.svg',
      font_family: null,
      hide_predictly_branding: false,
    },
    api_key: 'pf_maas_b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    total_embeds: 8,
    total_views: 1923400,
    total_trades_from_embed: 62100,
    total_revenue_generated: 98000,
    trial_ends_at: null,
    created_at: '2025-09-01T14:00:00Z',
  },
  {
    id: 'client-substack',
    company_name: 'Substack Writer',
    website: 'https://themarkets.substack.com',
    contact_email: 'writer@example.com',
    contact_name: 'Alex Rivera',
    status: 'trial',
    pricing_model: 'revenue_share',
    monthly_fee: 0,
    revenue_share_pct: 0.25,
    embed_domains: ['themarkets.substack.com'],
    allowed_categories: ['politics', 'pop-culture'],
    custom_branding: {
      primary_color: '#FF6719',
      logo_url: null,
      font_family: null,
      hide_predictly_branding: false,
    },
    api_key: 'pf_maas_c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    total_embeds: 3,
    total_views: 89200,
    total_trades_from_embed: 3420,
    total_revenue_generated: 2340,
    trial_ends_at: '2026-06-15T00:00:00Z',
    created_at: '2026-04-20T09:00:00Z',
  },
  {
    id: 'client-coindesk',
    company_name: 'CoinDesk',
    website: 'https://coindesk.com',
    contact_email: 'partnerships@coindesk.com',
    contact_name: 'Priya Patel',
    status: 'active',
    pricing_model: 'hybrid',
    monthly_fee: 2000,
    revenue_share_pct: 0.10,
    embed_domains: ['coindesk.com', '*.coindesk.com'],
    allowed_categories: ['crypto', 'tech', 'economics'],
    custom_branding: {
      primary_color: '#F7931A',
      logo_url: 'https://coindesk.com/logo.png',
      font_family: 'Space Grotesk',
      hide_predictly_branding: true,
    },
    api_key: 'pf_maas_d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    total_embeds: 6,
    total_views: 1245600,
    total_trades_from_embed: 41200,
    total_revenue_generated: 68700,
    trial_ends_at: null,
    created_at: '2025-11-10T16:00:00Z',
  },
  {
    id: 'client-techcrunch',
    company_name: 'TechCrunch',
    website: 'https://techcrunch.com',
    contact_email: 'enterprise@techcrunch.com',
    contact_name: 'David Park',
    status: 'active',
    pricing_model: 'revenue_share',
    monthly_fee: 0,
    revenue_share_pct: 0.12,
    embed_domains: ['techcrunch.com', '*.techcrunch.com'],
    allowed_categories: ['tech', 'crypto', 'science'],
    custom_branding: {
      primary_color: '#0A9E01',
      logo_url: 'https://techcrunch.com/logo.svg',
      font_family: null,
      hide_predictly_branding: false,
    },
    api_key: 'pf_maas_e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    total_embeds: 9,
    total_views: 2156800,
    total_trades_from_embed: 73400,
    total_revenue_generated: 105200,
    trial_ends_at: null,
    created_at: '2025-10-05T11:30:00Z',
  },
]

// ── Widgets ─────────────────────────────────────────────────────────────────

export const MOCK_MAAS_WIDGETS: MaaSWidget[] = [
  {
    id: 'wgt-espn-super-bowl',
    client_id: 'client-espn',
    name: 'Super Bowl LVIII Winner',
    type: 'full_market',
    market_ids: ['mkt-super-bowl-58'],
    category: 'sports',
    config: {
      width: '800',
      height: '600',
      theme: 'dark',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Trade Now',
      cta_url: 'https://predictly.io/market/super-bowl-58',
      border_radius: '12px',
      hide_powered_by: true,
    },
    embed_code: '',
    views: 892340,
    clicks: 31200,
    ctr: 3.5,
    created_at: '2025-12-01T10:00:00Z',
  },
  {
    id: 'wgt-espn-nba-mvp',
    client_id: 'client-espn',
    name: 'NBA MVP Race',
    type: 'mini_card',
    market_ids: ['mkt-nba-mvp-26'],
    category: 'sports',
    config: {
      width: '250',
      height: '200',
      theme: 'dark',
      show_volume: true,
      show_traders: false,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'View Market',
      cta_url: 'https://predictly.io/market/nba-mvp-26',
      border_radius: '8px',
      hide_powered_by: true,
    },
    embed_code: '',
    views: 423100,
    clicks: 18200,
    ctr: 4.3,
    created_at: '2026-01-15T08:00:00Z',
  },
  {
    id: 'wgt-bloomberg-fed-rate',
    client_id: 'client-bloomberg',
    name: 'Fed Rate Decision June 2026',
    type: 'probability_bar',
    market_ids: ['mkt-fed-rate-jun26'],
    category: 'economics',
    config: {
      width: '600',
      height: '80',
      theme: 'light',
      show_volume: false,
      show_traders: false,
      show_timer: true,
      show_sparkline: false,
      cta_text: 'See Analysis',
      cta_url: 'https://predictly.io/market/fed-rate-jun26',
      border_radius: '6px',
      hide_powered_by: false,
    },
    embed_code: '',
    views: 567200,
    clicks: 21400,
    ctr: 3.77,
    created_at: '2026-02-20T12:00:00Z',
  },
  {
    id: 'wgt-bloomberg-gdp',
    client_id: 'client-bloomberg',
    name: 'Q2 GDP Forecast',
    type: 'ticker',
    market_ids: ['mkt-gdp-q2-26', 'mkt-inflation-cpi-jun', 'mkt-unemployment-jun'],
    category: 'economics',
    config: {
      width: '100%',
      height: '50',
      theme: 'light',
      show_volume: false,
      show_traders: false,
      show_timer: false,
      show_sparkline: true,
      cta_text: '',
      cta_url: '',
      border_radius: '0px',
      hide_powered_by: false,
    },
    embed_code: '',
    views: 834100,
    clicks: 28900,
    ctr: 3.46,
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'wgt-substack-election',
    client_id: 'client-substack',
    name: '2026 Midterm Outlook',
    type: 'full_market',
    market_ids: ['mkt-midterm-senate-26'],
    category: 'politics',
    config: {
      width: '800',
      height: '600',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Place Your Bet',
      cta_url: 'https://predictly.io/market/midterm-senate-26',
      border_radius: '12px',
      hide_powered_by: false,
    },
    embed_code: '',
    views: 45200,
    clicks: 2100,
    ctr: 4.65,
    created_at: '2026-04-22T14:00:00Z',
  },
  {
    id: 'wgt-coindesk-btc-100k',
    client_id: 'client-coindesk',
    name: 'Bitcoin $100K by EOY?',
    type: 'probability_bar',
    market_ids: ['mkt-btc-100k-eoy'],
    category: 'crypto',
    config: {
      width: '600',
      height: '80',
      theme: 'dark',
      show_volume: true,
      show_traders: false,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Trade BTC Markets',
      cta_url: 'https://predictly.io/market/btc-100k-eoy',
      border_radius: '8px',
      hide_powered_by: true,
    },
    embed_code: '',
    views: 678900,
    clicks: 25600,
    ctr: 3.77,
    created_at: '2026-01-05T11:00:00Z',
  },
  {
    id: 'wgt-coindesk-eth-merge',
    client_id: 'client-coindesk',
    name: 'Top Crypto Markets',
    type: 'multi_market',
    market_ids: ['mkt-btc-100k-eoy', 'mkt-eth-5k-q2', 'mkt-sol-200-q2', 'mkt-doge-1-q2'],
    category: 'crypto',
    config: {
      width: '800',
      height: '600',
      theme: 'dark',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'View All Crypto Markets',
      cta_url: 'https://predictly.io/markets?cat=crypto',
      border_radius: '12px',
      hide_powered_by: true,
    },
    embed_code: '',
    views: 389400,
    clicks: 14300,
    ctr: 3.67,
    created_at: '2026-02-10T16:00:00Z',
  },
  {
    id: 'wgt-techcrunch-ai',
    client_id: 'client-techcrunch',
    name: 'AI & Tech Leaderboard',
    type: 'leaderboard',
    market_ids: ['mkt-gpt5-launch', 'mkt-apple-ai', 'mkt-meta-llama4', 'mkt-agi-2030'],
    category: 'tech',
    config: {
      width: '400',
      height: '500',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: false,
      show_sparkline: true,
      cta_text: 'Explore Tech Markets',
      cta_url: 'https://predictly.io/markets?cat=tech',
      border_radius: '12px',
      hide_powered_by: false,
    },
    embed_code: '',
    views: 912400,
    clicks: 34100,
    ctr: 3.74,
    created_at: '2026-03-15T13:00:00Z',
  },
]

// ── Analytics ───────────────────────────────────────────────────────────────

function generateDailyData() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      views: Math.floor(Math.random() * 500000 + 100000),
      clicks: Math.floor(Math.random() * 20000 + 2000),
      trades: Math.floor(Math.random() * 5000 + 500),
    })
  }
  return days
}

export const MOCK_MAAS_ANALYTICS: MaaSAnalytics[] = [
  {
    client_id: 'client-espn',
    total_views_7d: 1847200,
    total_clicks_7d: 62400,
    total_trades_7d: 18200,
    total_revenue_7d: 28400,
    views_by_day: generateDailyData(),
    top_widgets: [
      { widget_id: 'wgt-espn-super-bowl', widget_name: 'Super Bowl LVIII Winner', views: 892340, ctr: 3.5 },
      { widget_id: 'wgt-espn-nba-mvp', widget_name: 'NBA MVP Race', views: 423100, ctr: 4.3 },
    ],
    revenue_breakdown: [
      { source: 'Revenue Share (15%)', amount: 21300 },
      { source: 'Premium Category Add-ons', amount: 5100 },
      { source: 'Custom Branding Fee', amount: 2000 },
    ],
  },
  {
    client_id: 'client-bloomberg',
    total_views_7d: 1342500,
    total_clicks_7d: 48200,
    total_trades_7d: 14100,
    total_revenue_7d: 19600,
    views_by_day: generateDailyData(),
    top_widgets: [
      { widget_id: 'wgt-bloomberg-gdp', widget_name: 'Q2 GDP Forecast', views: 834100, ctr: 3.46 },
      { widget_id: 'wgt-bloomberg-fed-rate', widget_name: 'Fed Rate Decision June 2026', views: 567200, ctr: 3.77 },
    ],
    revenue_breakdown: [
      { source: 'Flat Fee', amount: 1250 },
      { source: 'Premium Category Add-ons', amount: 18000 },
      { source: 'Overage Charges', amount: 350 },
    ],
  },
  {
    client_id: 'client-substack',
    total_views_7d: 63200,
    total_clicks_7d: 3100,
    total_trades_7d: 820,
    total_revenue_7d: 580,
    views_by_day: generateDailyData(),
    top_widgets: [
      { widget_id: 'wgt-substack-election', widget_name: '2026 Midterm Outlook', views: 45200, ctr: 4.65 },
    ],
    revenue_breakdown: [
      { source: 'Revenue Share (25%)', amount: 580 },
    ],
  },
  {
    client_id: 'client-coindesk',
    total_views_7d: 987300,
    total_clicks_7d: 36800,
    total_trades_7d: 12400,
    total_revenue_7d: 16200,
    views_by_day: generateDailyData(),
    top_widgets: [
      { widget_id: 'wgt-coindesk-btc-100k', widget_name: 'Bitcoin $100K by EOY?', views: 678900, ctr: 3.77 },
      { widget_id: 'wgt-coindesk-eth-merge', widget_name: 'Top Crypto Markets', views: 389400, ctr: 3.67 },
    ],
    revenue_breakdown: [
      { source: 'Flat Fee (Partial)', amount: 500 },
      { source: 'Revenue Share (10%)', amount: 9200 },
      { source: 'Premium Category Add-ons', amount: 6500 },
    ],
  },
  {
    client_id: 'client-techcrunch',
    total_views_7d: 1523000,
    total_clicks_7d: 58700,
    total_trades_7d: 19600,
    total_revenue_7d: 22100,
    views_by_day: generateDailyData(),
    top_widgets: [
      { widget_id: 'wgt-techcrunch-ai', widget_name: 'AI & Tech Leaderboard', views: 912400, ctr: 3.74 },
    ],
    revenue_breakdown: [
      { source: 'Revenue Share (12%)', amount: 18600 },
      { source: 'Premium Category Add-ons', amount: 3500 },
    ],
  },
]

// ── Utility functions ───────────────────────────────────────────────────────

export function generateEmbedCode(widget: MaaSWidget): string {
  return `<iframe src="https://predictly.io/embed/${widget.id}" width="${widget.config.width}" height="${widget.config.height}" frameborder="0" style="border-radius: ${widget.config.border_radius}"></iframe>`
}

export function generateMaaSApiKey(): string {
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
  return `pf_maas_${hex}`
}

export function calculateMaaSRevenue(client: MaaSClient): number {
  let revenue = 0
  if (client.pricing_model === 'flat_fee') {
    revenue = client.monthly_fee
  } else if (client.pricing_model === 'revenue_share') {
    revenue = client.total_revenue_generated * client.revenue_share_pct
  } else if (client.pricing_model === 'hybrid') {
    revenue = client.monthly_fee + client.total_revenue_generated * client.revenue_share_pct
  }
  return Math.round(revenue * 100) / 100
}

// ── Widget Presets ──────────────────────────────────────────────────────────

export interface WidgetPreset {
  name: string
  type: MaaSWidget['type']
  description: string
  useCase: string
  width: string
  height: string
  features: string[]
  config: MaaSWidget['config']
}

export const WIDGET_PRESETS: WidgetPreset[] = [
  {
    name: 'Market Card',
    type: 'mini_card',
    description: 'Compact card showing a single market with probability, sparkline, and CTA.',
    useCase: 'Sidebar widgets, article embeds, newsletter inserts',
    width: '300',
    height: '400',
    features: ['Sparkline chart', 'Volume indicator', 'Countdown timer', 'CTA button'],
    config: {
      width: '300',
      height: '400',
      theme: 'auto',
      show_volume: true,
      show_traders: false,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Trade Now',
      cta_url: '',
      border_radius: '12px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Probability Bar',
    type: 'probability_bar',
    description: 'Slim horizontal bar showing real-time probability for a single market.',
    useCase: 'In-article embeds, header bars, inline context',
    width: '600',
    height: '80',
    features: ['Minimal footprint', 'Real-time probability', 'Inline embed'],
    config: {
      width: '600',
      height: '80',
      theme: 'auto',
      show_volume: false,
      show_traders: false,
      show_timer: true,
      show_sparkline: false,
      cta_text: 'View',
      cta_url: '',
      border_radius: '6px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Mini Card',
    type: 'mini_card',
    description: 'Ultra-compact card with just the essentials — probability and market title.',
    useCase: 'Multiple markets in a grid, mobile layouts, quick glances',
    width: '250',
    height: '200',
    features: ['Compact layout', 'Probability display', 'Quick CTA'],
    config: {
      width: '250',
      height: '200',
      theme: 'auto',
      show_volume: false,
      show_traders: false,
      show_timer: false,
      show_sparkline: true,
      cta_text: 'Trade',
      cta_url: '',
      border_radius: '8px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Full Market',
    type: 'full_market',
    description: 'Complete market view with order book, chart, volume, and trade actions.',
    useCase: 'Dedicated market pages, full-page embeds, deep engagement',
    width: '800',
    height: '600',
    features: ['Full order book', 'Price chart', 'Volume & traders', 'Timer', 'Sparkline', 'CTA'],
    config: {
      width: '800',
      height: '600',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'Place Trade',
      cta_url: '',
      border_radius: '12px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Ticker Strip',
    type: 'ticker',
    description: 'Scrolling ticker bar showing multiple market probabilities in real-time.',
    useCase: 'Website headers, news tickers, live dashboards',
    width: '100%',
    height: '50',
    features: ['Scrolling animation', 'Multiple markets', 'Real-time updates'],
    config: {
      width: '100%',
      height: '50',
      theme: 'dark',
      show_volume: false,
      show_traders: false,
      show_timer: false,
      show_sparkline: true,
      cta_text: '',
      cta_url: '',
      border_radius: '0px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Multi-Market Grid',
    type: 'multi_market',
    description: '2×2 grid displaying multiple markets with probabilities and sparklines.',
    useCase: 'Category pages, homepage sections, market roundups',
    width: '800',
    height: '600',
    features: ['2×2 grid layout', 'Multiple markets', 'Sparklines', 'CTA per market'],
    config: {
      width: '800',
      height: '600',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: true,
      show_sparkline: true,
      cta_text: 'View All Markets',
      cta_url: '',
      border_radius: '12px',
      hide_powered_by: false,
    },
  },
  {
    name: 'Leaderboard Widget',
    type: 'leaderboard',
    description: 'Shows top traders and their performance on embedded markets.',
    useCase: 'Community engagement, gamification, social proof',
    width: '400',
    height: '500',
    features: ['Top traders', 'Win rate display', 'P&L rankings', 'Market stats'],
    config: {
      width: '400',
      height: '500',
      theme: 'auto',
      show_volume: true,
      show_traders: true,
      show_timer: false,
      show_sparkline: true,
      cta_text: 'Join the Leaderboard',
      cta_url: '',
      border_radius: '12px',
      hide_powered_by: false,
    },
  },
]

// ── In-memory store (mutated by API routes) ─────────────────────────────────

let _clients = [...MOCK_MAAS_CLIENTS]
let _widgets = [...MOCK_MAAS_WIDGETS].map((w) => ({
  ...w,
  embed_code: generateEmbedCode(w),
}))
let _analytics = [...MOCK_MAAS_ANALYTICS]

export function getMaasClients(): MaaSClient[] {
  return _clients
}

export function getMaasClient(id: string): MaaSClient | undefined {
  return _clients.find((c) => c.id === id)
}

export function addMaasClient(client: MaaSClient): void {
  _clients.push(client)
}

export function updateMaasClient(id: string, updates: Partial<MaaSClient>): MaaSClient | undefined {
  const idx = _clients.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  _clients[idx] = { ..._clients[idx], ...updates }
  return _clients[idx]
}

export function getMaasWidgets(clientId?: string): MaaSWidget[] {
  if (clientId) return _widgets.filter((w) => w.client_id === clientId)
  return _widgets
}

export function getMaasWidget(id: string): MaaSWidget | undefined {
  return _widgets.find((w) => w.id === id)
}

export function addMaasWidget(widget: MaaSWidget): void {
  _widgets.push(widget)
}

export function getMaasAnalytics(clientId: string): MaaSAnalytics | undefined {
  return _analytics.find((a) => a.client_id === clientId)
}

export function getMaasCategories(): MaaSCategory[] {
  return MOCK_MAAS_CATEGORIES
}
