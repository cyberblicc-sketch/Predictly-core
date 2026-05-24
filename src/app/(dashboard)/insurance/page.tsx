'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  TrendingDown,
  ArrowRight,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { cn, formatUSD } from '@/lib/utils'
import { portfolio } from '@/lib/mockData'
import {
  INSURANCE_TYPE_INFO,
  MOCK_INSURANCE_POLICIES,
  calculateInsuranceQuote,
  checkInsuranceTrigger,
  getRiskScore,
} from '@/lib/insurance'
import type {
  InsurancePolicy,
  InsuranceType,
  InsuranceQuote,
} from '@/types'
import type { Position } from '@/types'

// ── Insurance Page ───────────────────────────────────────────────────────────

export default function InsurancePage() {
  const [activePolicies, setActivePolicies] = useState<InsurancePolicy[]>([])
  const [historicalPolicies, setHistoricalPolicies] = useState<InsurancePolicy[]>([])
  const [loading, setLoading] = useState(true)

  // Get insurance state
  const [selectedPositionId, setSelectedPositionId] = useState<string>('')
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('partial_hedge')
  const [coveragePct, setCoveragePct] = useState<number>(50)
  const [quote, setQuote] = useState<InsuranceQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const { toast } = useToast()

  // Load policies
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const res = await fetch('/api/insurance')
        if (res.ok) {
          const data = await res.json()
          const policies: InsurancePolicy[] = data.policies || []
          setActivePolicies(policies.filter((p) => p.status === 'active'))
          setHistoricalPolicies(policies.filter((p) => p.status !== 'active'))
        } else {
          // Fallback to mock data
          setActivePolicies(MOCK_INSURANCE_POLICIES.filter((p) => p.status === 'active'))
          setHistoricalPolicies(MOCK_INSURANCE_POLICIES.filter((p) => p.status !== 'active'))
        }
      } catch {
        setActivePolicies(MOCK_INSURANCE_POLICIES.filter((p) => p.status === 'active'))
        setHistoricalPolicies(MOCK_INSURANCE_POLICIES.filter((p) => p.status !== 'active'))
      } finally {
        setLoading(false)
      }
    }
    loadPolicies()
  }, [])

  // Fetch quote when inputs change
  const fetchQuote = useCallback(async () => {
    if (!selectedPositionId) {
      setQuote(null)
      return
    }

    setQuoteLoading(true)
    try {
      const res = await fetch('/api/insurance/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: selectedPositionId,
          insurance_type: insuranceType,
          coverage_pct: coveragePct,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setQuote(data.quote)
      }
    } catch {
      // Silently fail
    } finally {
      setQuoteLoading(false)
    }
  }, [selectedPositionId, insuranceType, coveragePct])

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 300)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  // Set default coverage based on type
  useEffect(() => {
    if (insuranceType === 'full_hedge') setCoveragePct(100)
    else if (insuranceType === 'partial_hedge') setCoveragePct(50)
    else if (insuranceType === 'stop_loss') setCoveragePct(100)
  }, [insuranceType])

  // Purchase insurance
  const handlePurchase = async () => {
    if (!selectedPositionId || !quote) return

    setPurchasing(true)
    try {
      const res = await fetch('/api/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_id: selectedPositionId,
          insurance_type: insuranceType,
          coverage_pct: coveragePct,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Insurance purchased!',
          description: `Policy created for ${quote.premium.toFixed(2)} SC premium. You're now protected!`,
        })
        setActivePolicies((prev) => [...prev, data.policy])
        setSelectedPositionId('')
        setQuote(null)
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to purchase insurance.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setPurchasing(false)
    }
  }

  // Claim insurance
  const handleClaim = async (policyId: string) => {
    try {
      const res = await fetch(`/api/insurance/${policyId}/claim`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Claim processed!',
          description: `${data.payout} SC will be credited to your account.`,
        })
        // Move from active to historical
        setActivePolicies((prev) => prev.filter((p) => p.id !== policyId))
        setHistoricalPolicies((prev) => [
          ...prev,
          { ...activePolicies.find((p) => p.id === policyId)!, status: 'claimed', claimed_at: new Date().toISOString(), payout: data.payout },
        ])
      } else {
        toast({ title: 'Claim denied', description: data.error || 'Trigger condition not met.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    }
  }

  // Get selected position
  const selectedPosition = portfolio.positions.find((p) => p.id === selectedPositionId)

  return (
    <div className="space-y-6 pb-8">
      {/* ═══════════ Header ═══════════ */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Position Insurance</h1>
            <p className="text-sm text-fg-muted">Protect your positions against adverse market moves</p>
          </div>
        </div>
      </div>

      {/* ═══════════ Summary Stats ═══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-1.5 text-emerald-500" />
            <div className="text-2xl font-bold tabular-nums">{activePolicies.length}</div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Active Policies</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1.5 text-sky-500" />
            <div className="text-2xl font-bold tabular-nums">
              {activePolicies.reduce((sum, p) => sum + p.coverage_amount, 0).toLocaleString()}
            </div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Total Coverage</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <div className="text-2xl font-bold tabular-nums">
              {activePolicies.reduce((sum, p) => sum + p.premium, 0).toFixed(0)}
            </div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Premiums Paid</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1.5 text-rose-500" />
            <div className="text-2xl font-bold tabular-nums">
              {historicalPolicies.filter((p) => p.status === 'claimed').length}
            </div>
            <div className="text-2xs text-fg-muted uppercase tracking-wider">Claims Made</div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ Active Policies ═══════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Active Policies
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        ) : activePolicies.length === 0 ? (
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-8 text-center">
              <Shield className="h-10 w-10 mx-auto mb-3 text-fg-muted" />
              <p className="text-fg-muted">No active insurance policies</p>
              <p className="text-2xs text-fg-subtle mt-1">Protect your positions by purchasing insurance below</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {activePolicies.map((policy) => (
              <ActivePolicyCard
                key={policy.id}
                policy={policy}
                onClaim={handleClaim}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ Get Insurance ═══════════ */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Get Insurance
        </h2>

        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-5 space-y-5">
            {/* Select Position */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Position</label>
              <Select
                value={selectedPositionId}
                onValueChange={setSelectedPositionId}
              >
                <SelectTrigger className="h-10 bg-bg border-border">
                  <SelectValue placeholder="Choose a position to insure" />
                </SelectTrigger>
                <SelectContent>
                  {portfolio.positions.map((pos) => {
                    const riskScore = getRiskScore(pos.marketId)
                    return (
                      <SelectItem key={pos.id} value={pos.id}>
                        <span className="flex items-center gap-2">
                          <span>{pos.imageEmoji}</span>
                          <span className="truncate max-w-[200px]">{pos.marketTitle}</span>
                          <Badge
                            className={cn(
                              'text-[9px] ml-1',
                              riskScore >= 70
                                ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                                : riskScore >= 45
                                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                            )}
                          >
                            Risk: {riskScore}
                          </Badge>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Insurance Type Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Insurance Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(INSURANCE_TYPE_INFO) as [InsuranceType, typeof INSURANCE_TYPE_INFO[InsuranceType]][]).map(
                  ([type, info]) => {
                    const isSelected = insuranceType === type
                    return (
                      <button
                        key={type}
                        onClick={() => setInsuranceType(type)}
                        className={cn(
                          'relative rounded-xl border p-3 text-center transition-all duration-200',
                          isSelected
                            ? `bg-gradient-to-br ${info.color} ring-2 ring-offset-1 ring-offset-bg border-emerald-500/40`
                            : 'bg-bg border-border hover:border-border-strong'
                        )}
                      >
                        <div className="text-2xl mb-1">{info.emoji}</div>
                        <div className={cn('text-xs font-semibold', isSelected ? 'text-fg' : 'text-fg-muted')}>
                          {info.name}
                        </div>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Coverage Percentage Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Coverage</label>
                <span className="text-sm font-semibold tabular-nums">{coveragePct}%</span>
              </div>
              <Slider
                value={[coveragePct]}
                onValueChange={(v) => setCoveragePct(v[0])}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-2xs text-fg-subtle mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Type Info */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors w-full">
                <Info className="h-3.5 w-3.5" />
                About {INSURANCE_TYPE_INFO[insuranceType].name}
                <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-fg-muted leading-relaxed bg-bg rounded-lg p-3 border border-border">
                <p className="mb-2">{INSURANCE_TYPE_INFO[insuranceType].description}</p>
                <p className="text-2xs italic">{INSURANCE_TYPE_INFO[insuranceType].recommendation}</p>
              </CollapsibleContent>
            </Collapsible>

            {/* Quote Display */}
            {selectedPositionId && quote && (
              <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold">Insurance Quote</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-2xs text-fg-muted">Premium</div>
                    <div className="font-bold text-lg tabular-nums text-amber-600 dark:text-amber-400">
                      {quote.premium.toFixed(2)} SC
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-fg-muted">Premium Rate</div>
                    <div className="font-semibold tabular-nums">{quote.premium_pct}%</div>
                  </div>
                  <div>
                    <div className="text-2xs text-fg-muted">Coverage Amount</div>
                    <div className="font-semibold tabular-nums">{quote.coverage_amount.toFixed(2)} SC</div>
                  </div>
                  <div>
                    <div className="text-2xs text-fg-muted">Trigger Price</div>
                    <div className="font-semibold tabular-nums">{(quote.trigger_price * 100).toFixed(1)}¢</div>
                  </div>
                  <div>
                    <div className="text-2xs text-fg-muted">Risk Score</div>
                    <div className="flex items-center gap-1">
                      <div className="font-semibold tabular-nums">{quote.risk_score}</div>
                      <Badge
                        className={cn(
                          'text-[9px]',
                          quote.risk_score >= 70
                            ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                            : quote.risk_score >= 45
                              ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        )}
                      >
                        {quote.risk_score >= 70 ? 'High' : quote.risk_score >= 45 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-fg-muted">Expires In</div>
                    <div className="font-semibold tabular-nums">{quote.expires_in_days} days</div>
                  </div>
                </div>

                {quote.recommendation && (
                  <div className="flex gap-2 text-2xs text-fg-muted bg-bg/50 rounded-lg p-2">
                    <Info className="shrink-0 h-3.5 w-3.5 mt-0.5 text-sky-500" />
                    {quote.recommendation}
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  disabled={purchasing || quoteLoading}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Purchase Insurance — {quote.premium.toFixed(2)} SC
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {quoteLoading && selectedPositionId && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-fg-muted" />
                <span className="ml-2 text-sm text-fg-muted">Calculating premium...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════ Insurance History ═══════════ */}
      {historicalPolicies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-fg-muted" />
            Insurance History
          </h2>
          <div className="space-y-2">
            {historicalPolicies.map((policy) => (
              <Card key={policy.id} className="bg-bg-subtle border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-bg flex items-center justify-center text-sm border border-border">
                        {policy.insurance_type === 'full_hedge' ? '🛡️' : policy.insurance_type === 'partial_hedge' ? '⚖️' : '🛑'}
                      </div>
                      <div>
                        <div className="text-sm font-medium truncate max-w-[280px]">{policy.market_title}</div>
                        <div className="text-2xs text-fg-muted">
                          {policy.insurance_type.replace('_', ' ')} · Coverage: {policy.coverage_pct}% · Premium: {policy.premium.toFixed(2)} SC
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {policy.status === 'claimed' && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          Claimed {policy.payout ? `+${policy.payout.toFixed(2)} SC` : ''}
                        </Badge>
                      )}
                      {policy.status === 'expired' && (
                        <Badge variant="outline" className="text-fg-muted">Expired</Badge>
                      )}
                      {policy.status === 'cancelled' && (
                        <Badge variant="outline" className="text-fg-muted">Cancelled</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ How Insurance Works ═══════════ */}
      <Card className="bg-bg-subtle border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-500" />
            How Position Insurance Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-fg-muted leading-relaxed space-y-3">
          <p>
            Position insurance acts like a put option for your prediction market bets. If the market
            moves against you and triggers your policy, you receive a payout to offset your losses.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1">🛡️ Full Hedge</div>
              <p className="text-2xs">100% coverage. Triggers on any loss. Highest premium but complete protection.</p>
            </div>
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1">⚖️ Partial Hedge</div>
              <p className="text-2xs">50% coverage at 20% loss. Balances cost and protection for moderate risk.</p>
            </div>
            <div className="rounded-lg bg-bg p-3 border border-border">
              <div className="font-semibold text-fg text-xs mb-1">🛑 Stop Loss</div>
              <p className="text-2xs">Triggers at a specific price. Lowest premium with targeted protection.</p>
            </div>
          </div>
          <div className="flex gap-2 text-2xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle className="shrink-0 h-4 w-4 text-amber-500 mt-0.5" />
            <p>
              Insurance premiums are non-refundable. Policies expire after the specified duration.
              Claims are only processed when trigger conditions are met.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Active Policy Card ───────────────────────────────────────────────────────

function ActivePolicyCard({
  policy,
  onClaim,
}: {
  policy: InsurancePolicy
  onClaim: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Calculate trigger distance
  const priceDistance = policy.trigger_price > 0
    ? ((policy.current_price - policy.trigger_price) / policy.trigger_price) * 100
    : 0
  const isNearTrigger = priceDistance < 15
  const isTriggered = policy.current_price <= policy.trigger_price

  // Check trigger
  const triggerCheck = checkInsuranceTrigger(policy, policy.current_price)

  // Progress bar: 0% = at trigger, 100% = safe
  const safetyPct = Math.max(0, Math.min(100, priceDistance))

  const typeEmoji = policy.insurance_type === 'full_hedge' ? '🛡️' : policy.insurance_type === 'partial_hedge' ? '⚖️' : '🛑'
  const typeName = INSURANCE_TYPE_INFO[policy.insurance_type].name

  return (
    <Card className={cn(
      'bg-bg-subtle border transition-colors',
      isTriggered ? 'border-rose-500/40' : isNearTrigger ? 'border-amber-500/40' : 'border-border'
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'h-9 w-9 rounded-lg flex items-center justify-center text-lg border shrink-0',
              isTriggered
                ? 'bg-rose-500/15 border-rose-500/30'
                : isNearTrigger
                  ? 'bg-amber-500/15 border-amber-500/30'
                  : 'bg-emerald-500/15 border-emerald-500/30'
            )}>
              {typeEmoji}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{policy.market_title}</div>
              <div className="text-2xs text-fg-muted">
                {typeName} · {policy.coverage_pct}% coverage
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isTriggered ? (
              <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-[10px]">
                <ShieldAlert className="h-3 w-3 mr-0.5" />
                Triggered
              </Badge>
            ) : isNearTrigger ? (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]">
                <ShieldAlert className="h-3 w-3 mr-0.5" />
                Near Trigger
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-0.5" />
                Safe
              </Badge>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="rounded-lg bg-bg p-2 border border-border">
            <div className="text-2xs text-fg-muted">Coverage</div>
            <div className="text-sm font-bold tabular-nums">{policy.coverage_amount.toFixed(0)} SC</div>
          </div>
          <div className="rounded-lg bg-bg p-2 border border-border">
            <div className="text-2xs text-fg-muted">Premium</div>
            <div className="text-sm font-bold tabular-nums">{policy.premium.toFixed(2)} SC</div>
          </div>
          <div className="rounded-lg bg-bg p-2 border border-border">
            <div className="text-2xs text-fg-muted">Rate</div>
            <div className="text-sm font-bold tabular-nums">{policy.premium_pct}%</div>
          </div>
        </div>

        {/* Safety Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-2xs mb-1">
            <span className="text-fg-muted">Distance to trigger</span>
            <span className={cn(
              'font-semibold tabular-nums',
              isTriggered ? 'text-rose-500' : isNearTrigger ? 'text-amber-500' : 'text-emerald-500'
            )}>
              {isTriggered ? 'TRIGGERED' : `${safetyPct.toFixed(0)}% safe`}
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-bg overflow-hidden border border-border">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                isTriggered
                  ? 'bg-rose-500 w-full'
                  : isNearTrigger
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              )}
              style={{ width: `${isTriggered ? 100 : safetyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-fg-subtle mt-1">
            <span>Trigger: {(policy.trigger_price * 100).toFixed(1)}¢</span>
            <span>Current: {(policy.current_price * 100).toFixed(1)}¢</span>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex items-center justify-center w-full text-2xs text-fg-muted hover:text-fg transition-colors py-1">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Less' : 'More details'}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-muted">Position value</span>
              <span className="tabular-nums">{policy.position_value.toFixed(2)} SC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Expires</span>
              <span>{new Date(policy.expires_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-muted">Created</span>
              <span>{new Date(policy.created_at).toLocaleDateString()}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Claim Button */}
        {isTriggered && (
          <Button
            onClick={() => onClaim(policy.id)}
            className="w-full mt-3 h-9 bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 text-white text-sm font-semibold"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            Claim Insurance
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
