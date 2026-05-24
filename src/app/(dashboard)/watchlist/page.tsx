'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookmarkPlus, Eye, Trash2, TrendingUp, BarChart3,
  Filter, ArrowUpDown, Search, X, Users, Clock,
} from 'lucide-react'
import { cn, formatUSD, formatCompact, timeUntil } from '@/lib/utils'
import { markets } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Use first 4 trending markets as "watched" for mock
const INITIAL_WATCHED = markets.filter(m => m.trending).slice(0, 4)

type SortOption = 'recent' | 'volume' | 'closing'

export default function WatchlistPage() {
  const [watchedMarkets, setWatchedMarkets] = useState(INITIAL_WATCHED)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(watchedMarkets.map(m => m.category))
    return Array.from(cats)
  }, [watchedMarkets])

  const filteredMarkets = useMemo(() => {
    let result = watchedMarkets.filter(m => {
      const matchesCategory = filterCategory === 'all' || m.category === filterCategory
      const matchesSearch = !search || m.question.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })

    result.sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'closing') {
        const aDate = a.closeAt ? new Date(a.closeAt).getTime() : Infinity
        const bDate = b.closeAt ? new Date(b.closeAt).getTime() : Infinity
        return aDate - bDate
      }
      // 'recent' - keep original order
      return 0
    })

    return result
  }, [watchedMarkets, filterCategory, sortBy, search])

  const removeFromWatchlist = (marketId: string) => {
    setWatchedMarkets(prev => prev.filter(m => m.id !== marketId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookmarkPlus className="h-6 w-6 text-brand" />
          Watchlist
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Track markets you&apos;re interested in. Get notified of price changes and resolutions.
        </p>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
          <Input
            placeholder="Search your watchlist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-bg-subtle border-border text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-fg-subtle hover:text-fg" />
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 rounded-lg bg-bg-subtle border border-border text-sm text-fg"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-10 px-3 rounded-lg bg-bg-subtle border border-border text-sm text-fg"
        >
          <option value="recent">Recently Added</option>
          <option value="volume">Highest Volume</option>
          <option value="closing">Closing Soon</option>
        </select>
      </div>

      {/* Watchlist Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMarkets.map((market) => {
            const yesOutcome = market.outcomes.find(o => o.label.toLowerCase() === 'yes')
            const topOutcome = market.outcomes[0]
            const isBinary = market.outcomes.length === 2 && market.outcomes[0].label.toLowerCase() === 'yes'
            const price = isBinary ? (yesOutcome?.price ?? topOutcome.price) : topOutcome.price
            const delta = isBinary ? (yesOutcome?.delta7d ?? topOutcome.delta7d) : topOutcome.delta7d
            const deltaPos = delta >= 0

            return (
              <Card
                key={market.id}
                className="bg-bg-subtle border-border hover:border-border-strong transition-all overflow-hidden group"
              >
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start mb-3">
                    <div className={cn(
                      'shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl border border-border',
                      market.imageColor
                    )}>
                      {market.imageEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-2xs text-fg-subtle uppercase tracking-wider font-medium">{market.category}</span>
                        {market.trending && (
                          <Badge variant="secondary" className="bg-no-soft text-no border-no-border text-2xs h-4 px-1.5">
                            Hot
                          </Badge>
                        )}
                      </div>
                      <Link href={`/markets/${market.id}`}>
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 hover:text-brand transition-colors">
                          {market.question}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Price / Probability */}
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold tabular-nums">{Math.round(price * 100)}%</span>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 text-xs font-medium tabular-nums',
                        deltaPos ? 'text-yes' : 'text-no'
                      )}>
                        {deltaPos ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                        {deltaPos ? '+' : ''}{(delta * 100).toFixed(1)}% 7d
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-2xs text-fg-subtle">
                        <BarChart3 className="h-3 w-3" />
                        <span className="tabular-nums">{formatUSD(market.volume)} Vol</span>
                      </div>
                      <div className="flex items-center gap-1 text-2xs text-fg-subtle">
                        <Users className="h-3 w-3" />
                        <span className="tabular-nums">{formatCompact(market.traders)}</span>
                      </div>
                      {market.closeAt && (
                        <div className="flex items-center gap-1 text-2xs text-fg-subtle">
                          <Clock className="h-3 w-3" />
                          <span>{timeUntil(market.closeAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/70">
                    <Link href={`/markets/${market.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-brand hover:bg-brand-hover text-white h-8 text-xs">
                        Trade
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(market.id)}
                      className="h-8 w-8 p-0 text-fg-muted hover:text-no hover:bg-no-soft shrink-0"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="py-20 text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center mb-4">
            <BookmarkPlus className="h-10 w-10 text-fg-subtle opacity-40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {search || filterCategory !== 'all' ? 'No matching markets' : 'Your watchlist is empty'}
          </h3>
          <p className="text-sm text-fg-muted mb-6 max-w-md mx-auto">
            {search || filterCategory !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Start watching markets to track their prices and get notified of changes.'}
          </p>
          <Link href="/markets">
            <Button className="bg-brand hover:bg-brand-hover text-white">
              <Eye className="h-4 w-4 mr-2" /> Browse Markets
            </Button>
          </Link>
        </div>
      )}

      {/* Stats bar */}
      {filteredMarkets.length > 0 && (
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>Showing {filteredMarkets.length} of {watchedMarkets.length} watched markets</span>
          <Link href="/markets" className="text-brand hover:underline flex items-center gap-1">
            Discover more markets <TrendingUp className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
