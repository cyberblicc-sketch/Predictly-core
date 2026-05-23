'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { formatCurrency } from '@/lib/utils'
import {
  Trophy,
  Medal,
  Crown,
  Search,
  TrendingUp,
  Flame,
} from 'lucide-react'

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, user_id: 'user1', username: 'CryptoKing', avatar_url: null, total_winnings: 125000, win_rate: 0.78, trades: 542 },
  { rank: 2, user_id: 'user2', username: 'PredictionMaster', avatar_url: null, total_winnings: 98500, win_rate: 0.72, trades: 421 },
  { rank: 3, user_id: 'user3', username: 'TrendWatcher', avatar_url: null, total_winnings: 87400, win_rate: 0.69, trades: 389 },
  { rank: 4, user_id: 'user4', username: 'MarketShark', avatar_url: null, total_winnings: 76200, win_rate: 0.65, trades: 312 },
  { rank: 5, user_id: 'user5', username: 'ProTrader99', avatar_url: null, total_winnings: 65800, win_rate: 0.68, trades: 287 },
  { rank: 6, user_id: 'user6', username: 'AlphaSeeker', avatar_url: null, total_winnings: 54300, win_rate: 0.64, trades: 234 },
  { rank: 7, user_id: 'user7', username: 'InsightHunter', avatar_url: null, total_winnings: 47600, win_rate: 0.62, trades: 198 },
  { rank: 8, user_id: 'user8', username: 'DataDriven', avatar_url: null, total_winnings: 41200, win_rate: 0.61, trades: 176 },
  { rank: 9, user_id: 'user9', username: 'FutureForesight', avatar_url: null, total_winnings: 35800, win_rate: 0.59, trades: 165 },
  { rank: 10, user_id: 'user10', username: 'OddsOptimizer', avatar_url: null, total_winnings: 32400, win_rate: 0.58, trades: 145 },
  { rank: 11, user_id: 'user11', username: 'TraderPro', avatar_url: null, total_winnings: 28900, win_rate: 0.56, trades: 128 },
  { rank: 12, user_id: 'user12', username: 'MarketMaven', avatar_url: null, total_winnings: 24500, win_rate: 0.55, trades: 112 },
]

const categories = [
  { id: 'all', label: 'All Time', icon: Trophy },
  { id: 'monthly', label: 'This Month', icon: Flame },
  { id: 'weekly', label: 'This Week', icon: TrendingUp },
]

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')

  const filteredLeaderboard = React.useMemo(() => {
    if (!searchQuery) return leaderboardData
    return leaderboardData.filter(entry =>
      entry.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return null
    }
  }

  const currentUserRank = leaderboardData.findIndex(e => e.username === 'TraderPro') + 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Top traders ranked by total winnings</p>
      </div>

      {/* Your Rank */}
      <Card className="bg-gradient-to-r from-primary/20 to-transparent border-primary/30">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">#{currentUserRank}</span>
            </div>
            <div>
              <p className="font-bold">Your Rank</p>
              <p className="text-sm text-muted-foreground">TraderPro</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-profit">+{formatCurrency(28900, 'GC')}</p>
            <p className="text-sm text-muted-foreground">Total Winnings</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'secondary' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search traders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Trader</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Winnings</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Win Rate</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Trades</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((entry) => (
                  <tr
                    key={entry.user_id}
                    className={`border-b last:border-0 ${
                      entry.username === 'TraderPro' ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank) || (
                          <span className="w-8 text-center font-medium">{entry.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={entry.username}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="font-medium">{entry.username[0]}</span>
                          )}
                        </div>
                        <span className="font-medium">
                          {entry.username}
                          {entry.username === 'TraderPro' && (
                            <Badge variant="secondary" className="ml-2">You</Badge>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-profit">
                        {formatCurrency(entry.total_winnings, 'GC')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant={entry.win_rate >= 0.6 ? 'success' : 'secondary'}>
                        {(entry.win_rate * 100).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-muted-foreground">
                      {entry.trades}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  )
}