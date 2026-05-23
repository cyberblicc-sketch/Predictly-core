'use client'

import { useMemo, useState } from 'react'
import { Search, Filter, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { CategoryStrip } from '@/components/layout/CategoryStrip'
import { MarketCard } from '@/components/market/MarketCard'
import { ActivityFeed } from '@/components/market/ActivityFeed'
import { markets, activity } from '@/lib/mockData'
import { cn, formatUSD, formatPct } from '@/lib/utils'

const SORTS = [
  { id: 'volume',  label: 'Volume' },
  { id: 'traders', label: 'Traders' },
  { id: 'new',     label: 'Newest' },
  { id: 'closing', label: 'Closing soon' },
] as const

export default function MarketsPage() {
  const [category, setCategory] = useState<string>('All')
  const [sort, setSort] = useState<typeof SORTS[number]['id']>('volume')
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = markets
    if (category !== 'All') list = list.filter((m) => m.category === category)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(
        (m) => m.question.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    list = [...list].sort((a, b) => {
      if (sort === 'volume') return b.volume - a.volume
      if (sort === 'traders') return b.traders - a.traders
      if (sort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime()
    })
    return list
  }, [category, sort, query])

  // Top movers: markets with highest absolute 7d delta
  const topMovers = useMemo(() => {
    return [...markets]
      .map((m) => {
        const yesOutcome = m.outcomes.find((o) => o.label.toLowerCase() === 'yes')
        const delta = yesOutcome?.delta7d ?? m.outcomes[0].delta7d
        return { market: m, delta }
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 5)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-sm text-fg-muted mt-1">Browse and trade on prediction markets</p>
      </div>

      <CategoryStrip active={category} onChange={setCategory} />

      {/* Search + Sort + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-bg-subtle border border-border text-sm focus:outline-none focus:border-brand placeholder:text-fg-subtle"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-bg-subtle border border-border">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                'px-3 h-8 rounded-md text-xs font-medium transition-colors',
                sort === s.id ? 'bg-bg-elevated text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'h-10 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition-colors',
            showFilters
              ? 'bg-brand-soft border-brand/40 text-brand-hover'
              : 'bg-bg-subtle border-border text-fg-muted hover:text-fg hover:border-border-strong'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Main content + Sidebar */}
      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        {/* Markets grid */}
        <div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-border bg-bg-subtle p-12 text-center text-fg-muted">
              <BarChart3 className="mx-auto h-10 w-10 opacity-40 mb-3" />
              <p className="font-medium mb-1">No markets found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        {/* Sidebar: Activity + Top Movers */}
        <aside className="space-y-5">
          <ActivityFeed limit={7} />

          {/* Top Movers */}
          <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yes" />
                Top Movers
              </h3>
            </div>
            <ul className="divide-y divide-border">
              {topMovers.map(({ market: m, delta }) => {
                const pos = delta >= 0
                return (
                  <li key={m.id}>
                    <a
                      href={`/markets/${m.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-elevated transition-colors"
                    >
                      <div className={cn(
                        'shrink-0 h-8 w-8 rounded-md bg-gradient-to-br flex items-center justify-center text-base border border-border',
                        m.imageColor
                      )}>
                        {m.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{m.shortTitle}</div>
                        <div className="text-2xs text-fg-subtle">{formatUSD(m.volume)} vol</div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-0.5 text-xs font-semibold tabular-nums shrink-0',
                        pos ? 'text-yes' : 'text-no'
                      )}>
                        {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {pos ? '+' : ''}{(delta * 100).toFixed(1)}%
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
