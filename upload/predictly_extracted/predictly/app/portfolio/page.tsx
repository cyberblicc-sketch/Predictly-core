'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, ChevronRight, Wallet, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { portfolio, portfolioHistory } from '@/lib/mockData'
import { cn, formatUSD } from '@/lib/utils'

const TABS = ['Active', 'Resolved', 'History'] as const

export default function PortfolioPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Active')

  const totals = useMemo(() => {
    const positionValue = portfolio.positions.reduce(
      (sum, p) => sum + p.shares * p.currentPrice, 0
    )
    const cost = portfolio.positions.reduce(
      (sum, p) => sum + p.shares * p.avgPrice, 0
    )
    const unrealizedPnL = positionValue - cost
    return {
      positionValue,
      cost,
      unrealizedPnL,
      pnlPct: cost > 0 ? (unrealizedPnL / cost) : 0,
      netWorth: positionValue + portfolio.balance,
    }
  }, [])

  const last30 = portfolioHistory
  const first = last30[0]?.value ?? 0
  const latest = last30[last30.length - 1]?.value ?? 0
  const totalDelta = latest - first
  const totalDeltaPct = first > 0 ? totalDelta / first : 0
  const deltaPos = totalDelta >= 0

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Portfolio</h1>
        <p className="text-fg-muted text-sm mt-1">
          Track your positions, P&amp;L, and trading history.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Portfolio value"
          value={formatUSD(totals.netWorth, { compact: false })}
          accent="brand"
          subValue={
            <span className={cn(
              'inline-flex items-center gap-1',
              deltaPos ? 'text-yes' : 'text-no'
            )}>
              {deltaPos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {deltaPos ? '+' : ''}{formatUSD(totalDelta, { compact: false })}
              ({(totalDeltaPct * 100).toFixed(1)}%)
            </span>
          }
        />
        <SummaryCard
          label="Cash balance"
          value={formatUSD(portfolio.balance, { compact: false })}
          icon={<Wallet className="h-4 w-4 text-brand" />}
          subValue={<span className="text-fg-subtle">Available to trade</span>}
        />
        <SummaryCard
          label="Open positions"
          value={String(portfolio.positions.length)}
          subValue={<span className="text-fg-subtle">{formatUSD(totals.positionValue, { compact: false })} at risk</span>}
        />
        <SummaryCard
          label="Unrealized P&L"
          value={
            <span className={cn(totals.unrealizedPnL >= 0 ? 'text-yes' : 'text-no')}>
              {totals.unrealizedPnL >= 0 ? '+' : ''}
              {formatUSD(totals.unrealizedPnL, { compact: false })}
            </span>
          }
          subValue={
            <span className={cn(totals.unrealizedPnL >= 0 ? 'text-yes' : 'text-no')}>
              ({totals.pnlPct >= 0 ? '+' : ''}{(totals.pnlPct * 100).toFixed(1)}%)
            </span>
          }
        />
      </div>

      {/* Value chart */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-fg-muted">30-day portfolio value</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-bold tabular-nums">
                {formatUSD(latest, { compact: false })}
              </span>
              <span className={cn(
                'text-sm font-semibold inline-flex items-center gap-1',
                deltaPos ? 'text-yes' : 'text-no'
              )}>
                {deltaPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {deltaPos ? '+' : ''}{formatUSD(totalDelta, { compact: false })} ({(totalDeltaPct * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          <button className="h-9 px-3 rounded-lg bg-bg border border-border text-xs font-medium text-fg-muted hover:text-fg inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pfArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={deltaPos ? '#00D284' : '#FF4D6D'} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={deltaPos ? '#00D284' : '#FF4D6D'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} width={48}
              />
              <Tooltip
                contentStyle={{ background: '#11131A', border: '1px solid #2A3040', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9098A8' }}
                formatter={(v: number) => [formatUSD(v, { compact: false }), 'Value']}
                labelFormatter={(t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="value" stroke={deltaPos ? '#00D284' : '#FF4D6D'} strokeWidth={2} fill="url(#pfArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'h-10 px-4 text-sm font-medium border-b-2 transition-colors',
                tab === t ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              )}
            >
              {t}
              {t === 'Active' && (
                <span className="ml-2 text-2xs px-1.5 py-0.5 rounded bg-bg-elevated">
                  {portfolio.positions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Positions table */}
      {tab === 'Active' && (
        <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
          {/* Header (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_140px_40px] gap-3 px-4 py-3 text-2xs uppercase tracking-wider text-fg-subtle border-b border-border bg-bg/50">
            <div>Market</div>
            <div className="text-right">Shares</div>
            <div className="text-right">Avg / Current</div>
            <div className="text-right">Value</div>
            <div className="text-right">P&amp;L</div>
            <div />
          </div>
          <div className="divide-y divide-border">
            {portfolio.positions.map((p) => {
              const value = p.shares * p.currentPrice
              const cost = p.shares * p.avgPrice
              const pnl = value - cost
              const pnlPct = cost > 0 ? pnl / cost : 0
              const positive = pnl >= 0
              return (
                <Link
                  key={p.id}
                  href={`/markets/${p.marketId}`}
                  className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px_140px_40px] gap-3 px-4 py-3 items-center hover:bg-bg-elevated transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-10 w-10 rounded-md bg-gradient-to-br flex items-center justify-center text-lg border border-border shrink-0',
                      p.imageColor
                    )}>
                      {p.imageEmoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.marketTitle}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          'text-2xs px-1.5 py-0.5 rounded font-medium',
                          p.side === 'NO' ? 'bg-no-soft text-no' : 'bg-yes-soft text-yes'
                        )}>
                          {p.outcome}
                        </span>
                        <span className="text-2xs text-fg-subtle">{p.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:text-right text-sm tabular-nums">
                    <span className="md:hidden text-fg-subtle text-xs">Shares: </span>
                    {p.shares.toLocaleString()}
                  </div>
                  <div className="md:text-right text-sm tabular-nums text-fg-muted">
                    <span className="md:hidden text-fg-subtle text-xs">Price: </span>
                    {Math.round(p.avgPrice * 100)}¢ / <span className="text-fg">{Math.round(p.currentPrice * 100)}¢</span>
                  </div>
                  <div className="md:text-right text-sm font-medium tabular-nums">
                    {formatUSD(value, { compact: false })}
                  </div>
                  <div className={cn(
                    'md:text-right text-sm font-semibold tabular-nums',
                    positive ? 'text-yes' : 'text-no'
                  )}>
                    {positive ? '+' : ''}{formatUSD(pnl, { compact: false })}
                    <div className="text-2xs font-normal">
                      ({positive ? '+' : ''}{(pnlPct * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <ChevronRight className="hidden md:block h-4 w-4 text-fg-subtle justify-self-end" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {tab !== 'Active' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-12 text-center text-fg-muted">
          <p className="text-sm">No {tab.toLowerCase()} positions yet.</p>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, subValue, accent, icon,
}: {
  label: string
  value: React.ReactNode
  subValue?: React.ReactNode
  accent?: 'brand' | 'yes' | 'no'
  icon?: React.ReactNode
}) {
  return (
    <div className={cn(
      'rounded-xl border bg-bg-subtle p-4',
      accent === 'brand' ? 'border-brand/30' : 'border-border'
    )}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-fg-muted">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {subValue && <div className="mt-1 text-xs tabular-nums">{subValue}</div>}
    </div>
  )
}
