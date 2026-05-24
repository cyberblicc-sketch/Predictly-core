// ============================================================================
// Predictly — Boosted Markets (Sponsored Liquidity)
// Companies pay to feature their market. Like promoted tweets but for markets.
// ============================================================================

import type { BoostedMarket, BoostPlacement } from '@/types'

// ── Boost Placements ─────────────────────────────────────────────────────────

export const BOOST_PLACEMENTS: Record<
  BoostPlacement,
  { name: string; description: string; suggestedCPC: number; minBudget: number }
> = {
  hero: {
    name: 'Hero Banner',
    description: 'Full-width banner at the top of the homepage. Maximum visibility and engagement.',
    suggestedCPC: 2.50,
    minBudget: 10_000,
  },
  featured: {
    name: 'Featured Card',
    description: 'Highlighted card in the featured markets section with boosted styling.',
    suggestedCPC: 1.80,
    minBudget: 5_000,
  },
  category_top: {
    name: 'Category Top',
    description: 'Pinned to the top of a specific category page. Targeted visibility.',
    suggestedCPC: 1.20,
    minBudget: 3_000,
  },
  sidebar: {
    name: 'Sidebar',
    description: 'Prominent placement in the right sidebar across dashboard pages.',
    suggestedCPC: 0.90,
    minBudget: 2_000,
  },
  ticker: {
    name: 'Ticker',
    description: 'Scrolling ticker banner visible across all pages. Persistent exposure.',
    suggestedCPC: 0.50,
    minBudget: 1_000,
  },
}

// ── Mock Boosted Markets ─────────────────────────────────────────────────────

export const MOCK_BOOSTED_MARKETS: BoostedMarket[] = [
  {
    id: 'boost-1',
    market_id: 'm-apple-ai-glasses',
    market_title: 'Will Apple Vision Pro 2 sell 1M units?',
    market_emoji: '🕶️',
    sponsor_name: 'Apple Inc',
    sponsor_logo_url: null,
    placement: 'hero',
    status: 'active',
    budget: 15_000,
    spent: 8_420,
    impressions: 1_240_000,
    clicks: 48_200,
    ctr: 3.89,
    additional_liquidity: 50_000,
    start_date: '2026-03-01T00:00:00Z',
    end_date: '2026-03-31T23:59:00Z',
    cpc: 0.17,
    target_categories: ['Tech', 'Stocks'],
    created_at: '2026-02-25T10:00:00Z',
  },
  {
    id: 'boost-2',
    market_id: 'm-btc-200k',
    market_title: 'Bitcoin $200k by 2026',
    market_emoji: '₿',
    sponsor_name: 'Coinbase',
    sponsor_logo_url: null,
    placement: 'featured',
    status: 'active',
    budget: 10_000,
    spent: 5_890,
    impressions: 890_000,
    clicks: 35_600,
    ctr: 4.00,
    additional_liquidity: 30_000,
    start_date: '2026-03-05T00:00:00Z',
    end_date: '2026-04-05T23:59:00Z',
    cpc: 0.17,
    target_categories: ['Crypto'],
    created_at: '2026-03-01T14:00:00Z',
  },
  {
    id: 'boost-3',
    market_id: 'm-fed-cut-jun',
    market_title: 'Will the Fed cut rates?',
    market_emoji: '🏦',
    sponsor_name: 'Goldman Sachs',
    sponsor_logo_url: null,
    placement: 'category_top',
    status: 'active',
    budget: 8_000,
    spent: 3_210,
    impressions: 420_000,
    clicks: 12_600,
    ctr: 3.00,
    additional_liquidity: 20_000,
    start_date: '2026-03-10T00:00:00Z',
    end_date: '2026-06-17T20:00:00Z',
    cpc: 0.25,
    target_categories: ['Economics'],
    created_at: '2026-03-08T09:00:00Z',
  },
  {
    id: 'boost-4',
    market_id: 'm-nba-champ',
    market_title: 'NBA Champion 2026',
    market_emoji: '🏀',
    sponsor_name: 'DraftKings',
    sponsor_logo_url: null,
    placement: 'sidebar',
    status: 'active',
    budget: 5_000,
    spent: 2_150,
    impressions: 310_000,
    clicks: 9_300,
    ctr: 3.00,
    additional_liquidity: 15_000,
    start_date: '2026-03-01T00:00:00Z',
    end_date: '2026-06-22T03:00:00Z',
    cpc: 0.23,
    target_categories: ['Sports'],
    created_at: '2026-02-28T16:00:00Z',
  },
  {
    id: 'boost-5',
    market_id: 'm-gpt-5-2026',
    market_title: 'GPT-5 release date',
    market_emoji: '🤖',
    sponsor_name: 'Microsoft',
    sponsor_logo_url: null,
    placement: 'featured',
    status: 'pending',
    budget: 12_000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    additional_liquidity: 40_000,
    start_date: '2026-04-01T00:00:00Z',
    end_date: '2026-07-01T00:00:00Z',
    cpc: 0,
    target_categories: ['Tech'],
    created_at: '2026-03-10T12:00:00Z',
  },
  {
    id: 'boost-6',
    market_id: 'm-ukraine-ceasefire',
    market_title: 'Ukraine ceasefire',
    market_emoji: '🕊️',
    sponsor_name: 'Reuters',
    sponsor_logo_url: null,
    placement: 'ticker',
    status: 'completed',
    budget: 3_000,
    spent: 2_980,
    impressions: 2_100_000,
    clicks: 84_000,
    ctr: 4.00,
    additional_liquidity: 8_000,
    start_date: '2026-02-01T00:00:00Z',
    end_date: '2026-02-28T23:59:00Z',
    cpc: 0.04,
    target_categories: ['World'],
    created_at: '2026-01-28T08:00:00Z',
  },
]

// ── Calculate Boost ROI ──────────────────────────────────────────────────────

export function calculateBoostROI(boost: BoostedMarket) {
  const remainingBudget = boost.budget - boost.spent
  const budgetUtilization = boost.budget > 0 ? (boost.spent / boost.budget) * 100 : 0
  const estimatedCPA = boost.clicks > 0 ? boost.spent / boost.clicks : 0
  const conversionRate = 0.034 // Average 3.4% conversion from click to trade
  const estimatedTraders = Math.round(boost.clicks * conversionRate)
  const costPerTrader = estimatedTraders > 0 ? boost.spent / estimatedTraders : 0
  const revenuePerTrader = 12.50 // Average revenue per trader from fees
  const estimatedRevenue = estimatedTraders * revenuePerTrader
  const roi = boost.spent > 0 ? ((estimatedRevenue - boost.spent) / boost.spent) * 100 : 0
  const liquidityMultiplier = boost.additional_liquidity > 0
    ? boost.additional_liquidity / Math.max(boost.spent, 1)
    : 0

  return {
    remainingBudget,
    budgetUtilization: +budgetUtilization.toFixed(1),
    estimatedCPA: +estimatedCPA.toFixed(2),
    estimatedTraders,
    costPerTrader: +costPerTrader.toFixed(2),
    estimatedRevenue: +estimatedRevenue.toFixed(2),
    roi: +roi.toFixed(1),
    liquidityMultiplier: +liquidityMultiplier.toFixed(1),
  }
}
