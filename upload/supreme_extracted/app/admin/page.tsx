'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  LineChart,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react'

interface Stats {
  total_users: number
  active_markets: number
  volume_24h: number
  pending_kyc: number
  pending_redemptions: number
  protocol_fees_24h: number
  publisher_fees_24h: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
}

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'down'
  stripe: 'healthy' | 'degraded' | 'down'
  ai_swarm: 'healthy' | 'degraded' | 'down'
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, statusRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity'),
          fetch('/api/admin/system-status')
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats)
        }

        if (activityRes.ok) {
          const data = await activityRes.json()
          setActivity(data.activity || [])
        }

        if (statusRes.ok) {
          const data = await statusRes.json()
          setSystemStatus(data.status)
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div>
        <h1 className="text-3xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Platform health and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Users</p>
              <p className="text-2xl font-mono text-white">{stats?.total_users?.toLocaleString() ?? '—'}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Active Markets</p>
              <p className="text-2xl font-mono text-white">{stats?.active_markets?.toLocaleString() ?? '—'}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <LineChart className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">24h Volume</p>
              <p className="text-2xl font-mono text-white">{stats?.volume_24h?.toLocaleString() ?? '—'} <span className="text-sm text-slate-400">SC</span></p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">24h Revenue</p>
              <p className="text-2xl font-mono text-emerald-400">${((stats?.protocol_fees_24h ?? 0) + (stats?.publisher_fees_24h ?? 0)).toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pending KYC</p>
              <p className="text-xl font-mono text-amber-400">{stats?.pending_kyc ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pending Redemptions</p>
              <p className="text-xl font-mono text-red-400">{stats?.pending_redemptions ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Protocol Fees (24h)</p>
              <p className="text-xl font-mono text-white">${stats?.protocol_fees_24h?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              activity.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">System Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-300">Database</span>
              <Badge variant={systemStatus?.database === 'healthy' ? 'success' : 'destructive'}>
                {systemStatus?.database ?? 'unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-300">Stripe</span>
              <Badge variant={systemStatus?.stripe === 'healthy' ? 'success' : 'destructive'}>
                {systemStatus?.stripe ?? 'unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-300">AI Swarm</span>
              <Badge variant={systemStatus?.ai_swarm === 'healthy' ? 'success' : 'destructive'}>
                {systemStatus?.ai_swarm ?? 'unknown'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Revenue Breakdown (24h)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-xs text-slate-400 mb-1">Protocol Fees</p>
            <p className="text-xl font-mono text-white">${stats?.protocol_fees_24h?.toFixed(2) ?? '0.00'}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-xs text-slate-400 mb-1">Publisher Fees</p>
            <p className="text-xl font-mono text-white">${stats?.publisher_fees_24h?.toFixed(2) ?? '0.00'}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50">
            <p className="text-xs text-slate-400 mb-1">Exit Fees</p>
            <p className="text-xl font-mono text-white">${((stats?.volume_24h ?? 0) * 0.02).toFixed(2)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}