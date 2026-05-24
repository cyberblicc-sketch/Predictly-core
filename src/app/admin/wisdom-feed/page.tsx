'use client'

import * as React from 'react'
import { cn, formatUSD, formatCompact, timeAgo } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  RadioTower,
  Users,
  DollarSign,
  Activity,
  Search,
  MoreHorizontal,
  Plus,
  Eye,
  Ban,
  Pencil,
  Copy,
  Check,
  Loader2,
  Zap,
  Clock,
  Shield,
  Globe,
  TrendingUp,
  Server,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { WisdomFeedClient, WisdomFeedLog, WisdomFeedUsageStats, WisdomFeedPricingTier, WisdomFeedTier } from '@/types'

// ── Types for API response ───────────────────────────────────────────────────

interface AdminData {
  clients: (WisdomFeedClient & { usage_stats: WisdomFeedUsageStats })[]
  stats: {
    total_revenue: number
    total_requests: number
    active_clients: number
    total_clients: number
    revenue_by_tier: { tier1: number; tier2: number; tier3: number }
  }
  recent_logs: WisdomFeedLog[]
  tier_config: Record<WisdomFeedTier, WisdomFeedPricingTier>
}

// ── Chart Config ─────────────────────────────────────────────────────────────

const revenueChartConfig: ChartConfig = {
  tier1: { label: 'Delayed Feed', color: '#94a3b8' },
  tier2: { label: 'Real-Time Feed', color: '#22c55e' },
  tier3: { label: 'Institutional Feed', color: '#f59e0b' },
}

// ── Badge Helpers ────────────────────────────────────────────────────────────

function tierBadge(tier: WisdomFeedTier) {
  switch (tier) {
    case 'tier1':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    case 'tier2':
      return 'bg-yes-soft text-yes border-yes-border'
    case 'tier3':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  }
}

function tierLabel(tier: WisdomFeedTier) {
  switch (tier) {
    case 'tier1': return 'Tier 1'
    case 'tier2': return 'Tier 2'
    case 'tier3': return 'Tier 3'
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-yes-soft text-yes border-yes-border'
    case 'suspended':
      return 'bg-warn/10 text-warn border-warn/30'
    case 'cancelled':
      return 'bg-no-soft text-no border-no-border'
    default:
      return 'bg-bg-elevated text-fg-muted border-border'
  }
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function WisdomFeedAdminPage() {
  const [data, setData] = React.useState<AdminData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterTier, setFilterTier] = React.useState<string>('all')
  const [filterStatus, setFilterStatus] = React.useState<string>('all')

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [createdApiKey, setCreatedApiKey] = React.useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false)
  const [selectedClient, setSelectedClient] = React.useState<(WisdomFeedClient & { usage_stats?: WisdomFeedUsageStats }) | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = React.useState(false)

  // Create form state
  const [createForm, setCreateForm] = React.useState({
    company_name: '',
    contact_email: '',
    contact_name: '',
    tier: 'tier1' as WisdomFeedTier,
  })
  const [createLoading, setCreateLoading] = React.useState(false)

  // Edit form state
  const [editForm, setEditForm] = React.useState<{
    tier: WisdomFeedTier
    status: 'active' | 'suspended' | 'cancelled'
    rate_limit_per_min: number
  }>({ tier: 'tier1', status: 'active', rate_limit_per_min: 100 })
  const [editLoading, setEditLoading] = React.useState(false)

  // Copy state
  const [copied, setCopied] = React.useState(false)

  // Active tab
  const [activeTab, setActiveTab] = React.useState('clients')

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/wisdom-feed')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch wisdom feed data:', err)
      toast.error('Failed to load Wisdom Feed data')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filtered clients
  const filteredClients = React.useMemo(() => {
    if (!data?.clients) return []
    return data.clients.filter((client) => {
      const matchesSearch =
        !search ||
        client.company_name.toLowerCase().includes(search.toLowerCase()) ||
        client.contact_email.toLowerCase().includes(search.toLowerCase()) ||
        client.contact_name.toLowerCase().includes(search.toLowerCase())
      const matchesTier = filterTier === 'all' || client.tier === filterTier
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus
      return matchesSearch && matchesTier && matchesStatus
    })
  }, [data?.clients, search, filterTier, filterStatus])

  // Create client
  async function handleCreateClient() {
    setCreateLoading(true)
    try {
      const res = await fetch('/api/admin/wisdom-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (json.success) {
        setCreatedApiKey(json.api_key)
        toast.success(`Client ${createForm.company_name} created successfully`)
        fetchData()
      } else {
        toast.error(json.message || 'Failed to create client')
      }
    } catch {
      toast.error('Failed to create client')
    } finally {
      setCreateLoading(false)
    }
  }

  // Update client
  async function handleUpdateClient() {
    if (!selectedClient) return
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/wisdom-feed/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Client updated successfully`)
        setEditDialogOpen(false)
        fetchData()
      } else {
        toast.error(json.message || 'Failed to update client')
      }
    } catch {
      toast.error('Failed to update client')
    } finally {
      setEditLoading(false)
    }
  }

  // Suspend/Cancel client
  async function handleSuspendClient() {
    if (!selectedClient) return
    try {
      const res = await fetch(`/api/admin/wisdom-feed/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${selectedClient.company_name} has been suspended`)
        setSuspendDialogOpen(false)
        setDetailsDialogOpen(false)
        fetchData()
      } else {
        toast.error(json.message || 'Failed to suspend client')
      }
    } catch {
      toast.error('Failed to suspend client')
    }
  }

  // Cancel client
  async function handleCancelClient() {
    if (!selectedClient) return
    try {
      const res = await fetch(`/api/admin/wisdom-feed/${selectedClient.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${selectedClient.company_name} has been cancelled`)
        setDetailsDialogOpen(false)
        fetchData()
      } else {
        toast.error(json.message || 'Failed to cancel client')
      }
    } catch {
      toast.error('Failed to cancel client')
    }
  }

  // Copy API key
  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopied(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Open details dialog
  function openDetails(client: WisdomFeedClient & { usage_stats?: WisdomFeedUsageStats }) {
    setSelectedClient(client)
    setDetailsDialogOpen(true)
  }

  // Open edit dialog
  function openEdit(client: WisdomFeedClient) {
    setSelectedClient(client)
    setEditForm({
      tier: client.tier,
      status: client.status as 'active' | 'suspended' | 'cancelled',
      rate_limit_per_min: client.rate_limit_per_min,
    })
    setEditDialogOpen(true)
  }

  // Open suspend dialog
  function openSuspend(client: WisdomFeedClient) {
    setSelectedClient(client)
    setSuspendDialogOpen(true)
  }

  // Revenue chart data
  const revenueChartData = React.useMemo(() => {
    if (!data?.stats) return []
    return [
      { name: 'Tier 1\nDelayed', tier1: data.stats.revenue_by_tier.tier1, tier2: 0, tier3: 0 },
      { name: 'Tier 2\nReal-Time', tier1: 0, tier2: data.stats.revenue_by_tier.tier2, tier3: 0 },
      { name: 'Tier 3\nInstitutional', tier1: 0, tier2: 0, tier3: data.stats.revenue_by_tier.tier3 },
    ]
  }, [data?.stats])

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-fg-muted">Failed to load data</p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            <RadioTower className="h-6 w-6 text-brand" />
            Wisdom Feed API
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            B2B probability data API for hedge funds, quant desks, and research firms
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateForm({ company_name: '', contact_email: '', contact_name: '', tier: 'tier1' })
            setCreatedApiKey(null)
            setCreateDialogOpen(true)
          }}
          className="bg-brand hover:bg-brand-hover text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yes-soft">
                <DollarSign className="h-5 w-5 text-yes" />
              </div>
              <div>
                <p className="text-2xs text-fg-muted font-medium">Monthly Revenue</p>
                <p className="text-xl font-bold text-fg">{formatUSD(data.stats.total_revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-brand-soft">
                <Users className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-2xs text-fg-muted font-medium">Active Clients</p>
                <p className="text-xl font-bold text-fg">{data.stats.active_clients}<span className="text-sm text-fg-muted font-normal">/{data.stats.total_clients}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xs text-fg-muted font-medium">Total Requests</p>
                <p className="text-xl font-bold text-fg">{formatCompact(data.stats.total_requests)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-500/10">
                <Server className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xs text-fg-muted font-medium">Avg Response</p>
                <p className="text-xl font-bold text-fg">67<span className="text-sm text-fg-muted font-normal">ms</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <div>
        <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Pricing Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(data.tier_config).map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'bg-bg-subtle border-border relative overflow-hidden',
                tier.id === 'tier3' && 'border-amber-500/30'
              )}
            >
              {tier.id === 'tier3' && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-2xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={cn('text-2xs font-medium border', tierBadge(tier.id))}>
                    {tierLabel(tier.id)}
                  </Badge>
                  <span className="text-2xs text-fg-muted">{tier.data_delay}</span>
                </div>
                <CardTitle className="text-fg text-lg">{tier.name}</CardTitle>
                <CardDescription className="text-fg-muted text-xs">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-fg">{formatUSD(tier.price, { compact: false })}</span>
                  <span className="text-fg-muted text-sm">/mo</span>
                </div>
                <div className="space-y-2 mb-4">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-fg-muted">
                      <Check className="h-3.5 w-3.5 text-yes shrink-0 mt-0.5" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-fg-muted hover:text-fg hover:bg-bg-elevated"
                  onClick={() => {
                    setCreateForm({ company_name: '', contact_email: '', contact_name: '', tier: tier.id })
                    setCreatedApiKey(null)
                    setCreateDialogOpen(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Client
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-bg-subtle border-border">
          <TabsTrigger value="clients" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            Clients
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            API Logs
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            Revenue
          </TabsTrigger>
        </TabsList>

        {/* ── Clients Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="clients" className="space-y-4 mt-4">
          {/* Search & Filters */}
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
                  <Input
                    placeholder="Search by company, email, or contact..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-bg-elevated border-border text-fg"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger className="w-[130px] bg-bg-elevated border-border text-fg text-sm">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border">
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="tier1">Tier 1</SelectItem>
                      <SelectItem value="tier2">Tier 2</SelectItem>
                      <SelectItem value="tier3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px] bg-bg-elevated border-border text-fg text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients Table */}
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-fg-muted text-xs">Company</TableHead>
                      <TableHead className="text-fg-muted text-xs">Tier</TableHead>
                      <TableHead className="text-fg-muted text-xs">Status</TableHead>
                      <TableHead className="text-fg-muted text-xs">Monthly</TableHead>
                      <TableHead className="text-fg-muted text-xs">Requests (Today/Mo)</TableHead>
                      <TableHead className="text-fg-muted text-xs">Last Request</TableHead>
                      <TableHead className="text-fg-muted text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="border-border hover:bg-bg-elevated/50 cursor-pointer"
                        onClick={() => openDetails(client)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-fg text-sm">{client.company_name}</p>
                            <p className="text-2xs text-fg-muted">{client.contact_name} &middot; {client.contact_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-2xs font-medium border', tierBadge(client.tier))}>
                            {tierLabel(client.tier)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-2xs font-medium border capitalize', statusBadge(client.status))}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-fg">
                          {formatUSD(client.monthly_price, { compact: false })}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="text-fg">{formatCompact(client.usage_stats?.total_requests_today ?? 0)}</span>
                          <span className="text-fg-muted"> / </span>
                          <span className="text-fg-muted">{formatCompact(client.usage_stats?.total_requests_month ?? 0)}</span>
                        </TableCell>
                        <TableCell className="text-sm text-fg-muted">
                          {client.last_request_at ? timeAgo(client.last_request_at) : 'Never'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
                              <DropdownMenuItem
                                onClick={() => openDetails(client)}
                                className="text-fg-muted focus:text-fg focus:bg-bg-hover"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(client)}
                                className="text-fg-muted focus:text-fg focus:bg-bg-hover"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                onClick={() => openSuspend(client)}
                                className="text-no focus:text-no focus:bg-no-soft"
                                disabled={client.status !== 'active'}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredClients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-fg-muted">
                          No clients found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── API Logs Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-fg text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" />
                Recent API Requests
              </CardTitle>
              <CardDescription className="text-fg-muted text-xs">
                Showing last {data.recent_logs.length} requests across all clients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-bg-subtle z-10">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-fg-muted text-xs">Client</TableHead>
                      <TableHead className="text-fg-muted text-xs">Endpoint</TableHead>
                      <TableHead className="text-fg-muted text-xs">Method</TableHead>
                      <TableHead className="text-fg-muted text-xs">Status</TableHead>
                      <TableHead className="text-fg-muted text-xs">Response Time</TableHead>
                      <TableHead className="text-fg-muted text-xs">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recent_logs.map((log) => (
                      <TableRow key={log.id} className="border-border hover:bg-bg-elevated/50">
                        <TableCell className="text-sm text-fg">{log.client_name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-bg-elevated px-2 py-0.5 rounded text-fg-muted font-mono">
                            {log.endpoint}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs text-fg-muted font-mono">{log.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-2xs font-mono font-medium border',
                              log.status_code >= 200 && log.status_code < 300
                                ? 'bg-yes-soft text-yes border-yes-border'
                                : log.status_code >= 400 && log.status_code < 500
                                  ? 'bg-warn/10 text-warn border-warn/30'
                                  : 'bg-no-soft text-no border-no-border'
                            )}
                          >
                            {log.status_code}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-fg-muted">{log.response_time_ms}ms</TableCell>
                        <TableCell className="text-sm text-fg-muted">{timeAgo(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Revenue Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <Card className="bg-bg-subtle border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-fg text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yes" />
                Monthly Revenue by Tier
              </CardTitle>
              <CardDescription className="text-fg-muted text-xs">
                Current MRR: {formatUSD(data.stats.total_revenue, { compact: false })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                <BarChart data={revenueChartData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--color-fg-muted)', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--color-fg-muted)', fontSize: 12 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-fg)',
                    }}
                    formatter={(value: number) => [formatUSD(value, { compact: false }), '']}
                  />
                  <Bar dataKey="tier1" stackId="revenue" fill="var(--color-tier1)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tier2" stackId="revenue" fill="var(--color-tier2)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tier3" stackId="revenue" fill="var(--color-tier3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>

              {/* Revenue breakdown */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-bg-elevated border border-border">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-2xs text-fg-muted">Tier 1 — Delayed</span>
                  </div>
                  <p className="text-lg font-bold text-fg">{formatUSD(data.stats.revenue_by_tier.tier1, { compact: false })}</p>
                  <p className="text-2xs text-fg-muted">{MOCK_WISDOM_FEED_CLIENTS.filter(c => c.tier === 'tier1' && c.status === 'active').length} clients</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-elevated border border-border">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-2xs text-fg-muted">Tier 2 — Real-Time</span>
                  </div>
                  <p className="text-lg font-bold text-fg">{formatUSD(data.stats.revenue_by_tier.tier2, { compact: false })}</p>
                  <p className="text-2xs text-fg-muted">{MOCK_WISDOM_FEED_CLIENTS.filter(c => c.tier === 'tier2' && c.status === 'active').length} clients</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-elevated border border-border">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-2xs text-fg-muted">Tier 3 — Institutional</span>
                  </div>
                  <p className="text-lg font-bold text-fg">{formatUSD(data.stats.revenue_by_tier.tier3, { compact: false })}</p>
                  <p className="text-2xs text-fg-muted">{MOCK_WISDOM_FEED_CLIENTS.filter(c => c.tier === 'tier3' && c.status === 'active').length} clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Create Client Dialog ──────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-bg-subtle border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-fg flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand" />
              Create Wisdom Feed Client
            </DialogTitle>
            <DialogDescription className="text-fg-muted text-sm">
              Add a new B2B client to the Wisdom Feed API. The API key will only be shown once.
            </DialogDescription>
          </DialogHeader>

          {!createdApiKey ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Company Name</Label>
                <Input
                  value={createForm.company_name}
                  onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })}
                  placeholder="e.g. Citadel Securities"
                  className="bg-bg-elevated border-border text-fg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Contact Name</Label>
                <Input
                  value={createForm.contact_name}
                  onChange={(e) => setCreateForm({ ...createForm, contact_name: e.target.value })}
                  placeholder="e.g. Marcus Chen"
                  className="bg-bg-elevated border-border text-fg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Contact Email</Label>
                <Input
                  type="email"
                  value={createForm.contact_email}
                  onChange={(e) => setCreateForm({ ...createForm, contact_email: e.target.value })}
                  placeholder="e.g. api-team@company.com"
                  className="bg-bg-elevated border-border text-fg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-fg-muted text-sm">Pricing Tier</Label>
                <Select
                  value={createForm.tier}
                  onValueChange={(v: WisdomFeedTier) => setCreateForm({ ...createForm, tier: v })}
                >
                  <SelectTrigger className="bg-bg-elevated border-border text-fg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-elevated border-border">
                    {Object.values(data.tier_config).map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn('text-2xs font-medium border', tierBadge(tier.id))}>
                            {tierLabel(tier.id)}
                          </Badge>
                          {tier.name} — {formatUSD(tier.price, { compact: false })}/mo
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tier preview */}
              {createForm.tier && (
                <div className="p-3 rounded-lg bg-bg-elevated border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-fg">{data.tier_config[createForm.tier].name}</span>
                    <Badge variant="secondary" className={cn('text-2xs font-medium border', tierBadge(createForm.tier))}>
                      {data.tier_config[createForm.tier].rate_limit} req/min
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {data.tier_config[createForm.tier].features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-2xs text-fg-muted">
                        <Check className="h-3 w-3 text-yes" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-yes-soft border border-yes-border">
                <p className="text-sm text-yes font-semibold mb-2">Client created successfully!</p>
                <p className="text-xs text-yes/80 mb-3">
                  Store this API key securely. It will not be shown again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-bg-elevated px-3 py-2 rounded border border-border text-fg font-mono break-all">
                    {createdApiKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(createdApiKey)}
                    className="border-border text-fg-muted hover:text-fg shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-yes" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {!createdApiKey ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setCreateDialogOpen(false)}
                  className="text-fg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={createLoading || !createForm.company_name || !createForm.contact_email || !createForm.contact_name}
                  className="bg-brand hover:bg-brand-hover text-white"
                >
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Client
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setCreateDialogOpen(false)
                  setCreatedApiKey(null)
                }}
                className="bg-brand hover:bg-brand-hover text-white"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Client Details Dialog ─────────────────────────────────────────── */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-bg-subtle border-border sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-fg flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand" />
              {selectedClient?.company_name}
            </DialogTitle>
            <DialogDescription className="text-fg-muted text-sm">
              Client details and usage analytics
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-5">
              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Status</p>
                  <Badge variant="secondary" className={cn('text-2xs font-medium border capitalize', statusBadge(selectedClient.status))}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Tier</p>
                  <Badge variant="secondary" className={cn('text-2xs font-medium border', tierBadge(selectedClient.tier))}>
                    {tierLabel(selectedClient.tier)} — {data.tier_config[selectedClient.tier].name}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Contact</p>
                  <p className="text-sm text-fg">{selectedClient.contact_name}</p>
                  <p className="text-2xs text-fg-muted">{selectedClient.contact_email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Monthly Price</p>
                  <p className="text-sm text-fg font-semibold">{formatUSD(selectedClient.monthly_price, { compact: false })}/mo</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">API Key</p>
                  <code className="text-xs text-fg-muted font-mono">
                    {selectedClient.api_key.slice(0, 12)}...{selectedClient.api_key.slice(-4)}
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Rate Limit</p>
                  <p className="text-sm text-fg">{selectedClient.rate_limit_per_min} req/min</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Total Requests</p>
                  <p className="text-sm text-fg">{formatCompact(selectedClient.total_requests)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Last Request</p>
                  <p className="text-sm text-fg">{selectedClient.last_request_at ? timeAgo(selectedClient.last_request_at) : 'Never'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Created</p>
                  <p className="text-sm text-fg">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Expires</p>
                  <p className="text-sm text-fg">{selectedClient.expires_at ? new Date(selectedClient.expires_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Webhook info for Tier 3 */}
              {selectedClient.tier === 'tier3' && selectedClient.webhook_url && (
                <>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-xs font-medium text-fg mb-2 flex items-center gap-2">
                      <RadioTower className="h-3.5 w-3.5 text-brand" />
                      Webhook Configuration
                    </p>
                    <div className="p-3 rounded-lg bg-bg-elevated border border-border space-y-1">
                      <p className="text-2xs text-fg-muted">URL: <code className="text-fg font-mono">{selectedClient.webhook_url}</code></p>
                      <p className="text-2xs text-fg-muted">Events: {selectedClient.webhook_events.join(', ')}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Allowed Categories */}
              <>
                <Separator className="bg-border" />
                <div>
                  <p className="text-xs font-medium text-fg mb-2">Allowed Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClient.allowed_categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-2xs bg-bg-elevated border-border text-fg-muted">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>

              {/* Usage Stats */}
              {selectedClient.usage_stats && (
                <>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-xs font-medium text-fg mb-3 flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-brand" />
                      Usage Analytics
                    </p>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-bg-elevated border border-border text-center">
                        <p className="text-lg font-bold text-fg">{formatCompact(selectedClient.usage_stats.total_requests_today)}</p>
                        <p className="text-2xs text-fg-muted">Today</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-bg-elevated border border-border text-center">
                        <p className="text-lg font-bold text-fg">{formatCompact(selectedClient.usage_stats.total_requests_month)}</p>
                        <p className="text-2xs text-fg-muted">This Month</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-bg-elevated border border-border text-center">
                        <p className="text-lg font-bold text-fg">{selectedClient.usage_stats.avg_response_time_ms}ms</p>
                        <p className="text-2xs text-fg-muted">Avg Latency</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-bg-elevated border border-border text-center">
                        <p className="text-lg font-bold text-fg">{(selectedClient.usage_stats.error_rate * 100).toFixed(1)}%</p>
                        <p className="text-2xs text-fg-muted">Error Rate</p>
                      </div>
                    </div>

                    {/* Daily usage mini chart */}
                    <div className="p-3 rounded-lg bg-bg-elevated border border-border">
                      <p className="text-2xs text-fg-muted mb-2">Daily Requests (14 days)</p>
                      <div className="flex items-end gap-1 h-16">
                        {selectedClient.usage_stats.daily_requests.map((day, i) => {
                          const maxCount = Math.max(...selectedClient.usage_stats!.daily_requests.map(d => d.count))
                          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm bg-brand/60 hover:bg-brand transition-colors"
                              style={{ height: `${height}%`, minHeight: '2px' }}
                              title={`${day.date}: ${day.count} requests`}
                            />
                          )
                        })}
                      </div>
                    </div>

                    {/* Top endpoints */}
                    {selectedClient.usage_stats.top_endpoints.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-2xs text-fg-muted">Top Endpoints</p>
                        {selectedClient.usage_stats.top_endpoints.map((ep) => (
                          <div key={ep.endpoint} className="flex items-center justify-between text-xs">
                            <code className="text-fg-muted font-mono">{ep.endpoint}</code>
                            <span className="text-fg font-medium">{formatCompact(ep.count)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => openEdit(selectedClient)}
                  className="flex-1 border-border text-fg-muted hover:text-fg hover:bg-bg-elevated"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Client
                </Button>
                {selectedClient.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={() => openSuspend(selectedClient)}
                    className="flex-1 border-no-border text-no hover:bg-no-soft"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Client Dialog ────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-bg-subtle border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-fg flex items-center gap-2">
              <Pencil className="h-5 w-5 text-brand" />
              Edit Client — {selectedClient?.company_name}
            </DialogTitle>
            <DialogDescription className="text-fg-muted text-sm">
              Update tier, status, and rate limit for this client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Tier</Label>
              <Select
                value={editForm.tier}
                onValueChange={(v: WisdomFeedTier) => {
                  setEditForm({ ...editForm, tier: v })
                  const tierConfig = data.tier_config[v]
                  setEditForm(prev => ({ ...prev, tier: v, rate_limit_per_min: tierConfig.rate_limit }))
                }}
              >
                <SelectTrigger className="bg-bg-elevated border-border text-fg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="tier1">Tier 1 — Delayed Feed ($500/mo)</SelectItem>
                  <SelectItem value="tier2">Tier 2 — Real-Time Feed ($5,000/mo)</SelectItem>
                  <SelectItem value="tier3">Tier 3 — Institutional Feed ($25,000/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v: 'active' | 'suspended' | 'cancelled') => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger className="bg-bg-elevated border-border text-fg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Rate Limit (req/min)</Label>
              <Input
                type="number"
                value={editForm.rate_limit_per_min}
                onChange={(e) => setEditForm({ ...editForm, rate_limit_per_min: Number(e.target.value) })}
                className="bg-bg-elevated border-border text-fg"
              />
              <p className="text-2xs text-fg-muted">
                Default for {tierLabel(editForm.tier)}: {data.tier_config[editForm.tier].rate_limit} req/min
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClient}
              disabled={editLoading}
              className="bg-brand hover:bg-brand-hover text-white"
            >
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Suspend Client Alert Dialog ───────────────────────────────────── */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className="bg-bg-subtle border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fg">Suspend {selectedClient?.company_name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-fg-muted">
              This will immediately revoke API access for this client. They will receive 403 errors on all requests. You can reactivate them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-bg-elevated border-border text-fg-muted hover:text-fg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendClient}
              className="bg-no hover:bg-no/90 text-white"
            >
              Suspend Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
