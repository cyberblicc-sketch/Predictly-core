'use client'

import { useState } from 'react'
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
  Shield,
  Clock,
  Calendar,
  Wallet,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Eye,
  MousePointerClick,
  Target,
  Percent,
  ArrowDownToLine,
  ShieldCheck,
  ShieldAlert,
  Info,
  Check,
  Loader2,
} from 'lucide-react'
import { MarketCard } from '@/components/market/MarketCard'
import { ActivityFeed } from '@/components/market/ActivityFeed'
import { BoostedBadge } from '@/components/market/BoostedBadge'
import { WithdrawalModal } from '@/components/trade/WithdrawalModal'
import { Footer } from '@/components/layout/Footer'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { markets, activity, portfolio } from '@/lib/mockData'
import { formatUSD, formatCompact, cn } from '@/lib/utils'
import { MOCK_BOOSTED_MARKETS, calculateBoostROI, BOOST_PLACEMENTS } from '@/lib/boosted'
import { calculateWithdrawalFee, MOCK_WITHDRAWAL_REQUESTS } from '@/lib/withdrawal'
import { MOCK_INSURANCE_POLICIES, INSURANCE_TYPE_INFO, getRiskScore, checkInsuranceTrigger } from '@/lib/insurance'
import type { BoostPlacement, WithdrawalSpeed } from '@/types'

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
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)
  const featuredMarkets = markets.slice(0, 6)
  const activeBoosts = MOCK_BOOSTED_MARKETS.filter((b) => b.status === 'active')
  const userWithdrawals = MOCK_WITHDRAWAL_REQUESTS.filter((w) => w.user_id === 'u1')
  const userInsurance = MOCK_INSURANCE_POLICIES.filter((p) => p.user_id === 'u1' && p.status === 'active')

  // Calculate withdrawal fee examples
  const instantFee100 = calculateWithdrawalFee(100, 'instant')
  const instantFee1000 = calculateWithdrawalFee(1000, 'instant')
  const standardFee1000 = calculateWithdrawalFee(1000, 'standard')
  const scheduledFee1000 = calculateWithdrawalFee(1000, 'scheduled')

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
              <button
                onClick={() => setWithdrawalOpen(true)}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold text-sm transition-opacity"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw
              </button>
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

      {/* ═══════════════════ Boosted Markets Section ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              Boosted <span className="gradient-text">Markets</span>
            </h2>
          </div>
          <p className="text-fg-muted text-sm mb-8">
            Sponsored markets featured by top companies. Like promoted tweets but for prediction markets.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBoosts.map((boost) => {
              const roi = calculateBoostROI(boost)
              const placementInfo = BOOST_PLACEMENTS[boost.placement]
              return (
                <div
                  key={boost.id}
                  className="relative rounded-xl bg-bg-subtle border border-border p-5 hover:border-amber-500/30 transition-all group"
                >
                  {/* Boosted badge */}
                  <div className="absolute top-3 right-3">
                    <BoostedBadge placement={boost.placement} sponsorName={boost.sponsor_name} />
                  </div>

                  {/* Market info */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
                      {boost.market_emoji}
                    </div>
                    <div className="min-w-0 pr-16">
                      <div className="text-sm font-semibold leading-snug">{boost.market_title}</div>
                      <div className="text-2xs text-fg-muted mt-0.5">Sponsored by {boost.sponsor_name}</div>
                    </div>
                  </div>

                  {/* Placement tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-2xs">
                      {placementInfo.name}
                    </Badge>
                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-2xs">
                      <Zap className="h-2.5 w-2.5 mr-0.5 fill-current" />
                      +{boost.additional_liquidity.toLocaleString()} SC liquidity
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-bg p-2 border border-border">
                      <div className="flex items-center justify-center gap-1 text-2xs text-fg-muted">
                        <Eye className="h-3 w-3" />
                        Impressions
                      </div>
                      <div className="text-sm font-bold tabular-nums mt-0.5">{formatCompact(boost.impressions)}</div>
                    </div>
                    <div className="rounded-lg bg-bg p-2 border border-border">
                      <div className="flex items-center justify-center gap-1 text-2xs text-fg-muted">
                        <MousePointerClick className="h-3 w-3" />
                        Clicks
                      </div>
                      <div className="text-sm font-bold tabular-nums mt-0.5">{formatCompact(boost.clicks)}</div>
                    </div>
                    <div className="rounded-lg bg-bg p-2 border border-border">
                      <div className="flex items-center justify-center gap-1 text-2xs text-fg-muted">
                        <Target className="h-3 w-3" />
                        CTR
                      </div>
                      <div className="text-sm font-bold tabular-nums mt-0.5">{boost.ctr.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Budget progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-2xs text-fg-muted mb-1">
                      <span>Budget used</span>
                      <span className="font-semibold tabular-nums">{roi.budgetUtilization}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg overflow-hidden border border-border">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${roi.budgetUtilization}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-2xs text-fg-subtle mt-1">
                      <span>${formatCompact(boost.spent)} spent</span>
                      <span>${formatCompact(boost.budget)} budget</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ Withdrawal Speed Charges Section ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownToLine className="h-5 w-5 text-emerald-500" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              Withdrawal <span className="gradient-text">Speed Charges</span>
            </h2>
          </div>
          <p className="text-fg-muted text-sm mb-8">
            No subscription needed. Pay a calculated fee based on withdrawal amount and speed.
            Faster withdrawals cost more — but are still reasonable.
          </p>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Speed Comparison Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Instant */}
              <div className="relative rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/30 p-5">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider">
                  Fastest
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Instant</div>
                    <div className="text-2xs text-fg-muted">Under 1 hour</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Base fee</span>
                    <span className="tabular-nums">1.5% (min $2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Speed fee</span>
                    <span className="tabular-nums">+1.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Risk fee</span>
                    <span className="tabular-nums">1-3%*</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>$100 example</span>
                    <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                      {instantFee100.fee.toFixed(2)} SC ({instantFee100.fee_pct}%)
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>$1,000 example</span>
                    <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                      {instantFee1000.fee.toFixed(2)} SC ({instantFee1000.fee_pct}%)
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-2xs text-fg-subtle">*Risk fee applies over $2K/$10K/$50K</div>
              </div>

              {/* Standard */}
              <div className="rounded-xl bg-bg-subtle border border-border p-5 hover:border-sky-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Standard</div>
                    <div className="text-2xs text-fg-muted">1-3 business days</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Base fee</span>
                    <span className="tabular-nums">1.0% (min $1.50)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Speed fee</span>
                    <span className="tabular-nums">None</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Risk fee</span>
                    <span className="tabular-nums">0.5% over $5K</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>$1,000 example</span>
                    <span className="text-sky-600 dark:text-sky-400 tabular-nums">
                      {standardFee1000.fee.toFixed(2)} SC ({standardFee1000.fee_pct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Scheduled */}
              <div className="rounded-xl bg-bg-subtle border border-border p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Scheduled</div>
                    <div className="text-2xs text-fg-muted">5-7 business days</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Base fee</span>
                    <span className="tabular-nums">0.5% (min $1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Speed fee</span>
                    <span className="tabular-nums">None</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-muted">Risk fee</span>
                    <span className="tabular-nums">None</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>$1,000 example</span>
                    <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {scheduledFee1000.fee.toFixed(2)} SC ({scheduledFee1000.fee_pct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="rounded-xl bg-bg-subtle border border-border p-5 h-fit">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
                Recent Withdrawals
              </h3>
              <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {userWithdrawals.map((wd) => (
                  <li key={wd.id} className="flex items-center gap-3 rounded-lg p-3 bg-bg border border-border">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center border shrink-0',
                      wd.speed === 'instant' ? 'bg-amber-500/15 border-amber-500/30' :
                      wd.speed === 'standard' ? 'bg-sky-500/15 border-sky-500/30' :
                      'bg-emerald-500/15 border-emerald-500/30'
                    )}>
                      {wd.speed === 'instant' ? <Zap className="h-4 w-4 text-amber-500" /> :
                       wd.speed === 'standard' ? <Clock className="h-4 w-4 text-sky-500" /> :
                       <Calendar className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{wd.amount.toLocaleString()} SC</div>
                      <div className="text-2xs text-fg-muted capitalize">{wd.speed} · {wd.destination_type.replace('_', ' ')}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={cn(
                        'text-[9px]',
                        wd.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                        wd.status === 'processing' ? 'bg-sky-500/15 text-sky-600 border-sky-500/30' :
                        wd.status === 'pending' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' :
                        'bg-rose-500/15 text-rose-600 border-rose-500/30'
                      )}>
                        {wd.status}
                      </Badge>
                      <div className="text-2xs text-fg-subtle mt-0.5">Fee: {wd.fee.toFixed(2)} SC</div>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setWithdrawalOpen(true)}
                className="w-full mt-4 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                New Withdrawal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ Insurance/Hedging Section ═══════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              Position <span className="gradient-text">Insurance</span>
            </h2>
          </div>
          <p className="text-fg-muted text-sm mb-8">
            Buy insurance (like put options) on your prediction market bets. Protect against adverse moves.
          </p>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Insurance Type Cards */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                {(Object.entries(INSURANCE_TYPE_INFO) as [string, typeof INSURANCE_TYPE_INFO.full_hedge][]).map(
                  ([type, info]) => (
                    <div
                      key={type}
                      className={cn(
                        'rounded-xl border p-5 bg-gradient-to-br transition-colors hover:border-emerald-500/40',
                        info.color,
                        'border-border'
                      )}
                    >
                      <div className="text-3xl mb-2">{info.emoji}</div>
                      <div className="text-sm font-bold mb-1">{info.name}</div>
                      <p className="text-2xs text-fg-muted leading-relaxed">{info.description}</p>
                    </div>
                  )
                )}
              </div>

              {/* Active Policies */}
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Your Active Policies
              </h3>
              <div className="space-y-2">
                {userInsurance.map((policy) => {
                  const triggerCheck = checkInsuranceTrigger(policy, policy.current_price)
                  const priceDistance = policy.trigger_price > 0
                    ? ((policy.current_price - policy.trigger_price) / policy.trigger_price) * 100
                    : 0
                  const isNearTrigger = priceDistance < 15
                  const isTriggered = triggerCheck.triggered
                  const safetyPct = Math.max(0, Math.min(100, priceDistance))

                  return (
                    <div
                      key={policy.id}
                      className={cn(
                        'rounded-xl border p-4 bg-bg-subtle transition-colors',
                        isTriggered ? 'border-rose-500/40' : isNearTrigger ? 'border-amber-500/40' : 'border-border'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">
                            {policy.insurance_type === 'full_hedge' ? '🛡️' : policy.insurance_type === 'partial_hedge' ? '⚖️' : '🛑'}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{policy.market_title}</div>
                            <div className="text-2xs text-fg-muted">
                              {INSURANCE_TYPE_INFO[policy.insurance_type].name} · Coverage: {policy.coverage_amount.toFixed(0)} SC
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          'text-[9px] shrink-0 ml-2',
                          isTriggered
                            ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                            : isNearTrigger
                              ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        )}>
                          {isTriggered ? 'Triggered' : isNearTrigger ? 'Near Trigger' : 'Safe'}
                        </Badge>
                      </div>

                      {/* Safety bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-bg overflow-hidden border border-border">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isTriggered ? 'bg-rose-500 w-full' : isNearTrigger ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${isTriggered ? 100 : safetyPct}%` }}
                          />
                        </div>
                        <span className="text-2xs text-fg-muted tabular-nums shrink-0">
                          Trigger: {(policy.trigger_price * 100).toFixed(0)}¢ · Current: {(policy.current_price * 100).toFixed(0)}¢
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link href="/insurance">
                <Button variant="outline" className="w-full h-10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                  <Shield className="h-4 w-4 mr-2" />
                  View Insurance Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Insurance Summary Sidebar */}
            <div className="rounded-xl bg-bg-subtle border border-border p-5 h-fit">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                Insurance Summary
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-bg p-3 border border-border text-center">
                    <div className="text-2xl font-bold tabular-nums">{userInsurance.length}</div>
                    <div className="text-2xs text-fg-muted">Active Policies</div>
                  </div>
                  <div className="rounded-lg bg-bg p-3 border border-border text-center">
                    <div className="text-2xl font-bold tabular-nums">
                      {userInsurance.reduce((sum, p) => sum + p.coverage_amount, 0).toFixed(0)}
                    </div>
                    <div className="text-2xs text-fg-muted">Total Coverage (SC)</div>
                  </div>
                </div>

                <div className="rounded-lg bg-bg p-3 border border-border">
                  <div className="text-2xs text-fg-muted mb-1">Premiums Paid</div>
                  <div className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {userInsurance.reduce((sum, p) => sum + p.premium, 0).toFixed(2)} SC
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <div className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Underwriting Model</div>
                  <p className="text-2xs text-fg-muted leading-relaxed">
                    On average, we collect ~8% in premiums and pay out ~3-4% in claims.
                    That means 4-5% net profit on every dollar insured, plus float interest.
                  </p>
                </div>

                <Link href="/insurance">
                  <Button className="w-full h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold">
                    Get Insurance
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
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

      {/* Withdrawal Modal */}
      <WithdrawalModal open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
    </div>
  )
}
