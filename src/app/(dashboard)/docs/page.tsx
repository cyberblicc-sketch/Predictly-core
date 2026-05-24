'use client'

import { useState } from 'react'
import {
  Code2,
  Zap,
  BarChart3,
  LineChart,
  Calendar,
  TrendingUp,
  Activity,
  Globe,
  LayoutGrid,
  CreditCard,
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Mail,
  Key,
  Clock,
  Server,
  Webhook,
  Layers,
  Box,
  LayoutDashboard,
  ArrowLeftRight,
  Send,
  Eye,
  MousePointerClick,
  CheckCircle2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { WisdomFeedPricingTier, MaaSWidget } from '@/types'

// ── Pricing Tier Data ──────────────────────────────────────────────────────

const PRICING_TIERS: WisdomFeedPricingTier[] = [
  {
    id: 'tier1',
    name: 'Explorer',
    price: 49,
    description: 'Perfect for getting started with prediction market data and building prototypes.',
    features: [
      'Basic market data endpoints',
      'Probability snapshots',
      'Category listings',
      'Community support',
      'Standard SLA',
    ],
    rate_limit: 100,
    data_delay: '5 minutes',
    included_endpoints: ['GET /markets', 'GET /markets/:id', 'GET /probabilities', 'GET /categories'],
  },
  {
    id: 'tier2',
    name: 'Professional',
    price: 199,
    description: 'For teams building production applications with real-time data needs.',
    features: [
      'All Explorer endpoints',
      'Historical price data',
      'Webhook notifications',
      'Volume & liquidity feeds',
      'Priority email support',
      '99.9% uptime SLA',
    ],
    rate_limit: 500,
    data_delay: '1 minute',
    included_endpoints: [
      'All Explorer endpoints',
      'GET /history/:market',
      'POST /webhooks',
      'GET /volume',
      'GET /liquidity',
    ],
  },
  {
    id: 'tier3',
    name: 'Enterprise',
    price: 499,
    description: 'Full access with real-time streaming, custom categories, and dedicated support.',
    features: [
      'All Professional endpoints',
      'Real-time streaming (WebSocket)',
      'Custom category creation',
      'Dedicated account manager',
      'Custom rate limits',
      'On-premise deployment option',
    ],
    rate_limit: 2000,
    data_delay: 'Real-time',
    included_endpoints: [
      'All Professional endpoints',
      'WS /stream',
      'POST /categories/custom',
      'GET /analytics/advanced',
      'GET /sentiment',
    ],
  },
]

// ── Wisdom Feed Types ──────────────────────────────────────────────────────

const WISDOM_FEEDS = [
  {
    id: 'market-sentiment',
    name: 'Market Sentiment',
    description: 'Real-time sentiment scores aggregated from trading activity, social signals, and order flow analysis across all active markets.',
    icon: BarChart3,
    price: '$79/mo',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    sampleData: `{
  "market_id": "m-btc-200k",
  "sentiment": 0.72,
  "bullish_signals": 342,
  "bearish_signals": 128,
  "confidence": 0.89
}`,
  },
  {
    id: 'trend-detection',
    name: 'Trend Detection',
    description: 'AI-powered trend identification that surfaces emerging market narratives, momentum shifts, and category-wide movement patterns before they become obvious.',
    icon: TrendingUp,
    price: '$99/mo',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    sampleData: `{
  "trend_id": "t-ai-agents",
  "category": "Tech",
  "momentum": 0.87,
  "markets_affected": 4,
  "emerged_at": "2026-03-08T14:22:00Z"
}`,
  },
  {
    id: 'volume-analysis',
    name: 'Volume Analysis',
    description: 'Granular volume breakdowns by outcome, time window, and trader segment. Detect unusual activity, whale movements, and liquidity shifts as they happen.',
    icon: Activity,
    price: '$69/mo',
    color: 'from-sky-500/20 to-cyan-500/20',
    borderColor: 'border-sky-500/30',
    iconColor: 'text-sky-500',
    sampleData: `{
  "market_id": "m-election-2028",
  "total_volume_24h": 2400000,
  "whale_pct": 0.34,
  "unusual_activity": true,
  "liquidity_change": "+12.4%"
}`,
  },
  {
    id: 'event-calendar',
    name: 'Event Calendar',
    description: 'Curated feed of upcoming resolution events, economic releases, and scheduled announcements that could move prediction market probabilities.',
    icon: Calendar,
    price: '$49/mo',
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-500',
    sampleData: `{
  "event_id": "e-fomc-march",
  "title": "FOMC Rate Decision",
  "date": "2026-03-18T18:00:00Z",
  "markets_impacted": 3,
  "importance": "high"
}`,
  },
]

// ── MaaS Widget Data ───────────────────────────────────────────────────────

const WIDGET_TYPES: {
  type: MaaSWidget['type']
  name: string
  description: string
  icon: React.ElementType
  color: string
  borderColor: string
  iconColor: string
  embedCode: string
  price: string
}[] = [
  {
    type: 'full_market',
    name: 'Full Market Widget',
    description: 'Complete market experience with live probability, trading interface, volume stats, and countdown timer. Best for embedding individual markets in articles or apps.',
    icon: LayoutDashboard,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/market/m-btc-200k"
  width="600" height="480"
  frameborder="0"
></iframe>`,
    price: '$299/mo',
  },
  {
    type: 'mini_card',
    name: 'Mini Card',
    description: 'Compact market card showing current probability, 7-day trend, and category. Ideal for sidebars, article embeds, and content pages.',
    icon: CreditCard,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/mini/m-btc-200k"
  width="320" height="200"
  frameborder="0"
></iframe>`,
    price: '$99/mo',
  },
  {
    type: 'probability_bar',
    name: 'Probability Bar',
    description: 'Minimal inline bar showing current YES probability with color-coded confidence. Perfect for inline content integration and data-rich dashboards.',
    icon: BarChart3,
    color: 'from-sky-500/20 to-cyan-500/20',
    borderColor: 'border-sky-500/30',
    iconColor: 'text-sky-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/bar/m-btc-200k"
  width="100%" height="48"
  frameborder="0"
></iframe>`,
    price: '$99/mo',
  },
  {
    type: 'leaderboard',
    name: 'Leaderboard Widget',
    description: 'Top traders leaderboard showing rankings, win rates, and badges. Drive engagement by showcasing the best predictors on your platform.',
    icon: LayoutGrid,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/leaderboard"
  width="400" height="600"
  frameborder="0"
></iframe>`,
    price: '$199/mo',
  },
  {
    type: 'ticker',
    name: 'Ticker Widget',
    description: 'Scrolling market ticker showing real-time probability changes across markets. Great for headers, footers, or live dashboard sidebars.',
    icon: ArrowLeftRight,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/ticker"
  width="100%" height="40"
  frameborder="0"
></iframe>`,
    price: '$149/mo',
  },
  {
    type: 'multi_market',
    name: 'Multi-Market Widget',
    description: 'Grid of multiple markets with compact probability displays. Curate a selection of markets by category or custom list for your audience.',
    icon: Layers,
    color: 'from-teal-500/20 to-emerald-500/20',
    borderColor: 'border-teal-500/30',
    iconColor: 'text-teal-500',
    embedCode: `<iframe
  src="https://widgets.predictly.io/grid?cats=Crypto,Tech"
  width="800" height="600"
  frameborder="0"
></iframe>`,
    price: '$249/mo',
  },
]

// ── Docs Page ──────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('api')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGetAPIKey = (tierName: string) => {
    toast({
      title: 'API Key Requested',
      description: `Your ${tierName} API key request has been submitted. Check your email for next steps.`,
    })
  }

  const handleSubscribe = (feedName: string) => {
    toast({
      title: 'Subscription Started',
      description: `You've subscribed to the ${feedName} feed. Setup instructions sent to your email.`,
    })
  }

  const handleGetStartedWidget = (widgetName: string) => {
    toast({
      title: 'Widget Setup Initiated',
      description: `Setup guide for ${widgetName} has been sent to your email.`,
    })
  }

  const handleSubmitEmail = () => {
    if (!email || !email.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' })
      return
    }
    toast({
      title: 'Demo Scheduled',
      description: `We'll reach out to ${email} within 24 hours to schedule your demo.`,
    })
    setEmail('')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ═══════════ Header ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center">
            <Code2 className="h-5 w-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Developer & <span className="gradient-text">Business Resources</span>
            </h1>
            <p className="text-sm text-fg-muted">APIs, data feeds, and embeddable widgets for prediction market integration</p>
          </div>
        </div>
      </div>

      {/* ═══════════ Tabs ═══════════ */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-bg-subtle border border-border">
          <TabsTrigger value="api" className="gap-1.5">
            <Key className="h-3.5 w-3.5" />
            API Access
          </TabsTrigger>
          <TabsTrigger value="feeds" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Wisdom Feeds
          </TabsTrigger>
          <TabsTrigger value="widgets" className="gap-1.5">
            <Box className="h-3.5 w-3.5" />
            MaaS Widgets
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ API Access Tab ═══════════ */}
        <TabsContent value="api" className="space-y-6 mt-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-sky-500" />
                Wisdom Feed API
              </h2>
              <p className="text-sm text-fg-muted mt-1">
                Access real-time prediction market data, probabilities, and historical trends via our RESTful API.
              </p>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs self-start">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              99.9% Uptime
            </Badge>
          </div>

          {/* Pricing Tiers */}
          <div className="grid md:grid-cols-3 gap-4">
            {PRICING_TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={cn(
                  'relative bg-bg-subtle border transition-all hover:shadow-lg',
                  tier.id === 'tier2'
                    ? 'border-sky-500/40 ring-1 ring-sky-500/20'
                    : 'border-border'
                )}
              >
                {tier.id === 'tier2' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-sky-500 text-white border-0 text-2xs px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    <div className="text-right">
                      <span className="text-2xl font-bold tabular-nums">${tier.price}</span>
                      <span className="text-fg-muted text-sm">/mo</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-1">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rate Limit & Data Delay */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-bg p-2.5 border border-border text-center">
                      <div className="text-2xs text-fg-muted mb-0.5">Rate Limit</div>
                      <div className="text-sm font-semibold tabular-nums">{tier.rate_limit.toLocaleString()} req/min</div>
                    </div>
                    <div className="rounded-lg bg-bg p-2.5 border border-border text-center">
                      <div className="text-2xs text-fg-muted mb-0.5">Data Delay</div>
                      <div className="text-sm font-semibold">{tier.data_delay}</div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Features */}
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-fg-muted">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Endpoints */}
                  <div className="rounded-lg bg-bg p-2.5 border border-border">
                    <div className="text-2xs text-fg-muted uppercase tracking-wider mb-1.5">Included Endpoints</div>
                    <div className="space-y-1">
                      {tier.included_endpoints.slice(0, 3).map((ep) => (
                        <code key={ep} className="block text-2xs text-sky-600 dark:text-sky-400 font-mono">
                          {ep}
                        </code>
                      ))}
                      {tier.included_endpoints.length > 3 && (
                        <div className="text-2xs text-fg-subtle">+{tier.included_endpoints.length - 3} more</div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleGetAPIKey(tier.name)}
                    className={cn(
                      'w-full h-10 font-semibold',
                      tier.id === 'tier2'
                        ? 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:opacity-90 text-white'
                        : 'bg-bg border border-border text-fg hover:bg-bg-elevated'
                    )}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Get API Key
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Code Snippet Example */}
          <Card className="bg-bg-subtle border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-sky-500" />
                Quick Start Example
              </CardTitle>
              <CardDescription className="text-xs">Fetch live market probabilities in under 10 lines of code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg bg-bg border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    <span className="text-2xs text-fg-muted ml-2">example.ts</span>
                  </div>
                  <button
                    onClick={() => handleCopy(API_EXAMPLE, 'api-example')}
                    className="flex items-center gap-1 text-2xs text-fg-muted hover:text-fg transition-colors"
                  >
                    {copied === 'api-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied === 'api-example' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-fg-muted overflow-x-auto">
                  <code>{API_EXAMPLE}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ Wisdom Feeds Tab ═══════════ */}
        <TabsContent value="feeds" className="space-y-6 mt-6">
          {/* Section Header */}
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-4 w-4 text-amber-500" />
              Wisdom Feeds
            </h2>
            <p className="text-sm text-fg-muted mt-1">
              Curated data streams delivering market intelligence, sentiment analysis, and trend signals directly to your application.
            </p>
          </div>

          {/* Feed Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {WISDOM_FEEDS.map((feed) => {
              const Icon = feed.icon
              return (
                <Card key={feed.id} className={cn('bg-bg-subtle border overflow-hidden', feed.borderColor)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center border',
                          feed.color, feed.borderColor
                        )}>
                          <Icon className={cn('h-4 w-4', feed.iconColor)} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{feed.name}</CardTitle>
                          <div className="text-2xs text-fg-muted">{feed.price}</div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-2">{feed.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Sample Data Preview */}
                    <div className="rounded-lg bg-bg border border-border overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-border text-2xs text-fg-muted flex items-center gap-1.5">
                        <Eye className="h-3 w-3" />
                        Sample Response
                      </div>
                      <pre className="p-3 text-2xs font-mono text-fg-muted overflow-x-auto max-h-32">
                        <code>{feed.sampleData}</code>
                      </pre>
                    </div>

                    <Button
                      onClick={() => handleSubscribe(feed.name)}
                      className={cn(
                        'w-full h-9 font-semibold text-sm',
                        'bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white'
                      )}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ═══════════ MaaS Widgets Tab ═══════════ */}
        <TabsContent value="widgets" className="space-y-6 mt-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                Market-as-a-Service Widgets
              </h2>
              <p className="text-sm text-fg-muted mt-1">
                Embed prediction markets directly into your website or app with our customizable widget system.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-fg-muted">
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-2xs">
                Starting at $99/mo
              </Badge>
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-2xs">
                Custom Branding $299/mo
              </Badge>
            </div>
          </div>

          {/* Widget Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WIDGET_TYPES.map((widget) => {
              const Icon = widget.icon
              return (
                <Card key={widget.type} className={cn('bg-bg-subtle border overflow-hidden', widget.borderColor)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        'h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center border',
                        widget.color, widget.borderColor
                      )}>
                        <Icon className={cn('h-4 w-4', widget.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm">{widget.name}</CardTitle>
                        <div className="text-2xs text-fg-muted">{widget.price}</div>
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-2">{widget.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Embed Code Snippet */}
                    <div className="rounded-lg bg-bg border border-border overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                        <span className="text-2xs text-fg-muted flex items-center gap-1.5">
                          <Code2 className="h-3 w-3" />
                          Embed Code
                        </span>
                        <button
                          onClick={() => handleCopy(widget.embedCode, widget.type)}
                          className="flex items-center gap-1 text-2xs text-fg-muted hover:text-fg transition-colors"
                        >
                          {copied === widget.type ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          {copied === widget.type ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3 text-2xs font-mono text-fg-muted overflow-x-auto max-h-28">
                        <code>{widget.embedCode}</code>
                      </pre>
                    </div>

                    <Button
                      onClick={() => handleGetStartedWidget(widget.name)}
                      className="w-full h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold text-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════ Checkout / CTA Section ═══════════ */}
      <Card className="glass border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">
                Ready to integrate <span className="gradient-text">prediction markets</span>?
              </h2>
              <p className="text-sm text-fg-muted leading-relaxed">
                Get started with a free trial or schedule a personalized demo with our integration team.
                We&apos;ll help you choose the right plan and get up and running in under an hour.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Free 14-day trial
                </div>
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
            <div className="w-full md:w-80 shrink-0">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-bg border-border"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitEmail()}
                />
                <Button
                  onClick={handleSubmitEmail}
                  className="h-11 px-6 bg-gradient-to-r from-sky-600 to-cyan-600 hover:opacity-90 text-white font-semibold shrink-0"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
              <p className="text-2xs text-fg-subtle mt-2">We&apos;ll reach out within 24 hours to schedule your demo.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Code Example ───────────────────────────────────────────────────────────

const API_EXAMPLE = `// Fetch live market probabilities
const res = await fetch(
  'https://api.predictly.io/v1/markets/m-btc-200k',
  {
    headers: {
      'Authorization': 'Bearer pk_live_...',
      'Content-Type': 'application/json'
    }
  }
)

const market = await res.json()
console.log(market.probability) // 0.62
console.log(market.volume_24h)  // 2340000`
