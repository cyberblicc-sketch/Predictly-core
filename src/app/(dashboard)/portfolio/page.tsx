'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { portfolio, portfolioHistory } from '@/lib/mockData'
import { PositionCard } from '@/components/portfolio/PositionCard'
import { formatUSD, formatCents, cn } from '@/lib/utils'
import { Wallet, TrendingUp, Coins, Gem, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'

const TABS = ['Active', 'Resolved', 'History'] as const

export default function PortfolioPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Active')
  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const isProfit = totalPnl >= 0

  const handleExportCSV = () => {
    const headers = ['Market', 'Outcome', 'Shares', 'Avg Price', 'Current', 'Value', 'P&L']
    const rows = portfolio.positions.map(p => {
      const pnl = p.pnl ?? (p.currentPrice - p.avgPrice) * p.shares
      const value = p.currentPrice * p.shares
      return [
        `"${p.marketTitle}"`,
        p.outcome,
        p.shares,
        p.avgPrice.toFixed(2),
        p.currentPrice.toFixed(2),
        value.toFixed(2),
        pnl.toFixed(2),
      ].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictly-portfolio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const chartTrendUp = portfolioHistory.length > 1
    ? portfolioHistory[portfolioHistory.length - 1].value >= portfolioHistory[0].value
    : true
  const chartColor = chartTrendUp ? '#00D284' : '#FF4D6D'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-fg-muted mt-1">Track your positions and performance</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-sm font-medium text-fg-muted hover:text-fg transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Portfolio Value
          </div>
          <div className="text-xl font-bold tabular-nums">{formatUSD(portfolio.balance, { compact: false })}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Wallet className="h-3.5 w-3.5" /> Cash Balance
          </div>
          <div className="text-xl font-bold tabular-nums">{formatUSD(portfolio.deposited, { compact: false })}</div>
        </div>
        <div className="rounded-xl bg-gold-soft/30 border border-gold-border p-4">
          <div className="flex items-center gap-2 text-2xs text-gold uppercase tracking-wider mb-2">
            <Coins className="h-3.5 w-3.5" /> GC Balance
          </div>
          <div className="text-xl font-bold tabular-nums text-gold">{portfolio.gcBalance?.toLocaleString() ?? '50,000'}</div>
        </div>
        <div className="rounded-xl bg-sweeps-soft/30 border border-sweeps-border p-4">
          <div className="flex items-center gap-2 text-2xs text-sweeps uppercase tracking-wider mb-2">
            <Gem className="h-3.5 w-3.5" /> SC Balance
          </div>
          <div className="text-xl font-bold tabular-nums text-sweeps">{portfolio.scBalance?.toLocaleString() ?? '2,500'}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4 col-span-2 sm:col-span-1">
          <div className="text-2xs text-fg-subtle uppercase tracking-wider mb-2">Unrealized P&L</div>
          <div className={cn('text-xl font-bold tabular-nums', isProfit ? 'text-profit' : 'text-loss')}>
            {isProfit ? '+' : ''}{formatUSD(Math.abs(totalPnl), { compact: false })}
          </div>
        </div>
      </div>

      {/* 30-day chart */}
      <div className="rounded-xl bg-bg-subtle border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Portfolio Value (30d)</h2>
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
                <linearGradient id="portAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tickFormatter={(t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} stroke="#5A6378" fontSize={11} tickLine={false} axisLine={false} width={48} />
              <Tooltip contentStyle={{ background: '#11131A', border: '1px solid #2A3040', borderRadius: 8, fontSize: 12, color: '#F5F7FA' }} formatter={(v: number) => [formatUSD(v, { compact: false }), 'Value']} />
              <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#portAreaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors',
                tab === t ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Active */}
      {tab === 'Active' && (
        <div className="space-y-5">
          {/* Positions table */}
          <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Market</th>
                    <th className="text-right px-4 py-3 font-medium">Shares</th>
                    <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                    <th className="text-right px-4 py-3 font-medium">Current</th>
                    <th className="text-right px-4 py-3 font-medium">Value</th>
                    <th className="text-right px-4 py-3 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {portfolio.positions.map((p) => {
                    const pnl = p.pnl ?? (p.currentPrice - p.avgPrice) * p.shares
                    const value = p.currentPrice * p.shares
                    const pnlPos = pnl >= 0
                    return (
                      <tr key={p.id} className="hover:bg-bg-elevated transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/markets/${p.marketId}`} className="flex items-center gap-2 hover:text-fg transition-colors">
                            <span className="text-base">{p.imageEmoji}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-[200px]">{p.marketTitle}</div>
                              <span className={cn(
                                'inline-flex px-1.5 h-5 rounded text-2xs font-semibold',
                                p.side === 'YES' ? 'bg-yes-soft text-yes' :
                                p.side === 'NO' ? 'bg-no-soft text-no' :
                                'bg-brand-soft text-brand'
                              )}>
                                {p.outcome}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-fg-muted">{p.shares.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCents(p.avgPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCents(p.currentPrice)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatUSD(value, { compact: false })}</td>
                        <td className={cn('px-4 py-3 text-right tabular-nums font-semibold', pnlPos ? 'text-profit' : 'text-loss')}>
                          <div className="flex items-center justify-end gap-1">
                            {pnlPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {pnlPos ? '+' : ''}{formatUSD(Math.abs(pnl), { compact: false })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* PositionCard components */}
          <div>
            <h3 className="text-sm font-semibold text-fg-muted mb-3">Position Cards</h3>
            <div className="space-y-3">
              {portfolio.positions.map((p) => (
                <PositionCard key={p.id} position={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Resolved */}
      {tab === 'Resolved' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-medium text-fg-muted mb-1">No resolved positions yet</p>
          <p className="text-2xs text-fg-subtle">Your resolved positions will appear here after markets settle</p>
        </div>
      )}

      {/* Tab: History */}
      {tab === 'History' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium text-fg-muted mb-1">Trade history coming soon</p>
          <p className="text-2xs text-fg-subtle">Detailed trade history will be available here</p>
          <Link href="/history" className="mt-4 inline-flex h-9 px-4 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium items-center transition-colors">
            View Transaction History
          </Link>
        </div>
      )}
    </div>
  )
}
