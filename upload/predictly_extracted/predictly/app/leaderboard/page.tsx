'use client'

import { useState } from 'react'
import { Crown, Trophy, Medal, Flame, TrendingUp, Award } from 'lucide-react'
import { leaderboard } from '@/lib/mockData'
import { cn, formatUSD, formatCompact } from '@/lib/utils'

const RANGES = ['All time', '30d', '7d', '24h'] as const
const CATEGORIES = ['Overall', 'Politics', 'Crypto', 'Sports', 'Tech'] as const

export default function LeaderboardPage() {
  const [range, setRange] = useState<typeof RANGES[number]>('30d')
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('Overall')

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-warn" />
            Leaderboard
          </h1>
          <p className="text-fg-muted text-sm mt-1">
            Top traders by realized profit and loss.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 p-1 rounded-lg bg-bg-subtle border border-border">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-medium transition-colors',
                  range === r ? 'bg-bg-elevated text-fg' : 'text-fg-muted hover:text-fg'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              'shrink-0 px-3 h-8 rounded-full text-xs font-medium transition-colors',
              cat === c
                ? 'bg-fg text-bg'
                : 'bg-bg-subtle border border-border text-fg-muted hover:text-fg'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 0, 2].map((i) => {
          const r = top3[i]
          if (!r) return null
          const place = r.rank
          const heightCls =
            place === 1 ? 'sm:pt-2 sm:-mb-2' :
            place === 2 ? 'sm:pt-6' : 'sm:pt-8'
          const ring =
            place === 1 ? 'from-yellow-400 to-amber-600' :
            place === 2 ? 'from-slate-300 to-slate-500' : 'from-orange-400 to-amber-700'
          return (
            <div
              key={r.user}
              className={cn(
                'relative rounded-2xl bg-bg-subtle border border-border p-5 text-center flex flex-col items-center',
                heightCls,
                place === 1 && 'ring-1 ring-warn/40'
              )}
            >
              <div className="absolute top-3 right-3 text-2xs font-bold text-fg-subtle">#{place}</div>
              <div className={cn(
                'relative h-16 w-16 rounded-full bg-gradient-to-br p-[2px]',
                ring
              )}>
                <div className="h-full w-full rounded-full bg-bg flex items-center justify-center text-3xl">
                  {r.avatar}
                </div>
                {place === 1 && (
                  <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-warn fill-warn" />
                )}
              </div>
              <div className="mt-2 text-sm font-semibold">{r.user}</div>
              <div className="text-2xs text-fg-subtle flex items-center gap-1 mt-0.5">
                {r.badge === 'whale' && <Award className="h-3 w-3 text-brand" />}
                {r.badge === 'sharp' && <TrendingUp className="h-3 w-3 text-yes" />}
                {r.badge === 'rising' && <Flame className="h-3 w-3 text-no" />}
                {r.badge ? r.badge.charAt(0).toUpperCase() + r.badge.slice(1) : 'Trader'}
              </div>
              <div className="mt-3 text-2xl font-bold tabular-nums text-yes">
                +{formatUSD(r.pnl)}
              </div>
              <div className="mt-1 text-2xs text-fg-muted">
                {(r.winRate * 100).toFixed(0)}% win · {r.positions} positions
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_100px_80px] gap-3 px-4 py-3 text-2xs uppercase tracking-wider text-fg-subtle border-b border-border bg-bg/40">
          <div>Rank</div>
          <div>Trader</div>
          <div className="text-right">Net P&amp;L</div>
          <div className="text-right">Volume</div>
          <div className="text-right">Win rate</div>
          <div className="text-right">Streak</div>
        </div>
        <div className="divide-y divide-border">
          {rest.map((r) => (
            <div
              key={r.user}
              className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_120px_120px_100px_80px] gap-3 px-4 py-3 items-center hover:bg-bg-elevated transition-colors"
            >
              <div className="text-sm font-bold text-fg-muted tabular-nums">
                #{r.rank}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-bg border border-border flex items-center justify-center text-base">
                  {r.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{r.user}</div>
                  {r.badge && (
                    <div className="text-2xs text-fg-subtle inline-flex items-center gap-1">
                      {r.badge === 'whale' && <Award className="h-3 w-3 text-brand" />}
                      {r.badge === 'sharp' && <TrendingUp className="h-3 w-3 text-yes" />}
                      {r.badge === 'rising' && <Flame className="h-3 w-3 text-no" />}
                      {r.badge}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:text-right text-sm font-semibold tabular-nums text-yes col-span-1 md:col-span-1">
                +{formatUSD(r.pnl)}
              </div>
              <div className="hidden md:block text-right text-sm tabular-nums text-fg-muted">
                {formatUSD(r.volume)}
              </div>
              <div className="hidden md:block text-right text-sm tabular-nums">
                {(r.winRate * 100).toFixed(0)}%
              </div>
              <div className="hidden md:flex justify-end items-center gap-1 text-sm tabular-nums">
                <Flame className="h-3.5 w-3.5 text-no" />
                {r.streak}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
