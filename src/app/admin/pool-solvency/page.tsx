'use client'

import * as React from 'react'
import { cn, formatUSD, formatCompact } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ShieldCheck, AlertTriangle, XCircle, Droplets,
  DollarSign, TrendingUp, ArrowDownToLine, Activity,
  Loader2, CheckCircle2, Clock, Zap,
} from 'lucide-react'
import { markets } from '@/lib/mockData'
import {
  checkPoolSolvency,
  calculateRedemptionPriority,
  generatePlatformSolvencyReport,
  generateRebalancingRecommendations,
  type PoolSolvencyCheck,
  type RedemptionPriority,
  type RebalancingAction,
} from '@/lib/pool-solvency'

const healthColors: Record<string, string> = {
  excellent: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  good: 'bg-brand-soft text-brand border-brand-border',
  caution: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  at_risk: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  insolvent: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
}

const urgencyColors: Record<string, string> = {
  critical: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  high: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
}

export default function PoolSolvencyPage() {
  const [loading, setLoading] = React.useState(true)
  const [report, setReport] = React.useState<ReturnType<typeof generatePlatformSolvencyReport> | null>(null)
  const [rebalancing, setRebalancing] = React.useState<RebalancingAction[]>([])
  const [solvencyChecks, setSolvencyChecks] = React.useState<PoolSolvencyCheck[]>([])
  const [priorities, setPriorities] = React.useState<RedemptionPriority[]>([])

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/pool-solvency')
        if (res.ok) {
          const data = await res.json()
          setReport(data.report)
          setRebalancing(data.rebalancing)
          setSolvencyChecks(data.solvencyChecks)
          setPriorities(data.report.markets_by_priority)
        } else {
          // Fallback to local calculation
          const r = generatePlatformSolvencyReport(markets)
          setReport(r)
          setRebalancing(generateRebalancingRecommendations(markets))
          setSolvencyChecks(markets.map(m => checkPoolSolvency(m)))
          setPriorities(r.markets_by_priority)
        }
      } catch {
        const r = generatePlatformSolvencyReport(markets)
        setReport(r)
        setRebalancing(generateRebalancingRecommendations(markets))
        setSolvencyChecks(markets.map(m => checkPoolSolvency(m)))
        setPriorities(r.markets_by_priority)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
          <Droplets className="h-6 w-6 text-brand" />
          Pool Solvency & Redemption
        </h1>
        <p className="text-sm text-fg-muted mt-1">Smart pool ordering ensures redeems can always be paid</p>
      </div>

      {/* Platform Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Liquidity', value: formatUSD(report.total_liquidity), icon: DollarSign, color: 'text-brand' },
          { label: 'Total Payouts', value: formatUSD(report.total_potential_payouts), icon: TrendingUp, color: 'text-yes' },
          { label: 'Solvency Ratio', value: `${(report.platform_solvency_ratio * 100).toFixed(0)}%`, icon: ShieldCheck, color: report.platform_solvency_ratio >= 1 ? 'text-emerald-500' : 'text-rose-500' },
          { label: 'Solvent Markets', value: `${report.solvent_markets}`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'At Risk', value: `${report.at_risk_markets}`, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Insolvent', value: `${report.insolvent_markets}`, icon: XCircle, color: 'text-rose-500' },
          { label: 'Fee Revenue', value: formatUSD(report.fee_revenue_available), icon: Activity, color: 'text-gold' },
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

      {/* Solvency Progress Bar */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={cn('h-5 w-5', report.platform_solvency_ratio >= 1 ? 'text-emerald-500' : 'text-rose-500')} />
              <span className="font-semibold text-fg">Platform Solvency</span>
            </div>
            <span className={cn('text-sm font-bold', report.platform_solvency_ratio >= 1 ? 'text-emerald-500' : 'text-rose-500')}>
              {(report.platform_solvency_ratio * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(100, report.platform_solvency_ratio * 100)} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-2xs text-fg-muted">
            <span>Total Liquidity: {formatUSD(report.total_liquidity)}</span>
            <span>Required: {formatUSD(report.total_potential_payouts)}</span>
          </div>
          {report.total_deficit > 0 && (
            <div className="mt-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Deficit: {formatUSD(report.total_deficit)} — Some pools need additional liquidity
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Priority Queue */}
      <Card className="bg-bg-subtle border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-brand" />
            Redemption Priority Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xs text-fg-muted mb-4">
            Markets are ordered by redemption priority. Solvent pools process redemptions instantly;
            at-risk pools queue until sufficient liquidity.
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-elevated border-b border-border">
                  <th className="text-left px-4 py-3 text-fg-muted font-medium text-2xs">#</th>
                  <th className="text-left px-4 py-3 text-fg-muted font-medium text-2xs">Market</th>
                  <th className="text-left px-4 py-3 text-fg-muted font-medium text-2xs">Health</th>
                  <th className="text-right px-4 py-3 text-fg-muted font-medium text-2xs">Total Pool</th>
                  <th className="text-right px-4 py-3 text-fg-muted font-medium text-2xs">Max Payout</th>
                  <th className="text-right px-4 py-3 text-fg-muted font-medium text-2xs">Solvency</th>
                  <th className="text-right px-4 py-3 text-fg-muted font-medium text-2xs">Redeemable</th>
                  <th className="text-left px-4 py-3 text-fg-muted font-medium text-2xs">Est. Wait</th>
                </tr>
              </thead>
              <tbody>
                {solvencyChecks.map((check, i) => {
                  const priority = priorities.find(p => p.market_id === check.market_id)
                  const health = priority?.pool_health ?? 'caution'
                  return (
                    <tr key={check.market_id} className="border-b border-border hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-4 py-3 text-fg-muted font-mono text-2xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-fg max-w-[200px] truncate">{check.market_title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('text-2xs', healthColors[health])}>
                          {health.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatUSD(check.total_pool)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatUSD(check.total_potential_payout)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('font-semibold tabular-nums', check.is_solvent ? 'text-emerald-500' : 'text-rose-500')}>
                          {(check.solvency_ratio * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-fg">{formatUSD(check.max_redeemable)}</td>
                      <td className="px-4 py-3 text-2xs text-fg-muted">{priority?.estimated_redeem_time ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rebalancing Recommendations */}
      {rebalancing.length > 0 && (
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Rebalancing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {rebalancing.map((rec) => (
                <div key={rec.market_id} className={cn(
                  'rounded-lg border p-4',
                  rec.urgency === 'critical' ? 'bg-rose-500/5 border-rose-500/20' :
                  rec.urgency === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-bg border-border'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{rec.market_title}</span>
                      <Badge variant="outline" className={cn('text-2xs', urgencyColors[rec.urgency])}>
                        {rec.urgency}
                      </Badge>
                    </div>
                    <span className="text-sm text-fg-muted">{rec.action.replace('_', ' ')}</span>
                  </div>
                  <p className="text-2xs text-fg-muted">{rec.reason}</p>
                  {rec.amount > 0 && (
                    <div className="mt-2 text-sm font-semibold text-fg">
                      Amount: {formatUSD(rec.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="bg-bg-subtle border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">How the Smart Pool System Works</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-bg p-4 border border-border">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="text-sm font-semibold mb-1">Priority Ordering</div>
              <p className="text-2xs text-fg-muted">Markets are ranked by solvency ratio, pool size, volume, and time to close. Most solvent pools process redemptions first.</p>
            </div>
            <div className="rounded-lg bg-bg p-4 border border-border">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="text-sm font-semibold mb-1">5% Reserve Buffer</div>
              <p className="text-2xs text-fg-muted">Each pool maintains a 5% reserve. Redemptions can only use pool minus reserve. This ensures there&apos;s always a safety net.</p>
            </div>
            <div className="rounded-lg bg-bg p-4 border border-border">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="text-sm font-semibold mb-1">Fee Revenue Rebalancing</div>
              <p className="text-2xs text-fg-muted">3% fees (2% house + 1% platform) are routed to at-risk pools first. Over-capitalized pools can free up capital for thinner markets.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
