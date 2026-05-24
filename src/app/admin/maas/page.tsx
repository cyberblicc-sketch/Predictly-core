'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Zap,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Mail,
  Building2,
  Key,
  BarChart3,
  Code2,
  Settings,
  Ban,
  Edit3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LayoutGrid,
  Box,
  Activity,
  ArrowUpRight,
  Loader2,
  X,
  CreditCard,
  Percent,
  Clock,
} from 'lucide-react'
import type {
  MaaSClient,
  MaaSWidget,
  MaaSCategory,
  MaaSAnalytics,
  MaaSPricingModel,
} from '@/types'
import { WIDGET_PRESETS, type WidgetPreset } from '@/lib/maas'
import { formatUSD, formatCompact } from '@/lib/utils'

// ── Animation variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

// ── Status helpers ──────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'trial': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    case 'suspended': return 'bg-red-500/15 text-red-400 border-red-500/30'
    case 'cancelled': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
    default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
  }
}

function pricingLabel(model: string) {
  switch (model) {
    case 'revenue_share': return 'Rev Share'
    case 'flat_fee': return 'Flat Fee'
    case 'hybrid': return 'Hybrid'
    default: return model
  }
}

function pricingColor(model: string) {
  switch (model) {
    case 'revenue_share': return 'bg-violet-500/15 text-violet-400 border-violet-500/30'
    case 'flat_fee': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
    case 'hybrid': return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    default: return ''
  }
}

// ── Widget type visual mockup ───────────────────────────────────────────────

function WidgetMockup({ type }: { type: WidgetPreset['type'] }) {
  const base = 'border border-[#1F2330] rounded-lg bg-[#11131A] flex items-center justify-center overflow-hidden'
  switch (type) {
    case 'full_market':
      return <div className={`${base} w-full h-36 p-3 flex-col gap-2 items-start`}>
        <div className="w-16 h-1.5 rounded bg-violet-500/40" />
        <div className="w-3/4 h-2 rounded bg-[#1F2330]" />
        <div className="w-full flex gap-2 mt-1">
          <div className="flex-1 h-2 rounded bg-violet-500/30" />
          <div className="flex-1 h-2 rounded bg-zinc-700/50" />
        </div>
        <div className="w-full flex gap-2 mt-auto">
          <div className="flex-1 h-6 rounded bg-violet-500/20" />
          <div className="flex-1 h-6 rounded bg-zinc-700/30" />
        </div>
      </div>
    case 'mini_card':
      return <div className={`${base} w-20 h-28 p-2 flex-col gap-1.5 items-start`}>
        <div className="w-10 h-1 rounded bg-violet-500/40" />
        <div className="w-16 h-1.5 rounded bg-[#1F2330]" />
        <div className="w-8 h-5 rounded bg-violet-500/30 mt-1" />
        <div className="w-12 h-1 rounded bg-zinc-700/50 mt-auto" />
      </div>
    case 'probability_bar':
      return <div className={`${base} w-full h-8 px-3 gap-3`}>
        <div className="w-20 h-1.5 rounded bg-[#1F2330]" />
        <div className="flex-1 h-2 rounded-full bg-zinc-700/40 overflow-hidden">
          <div className="w-3/5 h-full bg-violet-500/40 rounded-full" />
        </div>
        <div className="w-6 h-3 rounded bg-violet-500/30" />
      </div>
    case 'leaderboard':
      return <div className={`${base} w-24 h-32 p-2 flex-col gap-1.5 items-start`}>
        <div className="w-14 h-1.5 rounded bg-violet-500/40" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-violet-500/30" />
            <div className="flex-1 h-1 rounded bg-[#1F2330]" />
            <div className="w-5 h-1 rounded bg-emerald-500/30" />
          </div>
        ))}
      </div>
    case 'ticker':
      return <div className={`${base} w-full h-6 px-3 gap-4 overflow-hidden`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="w-12 h-1 rounded bg-[#1F2330] shrink-0" />
            <div className="w-4 h-2 rounded bg-violet-500/30 shrink-0" />
          </React.Fragment>
        ))}
      </div>
    case 'multi_market':
      return <div className={`${base} w-full h-36 p-3`}>
        <div className="w-full h-full grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded bg-[#0A0B0F] border border-[#1F2330] p-1.5 flex flex-col gap-1">
              <div className="w-6 h-1 rounded bg-violet-500/30" />
              <div className="w-10 h-1 rounded bg-[#1F2330]" />
              <div className="w-4 h-2.5 rounded bg-violet-500/20 mt-auto" />
            </div>
          ))}
        </div>
      </div>
    default:
      return <div className={`${base} w-full h-36`} />
  }
}

// ── Main page component ─────────────────────────────────────────────────────

export default function MaaSAdminPage() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [clients, setClients] = React.useState<(MaaSClient & { analytics_summary?: { views_7d: number; clicks_7d: number; trades_7d: number; revenue_7d: number } | null; widget_count?: number })[]>([])
  const [categories, setCategories] = React.useState<MaaSCategory[]>([])
  const [globalStats, setGlobalStats] = React.useState({
    total_clients: 0,
    active_clients: 0,
    total_embeds: 0,
    total_views_7d: 0,
    total_revenue_7d: 0,
    total_trades_7d: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedClient, setExpandedClient] = React.useState<string | null>(null)

  // Dialogs
  const [createClientOpen, setCreateClientOpen] = React.useState(false)
  const [widgetBuilderOpen, setWidgetBuilderOpen] = React.useState(false)
  const [clientDetailOpen, setClientDetailOpen] = React.useState(false)
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = React.useState<WidgetPreset | null>(null)

  // Client detail
  const [clientDetail, setClientDetail] = React.useState<{
    client: MaaSClient
    analytics: MaaSAnalytics | null
    widgets: MaaSWidget[]
  } | null>(null)

  // Create client form
  const [createForm, setCreateForm] = React.useState({
    company_name: '',
    website: '',
    contact_email: '',
    contact_name: '',
    pricing_model: 'revenue_share' as MaaSPricingModel,
    monthly_fee: 0,
    revenue_share_pct: 15,
    embed_domains: '',
    allowed_categories: [] as string[],
  })
  const [creating, setCreating] = React.useState(false)
  const [createdApiKey, setCreatedApiKey] = React.useState<string | null>(null)

  // Widget builder form
  const [widgetForm, setWidgetForm] = React.useState({
    client_id: '',
    name: '',
    type: '' as MaaSWidget['type'] | '',
    market_ids: '',
    category: '',
    cta_text: 'Trade Now',
    cta_url: '',
  })
  const [widgetResult, setWidgetResult] = React.useState<MaaSWidget | null>(null)
  const [creatingWidget, setCreatingWidget] = React.useState(false)

  // Copy
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  // API key reveal
  const [revealedKeys, setRevealedKeys] = React.useState<Set<string>>(new Set())

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/maas')
      const data = await res.json()
      setClients(data.clients || [])
      setCategories(data.categories || [])
      setGlobalStats(data.stats || globalStats)
    } catch (err) {
      console.error('Failed to fetch MaaS data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchClientDetail = React.useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/admin/maas/${clientId}`)
      const data = await res.json()
      setClientDetail(data)
    } catch (err) {
      console.error('Failed to fetch client detail:', err)
    }
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreateClient = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/maas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          embed_domains: createForm.embed_domains.split(',').map((d) => d.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreatedApiKey(data.api_key)
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to create client:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateWidget = async () => {
    setCreatingWidget(true)
    try {
      const preset = WIDGET_PRESETS.find((p) => p.type === widgetForm.type)
      const res = await fetch('/api/admin/maas/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: widgetForm.client_id,
          name: widgetForm.name,
          type: widgetForm.type,
          market_ids: widgetForm.market_ids.split(',').map((m) => m.trim()).filter(Boolean),
          category: widgetForm.category || undefined,
          config: preset?.config,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setWidgetResult(data.widget)
      }
    } catch (err) {
      console.error('Failed to create widget:', err)
    } finally {
      setCreatingWidget(false)
    }
  }

  const handleUpdateClientStatus = async (clientId: string, status: string) => {
    try {
      await fetch(`/api/admin/maas/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchData()
      if (selectedClientId === clientId) {
        await fetchClientDetail(clientId)
      }
    } catch (err) {
      console.error('Failed to update client:', err)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const toggleKeyReveal = (clientId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      return next
    })
  }

  // ── Filtered clients ────────────────────────────────────────────────────────
  const filteredClients = React.useMemo(() => {
    if (!searchQuery) return clients
    const q = searchQuery.toLowerCase()
    return clients.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        c.website.toLowerCase().includes(q) ||
        c.contact_email.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    )
  }, [clients, searchQuery])

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="space-y-8 pb-12">
        {/* ═══ Section 1: Header + Stats ═════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} custom={0} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Market-as-a-Service</h1>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Embed prediction markets anywhere. The Stripe of prediction markets.
              </p>
            </div>
            <Dialog open={createClientOpen} onOpenChange={(open) => {
              setCreateClientOpen(open)
              if (!open) setCreatedApiKey(null)
            }}>
              <DialogTrigger asChild>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  New Client
                </Button>
              </DialogTrigger>
              {/* Create Client Dialog - Section 5 */}
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#11131A] border-[#1F2330]">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-violet-400" />
                    Create MaaS Client
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Add a new partner to the Market-as-a-Service platform.
                  </DialogDescription>
                </DialogHeader>

                {createdApiKey ? (
                  <div className="space-y-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Check className="h-5 w-5" />
                      Client Created Successfully
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">API Key (save this — it won&apos;t be shown again)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 px-3 py-2 rounded bg-[#0A0B0F] text-sm font-mono text-foreground break-all">
                          {createdApiKey}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(createdApiKey, 'created-key')}
                          className="shrink-0"
                        >
                          {copiedKey === 'created-key' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setCreateClientOpen(false)
                        setCreatedApiKey(null)
                      }}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Company Name *</Label>
                        <Input
                          value={createForm.company_name}
                          onChange={(e) => setCreateForm((f) => ({ ...f, company_name: e.target.value }))}
                          placeholder="Acme Media"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Website *</Label>
                        <Input
                          value={createForm.website}
                          onChange={(e) => setCreateForm((f) => ({ ...f, website: e.target.value }))}
                          placeholder="https://acme.com"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Contact Email *</Label>
                        <Input
                          type="email"
                          value={createForm.contact_email}
                          onChange={(e) => setCreateForm((f) => ({ ...f, contact_email: e.target.value }))}
                          placeholder="partner@acme.com"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Contact Name *</Label>
                        <Input
                          value={createForm.contact_name}
                          onChange={(e) => setCreateForm((f) => ({ ...f, contact_name: e.target.value }))}
                          placeholder="Jane Smith"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                    </div>

                    <Separator className="bg-[#1F2330]" />

                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pricing Model</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['revenue_share', 'flat_fee', 'hybrid'] as MaaSPricingModel[]).map((model) => (
                          <button
                            key={model}
                            onClick={() => setCreateForm((f) => ({ ...f, pricing_model: model }))}
                            className={`p-3 rounded-lg border text-center text-xs font-medium transition-all ${
                              createForm.pricing_model === model
                                ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                                : 'border-[#1F2330] bg-[#0A0B0F] text-muted-foreground hover:border-zinc-600'
                            }`}
                          >
                            {model === 'revenue_share' ? 'Revenue Share' : model === 'flat_fee' ? 'Flat Fee' : 'Hybrid'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(createForm.pricing_model === 'flat_fee' || createForm.pricing_model === 'hybrid') && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" /> Monthly Fee ($)
                        </Label>
                        <Input
                          type="number"
                          value={createForm.monthly_fee}
                          onChange={(e) => setCreateForm((f) => ({ ...f, monthly_fee: Number(e.target.value) }))}
                          placeholder="5000"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                    )}

                    {(createForm.pricing_model === 'revenue_share' || createForm.pricing_model === 'hybrid') && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Percent className="h-3.5 w-3.5" /> Revenue Share (%)
                        </Label>
                        <Input
                          type="number"
                          value={createForm.revenue_share_pct}
                          onChange={(e) => setCreateForm((f) => ({ ...f, revenue_share_pct: Number(e.target.value) }))}
                          placeholder="15"
                          className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Allowed Categories</Label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={createForm.allowed_categories.includes(cat.slug)}
                              onCheckedChange={(checked) => {
                                setCreateForm((f) => ({
                                  ...f,
                                  allowed_categories: checked
                                    ? [...f.allowed_categories, cat.slug]
                                    : f.allowed_categories.filter((s) => s !== cat.slug),
                                }))
                              }}
                            />
                            <span className="text-xs text-muted-foreground">{cat.emoji} {cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Embed Domains (comma-separated)</Label>
                      <Input
                        value={createForm.embed_domains}
                        onChange={(e) => setCreateForm((f) => ({ ...f, embed_domains: e.target.value }))}
                        placeholder="acme.com, *.acme.com"
                        className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                      />
                    </div>

                    <Button
                      onClick={handleCreateClient}
                      disabled={creating || !createForm.company_name || !createForm.website || !createForm.contact_email || !createForm.contact_name}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Create Client
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total Clients', value: globalStats.total_clients, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Active Embeds', value: globalStats.total_embeds, icon: LayoutGrid, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: 'Views (7d)', value: globalStats.total_views_7d, icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10', format: 'compact' },
              { label: 'Revenue (7d)', value: globalStats.total_revenue_7d, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', format: 'usd' },
              { label: 'Trades (7d)', value: globalStats.total_trades_7d, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10', format: 'compact' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeInUp} custom={i + 1}>
                <Card className="bg-[#11131A] border-[#1F2330] hover:border-[#2A3040] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <span className="text-2xs text-muted-foreground font-medium">{stat.label}</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {stat.format === 'usd'
                        ? formatUSD(stat.value)
                        : stat.format === 'compact'
                          ? formatCompact(stat.value)
                          : stat.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ Section 2: MaaS Categories Grid ══════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-bold text-foreground">MaaS Categories</h2>
            <Badge variant="secondary" className="text-2xs bg-violet-500/10 text-violet-400 border-violet-500/20">
              {categories.length} available
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.04, duration: 0.35 }}
              >
                <Card className="bg-[#11131A] border-[#1F2330] hover:border-violet-500/30 transition-all group cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{cat.emoji}</span>
                      {cat.is_premium ? (
                        <Badge className="text-2xs bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="text-2xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                          Free
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{cat.name}</h3>
                    <p className="text-2xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{cat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xs text-muted-foreground">{cat.market_count} markets</span>
                      <span className={`text-xs font-bold ${cat.monthly_addon_price === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {cat.monthly_addon_price === 0 ? 'Free' : `$${cat.monthly_addon_price}/mo`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══ Section 3: Widget Presets Gallery ════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Box className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-foreground">Widget Presets</h2>
            <Badge variant="secondary" className="text-2xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              {WIDGET_PRESETS.length} types
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {WIDGET_PRESETS.map((preset, i) => (
              <motion.div
                key={preset.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05, duration: 0.35 }}
              >
                <Card className="bg-[#11131A] border-[#1F2330] hover:border-cyan-500/30 transition-all group h-full flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    {/* Mockup */}
                    <div className="mb-4 flex justify-center py-2">
                      <WidgetMockup type={preset.type} />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1">{preset.name}</h3>
                    <p className="text-2xs text-muted-foreground mb-3 leading-relaxed">{preset.description}</p>

                    <div className="flex items-center gap-3 text-2xs text-muted-foreground mb-3">
                      <span>{preset.width}×{preset.height}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{preset.features.length} features</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {preset.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-2xs px-2 py-0.5 rounded-full bg-[#0A0B0F] border border-[#1F2330] text-muted-foreground">
                          {f}
                        </span>
                      ))}
                      {preset.features.length > 3 && (
                        <span className="text-2xs px-2 py-0.5 rounded-full bg-[#0A0B0F] border border-[#1F2330] text-muted-foreground">
                          +{preset.features.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 gap-1.5 text-xs"
                        onClick={() => {
                          setSelectedPreset(preset)
                          setWidgetForm((f) => ({
                            ...f,
                            type: preset.type,
                            name: '',
                          }))
                          setWidgetResult(null)
                          setWidgetBuilderOpen(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Widget
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══ Section 4: Clients Table ═════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-foreground">Clients</h2>
              <Badge variant="secondary" className="text-2xs bg-amber-500/10 text-amber-400 border-amber-500/20">
                {clients.length} total
              </Badge>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="pl-9 bg-[#11131A] border-[#1F2330] text-foreground h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <Card className="bg-[#11131A] border-[#1F2330] overflow-hidden">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr_0.6fr_0.6fr_0.6fr_0.5fr] gap-2 px-4 py-3 border-b border-[#1F2330] text-2xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Company</span>
              <span>Website</span>
              <span>Status</span>
              <span>Pricing</span>
              <span>Monthly</span>
              <span>Rev Share</span>
              <span>Embeds</span>
              <span>Views 7d</span>
              <span>Revenue</span>
            </div>

            <div className="divide-y divide-[#1F2330]">
              {filteredClients.map((client) => {
                const isExpanded = expandedClient === client.id
                return (
                  <div key={client.id}>
                    <button
                      onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                      className="w-full text-left"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr_0.6fr_0.6fr_0.6fr_0.5fr] gap-2 px-4 py-3 hover:bg-[#171923] transition-colors items-center">
                        {/* Company */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ background: client.custom_branding.primary_color }}
                          >
                            {client.company_name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{client.company_name}</div>
                            <div className="text-2xs text-muted-foreground truncate lg:hidden">{client.website.replace('https://', '')}</div>
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto lg:ml-0 shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto lg:ml-0 shrink-0" />}
                        </div>

                        {/* Website */}
                        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Globe className="h-3 w-3 shrink-0" />
                          {client.website.replace('https://', '')}
                        </div>

                        {/* Status */}
                        <div className="hidden lg:block">
                          <Badge className={`text-2xs ${statusColor(client.status)}`}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Badge>
                        </div>

                        {/* Pricing */}
                        <div className="hidden lg:block">
                          <Badge className={`text-2xs ${pricingColor(client.pricing_model)}`}>
                            {pricingLabel(client.pricing_model)}
                          </Badge>
                        </div>

                        {/* Monthly fee */}
                        <div className="hidden lg:block text-xs text-foreground font-medium">
                          {client.monthly_fee > 0 ? formatUSD(client.monthly_fee) : '—'}
                        </div>

                        {/* Rev share */}
                        <div className="hidden lg:block text-xs text-foreground font-medium">
                          {client.revenue_share_pct > 0 ? `${(client.revenue_share_pct * 100).toFixed(0)}%` : '—'}
                        </div>

                        {/* Embeds */}
                        <div className="hidden lg:block text-xs text-foreground font-medium">
                          {client.widget_count ?? client.total_embeds}
                        </div>

                        {/* Views 7d */}
                        <div className="hidden lg:block text-xs text-foreground font-medium">
                          {formatCompact(client.analytics_summary?.views_7d ?? 0)}
                        </div>

                        {/* Revenue 7d */}
                        <div className="hidden lg:block text-xs text-emerald-400 font-semibold">
                          {formatUSD(client.analytics_summary?.revenue_7d ?? 0)}
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 bg-[#0A0B0F]/50 border-t border-[#1F2330]">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              <div>
                                <div className="text-2xs text-muted-foreground mb-1">Contact</div>
                                <div className="text-xs text-foreground font-medium">{client.contact_name}</div>
                                <div className="text-2xs text-muted-foreground">{client.contact_email}</div>
                              </div>
                              <div>
                                <div className="text-2xs text-muted-foreground mb-1">API Key</div>
                                <div className="flex items-center gap-1.5">
                                  <code className="text-2xs font-mono text-foreground">
                                    {revealedKeys.has(client.id) ? client.api_key : `${client.api_key.slice(0, 12)}...`}
                                  </code>
                                  <button onClick={() => toggleKeyReveal(client.id)}>
                                    <Key className="h-3 w-3 text-muted-foreground hover:text-violet-400" />
                                  </button>
                                  <button onClick={() => copyToClipboard(client.api_key, `key-${client.id}`)}>
                                    {copiedKey === `key-${client.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />}
                                  </button>
                                </div>
                              </div>
                              <div>
                                <div className="text-2xs text-muted-foreground mb-1">Embed Domains</div>
                                <div className="text-2xs text-foreground">{client.embed_domains.join(', ') || 'None'}</div>
                              </div>
                              <div>
                                <div className="text-2xs text-muted-foreground mb-1">Categories</div>
                                <div className="flex flex-wrap gap-1">
                                  {client.allowed_categories.map((c) => {
                                    const cat = categories.find((cc) => cc.slug === c)
                                    return (
                                      <span key={c} className="text-2xs px-1.5 py-0.5 rounded bg-[#11131A] border border-[#1F2330] text-muted-foreground">
                                        {cat?.emoji} {c}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-violet-400 hover:bg-violet-500/10 gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedClientId(client.id)
                                  fetchClientDetail(client.id)
                                  setClientDetailOpen(true)
                                }}
                              >
                                <BarChart3 className="h-3.5 w-3.5" /> View Details
                              </Button>
                              {client.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-amber-400 hover:bg-amber-500/10 gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateClientStatus(client.id, 'suspended')
                                  }}
                                >
                                  <Ban className="h-3.5 w-3.5" /> Suspend
                                </Button>
                              )}
                              {client.status === 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateClientStatus(client.id, 'active')
                                  }}
                                >
                                  <Activity className="h-3.5 w-3.5" /> Reactivate
                                </Button>
                              )}
                              {client.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs text-red-400 hover:bg-red-500/10 gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpdateClientStatus(client.id, 'cancelled')
                                  }}
                                >
                                  <X className="h-3.5 w-3.5" /> Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            {filteredClients.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No clients found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </Card>
        </motion.section>

        {/* ═══ Section 6: Widget Builder Dialog ═════════════════════════════ */}
        <Dialog open={widgetBuilderOpen} onOpenChange={(open) => {
          setWidgetBuilderOpen(open)
          if (!open) setWidgetResult(null)
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#11131A] border-[#1F2330]">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Code2 className="h-5 w-5 text-cyan-400" />
                Widget Builder
                {selectedPreset && (
                  <Badge className="text-2xs bg-cyan-500/15 text-cyan-400 border-cyan-500/30">
                    {selectedPreset.name}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new embeddable widget for a client.
              </DialogDescription>
            </DialogHeader>

            {widgetResult ? (
              <div className="space-y-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Check className="h-5 w-5" />
                  Widget Created
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Widget ID</Label>
                  <div className="text-sm font-mono text-foreground mt-1">{widgetResult.id}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Embed Code</Label>
                  <div className="relative mt-1">
                    <pre className="p-3 rounded-lg bg-[#0A0B0F] text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                      {widgetResult.embed_code}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(widgetResult.embed_code, 'embed-code')}
                    >
                      {copiedKey === 'embed-code' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setWidgetBuilderOpen(false)
                    setWidgetResult(null)
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Client *</Label>
                  <Select
                    value={widgetForm.client_id}
                    onValueChange={(v) => setWidgetForm((f) => ({ ...f, client_id: v }))}
                  >
                    <SelectTrigger className="bg-[#0A0B0F] border-[#1F2330] text-foreground">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#11131A] border-[#1F2330]">
                      {clients.filter((c) => c.status !== 'cancelled').map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Widget Name *</Label>
                  <Input
                    value={widgetForm.name}
                    onChange={(e) => setWidgetForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Super Bowl Winner"
                    className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Widget Type</Label>
                  <Select
                    value={widgetForm.type || undefined}
                    onValueChange={(v) => setWidgetForm((f) => ({ ...f, type: v as MaaSWidget['type'] }))}
                  >
                    <SelectTrigger className="bg-[#0A0B0F] border-[#1F2330] text-foreground">
                      <SelectValue placeholder="Select widget type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#11131A] border-[#1F2330]">
                      {WIDGET_PRESETS.map((p) => (
                        <SelectItem key={p.type} value={p.type}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Market IDs (comma-separated) *</Label>
                  <Input
                    value={widgetForm.market_ids}
                    onChange={(e) => setWidgetForm((f) => ({ ...f, market_ids: e.target.value }))}
                    placeholder="mkt-super-bowl-58, mkt-nba-mvp-26"
                    className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Select
                    value={widgetForm.category || undefined}
                    onValueChange={(v) => setWidgetForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger className="bg-[#0A0B0F] border-[#1F2330] text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#11131A] border-[#1F2330]">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          {c.emoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">CTA Text</Label>
                    <Input
                      value={widgetForm.cta_text}
                      onChange={(e) => setWidgetForm((f) => ({ ...f, cta_text: e.target.value }))}
                      placeholder="Trade Now"
                      className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">CTA URL</Label>
                    <Input
                      value={widgetForm.cta_url}
                      onChange={(e) => setWidgetForm((f) => ({ ...f, cta_url: e.target.value }))}
                      placeholder="https://predictly.io/..."
                      className="bg-[#0A0B0F] border-[#1F2330] text-foreground"
                    />
                  </div>
                </div>

                {/* Embed code preview */}
                {widgetForm.client_id && widgetForm.type && (
                  <div className="p-3 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                    <Label className="text-2xs text-muted-foreground mb-1 block">Embed Code Preview</Label>
                    <code className="text-2xs font-mono text-violet-400 break-all">
                      {`<iframe src="https://predictly.io/embed/wgt-${widgetForm.type}-..." width="${selectedPreset?.config.width ?? '800'}" height="${selectedPreset?.config.height ?? '600'}" frameborder="0" style="border-radius: ${selectedPreset?.config.border_radius ?? '12px'}"></iframe>`}
                    </code>
                  </div>
                )}

                <Button
                  onClick={handleCreateWidget}
                  disabled={creatingWidget || !widgetForm.client_id || !widgetForm.name || !widgetForm.type || !widgetForm.market_ids}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {creatingWidget ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Code2 className="h-4 w-4 mr-2" />}
                  Create Widget
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ═══ Section 7: Client Detail Dialog ══════════════════════════════ */}
        <Dialog open={clientDetailOpen} onOpenChange={setClientDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#11131A] border-[#1F2330]">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                {clientDetail?.client.company_name ?? 'Client Details'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Full client details, analytics, and management.
              </DialogDescription>
            </DialogHeader>

            {clientDetail && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-[#0A0B0F] border border-[#1F2330]">
                  <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-[#1F2330]">Overview</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs data-[state=active]:bg-[#1F2330]">Analytics</TabsTrigger>
                  <TabsTrigger value="widgets" className="text-xs data-[state=active]:bg-[#1F2330]">Widgets</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-[#1F2330]">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xs text-muted-foreground">Company</div>
                      <div className="text-sm font-semibold text-foreground">{clientDetail.client.company_name}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-muted-foreground">Website</div>
                      <a href={clientDetail.client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-400 hover:underline flex items-center gap-1">
                        {clientDetail.client.website.replace('https://', '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div>
                      <div className="text-2xs text-muted-foreground">Contact</div>
                      <div className="text-sm text-foreground">{clientDetail.client.contact_name}</div>
                      <div className="text-2xs text-muted-foreground">{clientDetail.client.contact_email}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-muted-foreground">Status</div>
                      <Badge className={`text-2xs mt-0.5 ${statusColor(clientDetail.client.status)}`}>
                        {clientDetail.client.status.charAt(0).toUpperCase() + clientDetail.client.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-2xs text-muted-foreground">Pricing Model</div>
                      <Badge className={`text-2xs mt-0.5 ${pricingColor(clientDetail.client.pricing_model)}`}>
                        {pricingLabel(clientDetail.client.pricing_model)}
                      </Badge>
                      {clientDetail.client.monthly_fee > 0 && (
                        <span className="text-2xs text-muted-foreground ml-2">{formatUSD(clientDetail.client.monthly_fee)}/mo</span>
                      )}
                      {clientDetail.client.revenue_share_pct > 0 && (
                        <span className="text-2xs text-muted-foreground ml-2">{(clientDetail.client.revenue_share_pct * 100).toFixed(0)}% share</span>
                      )}
                    </div>
                    <div>
                      <div className="text-2xs text-muted-foreground">Total Revenue</div>
                      <div className="text-sm font-semibold text-emerald-400">{formatUSD(clientDetail.client.total_revenue_generated)}</div>
                    </div>
                  </div>

                  <Separator className="bg-[#1F2330]" />

                  <div>
                    <div className="text-2xs text-muted-foreground mb-1">API Key</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground bg-[#0A0B0F] px-3 py-1.5 rounded flex-1 break-all">
                        {revealedKeys.has(clientDetail.client.id) ? clientDetail.client.api_key : `${clientDetail.client.api_key.slice(0, 16)}${'•'.repeat(16)}`}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => toggleKeyReveal(clientDetail.client.id)}>
                            <Key className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{revealedKeys.has(clientDetail.client.id) ? 'Hide' : 'Reveal'} API key</TooltipContent>
                      </Tooltip>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(clientDetail.client.api_key, `detail-key-${clientDetail.client.id}`)}>
                        {copiedKey === `detail-key-${clientDetail.client.id}` ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>

                  {clientDetail.client.trial_ends_at && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                        <Clock className="h-4 w-4" />
                        Trial ends {new Date(clientDetail.client.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4 mt-4">
                  {clientDetail.analytics ? (
                    <>
                      {/* Stat cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Views (7d)', value: clientDetail.analytics.total_views_7d, format: 'compact' as const, color: 'text-violet-400' },
                          { label: 'Clicks (7d)', value: clientDetail.analytics.total_clicks_7d, format: 'compact' as const, color: 'text-cyan-400' },
                          { label: 'Trades (7d)', value: clientDetail.analytics.total_trades_7d, format: 'compact' as const, color: 'text-emerald-400' },
                          { label: 'Revenue (7d)', value: clientDetail.analytics.total_revenue_7d, format: 'usd' as const, color: 'text-amber-400' },
                        ].map((s) => (
                          <div key={s.label} className="p-3 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                            <div className="text-2xs text-muted-foreground mb-1">{s.label}</div>
                            <div className={`text-lg font-bold ${s.color}`}>
                              {s.format === 'usd' ? formatUSD(s.value) : formatCompact(s.value)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 7-day chart */}
                      <div className="p-4 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                        <div className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-violet-400" />
                          7-Day Views
                        </div>
                        <div className="flex items-end gap-1.5 h-24">
                          {clientDetail.analytics.views_by_day.map((day, i) => {
                            const maxViews = Math.max(...clientDetail.analytics.views_by_day.map((d) => d.views))
                            const pct = maxViews > 0 ? (day.views / maxViews) * 100 : 0
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className="w-full rounded-t bg-violet-500/60 hover:bg-violet-500 transition-colors cursor-pointer"
                                      style={{ height: `${Math.max(pct, 4)}%` }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">{formatCompact(day.views)} views</div>
                                  </TooltipContent>
                                </Tooltip>
                                <span className="text-2xs text-muted-foreground">
                                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Revenue breakdown */}
                      {clientDetail.analytics.revenue_breakdown.length > 0 && (
                        <div className="p-4 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                          <div className="text-xs font-semibold text-foreground mb-3">Revenue Breakdown</div>
                          <div className="space-y-2">
                            {clientDetail.analytics.revenue_breakdown.map((r, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{r.source}</span>
                                <span className="text-xs font-semibold text-emerald-400">{formatUSD(r.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top widgets */}
                      {clientDetail.analytics.top_widgets.length > 0 && (
                        <div className="p-4 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                          <div className="text-xs font-semibold text-foreground mb-3">Top Performing Widgets</div>
                          <div className="space-y-2">
                            {clientDetail.analytics.top_widgets.map((w, i) => (
                              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1F2330] last:border-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xs text-muted-foreground font-mono">{w.widget_id.slice(0, 16)}…</span>
                                  <span className="text-xs text-foreground">{w.widget_name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xs text-muted-foreground">{formatCompact(w.views)} views</span>
                                  <span className="text-2xs text-violet-400 font-medium">{w.ctr}% CTR</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">No analytics data available</div>
                  )}
                </TabsContent>

                <TabsContent value="widgets" className="space-y-3 mt-4">
                  {clientDetail.widgets.length > 0 ? (
                    clientDetail.widgets.map((w) => (
                      <div key={w.id} className="p-4 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="text-sm font-semibold text-foreground">{w.name}</div>
                            <div className="text-2xs text-muted-foreground mt-0.5">
                              {w.type} · {w.config.width}×{w.config.height} · {w.config.theme}
                            </div>
                          </div>
                          <Badge className="text-2xs bg-violet-500/15 text-violet-400 border-violet-500/30 shrink-0">
                            {w.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-2xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCompact(w.views)}</span>
                          <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> {formatCompact(w.clicks)}</span>
                          <span>{w.ctr}% CTR</span>
                        </div>
                        <div className="relative">
                          <pre className="p-2 rounded bg-[#11131A] text-2xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
                            {w.embed_code}
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => copyToClipboard(w.embed_code, `widget-${w.id}`)}
                          >
                            {copiedKey === `widget-${w.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">No widgets created yet</div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="text-xs font-semibold text-foreground mb-2">Quick Actions</div>
                  <div className="flex flex-wrap gap-2">
                    {clientDetail.client.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1.5"
                        onClick={() => {
                          handleUpdateClientStatus(clientDetail.client.id, 'suspended')
                          setClientDetailOpen(false)
                        }}
                      >
                        <Ban className="h-3.5 w-3.5" /> Suspend Client
                      </Button>
                    )}
                    {clientDetail.client.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
                        onClick={() => {
                          handleUpdateClientStatus(clientDetail.client.id, 'active')
                          setClientDetailOpen(false)
                        }}
                      >
                        <Activity className="h-3.5 w-3.5" /> Reactivate Client
                      </Button>
                    )}
                    {clientDetail.client.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
                        onClick={() => {
                          handleUpdateClientStatus(clientDetail.client.id, 'cancelled')
                          setClientDetailOpen(false)
                        }}
                      >
                        <X className="h-3.5 w-3.5" /> Cancel Client
                      </Button>
                    )}
                  </div>

                  <Separator className="bg-[#1F2330]" />

                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2">Custom Branding</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                        <div className="text-2xs text-muted-foreground mb-1">Primary Color</div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded" style={{ background: clientDetail.client.custom_branding.primary_color }} />
                          <code className="text-xs text-foreground">{clientDetail.client.custom_branding.primary_color}</code>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0A0B0F] border border-[#1F2330]">
                        <div className="text-2xs text-muted-foreground mb-1">Hide Predictly Branding</div>
                        <div className="text-xs text-foreground">{clientDetail.client.custom_branding.hide_predictly_branding ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2">Embed Domains</div>
                    <div className="flex flex-wrap gap-1.5">
                      {clientDetail.client.embed_domains.map((d) => (
                        <span key={d} className="text-2xs px-2 py-1 rounded bg-[#0A0B0F] border border-[#1F2330] text-muted-foreground font-mono">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
