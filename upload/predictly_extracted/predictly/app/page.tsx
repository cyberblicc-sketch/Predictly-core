'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart3, Search, Filter, ChevronDown } from 'lucide-react'
import { CategoryStrip } from '@/components/layout/CategoryStrip'
import { MarketCard } from '@/components/market/MarketCard'
import { ActivityFeed } from '@/components/market/ActivityFeed'
import { markets } from '@/lib/mockData'
import { formatUSD, formatCompact, cn } from '@/lib/utils'

const SORTS = [
  { id: 'volume',   label: 'Volume' },
  { id: 'traders',  label: 'Traders' },
  { id: 'new',      label: 'Newest' },
  { id: 'closing',  label: 'Closing soon' },
] as const

export default function HomePage() {
  const [category, setCategory] = useState<string>('All')
  const [sort, setSort] = useState<typeof SORTS[number]['id']>('volume')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = markets
    if (category !== 'All') list = list.filter((m) => m.category === category)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        (m) =>
          m.question.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    list = [...list].sort((a, b) => {
      if (sort === 'volume') return b.volume - a.volume
      if (sort === 'traders') return b.traders - a.traders
      if (sort === 'new')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime()
    })
    return list
  }, [category, sort, query])

  const featured = markets[0]
  const totalVolume = markets.reduce((s, m) => s + m.volume, 0)
  const totalTraders = markets.reduce((s, m) => s + m.traders, 0)

  return (
    <>
      {/* Hero strip */}
      <section className="border-b border-border bg-gradient-to-b from-bg to-bg-subtle/30">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-brand-soft border border-brand/20 text-brand-hover text-xs font-medium mb-4">
                <span className="live-dot !bg-brand" />
                Markets are open · 24/7
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
                Trade on what&apos;s next.{' '}
                <span className="gradient-text">Bet on the truth.</span>
              </h1>
              <p className="mt-4 text-fg-muted max-w-xl text-lg leading-relaxed">
                Predict outcomes in politics, crypto, sports, and tech. Real money,
                real-world events, settled by verifiable sources.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#markets"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-brand hover:bg-brand-hover text-white font-semibold text-sm transition-colors"
                >
                  Browse markets <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-fg font-semibold text-sm transition-colors"
                >
                  Leaderboard
                </Link>
              </div>

              {/* Live stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Total volume" value={formatUSD(totalVolume)} />
                <Stat label="Traders" value={formatCompact(totalTraders)} />
                <Stat label="Open markets" value={String(markets.length)} />
              </div>
            </div>

            {/* Featured market card */}
            <FeaturedMarket market={featured} />
          </div>
        </div>
      </section>

      {/* Category strip — sticky */}
      <CategoryStrip active={category} onChange={setCategory} />

      {/* Toolbar: search + sort */}
      <section id="markets" className="mx-auto max-w-[1400px] px-4 sm:px-6 pt-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-bg-subtle border border-border text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-bg-subtle border border-border">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-medium transition-colors',
                  sort === s.id
                    ? 'bg-bg-elevated text-fg'
                    : 'text-fg-muted hover:text-fg'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button className="h-10 px-3 rounded-lg bg-bg-subtle border border-border text-sm text-fg-muted hover:text-fg flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Markets grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {category === 'All' ? 'Trending markets' : `${category} markets`}
                <span className="ml-2 text-fg-subtle text-sm font-normal">
                  · {filtered.length}
                </span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-border bg-bg-subtle p-12 text-center text-fg-muted">
                <BarChart3 className="mx-auto h-10 w-10 opacity-40 mb-3" />
                No markets match those filters yet.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <ActivityFeed limit={7} />

            <div className="rounded-xl bg-bg-subtle border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Top movers (24h)</h3>
              <ul className="space-y-2.5">
                {[...markets]
                  .sort((a, b) => {
                    const da = Math.abs(a.outcomes[0].delta7d)
                    const db = Math.abs(b.outcomes[0].delta7d)
                    return db - da
                  })
                  .slice(0, 5)
                  .map((m) => {
                    const o = m.outcomes[0]
                    const pos = o.delta7d >= 0
                    return (
                      <li key={m.id}>
                        <Link
                          href={`/markets/${m.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <div className={cn(
                            'h-8 w-8 rounded-md bg-gradient-to-br flex items-center justify-center text-base shrink-0',
                            m.imageColor
                          )}>
                            {m.imageEmoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate group-hover:text-fg">
                              {m.shortTitle}
                            </div>
                            <div className="text-2xs text-fg-subtle">
                              {Math.round(o.price * 100)}¢
                            </div>
                          </div>
                          <span className={cn(
                            'text-xs tabular-nums font-semibold',
                            pos ? 'text-yes' : 'text-no'
                          )}>
                            {pos ? '+' : ''}{(o.delta7d * 100).toFixed(0)}%
                          </span>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-subtle/60 border border-border px-3 py-2">
      <div className="text-2xs text-fg-subtle uppercase tracking-wider">{label}</div>
      <div className="text-base font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}

function FeaturedMarket({ market }: { market: typeof markets[number] }) {
  return (
    <Link
      href={`/markets/${market.id}`}
      className="block w-full lg:w-[360px] rounded-2xl bg-bg-subtle border border-border p-5 hover:border-brand/50 transition-colors shadow-card"
    >
      <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-3">
        <TrendingUp className="h-3.5 w-3.5 text-no" /> Most traded today
      </div>
      <div className="flex gap-3 items-start mb-4">
        <div className={cn(
          'h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl border border-border shrink-0',
          market.imageColor
        )}>
          {market.imageEmoji}
        </div>
        <h3 className="text-base font-semibold leading-snug">{market.question}</h3>
      </div>
      <ul className="space-y-2">
        {market.outcomes.slice(0, 4).map((o) => (
          <li key={o.id} className="flex items-center gap-3">
            <span className="flex-1 text-sm text-fg-muted truncate">{o.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-bg overflow-hidden max-w-[120px]">
              <div
                className="h-full bg-gradient-to-r from-brand to-yes"
                style={{ width: `${o.price * 100}%` }}
              />
            </div>
            <span className="tabular-nums font-semibold text-sm w-10 text-right">
              {Math.round(o.price * 100)}%
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-2xs text-fg-subtle">
        <span>{formatUSD(market.volume)} volume</span>
        <span className="text-brand-hover font-medium inline-flex items-center gap-1">
          View market <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
