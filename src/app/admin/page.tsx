'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn, formatUSD, formatCompact } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRightLeft,
  Wallet,
  Bot,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Loader2,
} from 'lucide-react'
import type { AdminStats, AdminLog, AISwarmStatus } from '@/types'

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-brand' },
  { key: 'activeMarkets', label: 'Active Markets', icon: TrendingUp, color: 'text-yes' },
  { key: 'totalVolume', label: 'Total Volume', icon: DollarSign, color: 'text-gold', format: 'usd' },
  { key: 'pendingKyc', label: 'Pending KYC', icon: Clock, color: 'text-warn' },
  { key: 'pendingRedemptions', label: 'Pending Redemptions', icon: ArrowRightLeft, color: 'text-sweeps' },
  { key: 'totalPayout', label: 'Total Payout', icon: Wallet, color: 'text-profit', format: 'usd' },
] as const

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null)
  const [logs, setLogs] = React.useState<AdminLog[]>([])
  const [aiStatus, setAiStatus] = React.useState<AISwarmStatus | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, logsRes, aiRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity'),
          fetch('/api/admin/ai-config'),
        ])
        const statsData = await statsRes.json()
        const logsData = await logsRes.json()
        const aiData = await aiRes.json()

        setStats(statsData)
        setLogs(logsData)
        setAiStatus(aiData)
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-fg">Admin Overview</h1>
        <p className="text-sm text-fg-muted mt-1">System status and quick actions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const value = stats?.[card.key as keyof AdminStats] ?? 0
          return (
            <Card key={card.key} className="bg-bg-subtle border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={cn('h-4 w-4', card.color)} />
                  <span className="text-2xs text-fg-muted font-medium">{card.label}</span>
                </div>
                <div className="text-lg font-bold text-fg">
                  {card.format === 'usd'
                    ? formatUSD(value as number)
                    : formatCompact(value as number)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Chart */}
        <Card className="lg:col-span-2 bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-fg flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              Recent Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end gap-2 h-40">
              {[42, 68, 35, 82, 56, 74, 91].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-brand/60 hover:bg-brand transition-colors"
                    style={{ height: `${(val / 100) * 100}%` }}
                  />
                  <span className="text-2xs text-fg-subtle">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Swarm Status */}
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-fg flex items-center gap-2">
              <Bot className="h-4 w-4 text-sweeps" />
              AI Swarm Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Status</span>
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs font-medium',
                  aiStatus?.enabled
                    ? 'bg-yes-soft text-yes border-yes-border'
                    : 'bg-no-soft text-no border-no-border'
                )}
              >
                {aiStatus?.enabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Running</span>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', aiStatus?.running ? 'bg-yes live-dot' : 'bg-fg-subtle')} />
                <span className="text-sm text-fg">{aiStatus?.running ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Today&apos;s Trades</span>
              <span className="text-sm font-semibold text-fg">{aiStatus?.total_trades_today ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Today&apos;s Volume</span>
              <span className="text-sm font-semibold text-fg">
                {formatUSD(aiStatus?.total_amount_today ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Active Agents</span>
              <span className="text-sm font-semibold text-fg">4</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-fg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            <Link href="/admin/markets">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-fg-muted hover:text-fg hover:bg-bg-elevated h-11"
              >
                <Plus className="h-4 w-4 text-yes" />
                <span>Create Market</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-fg-muted hover:text-fg hover:bg-bg-elevated h-11"
              >
                <ShieldCheck className="h-4 w-4 text-warn" />
                <span>Review KYC ({stats?.pendingKyc ?? 0} pending)</span>
              </Button>
            </Link>
            <Link href="/admin/disputes">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-fg-muted hover:text-fg hover:bg-bg-elevated h-11"
              >
                <AlertTriangle className="h-4 w-4 text-no" />
                <span>Resolve Disputes</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Admin Logs */}
        <Card className="bg-bg-subtle border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-fg">Recent Logs</CardTitle>
              <Link href="/admin/logs" className="text-xs text-brand hover:text-brand-hover">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-fg truncate">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-2xs text-fg-subtle shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-2xs text-fg-muted truncate">
                      {log.reason || JSON.stringify(log.changes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
