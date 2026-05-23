'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MarketCard } from '@/components/market/MarketCard'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ChevronRight,
  Gift,
} from 'lucide-react'

// Mock user data
const userStats = {
  gold_balance: 50000,
  sweeps_balance: 2500,
  totalPnL: 12450,
  todayPnL: 850,
  openPositions: 12,
  winRate: 0.68,
}

// Mock data
const featuredMarkets = [
  {
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
  {
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
]

const recentActivity = [
  { id: '1', type: 'trade', description: 'Bought YES on Bitcoin $100k', amount: -500, time: '5m ago' },
  { id: '2', type: 'win', description: 'Won position on AI Turing Test', amount: 1200, time: '1h ago' },
  { id: '3', type: 'deposit', description: 'Deposited 10,000 GC', amount: 10000, time: '3h ago' },
]

const topMovers = [
  { market: 'Fed rate cut 2024', change: '+15%', direction: 'up' },
  { market: 'Ethereum ETF approval', change: '+8%', direction: 'up' },
  { market: 'Climate bill passed', change: '-12%', direction: 'down' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, TraderPro!</h1>
          <p className="text-muted-foreground">Here's your trading overview</p>
        </div>
        <Button asChild>
          <Link href="/markets">Place Trade</Link>
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gold Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gold">🪙</span>
              <span className="text-2xl font-bold">{userStats.gold_balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sweeps Coins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-sweeps">💎</span>
              <span className="text-2xl font-bold">{userStats.sweeps_balance.toLocaleString()}</span>
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
              {userStats.totalPnL >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-profit" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-loss" />
              )}
              <span className={`text-2xl font-bold ${userStats.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {userStats.totalPnL >= 0 ? '+' : ''}{formatCurrency(userStats.totalPnL, 'GC')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {userStats.todayPnL >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-profit" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-loss" />
              )}
              <span className={`text-2xl font-bold ${userStats.todayPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {userStats.todayPnL >= 0 ? '+' : ''}{formatCurrency(userStats.todayPnL, 'GC')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{userStats.openPositions}</p>
                <p className="text-sm text-muted-foreground">Open Positions</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">{(userStats.winRate * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-3xl font-bold">847</p>
                <p className="text-sm text-muted-foreground">Total Trades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Movers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Movers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topMovers.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{item.market}</span>
                <Badge variant={item.direction === 'up' ? 'success' : 'danger'}>
                  {item.change}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" asChild>
            <Link href="/history">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.amount >= 0 ? 'bg-profit/10' : 'bg-loss/10'
                  }`}>
                    {activity.amount >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-profit" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-loss" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`font-medium ${activity.amount >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {activity.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount), 'GC')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Markets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Markets</h2>
          <Button variant="outline" asChild>
            <Link href="/markets">Browse All</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>

      {/* Referral Banner */}
      <Card className="bg-gradient-to-r from-primary/20 to-sweeps/20 border-primary/30">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Gift className="w-10 h-10 text-primary" />
            <div>
              <h3 className="font-bold text-lg">Invite Friends & Earn</h3>
              <p className="text-sm text-muted-foreground">
                Get 20 SC + 20,000 GOLD when your friend deposits
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/referrals">Invite Now</Link>
          </Button>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}