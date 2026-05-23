'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TradeForm } from '@/components/trade/TradeForm'
import { ProbabilityChart } from '@/components/market/ProbabilityChart'
import { PositionCard } from '@/components/portfolio/PositionCard'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Share2,
  Users,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

// Mock market data
const mockMarket = {
  id: '1',
  title: 'Will AI pass the Turing test by 2025?',
  description: 'This market resolves YES if artificial intelligence systems can convincingly mimic human behavior to pass a comprehensive Turing test evaluation before December 31, 2025.',
  category: 'Technology',
  subcategory: 'AI & Machine Learning',
  close_date: '2025-12-31',
  resolved: false,
  resolution: null,
  yes_price: 0.65,
  no_price: 0.35,
  volume: 125000,
  participants: 3421,
  created_at: '2024-01-15',
  creator_id: 'system',
}

// Mock chart data
const chartData = [
  { timestamp: 'Jan 15', price: 0.52 },
  { timestamp: 'Jan 22', price: 0.55 },
  { timestamp: 'Jan 29', price: 0.51 },
  { timestamp: 'Feb 5', price: 0.58 },
  { timestamp: 'Feb 12', price: 0.62 },
  { timestamp: 'Feb 19', price: 0.60 },
  { timestamp: 'Feb 26', price: 0.65 },
]

// Mock user positions
const userPositions = [
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
    market: mockMarket,
  },
]

export default function MarketDetailPage() {
  const params = useParams()
  const marketId = params.id as string

  const handleTrade = async (side: 'YES' | 'NO', amount: number, currency: 'GC' | 'SC') => {
    // Simulated trade execution
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Trade executed:', { marketId, side, amount, currency })
  }

  const handleExitPosition = async (positionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Position exited:', positionId)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/markets">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Link>
      </Button>

      {/* Market Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-3">
          <Badge variant="outline">{mockMarket.category}</Badge>
          <h1 className="text-3xl font-bold">{mockMarket.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{mockMarket.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Closes {formatDate(mockMarket.close_date)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {mockMarket.participants.toLocaleString()} traders
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {formatCurrency(mockMarket.volume, 'GC')} volume
            </div>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Odds Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Odds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-profit/10 rounded-lg border border-profit/20">
                  <p className="text-sm text-muted-foreground mb-2">YES</p>
                  <p className="text-4xl font-bold text-profit">
                    {(mockMarket.yes_price * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatCurrency(mockMarket.yes_price, 'GC')}
                  </p>
                </div>
                <div className="text-center p-6 bg-loss/10 rounded-lg border border-loss/20">
                  <p className="text-sm text-muted-foreground mb-2">NO</p>
                  <p className="text-4xl font-bold text-loss">
                    {(mockMarket.no_price * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatCurrency(mockMarket.no_price, 'GC')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Probability Chart */}
          <ProbabilityChart data={chartData} title="Price History" />

          {/* Market Info */}
          <Card>
            <CardHeader>
              <CardTitle>Market Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(mockMarket.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{mockMarket.category} / {mockMarket.subcategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Liquidity</p>
                  <p className="font-medium">{formatCurrency(mockMarket.volume * 0.3, 'GC')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Trade Size</p>
                  <p className="font-medium">{formatCurrency(mockMarket.volume / mockMarket.participants, 'GC')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Positions */}
          {userPositions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userPositions.map(position => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onExit={handleExitPosition}
                    onViewMarket={(id) => console.log('View market', id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Trade Form */}
        <div className="space-y-6">
          <TradeForm
            marketId={marketId}
            currentOdds={{ yes: mockMarket.yes_price, no: mockMarket.no_price }}
            onTrade={handleTrade}
          />

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Markets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/markets/2" className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                <span className="text-sm">SpaceX Mars landing by 2030</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/markets/3" className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                <span className="text-sm">Bitcoin $100k by 2025</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/markets/5" className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                <span className="text-sm">Apple VR headset sales</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Disclaimer />
    </div>
  )
}