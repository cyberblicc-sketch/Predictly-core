'use client'

import { useState, useMemo } from 'react'
import {
  Trophy, Medal, Crown, Flame, TrendingUp,
  Whale, Crosshair, Rocket,
} from 'lucide-react'
import { leaderboard } from '@/lib/mockData'
import { cn, formatUSD, formatCompact, formatPct } from '@/lib/utils'

const TIME_RANGES = [
  { id: 'all', label: 'All time' },
  { id: '30d', label: '30d' },
  { id: '7d',  label: '7d' },
  { id: '24h', label: '24h' },
] as const

const CATEGORY_PILLS = ['Overall', 'Politics', 'Crypto', 'Sports', 'Tech'] as const

const BADGE_CONFIG = {
  whale: { emoji: '🐋', label: 'Whale', color: 'bg-brand-soft text-brand border-brand/30' },
  sharp: { emoji: '🎯', label: 'Sharp', color: 'bg-yes-soft text-yes border-yes-border' },
  rising: { emoji: '🚀', label: 'Rising', color: 'bg-gold-soft text-gold border-gold-border' },
} as const

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<string>('all')
  const [category, setCategory] = useState<string>('Overall')

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  // Podium order: 2nd (left), 1st (center), 3rd (right)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold-border">
          <Trophy className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-fg-muted mt-0.5">Top traders on Predictly</p>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex gap-1 p-1 rounded-lg bg-bg-subtle border border-border w-fit">
        {TIME_RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id)}
            className={cn(
              'px-3 h-8 rounded-md text-xs font-medium transition-colors',
              timeRange === r.id ? 'bg-bg-elevated text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORY_PILLS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-all',
              category === cat
                ? 'bg-fg text-bg shadow-sm'
                : 'bg-bg-subtle text-fg-muted hover:text-fg border border-border'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {podiumOrder.map((entry, idx) => {
          const rank = entry.rank
          const isFirst = rank === 1
          const podiumHeight = isFirst ? 'h-48' : rank === 2 ? 'h-40' : 'h-36'
          const badgeInfo = entry.badge ? BADGE_CONFIG[entry.badge] : null

          return (
            <div key={entry.rank} className="flex flex-col items-center">
              {/* Avatar */}
              <div className={cn(
                'relative mb-3',
                isFirst ? 'h-20 w-20' : 'h-16 w-16'
              )}>
                <div className={cn(
                  'h-full w-full rounded-2xl flex items-center justify-center text-3xl border-2 shadow-lg',
                  isFirst
                    ? 'bg-gradient-to-br from-gold/30 to-gold/10 border-gold text-4xl'
                    : rank === 2
                      ? 'bg-gradient-to-br from-fg-subtle/20 to-fg-subtle/5 border-fg-subtle/40'
                      : 'bg-gradient-to-br from-amber-700/20 to-amber-800/5 border-amber-700/40'
                )}>
                  {entry.avatar}
                </div>
                {/* Rank badge */}
                <div className={cn(
                  'absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-bg',
                  isFirst ? 'bg-gold text-bg' :
                  rank === 2 ? 'bg-fg-subtle text-bg' :
                  'bg-amber-700 text-bg'
                )}>
                  {rank}
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-2">
                <div className={cn('font-bold', isFirst ? 'text-base' : 'text-sm')}>
                  {entry.user}
                </div>
                {badgeInfo && (
                  <span className={cn(
                    'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-medium border mt-1',
                    badgeInfo.color
                  )}>
                    {badgeInfo.emoji} {badgeInfo.label}
                  </span>
                )}
              </div>

              {/* Podium block */}
              <div className={cn(
                'w-full rounded-t-xl flex flex-col items-center justify-end pb-4 px-3',
                podiumHeight,
                isFirst
                  ? 'bg-gradient-to-t from-gold/20 to-gold/5 border border-gold-border'
                  : rank === 2
                    ? 'bg-gradient-to-t from-fg-subtle/10 to-fg-subtle/5 border border-fg-subtle/20'
                    : 'bg-gradient-to-t from-amber-800/15 to-amber-800/5 border border-amber-700/20'
              )}>
                <div className={cn(
                  'font-bold tabular-nums',
                  isFirst ? 'text-lg text-gold' : 'text-base'
                )}>
                  {formatUSD(entry.pnl)}
                </div>
                <div className="text-2xs text-fg-muted">Net P&L</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full leaderboard table */}
      <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium w-16">Rank</th>
                <th className="text-left px-4 py-3 font-medium">Trader</th>
                <th className="text-right px-4 py-3 font-medium">Net P&L</th>
                <th className="text-right px-4 py-3 font-medium">Volume</th>
                <th className="text-right px-4 py-3 font-medium">Win Rate</th>
                <th className="text-right px-4 py-3 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.map((entry) => {
                const badgeInfo = entry.badge ? BADGE_CONFIG[entry.badge] : null
                return (
                  <tr key={entry.rank} className="hover:bg-bg-elevated transition-colors">
                    <td className="px-4 py-3">
                      <div className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
                        entry.rank === 1 ? 'bg-gold/20 text-gold' :
                        entry.rank === 2 ? 'bg-fg-subtle/15 text-fg-subtle' :
                        entry.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                        'bg-bg text-fg-muted'
                      )}>
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center text-base border border-border shrink-0',
                          'bg-bg'
                        )}>
                          {entry.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{entry.user}</div>
                          {badgeInfo && (
                            <span className={cn(
                              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-2xs font-medium border',
                              badgeInfo.color
                            )}>
                              {badgeInfo.emoji} {badgeInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-profit">
                      +{formatUSD(entry.pnl)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-fg-muted">
                      {formatUSD(entry.volume)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={cn(
                        'font-medium',
                        entry.winRate >= 0.7 ? 'text-yes' :
                        entry.winRate >= 0.6 ? 'text-fg' : 'text-fg-muted'
                      )}>
                        {formatPct(entry.winRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {entry.streak >= 5 && <Flame className="h-3.5 w-3.5 text-no" />}
                        <span className="tabular-nums font-medium">{entry.streak}🔥</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
