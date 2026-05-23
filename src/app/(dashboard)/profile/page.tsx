'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  User, Shield, Mail, Calendar, Copy, Check, ExternalLink,
  Twitter, Globe, Wallet, Crown, Award, Star, Zap,
  TrendingUp, BarChart3, Target, Briefcase, Edit3,
  Gift, Bell, Lock, Settings, Download, Eye, Filter,
  Search, ChevronLeft, ChevronRight, BookmarkPlus,
  ArrowUpDown,
} from 'lucide-react'
import { cn, formatDate, formatUSD, formatPct } from '@/lib/utils'
import { mockUser, portfolio, transactions, markets } from '@/lib/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const TABS = ['Overview', 'Trade History', 'Watchlist', 'Settings', 'Notifications', 'Security'] as const
type TabName = (typeof TABS)[number]

const ACHIEVEMENTS = [
  { emoji: '🎯', title: 'First Trade', desc: 'Made your first prediction', unlocked: true },
  { emoji: '🔥', title: 'Hot Streak', desc: '5 wins in a row', unlocked: true },
  { emoji: '🐋', title: 'Whale', desc: 'Traded over $10K volume', unlocked: true },
  { emoji: '🏆', title: 'Champion', desc: 'Won a resolved market', unlocked: true },
  { emoji: '💎', title: 'Diamond Hands', desc: 'Held a position for 30+ days', unlocked: false },
  { emoji: '🧠', title: 'Sharp', desc: 'Win rate above 70%', unlocked: false },
]

const QUICK_ACTIONS = [
  { href: '/portfolio', icon: Briefcase, label: 'View Portfolio' },
  { href: '/history', icon: BarChart3, label: 'Transaction History' },
  { href: '/referrals', icon: Gift, label: 'Refer a Friend' },
  { href: '/kyc', icon: Shield, label: 'KYC Verification' },
]

// Mock trade history data
const MOCK_TRADES = [
  { id: 'th1', date: '2026-03-10T14:20:00Z', market: 'Will Bitcoin reach $200,000 by end of 2026?', side: 'YES' as const, amount: 5000, currency: 'GC' as const, entryPrice: 0.51, currentPrice: 0.62, pnl: 462, status: 'OPEN' as const },
  { id: 'th2', date: '2026-03-10T12:15:00Z', market: 'GPT-5 before July 2026', side: 'YES' as const, amount: 2500, currency: 'SC' as const, entryPrice: 0.62, currentPrice: 0.71, pnl: 108, status: 'OPEN' as const },
  { id: 'th3', date: '2026-03-06T15:45:00Z', market: '2028 US Presidential Election', side: 'JD Vance' as const, amount: 1800, currency: 'GC' as const, entryPrice: 0.28, currentPrice: 0.34, pnl: 108, status: 'OPEN' as const },
  { id: 'th4', date: '2026-03-01T08:30:00Z', market: 'Russia–Ukraine ceasefire 2026', side: 'YES' as const, amount: 2100, currency: 'SC' as const, entryPrice: 0.35, currentPrice: 0.41, pnl: 126, status: 'OPEN' as const },
  { id: 'th5', date: '2026-02-28T11:20:00Z', market: 'Super Bowl LX', side: 'Chiefs' as const, amount: 600, currency: 'SC' as const, entryPrice: 0.21, currentPrice: 0.24, pnl: 18, status: 'OPEN' as const },
  { id: 'th6', date: '2026-02-15T10:30:00Z', market: 'US recession 2026', side: 'NO' as const, amount: 950, currency: 'GC' as const, entryPrice: 0.72, currentPrice: 0.68, pnl: -38, status: 'OPEN' as const },
  { id: 'th7', date: '2026-03-08T16:30:00Z', market: 'Will AI pass bar exam?', side: 'YES' as const, amount: 3000, currency: 'SC' as const, entryPrice: 0.55, currentPrice: 1.0, pnl: 1200, status: 'SETTLED' as const },
  { id: 'th8', date: '2026-02-20T09:00:00Z', market: 'Oscars Best Picture 2026', side: 'Anora' as const, amount: 800, currency: 'SC' as const, entryPrice: 0.25, currentPrice: 0.31, pnl: 96, status: 'OPEN' as const },
  { id: 'th9', date: '2026-02-10T13:15:00Z', market: 'Fed rate cut June 2026', side: 'NO' as const, amount: 1500, currency: 'SC' as const, entryPrice: 0.50, currentPrice: 0.53, pnl: -45, status: 'OPEN' as const },
  { id: 'th10', date: '2026-01-28T16:45:00Z', market: 'SpaceX crewed Mars by 2030', side: 'YES' as const, amount: 400, currency: 'GC' as const, entryPrice: 0.11, currentPrice: 0.09, pnl: -8, status: 'OPEN' as const },
  { id: 'th11', date: '2026-01-15T10:00:00Z', market: 'Apple AI glasses 2026', side: 'YES' as const, amount: 700, currency: 'SC' as const, entryPrice: 0.33, currentPrice: 0.38, pnl: 35, status: 'OPEN' as const },
  { id: 'th12', date: '2026-01-05T08:30:00Z', market: 'Taylor Swift new tour 2026', side: 'YES' as const, amount: 500, currency: 'SC' as const, entryPrice: 0.45, currentPrice: 0.55, pnl: 50, status: 'OPEN' as const },
]

// Mock watched markets (first 4 trending)
const MOCK_WATCHED_MARKETS = markets.filter(m => m.trending).slice(0, 4)

const TRADES_PER_PAGE = 10

export default function ProfilePage() {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<TabName>('Overview')
  const user = mockUser

  // Trade History state
  const [tradeSearch, setTradeSearch] = useState('')
  const [tradeCurrency, setTradeCurrency] = useState<string>('all')
  const [tradeStatus, setTradeStatus] = useState<string>('all')
  const [tradeDateFrom, setTradeDateFrom] = useState('')
  const [tradeDateTo, setTradeDateTo] = useState('')
  const [tradePage, setTradePage] = useState(1)
  const [tradeSort, setTradeSort] = useState<'date' | 'pnl' | 'amount'>('date')
  const [tradeSortDir, setTradeSortDir] = useState<'asc' | 'desc'>('desc')

  const copyReferral = () => {
    navigator.clipboard.writeText('https://predictly.io/r/TRADERPRO')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalPnl = portfolio.positions.reduce((sum, p) => sum + (p.pnl || 0), 0)
  const winningPositions = portfolio.positions.filter(p => (p.pnl ?? 0) > 0).length
  const winRate = portfolio.positions.length > 0 ? winningPositions / portfolio.positions.length : 0

  // Trade history filtering
  const filteredTrades = useMemo(() => {
    let result = MOCK_TRADES.filter((trade) => {
      const matchesSearch = !tradeSearch || trade.market.toLowerCase().includes(tradeSearch.toLowerCase())
      const matchesCurrency = tradeCurrency === 'all' || trade.currency === tradeCurrency
      const matchesStatus = tradeStatus === 'all' || trade.status === tradeStatus
      const matchesDateFrom = !tradeDateFrom || new Date(trade.date) >= new Date(tradeDateFrom)
      const matchesDateTo = !tradeDateTo || new Date(trade.date) <= new Date(tradeDateTo + 'T23:59:59Z')
      return matchesSearch && matchesCurrency && matchesStatus && matchesDateFrom && matchesDateTo
    })

    // Sort
    result.sort((a, b) => {
      const dir = tradeSortDir === 'asc' ? 1 : -1
      if (tradeSort === 'date') return dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
      if (tradeSort === 'pnl') return dir * (a.pnl - b.pnl)
      if (tradeSort === 'amount') return dir * (a.amount - b.amount)
      return 0
    })

    return result
  }, [tradeSearch, tradeCurrency, tradeStatus, tradeDateFrom, tradeDateTo, tradeSort, tradeSortDir])

  const tradeTotalPages = Math.ceil(filteredTrades.length / TRADES_PER_PAGE)
  const paginatedTrades = filteredTrades.slice((tradePage - 1) * TRADES_PER_PAGE, tradePage * TRADES_PER_PAGE)

  const exportCSV = () => {
    const headers = ['Date', 'Market', 'Side', 'Amount', 'Currency', 'Entry Price', 'Current Price', 'P&L', 'Status']
    const rows = filteredTrades.map((t) => [
      new Date(t.date).toLocaleDateString(),
      `"${t.market}"`,
      t.side,
      t.amount.toString(),
      t.currency,
      t.entryPrice.toString(),
      t.currentPrice.toString(),
      t.pnl.toString(),
      t.status,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trade-history.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSort = (field: 'date' | 'pnl' | 'amount') => {
    if (tradeSort === field) {
      setTradeSortDir(tradeSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setTradeSort(field)
      setTradeSortDir('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Gradient banner */}
        <div className="h-32 bg-gradient-to-r from-brand/40 via-brand/20 to-yes/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
        </div>

        {/* Profile info */}
        <div className="bg-bg-subtle px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand to-yes flex items-center justify-center text-3xl font-bold text-white border-4 border-bg-subtle shrink-0 shadow-lg">
              {user.username[0]}
            </div>

            <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{user.username}</h1>
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-brand-soft text-brand-hover text-2xs font-semibold border border-brand/30">
                  <Star className="h-3 w-3" /> Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-yes-soft text-yes text-2xs font-semibold border border-yes-border">
                  <Shield className="h-3 w-3" /> Verified
                </span>
                <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-gold-soft text-gold text-2xs font-semibold border border-gold-border">
                  <Crown className="h-3 w-3" /> Gold Tier
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-fg-muted">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {formatDate(user.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-fg-subtle">
                <span className="flex items-center gap-1 hover:text-fg cursor-pointer transition-colors">
                  <Twitter className="h-3.5 w-3.5" /> @traderpro
                </span>
                <span className="flex items-center gap-1 hover:text-fg cursor-pointer transition-colors">
                  <Globe className="h-3.5 w-3.5" /> predictly.io
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Wallet className="h-3.5 w-3.5" /> 0x7f3...a92d
                </span>
              </div>
            </div>

            <button className="h-10 px-4 rounded-lg bg-bg border border-border hover:border-border-strong text-sm font-medium flex items-center gap-2 transition-colors shrink-0">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Net P&L
          </div>
          <div className={cn('text-xl font-bold tabular-nums', totalPnl >= 0 ? 'text-profit' : 'text-loss')}>
            {totalPnl >= 0 ? '+' : ''}{formatUSD(Math.abs(totalPnl), { compact: false })}
          </div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <BarChart3 className="h-3.5 w-3.5" /> Volume Traded
          </div>
          <div className="text-xl font-bold tabular-nums">{formatUSD(124000)}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Target className="h-3.5 w-3.5" /> Win Rate
          </div>
          <div className="text-xl font-bold tabular-nums">{formatPct(winRate)}</div>
        </div>
        <div className="rounded-xl bg-bg-subtle border border-border p-4">
          <div className="flex items-center gap-2 text-2xs text-fg-subtle uppercase tracking-wider mb-2">
            <Briefcase className="h-3.5 w-3.5" /> Active Positions
          </div>
          <div className="text-xl font-bold tabular-nums">{portfolio.positions.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                tab === t ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
              )}
            >
              {t === 'Trade History' && <BarChart3 className="h-4 w-4" />}
              {t === 'Watchlist' && <BookmarkPlus className="h-4 w-4" />}
              {t === 'Settings' && <Settings className="h-4 w-4" />}
              {t === 'Notifications' && <Bell className="h-4 w-4" />}
              {t === 'Security' && <Lock className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-5">
            {/* Recent trades */}
            <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Recent Trades</h3>
              </div>
              <ul className="divide-y divide-border">
                {transactions.slice(0, 6).map((tx) => (
                  <li key={tx.id} className="px-4 py-3 flex items-center gap-3 hover:bg-bg-elevated transition-colors">
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center text-base shrink-0',
                      tx.type === 'TRADE' ? 'bg-brand-soft' :
                      tx.type === 'DEPOSIT' || tx.type === 'GC_PURCHASE' ? 'bg-yes-soft' :
                      'bg-gold-soft'
                    )}>
                      {tx.type === 'TRADE' ? '🔄' : tx.type === 'DEPOSIT' ? '💰' : '🎁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tx.description}</div>
                      <div className="text-2xs text-fg-subtle">{formatDate(tx.createdAt)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={cn(
                        'text-sm font-semibold tabular-nums',
                        tx.type === 'WITHDRAWAL' ? 'text-loss' : 'text-profit'
                      )}>
                        {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                      </div>
                      <span className={cn(
                        'text-2xs font-medium',
                        tx.status === 'COMPLETED' ? 'text-yes' :
                        tx.status === 'PENDING' ? 'text-gold' : 'text-no'
                      )}>
                        {tx.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((ach) => (
                  <div
                    key={ach.title}
                    className={cn(
                      'rounded-xl border p-4 text-center transition-colors',
                      ach.unlocked
                        ? 'bg-bg-subtle border-border hover:border-border-strong'
                        : 'bg-bg-subtle/50 border-border/50 opacity-50'
                    )}
                  >
                    <div className="text-2xl mb-2">{ach.emoji}</div>
                    <div className="text-xs font-semibold">{ach.title}</div>
                    <div className="text-2xs text-fg-subtle mt-0.5">{ach.desc}</div>
                    {ach.unlocked && (
                      <span className="inline-flex items-center gap-0.5 mt-2 text-2xs text-yes font-medium">
                        <Award className="h-3 w-3" /> Unlocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl bg-bg-subtle border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-bg-elevated transition-colors"
                  >
                    <action.icon className="h-4 w-4 shrink-0" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Referral card */}
            <div className="rounded-xl bg-gradient-to-br from-brand/10 to-yes/10 border border-brand/20 p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4 text-brand" /> Refer &amp; Earn
              </h3>
              <p className="text-2xs text-fg-muted mb-3">Share your link and earn 50 SC for each friend who joins</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-2xs font-mono text-brand truncate">
                  predictly.io/r/TRADERPRO
                </code>
                <button
                  onClick={copyReferral}
                  className="h-9 w-9 rounded-lg bg-bg border border-border hover:border-border-strong flex items-center justify-center transition-colors shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-yes" /> : <Copy className="h-4 w-4 text-fg-muted" />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Tab: Trade History */}
      {tab === 'Trade History' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-xl bg-bg-subtle border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                <Input
                  placeholder="Search markets..."
                  value={tradeSearch}
                  onChange={(e) => { setTradeSearch(e.target.value); setTradePage(1) }}
                  className="pl-9 bg-bg border-border text-sm"
                />
              </div>
              <select
                value={tradeCurrency}
                onChange={(e) => { setTradeCurrency(e.target.value); setTradePage(1) }}
                className="h-10 px-3 rounded-lg bg-bg border border-border text-sm text-fg"
              >
                <option value="all">All Currencies</option>
                <option value="GC">Gold Coins</option>
                <option value="SC">Sweeps Coins</option>
              </select>
              <select
                value={tradeStatus}
                onChange={(e) => { setTradeStatus(e.target.value); setTradePage(1) }}
                className="h-10 px-3 rounded-lg bg-bg border border-border text-sm text-fg"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="SETTLED">Settled</option>
              </select>
              <Input
                type="date"
                value={tradeDateFrom}
                onChange={(e) => { setTradeDateFrom(e.target.value); setTradePage(1) }}
                className="bg-bg border-border text-sm w-[140px]"
                placeholder="From"
              />
              <Input
                type="date"
                value={tradeDateTo}
                onChange={(e) => { setTradeDateTo(e.target.value); setTradePage(1) }}
                className="bg-bg border-border text-sm w-[140px]"
                placeholder="To"
              />
              <Button variant="outline" size="sm" onClick={exportCSV} className="h-10 shrink-0">
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
            </div>
          </div>

          {/* Trade table */}
          <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">
                      <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-fg transition-colors">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Market</th>
                    <th className="text-left px-4 py-3 font-medium">Side</th>
                    <th className="text-left px-4 py-3 font-medium">
                      <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-fg transition-colors">
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Currency</th>
                    <th className="text-left px-4 py-3 font-medium">Entry Price</th>
                    <th className="text-left px-4 py-3 font-medium">Current Price</th>
                    <th className="text-left px-4 py-3 font-medium">
                      <button onClick={() => toggleSort('pnl')} className="flex items-center gap-1 hover:text-fg transition-colors">
                        P&amp;L <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-bg-elevated transition-colors">
                      <td className="px-4 py-3 text-fg-muted tabular-nums whitespace-nowrap text-xs">
                        {new Date(trade.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px]">
                        <Link href={`/markets/${trade.market.split(' ').slice(0, 2).join('-')}`} className="hover:text-brand transition-colors truncate block">
                          {trade.market}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-2xs font-medium border',
                            trade.side === 'YES' ? 'bg-yes-soft text-yes border-yes-border' :
                            trade.side === 'NO' ? 'bg-no-soft text-no border-no-border' :
                            'bg-brand-soft text-brand border-brand/30'
                          )}
                        >
                          {trade.side}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-xs font-medium">{trade.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs font-medium',
                          trade.currency === 'GC' ? 'text-gold' : 'text-sweeps'
                        )}>
                          {trade.currency}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-xs">{(trade.entryPrice * 100).toFixed(0)}¢</td>
                      <td className="px-4 py-3 tabular-nums text-xs">{(trade.currentPrice * 100).toFixed(0)}¢</td>
                      <td className={cn(
                        'px-4 py-3 tabular-nums text-xs font-semibold',
                        trade.pnl >= 0 ? 'text-yes' : 'text-no'
                      )}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-2xs font-medium border',
                            trade.status === 'OPEN' ? 'bg-brand-soft text-brand border-brand/30' : 'bg-yes-soft text-yes border-yes-border'
                          )}
                        >
                          {trade.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {paginatedTrades.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-fg-muted">
                        No trades found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {tradeTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-fg-muted">
                Showing {(tradePage - 1) * TRADES_PER_PAGE + 1}–{Math.min(tradePage * TRADES_PER_PAGE, filteredTrades.length)} of {filteredTrades.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={tradePage === 1}
                  onClick={() => setTradePage(tradePage - 1)}
                  className="text-fg-muted"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={tradePage === tradeTotalPages}
                  onClick={() => setTradePage(tradePage + 1)}
                  className="text-fg-muted"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Watchlist */}
      {tab === 'Watchlist' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_WATCHED_MARKETS.map((market) => (
              <Link
                key={market.id}
                href={`/markets/${market.id}`}
                className="group relative flex flex-col rounded-xl bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-all duration-200 overflow-hidden p-4"
              >
                <div className="flex gap-3 items-start mb-3">
                  <div className={cn(
                    'shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xl border border-border',
                    market.imageColor
                  )}>
                    {market.imageEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-2xs text-fg-subtle uppercase tracking-wider font-medium mb-0.5">{market.category}</div>
                    <h3 className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-fg transition-colors">{market.question}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold tabular-nums">{Math.round((market.outcomes[0]?.price ?? 0.5) * 100)}%</span>
                  <span className="inline-flex items-center gap-1 text-2xs text-fg-subtle">
                    <Eye className="h-3 w-3" /> Watching
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {MOCK_WATCHED_MARKETS.length === 0 && (
            <div className="py-16 text-center">
              <BookmarkPlus className="mx-auto h-12 w-12 text-fg-subtle opacity-40 mb-3" />
              <p className="text-sm text-fg-muted mb-3">No markets in your watchlist yet</p>
              <Link href="/markets">
                <Button variant="outline" size="sm">Browse Markets</Button>
              </Link>
            </div>
          )}
          <div className="text-center">
            <Link href="/watchlist" className="text-brand text-sm font-medium hover:underline inline-flex items-center gap-1">
              View Full Watchlist <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === 'Settings' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold">Account Settings</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Display Name</label>
              <input
                type="text"
                defaultValue={user.username}
                className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <button className="h-10 px-6 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-semibold transition-colors">
            Save Changes
          </button>
        </div>
      )}

      {/* Tab: Notifications */}
      {tab === 'Notifications' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
          {[
            { label: 'Trade confirmations', desc: 'Get notified when your trades execute', enabled: true },
            { label: 'Market resolutions', desc: 'Alerts when markets you traded on resolve', enabled: true },
            { label: 'Price alerts', desc: 'Notify when a market hits your target price', enabled: false },
            { label: 'Promotional emails', desc: 'Special offers and platform updates', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-2xs text-fg-muted">{item.desc}</div>
              </div>
              <button className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                item.enabled ? 'bg-brand' : 'bg-bg-elevated border border-border'
              )}>
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm',
                  item.enabled ? 'translate-x-5.5 mt-0.5' : 'translate-x-0.5 mt-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Security */}
      {tab === 'Security' && (
        <div className="rounded-xl bg-bg-subtle border border-border p-6 space-y-5">
          <h3 className="text-sm font-semibold">Security Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-2xs text-fg-muted">Add an extra layer of security to your account</div>
              </div>
              <button className="h-9 px-4 rounded-lg bg-bg border border-border text-sm font-medium hover:border-border-strong transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-sm font-medium">Change Password</div>
                <div className="text-2xs text-fg-muted">Update your account password</div>
              </div>
              <button className="h-9 px-4 rounded-lg bg-bg border border-border text-sm font-medium hover:border-border-strong transition-colors">
                Update
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium">Active Sessions</div>
                <div className="text-2xs text-fg-muted">Manage your active login sessions</div>
              </div>
              <span className="text-sm text-fg-muted">1 active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
