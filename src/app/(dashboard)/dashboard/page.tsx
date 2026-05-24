'use client'

import Link from 'next/link'
import {
  TrendingUp, Wallet, Coins, Gem, ArrowUpRight, ArrowDownRight,
  ArrowRight, Activity, BookOpen, ShieldCheck, ArrowDownToLine,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { portfolio, portfolioHistory, markets, transactions, mockUser } from '@/lib/mockData'
import { PositionCard } from '@/components/portfolio/PositionCard'
import { formatUSD, formatCompact, formatDate, cn } from '@/lib/utils'

export default function DashboardPage() {
  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const isProfit = totalPnl >= 0
  const chartTrendUp = portfolioHistory.length > 1
    ? portfolioHistory[portfolioHistory.length - 1].value >= portfolioHistory[0].value
    : true
  const chartColor = chartTrendUp ? '#00D284' : '#FF4D6D'
  const trendingMarkets = markets.filter((m) => m.trending).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{mockUser.username}</span>
        </h1>
        <p className="text-sm text-fg-muted mt-1">Here&apos;s your portfolio at a glance</p>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatUSD(portfolio.balance, { compact: false })}
          change="+8.2%"
          positive
          icon={<TrendingUp className="h-4 w-4 text-fg-subtle" />}
        />
        <StatCard
          label="GC Balance"
          value={`${portfolio.gcBalance?.toLocaleString() ?? '50,000'} GC`}
          icon={<Coins className="h-4 w-4 text-gold" />}
          className="border-gold-border bg-gold-soft/30"
          valueColor="text-gold"
        />
        <StatCard
          label="SC Balance"
          value={`${portfolio.scBalance?.toLocaleString() ?? '2,500'} SC`}
          icon={<Gem className="h-4 w-4 text-sweeps" />}
          className="border-sweeps-border bg-sweeps-soft/30"
          valueColor="text-sweeps"
        />
        <StatCard
          label="Unrealized P&L"
          value={formatUSD(Math.abs(totalPnl), { compact: false })}
          change={isProfit ? `+${((totalPnl / 5000) * 100).toFixed(1)}%` : `${((totalPnl / 5000) * 100).toFixed(1)}%`}
          positive={isProfit}
          icon={<Wallet className="h-4 w-4 text-fg-subtle" />}
        />
      </div>

      {/* 30-day portfolio chart */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">30-Day Portfolio Value</h2>
          <span className={cn(
            'text-xs font-medium tabular-nums',
            chartTrendUp ? 'text-yes' : 'text-no'
          )}>
            {chartTrendUp ? '+' : ''}
            {((portfolioHistory[portfolioHistory.length - 1]?.value ?? 0) - (portfolioHistory[0]?.value ?? 0)).toFixed(0)} this period
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashPortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={(t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} minTickGap={40}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} width={48}
              />
              <Tooltip
                contentStyle={{ background: '#11131A', border: '1px solid #2A3040', borderRadius: 8, fontSize: 12, color: '#F5F7FA' }}
                labelStyle={{ color: '#9098A8' }}
                formatter={(v: number) => [formatUSD(v, { compact: false }), 'Value']}
                labelFormatter={(t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#dashPortGrad)" animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-brand to-brand-hover hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-[0_0_16px_-4px_rgba(99,102,241,0.5)]"
          >
            <TrendingUp className="h-4 w-4" />
            Browse Markets
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg text-sm font-semibold transition-colors"
          >
            <Wallet className="h-4 w-4" />
            View Portfolio
          </Link>
          <Link
            href="/withdrawal"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg text-sm font-semibold transition-colors"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Withdraw
          </Link>
          <Link
            href="/insurance"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 text-sm font-semibold transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            Get Insurance
          </Link>
          <Link
            href="/playbooks"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg text-sm font-semibold transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Playbooks
          </Link>
        </div>
      </div>

      {/* Your Positions (first 3) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Positions</h2>
          <Link href="/portfolio" className="text-sm text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {portfolio.positions.slice(0, 3).map((p) => (
            <PositionCard key={p.id} position={p} />
          ))}
        </div>
      </div>

      {/* Trending Markets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trending Markets</h2>
          <Link href="/markets" className="text-sm text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {trendingMarkets.map((m) => {
              const yesOutcome = m.outcomes[0]
              const delta = yesOutcome?.delta7d ?? 0
              const positive = delta >= 0
              return (
                <li key={m.id}>
                  <Link
                    href={`/markets/${m.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-bg-elevated transition-colors"
                  >
                    <div className={cn(
                      'shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg border border-border',
                      m.imageColor
                    )}>
                      {m.imageEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.question}</div>
                      <div className="text-2xs text-fg-subtle">{m.category} · {formatCompact(m.traders)} traders</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold tabular-nums">
                        {Math.round((yesOutcome?.price ?? 0) * 100)}%
                      </div>
                      <div className={cn(
                        'flex items-center gap-0.5 text-2xs font-medium tabular-nums justify-end',
                        positive ? 'text-yes' : 'text-no'
                      )}>
                        {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {positive ? '+' : ''}{(delta * 100).toFixed(1)}%
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Recent Transactions (last 5) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link href="/history" className="text-sm text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-bg-elevated transition-colors">
                    <td className="px-4 py-3 text-fg-muted tabular-nums whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-2xs font-semibold',
                        tx.type === 'TRADE' ? 'bg-brand-soft text-brand' :
                        tx.type === 'DEPOSIT' || tx.type === 'GC_PURCHASE' ? 'bg-yes-soft text-yes' :
                        tx.type === 'WITHDRAWAL' ? 'bg-no-soft text-no' :
                        'bg-gold-soft text-gold'
                      )}>
                        <Activity className="h-3 w-3" />
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap',
                      tx.type === 'WITHDRAWAL' ? 'text-loss' : 'text-profit'
                    )}>
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                    </td>
                    <td className="px-4 py-3 text-fg-muted max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex px-2 h-5 rounded-full text-2xs font-medium',
                        tx.status === 'COMPLETED' ? 'bg-yes-soft text-yes' :
                        tx.status === 'PENDING' ? 'bg-gold-soft text-gold' :
                        'bg-no-soft text-no'
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────── Stat card ────── */

function StatCard({
  label, value, change, positive, icon, className, valueColor,
}: {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon?: React.ReactNode
  className?: string
  valueColor?: string
}) {
  return (
    <div className={cn('rounded-xl bg-bg-subtle border border-border p-4', className)}>
      <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
        {icon}
        {label}
      </div>
      <div className={cn('text-xl font-bold tabular-nums', valueColor)}>
        {value}
      </div>
      {change && (
        <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', positive ? 'text-profit' : 'text-loss')}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      )}
    </div>
  )
}
