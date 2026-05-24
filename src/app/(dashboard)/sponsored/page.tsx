'use client'

import { useState, useMemo } from 'react'
import {
  Zap,
  Eye,
  MousePointerClick,
  BarChart3,
  Info,
  ArrowRight,
  TrendingUp,
  Megaphone,
  Sparkles,
  Filter,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { markets } from '@/lib/mockData'
import { MarketCard } from '@/components/market/MarketCard'
import type { BoostPlacement } from '@/types'

// ── Filter Tabs Config ─────────────────────────────────────────────────────

const PLACEMENT_FILTERS: {
  value: string
  label: string
  placement?: BoostPlacement
  color: string
}[] = [
  { value: 'all', label: 'All', color: 'text-fg' },
  { value: 'hero', label: 'Hero', placement: 'hero', color: 'text-amber-500' },
  { value: 'featured', label: 'Featured', placement: 'featured', color: 'text-emerald-500' },
  { value: 'category_top', label: 'Category Top', placement: 'category_top', color: 'text-violet-500' },
  { value: 'sidebar', label: 'Sidebar', placement: 'sidebar', color: 'text-sky-500' },
  { value: 'ticker', label: 'Ticker', placement: 'ticker', color: 'text-rose-500' },
]

// ── Mock Stats ─────────────────────────────────────────────────────────────

const SPONSORED_STATS = {
  totalSponsored: 2,
  totalImpressions: 847_300,
  averageCTR: 3.2,
  totalSpend: 24_500,
}

// ── Sponsored Page ─────────────────────────────────────────────────────────

export default function SponsoredPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { toast } = useToast()

  // Filter markets that have the `boosted` property
  const boostedMarkets = useMemo(
    () => markets.filter((m) => m.boosted),
    []
  )

  // Apply placement filter
  const filteredMarkets = useMemo(() => {
    if (activeFilter === 'all') return boostedMarkets
    const filter = PLACEMENT_FILTERS.find((f) => f.value === activeFilter)
    if (!filter?.placement) return boostedMarkets
    return boostedMarkets.filter((m) => m.boosted?.placement === filter.placement)
  }, [activeFilter, boostedMarkets])

  const handleSponsorCTA = () => {
    toast({
      title: 'Sponsorship Inquiry Sent',
      description: 'Our team will reach out within 24 hours to discuss sponsorship options.',
    })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ═══════════ Header ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Sponsored <span className="gradient-text">Markets</span>
            </h1>
            <p className="text-sm text-fg-muted">Boosted and promoted markets from our sponsorship partners</p>
          </div>
        </div>
      </div>

      {/* ═══════════ Stats ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <Megaphone className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <div className="text-2xl font-bold tabular-nums">{SPONSORED_STATS.totalSponsored}</div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Sponsored Markets</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <Eye className="h-5 w-5 mx-auto mb-1.5 text-sky-500" />
            <div className="text-2xl font-bold tabular-nums">
              {SPONSORED_STATS.totalImpressions >= 1_000_000
                ? `${(SPONSORED_STATS.totalImpressions / 1_000_000).toFixed(1)}M`
                : SPONSORED_STATS.totalImpressions >= 1_000
                  ? `${(SPONSORED_STATS.totalImpressions / 1_000).toFixed(0)}K`
                  : SPONSORED_STATS.totalImpressions.toLocaleString()
              }
            </div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Total Impressions</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <MousePointerClick className="h-5 w-5 mx-auto mb-1.5 text-emerald-500" />
            <div className="text-2xl font-bold tabular-nums">{SPONSORED_STATS.averageCTR}%</div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Average CTR</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1.5 text-violet-500" />
            <div className="text-2xl font-bold tabular-nums">
              ${SPONSORED_STATS.totalSpend.toLocaleString()}
            </div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Total Sponsor Spend</div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ Filter Tabs ═══════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-fg-muted" />
          <h2 className="text-sm font-medium text-fg-muted">Filter by Placement</h2>
        </div>
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="bg-bg-subtle border border-border flex-wrap h-auto gap-1 p-1">
            {PLACEMENT_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="gap-1.5 text-xs data-[state=active]:shadow-none"
              >
                {filter.placement && <Zap className={cn('h-3 w-3', filter.color)} />}
                {filter.label}
                {filter.placement && (
                  <Badge className="ml-1 h-4 min-w-[18px] px-1 text-[9px] bg-bg border border-border text-fg-muted tabular-nums">
                    {boostedMarkets.filter((m) => m.boosted?.placement === filter.placement).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ═══════════ Market Grid ═══════════ */}
      {filteredMarkets.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-8 text-center">
            <Megaphone className="h-10 w-10 mx-auto mb-3 text-fg-muted" />
            <p className="text-fg-muted font-medium">No sponsored markets found</p>
            <p className="text-2xs text-fg-subtle mt-1">
              No markets are currently boosted with the &quot;{PLACEMENT_FILTERS.find((f) => f.value === activeFilter)?.label}&quot; placement filter.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ Sponsorship Info ═══════════ */}
      <Card className="glass border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold">Want to sponsor a market?</h3>
              </div>
              <p className="text-sm text-fg-muted leading-relaxed">
                Boost your market&apos;s visibility with sponsored placements. Choose from hero banners, featured spots,
                category top positions, sidebar placements, or scrolling tickers. Reach hundreds of thousands of
                engaged prediction market participants with targeted visibility.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Eye className="h-3.5 w-3.5 text-sky-500" />
                  800K+ monthly impressions
                </div>
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  3.2% average CTR
                </div>
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  5 placement options
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Button
                onClick={handleSponsorCTA}
                className="h-11 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-semibold"
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ How Sponsorship Works ═══════════ */}
      <Card className="bg-bg-subtle border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-500" />
            How Sponsored Markets Work
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-fg-muted leading-relaxed space-y-3">
          <p>
            Sponsored markets allow projects, companies, and organizations to boost the visibility of prediction
            markets relevant to their audience. Each sponsored placement is clearly labeled to maintain transparency
            and trust within the Predictly community.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Choose Placement
              </div>
              <p className="text-2xs">Select from 5 placement types — hero, featured, category top, sidebar, or ticker — each targeting different user attention zones.</p>
            </div>
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-sky-500" />
                Set Budget
              </div>
              <p className="text-2xs">Define your daily or total budget. You only pay for actual impressions delivered, with real-time analytics and transparent reporting.</p>
            </div>
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                Track Performance
              </div>
              <p className="text-2xs">Monitor impressions, clicks, CTR, and downstream trading activity from your sponsored placement in real-time via the sponsor dashboard.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
