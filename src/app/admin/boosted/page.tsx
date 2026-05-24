'use client'

import * as React from 'react'
import { cn, formatUSD, formatCompact } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Zap,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Plus,
  Search,
  BarChart3,
  Loader2,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
} from 'lucide-react'
import { MOCK_BOOSTED_MARKETS, BOOST_PLACEMENTS, calculateBoostROI } from '@/lib/boosted'
import type { BoostedMarket, BoostPlacement, BoostStatus } from '@/types'

const statusConfig: Record<BoostStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: 'Active',    color: 'bg-yes-soft text-yes border-yes-border',  icon: CheckCircle2 },
  pending:   { label: 'Pending',   color: 'bg-warn-soft text-warn border-warn-border', icon: Clock },
  paused:    { label: 'Paused',    color: 'bg-fg-subtle/20 text-fg-muted border-border', icon: Pause },
  completed: { label: 'Completed', color: 'bg-brand-soft text-brand border-brand-border', icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  color: 'bg-no-soft text-no border-no-border',   icon: XCircle },
}

const placementColors: Record<BoostPlacement, string> = {
  hero: 'text-amber-500',
  featured: 'text-brand',
  category_top: 'text-yes',
  sidebar: 'text-sweeps',
  ticker: 'text-fg-muted',
}

export default function AdminBoostedPage() {
  const [boosts, setBoosts] = React.useState<BoostedMarket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [createOpen, setCreateOpen] = React.useState(false)
  const [detailBoost, setDetailBoost] = React.useState<BoostedMarket | null>(null)

  // Form state
  const [formMarket, setFormMarket] = React.useState('')
  const [formSponsor, setFormSponsor] = React.useState('')
  const [formPlacement, setFormPlacement] = React.useState<BoostPlacement>('featured')
  const [formBudget, setFormBudget] = React.useState('')

  React.useEffect(() => {
    async function fetchBoosts() {
      try {
        const res = await fetch('/api/admin/boosted')
        if (res.ok) {
          const data = await res.json()
          setBoosts(data.boosts || [])
        } else {
          setBoosts(MOCK_BOOSTED_MARKETS)
        }
      } catch {
        setBoosts(MOCK_BOOSTED_MARKETS)
      } finally {
        setLoading(false)
      }
    }
    fetchBoosts()
  }, [])

  const filteredBoosts = boosts.filter((b) => {
    const matchesSearch =
      b.market_title.toLowerCase().includes(search.toLowerCase()) ||
      b.sponsor_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalBudget = boosts.reduce((sum, b) => sum + b.budget, 0)
  const totalSpent = boosts.reduce((sum, b) => sum + b.spent, 0)
  const totalImpressions = boosts.reduce((sum, b) => sum + b.impressions, 0)
  const totalClicks = boosts.reduce((sum, b) => sum + b.clicks, 0)
  const avgCTR = boosts.length > 0
    ? boosts.reduce((sum, b) => sum + b.ctr, 0) / boosts.filter(b => b.status === 'active').length
    : 0

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/boosted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_title: formMarket,
          sponsor_name: formSponsor,
          placement: formPlacement,
          budget: parseFloat(formBudget) * 100,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setBoosts((prev) => [...prev, data.boost])
        setCreateOpen(false)
        setFormMarket('')
        setFormSponsor('')
        setFormPlacement('featured')
        setFormBudget('')
      }
    } catch {
      // Fallback: add locally
      const newBoost: BoostedMarket = {
        id: `boost-${Date.now()}`,
        market_id: `m-${Date.now()}`,
        market_title: formMarket,
        market_emoji: '📢',
        sponsor_name: formSponsor,
        sponsor_logo_url: null,
        placement: formPlacement,
        status: 'pending',
        budget: parseFloat(formBudget) * 100,
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        additional_liquidity: parseFloat(formBudget) * 100 * 3,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        cpc: 0,
        target_categories: [],
        created_at: new Date().toISOString(),
      }
      setBoosts((prev) => [...prev, newBoost])
      setCreateOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Boosted Markets
          </h1>
          <p className="text-sm text-fg-muted mt-1">Sponsored liquidity and promoted markets</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Boost
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Budget', value: formatUSD(totalBudget), icon: DollarSign, color: 'text-gold' },
          { label: 'Total Spent', value: formatUSD(totalSpent), icon: TrendingUp, color: 'text-brand' },
          { label: 'Impressions', value: formatCompact(totalImpressions), icon: Eye, color: 'text-yes' },
          { label: 'Total Clicks', value: formatCompact(totalClicks), icon: MousePointerClick, color: 'text-sweeps' },
          { label: 'Avg CTR', value: `${avgCTR.toFixed(1)}%`, icon: BarChart3, color: 'text-fg' },
        ].map((card) => (
          <Card key={card.label} className="bg-bg-subtle border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={cn('h-4 w-4', card.color)} />
                <span className="text-2xs text-fg-muted font-medium">{card.label}</span>
              </div>
              <div className="text-lg font-bold text-fg">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placement Guide */}
      <Card className="bg-bg-subtle border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-fg">Placement Options</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.entries(BOOST_PLACEMENTS) as [BoostPlacement, typeof BOOST_PLACEMENTS[BoostPlacement]][]).map(([key, val]) => (
              <div key={key} className="rounded-lg bg-bg-elevated border border-border p-3">
                <div className={cn('text-sm font-semibold', placementColors[key])}>{val.name}</div>
                <div className="text-2xs text-fg-muted mt-1 line-clamp-2">{val.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xs text-fg-muted">CPC: ${val.suggestedCPC}</span>
                  <span className="text-2xs text-fg-muted">Min: {formatUSD(val.minBudget)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
          <Input
            placeholder="Search markets or sponsors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-bg-subtle border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-bg-subtle border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Boosts Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-subtle border-b border-border">
                <th className="text-left px-4 py-3 text-fg-muted font-medium">Market</th>
                <th className="text-left px-4 py-3 text-fg-muted font-medium">Sponsor</th>
                <th className="text-left px-4 py-3 text-fg-muted font-medium">Placement</th>
                <th className="text-left px-4 py-3 text-fg-muted font-medium">Status</th>
                <th className="text-right px-4 py-3 text-fg-muted font-medium">Budget</th>
                <th className="text-right px-4 py-3 text-fg-muted font-medium">Spent</th>
                <th className="text-right px-4 py-3 text-fg-muted font-medium">Impressions</th>
                <th className="text-right px-4 py-3 text-fg-muted font-medium">CTR</th>
                <th className="text-center px-4 py-3 text-fg-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoosts.map((boost) => {
                const roi = calculateBoostROI(boost)
                const statusCfg = statusConfig[boost.status]
                return (
                  <tr key={boost.id} className="border-b border-border hover:bg-bg-subtle/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{boost.market_emoji}</span>
                        <span className="font-medium text-fg truncate max-w-[200px]">{boost.market_title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{boost.sponsor_name}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium', placementColors[boost.placement])}>
                        {BOOST_PLACEMENTS[boost.placement].name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={cn('text-xs', statusCfg.color)}>
                        <statusCfg.icon className="h-3 w-3 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-fg">{formatUSD(boost.budget)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-fg">{formatUSD(boost.spent)}</div>
                      <div className="text-2xs text-fg-muted">{roi.budgetUtilization}% used</div>
                    </td>
                    <td className="px-4 py-3 text-right text-fg">{formatCompact(boost.impressions)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-medium', boost.ctr >= 3 ? 'text-yes' : boost.ctr >= 2 ? 'text-warn' : 'text-fg-muted')}>
                        {boost.ctr.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailBoost(boost)}
                        className="text-brand hover:text-brand-hover"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Boost Detail Dialog */}
      <Dialog open={!!detailBoost} onOpenChange={(open) => !open && setDetailBoost(null)}>
        <DialogContent className="sm:max-w-lg bg-bg border-border">
          {detailBoost && (() => {
            const roi = calculateBoostROI(detailBoost)
            const statusCfg = statusConfig[detailBoost.status]
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{detailBoost.market_emoji}</span>
                    {detailBoost.market_title}
                  </DialogTitle>
                  <DialogDescription>
                    Sponsored by {detailBoost.sponsor_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={cn('text-xs', statusCfg.color)}>
                      <statusCfg.icon className="h-3 w-3 mr-1" />
                      {statusCfg.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {BOOST_PLACEMENTS[detailBoost.placement].name}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-bg-subtle p-3">
                      <div className="text-2xs text-fg-muted">Budget</div>
                      <div className="text-sm font-bold text-fg">{formatUSD(detailBoost.budget)}</div>
                      <div className="w-full bg-border rounded-full h-1.5 mt-2">
                        <div className="bg-brand h-1.5 rounded-full" style={{ width: `${Math.min(roi.budgetUtilization, 100)}%` }} />
                      </div>
                      <div className="text-2xs text-fg-muted mt-1">{roi.budgetUtilization}% used</div>
                    </div>
                    <div className="rounded-lg bg-bg-subtle p-3">
                      <div className="text-2xs text-fg-muted">ROI</div>
                      <div className={cn('text-sm font-bold', roi.roi >= 0 ? 'text-yes' : 'text-no')}>
                        {roi.roi >= 0 ? '+' : ''}{roi.roi}%
                      </div>
                      <div className="text-2xs text-fg-muted mt-1">Est. revenue: {formatUSD(parseFloat(roi.estimatedRevenue.toString()))}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-fg">{formatCompact(detailBoost.impressions)}</div>
                      <div className="text-2xs text-fg-muted">Impressions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-fg">{formatCompact(detailBoost.clicks)}</div>
                      <div className="text-2xs text-fg-muted">Clicks</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-fg">{detailBoost.ctr.toFixed(1)}%</div>
                      <div className="text-2xs text-fg-muted">CTR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Est. Traders</span>
                      <span className="font-medium text-fg">{roi.estimatedTraders.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Cost/Trader</span>
                      <span className="font-medium text-fg">${roi.costPerTrader}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Liquidity Added</span>
                      <span className="font-medium text-fg">{formatUSD(detailBoost.additional_liquidity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-fg-muted">Liquidity Multiplier</span>
                      <span className="font-medium text-fg">{roi.liquidityMultiplier}x</span>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Boost Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-bg border-border">
          <DialogHeader>
            <DialogTitle>Create Boosted Market</DialogTitle>
            <DialogDescription>Sponsor a market for increased visibility and engagement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-fg mb-1.5 block">Market Title</label>
              <Input
                placeholder="e.g., Will [Product] hit 1M sales?"
                value={formMarket}
                onChange={(e) => setFormMarket(e.target.value)}
                className="bg-bg-subtle border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-fg mb-1.5 block">Sponsor Name</label>
              <Input
                placeholder="e.g., Apple Inc"
                value={formSponsor}
                onChange={(e) => setFormSponsor(e.target.value)}
                className="bg-bg-subtle border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-fg mb-1.5 block">Placement</label>
              <Select value={formPlacement} onValueChange={(v) => setFormPlacement(v as BoostPlacement)}>
                <SelectTrigger className="bg-bg-subtle border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(BOOST_PLACEMENTS) as [BoostPlacement, typeof BOOST_PLACEMENTS[BoostPlacement]][]).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.name} (min {formatUSD(val.minBudget)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-fg mb-1.5 block">Budget (USD)</label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={formBudget}
                onChange={(e) => setFormBudget(e.target.value)}
                className="bg-bg-subtle border-border"
              />
              {formPlacement && (
                <p className="text-2xs text-fg-muted mt-1">
                  Min: {formatUSD(BOOST_PLACEMENTS[formPlacement].minBudget)} | Suggested CPC: ${BOOST_PLACEMENTS[formPlacement].suggestedCPC}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formMarket || !formSponsor || !formBudget}>
              Create Boost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
