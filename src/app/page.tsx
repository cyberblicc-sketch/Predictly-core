'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Users,
  DollarSign,
  Zap,
  Gift,
  Trophy,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Coins,
  Gem,
} from 'lucide-react'
import { MarketCard } from '@/components/market/MarketCard'
import { ActivityFeed } from '@/components/market/ActivityFeed'
import { Footer } from '@/components/layout/Footer'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { Badge } from '@/components/ui/badge'
import { markets, activity } from '@/lib/mockData'
import { formatUSD, formatCompact, cn } from '@/lib/utils'

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: BarChart3, label: 'Total Volume', value: '$2.8M', iconColor: 'text-brand' },
  { icon: Activity, label: 'Active Markets', value: '127', iconColor: 'text-yes' },
  { icon: Users, label: 'Traders', value: '45K+', iconColor: 'text-sweeps' },
  { icon: DollarSign, label: 'Total Paid Out', value: '$1.2M', iconColor: 'text-gold' },
]

const HOW_IT_WORKS = [
  {
    icon: Zap,
    title: 'Trade Predictions',
    description:
      'Pick YES or NO on real-world events — politics, crypto, sports, tech, and more. Your shares move with the probability.',
    color: 'text-brand',
    bg: 'bg-brand-soft',
    border: 'border-brand/20',
  },
  {
    icon: Gift,
    title: 'Dual Currency System',
    description:
      'Use Gold Coins (GC) for practice play and Sweeps Coins (SC) for redeemable rewards. SC can be cashed out after KYC verification.',
    color: 'text-gold',
    bg: 'bg-gold-soft',
    border: 'border-gold-border',
  },
  {
    icon: Trophy,
    title: 'Win Rewards',
    description:
      'Correct predictions earn real payouts in Sweeps Coins. Redeem for prizes, climb the leaderboard, and unlock exclusive rewards.',
    color: 'text-yes',
    bg: 'bg-yes-soft',
    border: 'border-yes-border',
  },
]

const PROFIT_OPPS = [
  { ticker: 'AAPL', name: 'Apple $250 by Q4', price: '67¢', change: '+3.2%', positive: true, emoji: '🍎' },
  { ticker: 'BTC', name: 'Bitcoin $150k by 2027', price: '54¢', change: '+5.8%', positive: true, emoji: '₿' },
  { ticker: 'TSLA', name: 'Tesla Earnings Beat', price: '42¢', change: '-1.1%', positive: false, emoji: '⚡' },
]

const RECENT_ACTIVITY_TYPES = [
  { ...activity[0], type: 'trade' as const, typeLabel: 'Trade' },
  { ...activity[2], type: 'win' as const, typeLabel: 'Win' },
  { id: 'ra-deposit', user: 'newtrader', avatar: '💰', side: 'Deposit', market: '', marketTitle: 'Gold Coins purchased', amount: 15000, price: 0, timeAgo: '8m', type: 'deposit' as const, typeLabel: 'Deposit' },
  { id: 'ra-referral', user: 'refpro', avatar: '🎁', side: 'Referral', market: '', marketTitle: 'Friend signed up — bonus SC', amount: 50, price: 0, timeAgo: '15m', type: 'referral' as const, typeLabel: 'Referral' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const featuredMarkets = markets.slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════════════════ Hero Section ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-bg">
        {/* Radial gradient overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-brand-soft border border-brand/20 text-brand-hover text-xs font-medium mb-6">
              <span className="live-dot !bg-brand" />
              Markets are open · 24/7
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              <span className="gradient-text">Predictly</span>
              <br />
              Prediction Market
            </h1>

            <p className="mt-6 text-fg-muted max-w-xl mx-auto text-lg sm:text-xl leading-relaxed">
              Trade real-world outcomes with our dual-currency system. Gold Coins for
              practice, Sweeps Coins for real rewards. Predict. Win. Redeem.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white font-semibold text-sm transition-opacity shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)]"
              >
                Sign Up <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#featured-markets"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg font-semibold text-sm transition-colors"
              >
                Browse Markets
              </Link>
            </div>

            {/* Inline stat pills */}
            <div className="mt-10 flex flex-wrap gap-6 justify-center text-sm text-fg-muted">
              <span className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-gold" />
                <strong className="text-fg font-semibold">50,000</strong> GC Welcome Bonus
              </span>
              <span className="flex items-center gap-1.5">
                <Gem className="h-4 w-4 text-sweeps" />
                <strong className="text-fg font-semibold">2,500</strong> SC Free on Signup
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Stats Banner ═══════════════════ */}
      <section className="border-b border-border bg-bg-subtle/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-bg-subtle/60 border border-border p-4 sm:p-5 text-center hover:border-border-strong transition-colors"
              >
                <stat.icon className={cn('h-5 w-5 mx-auto mb-2', stat.iconColor)} />
                <div className="text-2xl sm:text-3xl font-bold tabular-nums">{stat.value}</div>
                <div className="text-xs text-fg-muted mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ How It Works ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">
              How <span className="gradient-text">It Works</span>
            </h2>
            <p className="mt-3 text-fg-muted max-w-lg mx-auto">
              Get started in three simple steps and start earning on your predictions.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className={cn(
                  'rounded-xl border p-6 transition-colors hover:border-border-strong',
                  'bg-bg-subtle border-border'
                )}
              >
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4 border', step.bg, step.border)}>
                  <step.icon className={cn('h-6 w-6', step.color)} />
                </div>
                <div className="text-xs text-fg-subtle uppercase tracking-wider font-medium mb-2">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ 1% Profit Opportunity ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-5 w-5 text-gold" />
            <h2 className="text-2xl sm:text-3xl font-bold">1% Profit Opportunity</h2>
            <Badge className="bg-yes-soft text-yes border-yes-border hover:bg-yes-soft">
              Limited Time
            </Badge>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {PROFIT_OPPS.map((opp) => (
              <div
                key={opp.ticker}
                className="rounded-xl bg-bg-subtle border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{opp.emoji}</span>
                  <div>
                    <div className="text-xs text-fg-subtle uppercase tracking-wider font-medium">
                      {opp.ticker}
                    </div>
                    <div className="text-sm font-semibold">{opp.name}</div>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums text-emerald-400">
                    {opp.price}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums flex items-center gap-1',
                      opp.positive ? 'text-yes' : 'text-no'
                    )}
                  >
                    {opp.positive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {opp.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer box */}
          <div className="mt-6 rounded-lg bg-bg-subtle border border-warn/30 p-4 flex gap-3">
            <AlertTriangle className="shrink-0 h-4 w-4 text-warn mt-0.5" />
            <p className="text-xs text-fg-subtle leading-relaxed">
              <strong className="text-fg-muted">Disclaimer:</strong> Profit opportunities
              are not guaranteed. Past performance does not predict future results. Markets
              are for entertainment purposes. 18+ only. GC has no monetary value.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Featured Markets ═══════════════════ */}
      <section id="featured-markets" className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Featured <span className="gradient-text">Markets</span>
              </h2>
              <p className="mt-2 text-fg-muted text-sm">
                Trending prediction markets with the highest volume and engagement.
              </p>
            </div>
            <Link
              href="/markets"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-sm font-medium text-fg-muted hover:text-fg transition-colors"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
            {/* Market cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {featuredMarkets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>

            {/* Top Movers sidebar */}
            <div className="mt-8 lg:mt-0 rounded-xl bg-bg-subtle border border-border p-5 h-fit">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" />
                Top Movers (24h)
              </h3>
              <ul className="space-y-3">
                {markets
                  .filter(m => m.outcomes[0]?.delta7d)
                  .sort((a, b) => Math.abs(b.outcomes[0].delta7d) - Math.abs(a.outcomes[0].delta7d))
                  .slice(0, 5)
                  .map(m => {
                    const delta = m.outcomes[0].delta7d
                    const positive = delta >= 0
                    return (
                      <li key={m.id}>
                        <Link href={`/markets/${m.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-bg-elevated transition-colors">
                          <span className="text-lg">{m.imageEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{m.question}</div>
                            <div className="text-2xs text-fg-subtle">{m.category}</div>
                          </div>
                          <span className={cn('text-sm font-semibold tabular-nums', positive ? 'text-yes' : 'text-no')}>
                            {positive ? '+' : ''}{(delta * 100).toFixed(1)}%
                          </span>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>

          {/* Mobile View All button */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/markets"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-bg-subtle border border-border text-sm font-medium text-fg-muted"
            >
              View All Markets <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Recent Activity ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Activity feed */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Recent <span className="gradient-text">Activity</span>
              </h2>
              <p className="text-fg-muted text-sm mb-6">
                See what&apos;s happening right now on Predictly.
              </p>
              <ActivityFeed limit={4} />
            </div>

            {/* Side info: Recent activity by type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Activity Highlights</h3>
              <ul className="space-y-3">
                {RECENT_ACTIVITY_TYPES.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-bg-subtle border border-border p-4 hover:border-border-strong transition-colors"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-bg flex items-center justify-center text-xl border border-border">
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-fg">{item.user}</span>
                        <span
                          className={cn(
                            'px-1.5 h-5 rounded text-2xs font-semibold border inline-flex items-center',
                            item.type === 'trade'
                              ? 'bg-yes-soft text-yes border-yes-border'
                              : item.type === 'win'
                                ? 'bg-gold-soft text-gold border-gold-border'
                                : item.type === 'deposit'
                                  ? 'bg-brand-soft text-brand border-brand/30'
                                  : 'bg-sweeps-soft text-sweeps border-sweeps-border'
                          )}
                        >
                          {item.typeLabel}
                        </span>
                      </div>
                      <p className="text-2xs text-fg-muted mt-0.5 truncate">
                        {item.marketTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold tabular-nums">
                        {item.type === 'trade' ? formatUSD(item.amount) : `${item.amount.toLocaleString()} ${item.type === 'deposit' ? 'GC' : 'SC'}`}
                      </div>
                      <div className="text-2xs text-fg-subtle">{item.timeAgo} ago</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA Section ═══════════════════ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,210,132,0.08)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Start <span className="gradient-text">Trading</span>?
          </h2>
          <p className="mt-4 text-fg-muted max-w-md mx-auto text-lg">
            Join thousands of traders on the world&apos;s most advanced dual-currency
            prediction market platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white font-semibold transition-opacity shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)]"
            >
              Sign Up Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg font-semibold transition-colors"
            >
              Explore Markets
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Footer ═══════════════════ */}
      <Disclaimer />
      <Footer />
    </div>
  )
}
