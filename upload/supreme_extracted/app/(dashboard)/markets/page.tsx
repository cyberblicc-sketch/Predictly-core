'use client'

import * as React from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MarketCard } from '@/components/market/MarketCard'
import { Disclaimer } from '@/components/layout/Disclaimer'
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  TrendingUp,
} from 'lucide-react'

// Mock markets data
const allMarkets = [
  { id: '1', title: 'Will AI pass the Turing test by 2025?', category: 'Technology', close_date: '2025-12-31', resolved: false, yes_price: 0.65, no_price: 0.35, volume: 125000, participants: 3421, created_at: '2024-01-15' },
  { id: '2', title: 'Will SpaceX land humans on Mars before 2030?', category: 'Space', close_date: '2029-12-31', resolved: false, yes_price: 0.42, no_price: 0.58, volume: 89000, participants: 2156, created_at: '2024-02-01' },
  { id: '3', title: 'Will Bitcoin exceed $100,000 in 2025?', category: 'Crypto', close_date: '2025-12-31', resolved: false, yes_price: 0.78, no_price: 0.22, volume: 256000, participants: 5847, created_at: '2024-01-20' },
  { id: '4', title: 'Will a COVID variant cause new lockdowns in 2024?', category: 'Health', close_date: '2024-12-31', resolved: false, yes_price: 0.15, no_price: 0.85, volume: 45000, participants: 1234, created_at: '2024-01-10' },
  { id: '5', title: 'Will Apple's VR headset sell 1M units in year one?', category: 'Technology', close_date: '2024-06-30', resolved: false, yes_price: 0.35, no_price: 0.65, volume: 67000, participants: 1876, created_at: '2024-02-15' },
  { id: '6', title: 'Will Ethereum flip Bitcoin market cap in 2025?', category: 'Crypto', close_date: '2025-12-31', resolved: false, yes_price: 0.12, no_price: 0.88, volume: 134000, participants: 4231, created_at: '2024-01-25' },
  { id: '7', title: 'Will US unemployment exceed 6% in 2024?', category: 'Economics', close_date: '2024-12-31', resolved: false, yes_price: 0.28, no_price: 0.72, volume: 89000, participants: 2345, created_at: '2024-02-05' },
  { id: '8', title: 'Will Taylor Swift's Eras Tour gross $2B?', category: 'Entertainment', close_date: '2024-12-31', resolved: false, yes_price: 0.92, no_price: 0.08, volume: 345000, participants: 8765, created_at: '2024-02-20' },
]

const categories = ['All', 'Technology', 'Crypto', 'Politics', 'Sports', 'Economics', 'Entertainment', 'Health', 'Space']

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [sortBy, setSortBy] = React.useState<'volume' | 'participants' | 'close_date'>('volume')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [visibleCount, setVisibleCount] = React.useState(8)

  const filteredMarkets = React.useMemo(() => {
    let markets = allMarkets

    if (searchQuery) {
      markets = markets.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'All') {
      markets = markets.filter(m => m.category === selectedCategory)
    }

    markets = [...markets].sort((a, b) => {
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'participants') return b.participants - a.participants
      return new Date(a.close_date).getTime() - new Date(b.close_date).getTime()
    })

    return markets
  }, [searchQuery, selectedCategory, sortBy])

  const visibleMarkets = filteredMarkets.slice(0, visibleCount)
  const hasMore = visibleCount < filteredMarkets.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Markets</h1>
        <p className="text-muted-foreground">Browse and trade on prediction markets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="volume">Sort by Volume</option>
            <option value="participants">Sort by Traders</option>
            <option value="close_date">Sort by Close Date</option>
          </select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {visibleMarkets.length} of {filteredMarkets.length} markets
      </p>

      {/* Markets Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'space-y-4'
      }>
        {visibleMarkets.map(market => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount(prev => prev + 8)}
          >
            Load More Markets
          </Button>
        </div>
      )}

      {filteredMarkets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No markets found matching your criteria</p>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}