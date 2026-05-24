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
  Activity,
  Coins,
  Gem,
} from 'lucide-react'
import { MarketCard } from '@/components/market/MarketCard'
import { Footer } from '@/components/layout/Footer'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { markets } from '@/lib/mockData'
import { formatCompact, cn } from '@/lib/utils'

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
    description: 'Pick YES or NO on real-world events — politics, crypto, sports, tech, and more. Your shares move with the probability.',
    color: 'text-brand',
    bg: 'bg-brand-soft',
    border: 'border-brand/20',
  },
  {
    icon: Gift,
    title: 'Dual Currency System',
    description: 'Use Gold Coins (GC) for practice play and Sweeps Coins (SC) for redeemable rewards. SC can be cashed out after KYC verification.',
    color: 'text-gold',
    bg: 'bg-gold-soft',
    border: 'border-gold-border',
  },
  {
    icon: Trophy,
    title: 'Win Rewards',
    description: 'Correct predictions earn real payouts in Sweeps Coins. Redeem for prizes, climb the leaderboard, and unlock exclusive rewards.',
    color: 'text-yes',
    bg: 'bg-yes-soft',
    border: 'border-yes-border',
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const featuredMarkets = markets.slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════════════════ Hero Section ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand/10 to-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {featuredMarkets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>

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
