'use client'

import * as React from 'react'
import { cn, formatUSD, formatCompact } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TrendingUp,
  Plus,
  Search,
  Loader2,
  Filter,
  Play,
  Pause,
  CheckCircle2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Market, Category } from '@/types'

const categories: Category[] = [
  'Politics', 'Crypto', 'Sports', 'Tech', 'Economics',
  'Pop Culture', 'Science', 'World', 'Stocks',
]

export default function AdminMarketsPage() {
  const [markets, setMarkets] = React.useState<Market[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [filterCategory, setFilterCategory] = React.useState<string>('all')

  // Create market dialog
  const [createDialog, setCreateDialog] = React.useState(false)
  const [createTitle, setCreateTitle] = React.useState('')
  const [createDesc, setCreateDesc] = React.useState('')
  const [createCategory, setCreateCategory] = React.useState<string>('')
  const [createOutcomes, setCreateOutcomes] = React.useState('Yes, No')
  const [createCloseDate, setCreateCloseDate] = React.useState('')
  const [createLoading, setCreateLoading] = React.useState(false)

  // Resolve dialog
  const [resolveDialog, setResolveDialog] = React.useState<{
    open: boolean
    market: Market | null
  }>({ open: false, market: null })
  const [resolveOutcome, setResolveOutcome] = React.useState('')
  const [resolveEvidence, setResolveEvidence] = React.useState('')
  const [resolveLoading, setResolveLoading] = React.useState(false)

  React.useEffect(() => {
    fetchMarkets()
  }, [])

  async function fetchMarkets() {
    try {
      const res = await fetch('/api/admin/markets')
      const data = await res.json()
      setMarkets(data)
    } catch (err) {
      console.error('Failed to fetch markets:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMarkets = React.useMemo(() => {
    return markets.filter((market) => {
      const matchesSearch =
        !search ||
        market.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
        market.question.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = filterStatus === 'all' || market.status === filterStatus
      const matchesCategory = filterCategory === 'all' || market.category === filterCategory
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [markets, search, filterStatus, filterCategory])

  async function handleCreateMarket() {
    setCreateLoading(true)
    try {
      const outcomesList = createOutcomes.split(',').map((o) => ({ label: o.trim() })).filter((o) => o.label)
      const res = await fetch('/api/admin/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createTitle,
          description: createDesc,
          category: createCategory,
          outcomes: outcomesList,
          closeDate: createCloseDate,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Market created successfully')
        setCreateDialog(false)
        setCreateTitle('')
        setCreateDesc('')
        setCreateCategory('')
        setCreateOutcomes('Yes, No')
        setCreateCloseDate('')
        fetchMarkets()
      } else {
        toast.error(data.error || 'Failed to create market')
      }
    } catch {
      toast.error('Failed to create market')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleResolve() {
    if (!resolveDialog.market) return
    setResolveLoading(true)
    try {
      const res = await fetch(`/api/admin/markets/${resolveDialog.market.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: resolveOutcome,
          evidence: resolveEvidence,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Market resolved: ${resolveOutcome}`)
        setResolveDialog({ open: false, market: null })
        setResolveOutcome('')
        setResolveEvidence('')
        // Update local state
        setMarkets((prev) =>
          prev.map((m) =>
            m.id === resolveDialog.market?.id
              ? { ...m, status: 'resolved', resolvedOutcome: resolveOutcome }
              : m
          )
        )
      } else {
        toast.error(data.error || 'Failed to resolve market')
      }
    } catch {
      toast.error('Failed to resolve market')
    } finally {
      setResolveLoading(false)
    }
  }

  async function handleToggleSuspend(market: Market) {
    const suspending = market.status !== 'paused'
    try {
      const res = await fetch(`/api/admin/markets/${market.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: suspending }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(suspending ? 'Market paused' : 'Market resumed')
        setMarkets((prev) =>
          prev.map((m) =>
            m.id === market.id ? { ...m, status: suspending ? 'paused' : 'active' } : m
          )
        )
      } else {
        toast.error(data.error || 'Failed to update market')
      }
    } catch {
      toast.error('Failed to update market')
    }
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yes-soft text-yes border-yes-border'
      case 'paused':
        return 'bg-warn/10 text-warn border-warn/30'
      case 'resolved':
        return 'bg-bg-elevated text-fg-muted border-border'
      case 'cancelled':
        return 'bg-no-soft text-no border-no-border'
      default:
        return 'bg-bg-elevated text-fg-muted border-border'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-yes" />
            Market Management
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {filteredMarkets.length} of {markets.length} markets
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog(true)}
          className="bg-yes hover:bg-yes/90 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Market
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
              <Input
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-bg-elevated border-border text-fg"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] bg-bg-elevated border-border text-fg text-sm">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] bg-bg-elevated border-border text-fg text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-fg-muted text-xs">Title</TableHead>
                  <TableHead className="text-fg-muted text-xs">Category</TableHead>
                  <TableHead className="text-fg-muted text-xs">Volume</TableHead>
                  <TableHead className="text-fg-muted text-xs">Status</TableHead>
                  <TableHead className="text-fg-muted text-xs">Probability</TableHead>
                  <TableHead className="text-fg-muted text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarkets.map((market) => (
                  <TableRow key={market.id} className="border-border hover:bg-bg-elevated/50">
                    <TableCell className="font-medium text-fg text-sm max-w-[250px]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{market.imageEmoji}</span>
                        <span className="truncate">{market.shortTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-fg-muted text-sm">
                      {market.category}
                    </TableCell>
                    <TableCell className="text-sm text-fg">
                      {formatUSD(market.volume)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-2xs font-medium border capitalize', statusBadgeVariant(market.status))}
                      >
                        {market.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {market.currentProbability != null ? (
                        <span className={cn(
                          'font-medium',
                          market.currentProbability >= 0.5 ? 'text-yes' : 'text-no'
                        )}>
                          {(market.currentProbability * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-fg-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {market.status === 'active' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setResolveDialog({ open: true, market })}
                              className="h-8 text-yes hover:text-yes hover:bg-yes-soft"
                              title="Resolve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSuspend(market)}
                              className="h-8 text-warn hover:text-warn hover:bg-warn/10"
                              title="Pause"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {market.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSuspend(market)}
                            className="h-8 text-yes hover:text-yes hover:bg-yes-soft"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMarkets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-fg-muted">
                      No markets found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Market Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-bg-subtle border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-fg">Create New Market</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Title</Label>
              <Input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="e.g. Will Bitcoin reach $300k by 2027?"
                className="bg-bg-elevated border-border text-fg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Description</Label>
              <Textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Detailed description of the market resolution criteria..."
                className="bg-bg-elevated border-border text-fg min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Category</Label>
                <Select value={createCategory} onValueChange={setCreateCategory}>
                  <SelectTrigger className="bg-bg-elevated border-border text-fg">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-elevated border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Close Date</Label>
                <Input
                  type="date"
                  value={createCloseDate}
                  onChange={(e) => setCreateCloseDate(e.target.value)}
                  className="bg-bg-elevated border-border text-fg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Outcomes (comma-separated)</Label>
              <Input
                value={createOutcomes}
                onChange={(e) => setCreateOutcomes(e.target.value)}
                placeholder="Yes, No"
                className="bg-bg-elevated border-border text-fg"
              />
              <p className="text-2xs text-fg-subtle">Separate each outcome with a comma</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateDialog(false)}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMarket}
              disabled={createLoading || !createTitle || !createDesc || !createCategory || !createCloseDate}
              className="bg-yes hover:bg-yes/90 text-white"
            >
              {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Market
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Market Dialog */}
      <Dialog open={resolveDialog.open} onOpenChange={(open) => setResolveDialog({ open, market: open ? resolveDialog.market : null })}>
        <DialogContent className="bg-bg-subtle border-border">
          <DialogHeader>
            <DialogTitle className="text-fg">Resolve Market</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-bg-elevated border border-border">
              <p className="text-sm text-fg font-medium">{resolveDialog.market?.shortTitle}</p>
              <p className="text-2xs text-fg-muted mt-1">
                Current probability: {resolveDialog.market?.currentProbability != null
                  ? `${(resolveDialog.market.currentProbability * 100).toFixed(0)}%`
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Winning Outcome</Label>
              <Select value={resolveOutcome} onValueChange={setResolveOutcome}>
                <SelectTrigger className="bg-bg-elevated border-border text-fg">
                  <SelectValue placeholder="Select winning outcome" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  {resolveDialog.market?.outcomes.map((outcome) => (
                    <SelectItem key={outcome.id} value={outcome.label}>
                      {outcome.label} ({(outcome.price * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Evidence / Source</Label>
              <Textarea
                value={resolveEvidence}
                onChange={(e) => setResolveEvidence(e.target.value)}
                placeholder="URL or description of the source confirming this outcome..."
                className="bg-bg-elevated border-border text-fg min-h-[60px]"
              />
            </div>
            <div className="p-3 rounded-lg bg-no-soft border border-no-border">
              <p className="text-sm text-no font-medium">
                Warning: This action is irreversible. All positions will be settled.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setResolveDialog({ open: false, market: null })}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolveLoading || !resolveOutcome || !resolveEvidence}
              className="bg-yes hover:bg-yes/90 text-white"
            >
              {resolveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Resolve Market
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
