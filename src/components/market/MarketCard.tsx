'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Flame,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import type { Market, MarketOutcome } from '@/types'
import { histories } from '@/lib/mockData'
import { formatUSD, formatCompact, cn } from '@/lib/utils'
import { Sparkline } from './Sparkline'

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const isBinary =
    market.outcomes.length === 2 &&
    market.outcomes[0].label.toLowerCase() === 'yes' &&
    market.outcomes[1].label.toLowerCase() === 'no'

  const yesOutcome = market.outcomes.find(
    (o) => o.label.toLowerCase() === 'yes'
  )
  const yesPrice = yesOutcome?.price ?? market.outcomes[0].price
  const yesDelta = yesOutcome?.delta7d ?? market.outcomes[0].delta7d
  const history = histories[market.id] || []

  return (
    <Link
      href={`/markets/${market.id}`}
      className="group relative flex flex-col rounded-xl bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-1.5 z-10">
        {market.trending && (
          <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-no-soft border border-no-border text-no text-2xs font-medium">
            <Flame className="h-3 w-3" /> Hot
          </span>
        )}
        {market.isNew && (
          <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-brand-soft border border-brand/30 text-brand-hover text-2xs font-medium">
            <Sparkles className="h-3 w-3" /> New
          </span>
        )}
      </div>

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex gap-3 items-start">
          <div
            className={cn(
              'shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl border border-border',
              market.imageColor
            )}
          >
            {market.imageEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xs text-fg-subtle uppercase tracking-wider font-medium mb-1">
              {market.category}
            </div>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-fg transition-colors">
              {market.question}
            </h3>
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="px-4 pb-3 flex-1">
        {isBinary ? (
          <BinaryOutcomes
            yesPrice={yesPrice}
            yesDelta={yesDelta}
            history={history}
          />
        ) : (
          <MultiOutcomeList outcomes={market.outcomes.slice(0, 4)} />
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 border-t border-border/70 flex items-center gap-3 text-2xs text-fg-subtle">
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          <span className="tabular-nums">{formatUSD(market.volume)} Vol</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span className="tabular-nums">{formatCompact(market.traders)}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="live-dot" />
          <span>Live</span>
        </div>
      </div>
    </Link>
  )
}

/* ────── Internal sub-components ────── */

function BinaryOutcomes({
  yesPrice,
  yesDelta,
  history,
}: {
  yesPrice: number
  yesDelta: number
  history: { t: number; price: number }[]
}) {
  const pct = Math.round(yesPrice * 100)
  const deltaPos = yesDelta >= 0

  return (
    <div className="space-y-3">
      {/* Big probability + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums">{pct}%</span>
            <span className="text-xs text-fg-muted">chance</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium tabular-nums mt-0.5',
              deltaPos ? 'text-yes' : 'text-no'
            )}
          >
            {deltaPos ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {deltaPos ? '+' : ''}
            {(yesDelta * 100).toFixed(1)}% 7d
          </div>
        </div>
        <div className="opacity-90">
          <Sparkline data={history} positive={deltaPos} width={100} height={32} />
        </div>
      </div>

      {/* YES / NO buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="h-9 rounded-md bg-yes-soft border border-yes-border text-yes text-sm font-semibold hover:bg-yes hover:text-bg transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          Yes {Math.round(yesPrice * 100)}¢
        </button>
        <button
          className="h-9 rounded-md bg-no-soft border border-no-border text-no text-sm font-semibold hover:bg-no hover:text-bg transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          No {Math.round((1 - yesPrice) * 100)}¢
        </button>
      </div>
    </div>
  )
}

function MultiOutcomeList({
  outcomes,
}: {
  outcomes: MarketOutcome[]
}) {
  return (
    <ul className="space-y-1.5">
      {outcomes.map((o) => {
        const pct = Math.round(o.price * 100)
        const deltaPos = o.delta7d >= 0
        return (
          <li key={o.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 truncate text-fg-muted">{o.label}</span>
            <span
              className={cn(
                'tabular-nums text-2xs',
                deltaPos ? 'text-yes' : 'text-no'
              )}
            >
              {deltaPos ? '▲' : '▼'}
              {Math.abs(o.delta7d * 100).toFixed(0)}
            </span>
            <span className="tabular-nums font-semibold text-fg w-9 text-right">
              {pct}%
            </span>
            <button
              className="px-2 h-6 rounded text-2xs font-semibold bg-yes-soft text-yes border border-yes-border hover:bg-yes hover:text-bg transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              {pct}¢
            </button>
          </li>
        )
      })}
    </ul>
  )
}
