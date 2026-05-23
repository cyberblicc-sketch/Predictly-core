'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PositionCard } from '@/components/portfolio/PositionCard'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// Mock positions data
const mockPositions = [
  {
    id: 'pos1',
    user_id: 'user1',
    market_id: '1',
    side: 'YES' as const,
    stake: 500,
    entry_price: 0.55,
    current_price: 0.65,
    pnl: 90.91,
    created_at: '2024-02-10',
    market: {
      id: '1',
      title: 'Will AI pass the Turing test by 2025?',
      category: 'Technology',
      close_date: '2025-12-31',
      resolved: false,
      yes_price: 0.65,
      no_price: 0.35,
      volume: 125000,
      participants: 3421,
      created_at: '2024-01-15',
    },
  },
  {
    id: 'pos2',
    user_id: 'user1',
    market_id: '2',
    side: 'NO' as const,
    stake: 300,
    entry_price: 0.60,
    current_price: 0.58,
    pnl: 10.34,
    created_at: '2024-02-15',
    market: {
      id: '2',
      title: 'Will SpaceX land humans on Mars before 2030?',
      category: 'Space',
      close_date: '2029-12-31',
      resolved: false,
      yes_price: 0.42,
      no_price: 0.58,
      volume: 89000,
      participants: 2156,
      created_at: '2024-02-01',
    },
  },
  {
    id: 'pos3',
    user_id: 'user1',
    market_id: '3',
    side: 'YES' as const,
    stake: 1000,
    entry_price: 0.70,
    current_price: 0.78,
    pnl: 114.29,
    created_at: '2024-02-20',
    market: {
      id: '3',
      title: 'Will Bitcoin exceed $100,000 in 2025?',
      category: 'Crypto',
      close_date: '2025-12-31',
      resolved: false,
      yes_price: 0.78,
      no_price: 0.22,
      volume: 256000,
      participants: 5847,
      created_at: '2024-01-20',
    },
  },
]

// Mock stats
const portfolioStats = {
  totalValue: 18450,
  totalPnL: 215.54,
  winRate: 0.72,
  totalTrades: 47,
  bestMarket: 'Bitcoin $100k',
  bestPnL: 350.00,
}

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'open' | 'resolved'>('all')

  const filteredPositions = React.useMemo(() => {
    let positions = mockPositions

    if (filter === 'open') {
      positions = positions.filter(p => !p.market.resolved)
    } else if (filter === 'resolved') {
      positions = positions.filter(p => p.market.resolved)
    }

    if (searchQuery) {
      positions = positions.filter(p =>
        p.market.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return positions
  }, [searchQuery, filter])

  const handleExitPosition = async (positionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Exit position:', positionId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground">Track your positions and P&L</p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{formatCurrency(portfolioStats.totalValue, 'GC')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {portfolioStats.totalPnL >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-profit" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-loss" />
              )}
              <span className={`text-2xl font-bold ${portfolioStats.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {portfolioStats.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioStats.totalPnL, 'GC')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{(portfolioStats.winRate * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{portfolioStats.totalTrades}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer */}
      <Card className="bg-gradient-to-r from-profit/10 to-transparent border-profit/20">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-profit/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-profit" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Performer</p>
              <p className="font-bold">{portfolioStats.bestMarket}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-profit">+{formatCurrency(portfolioStats.bestPnL, 'GC')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'secondary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'open' ? 'secondary' : 'outline'}
            onClick={() => setFilter('open')}
          >
            Open
          </Button>
          <Button
            variant={filter === 'resolved' ? 'secondary' : 'outline'}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-4">
        {filteredPositions.map(position => (
          <PositionCard
            key={position.id}
            position={position}
            onExit={handleExitPosition}
            onViewMarket={(id) => console.log('View market', id)}
          />
        ))}

        {filteredPositions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No positions found</p>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  )
}