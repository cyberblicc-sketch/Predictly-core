'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Shield,
  Zap,
  Eye,
  Play,
  XCircle,
  ChevronRight,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react'
import {
  AGENT_CONFIGS,
  MOCK_AGENT_TASKS,
  MOCK_SCOUT_FINDINGS,
  MOCK_MARKET_CANDIDATES,
  MOCK_FRAUD_FLAGS,
  MOCK_CONTENT_QUEUE,
  MOCK_AGENT_ACTIONS,
  formatConfidence,
  formatRelativeTime,
  getStatusColor,
  getSeverityColor,
  getCategoryEmoji,
} from '@/lib/ai-employees'
import type {
  AgentType,
  AgentConfig,
  AgentTask,
  ScoutFinding,
  MarketCandidate,
  FraudFlag,
  ContentQueue,
  AgentAction,
} from '@/types'

// ── Types for page state ────────────────────────────────────────────────────

interface SystemData {
  configs: Record<AgentType, AgentConfig & { status: string }>
  system_health: number
  health_status: 'healthy' | 'degraded' | 'critical'
  pending_tasks: number
  tasks_completed_today: number
  tasks_failed_today: number
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AIEmployeesPage() {
  const [systemData, setSystemData] = React.useState<SystemData | null>(null)
  const [tasks, setTasks] = React.useState<AgentTask[]>([])
  const [findings, setFindings] = React.useState<ScoutFinding[]>([])
  const [candidates, setCandidates] = React.useState<MarketCandidate[]>([])
  const [fraudFlags, setFraudFlags] = React.useState<FraudFlag[]>([])
  const [contentItems, setContentItems] = React.useState<ContentQueue[]>([])
  const [actions, setActions] = React.useState<AgentAction[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [taskFilter, setTaskFilter] = React.useState<string>('all')
  const [taskStatusFilter, setTaskStatusFilter] = React.useState<string>('all')
  const [findingFilter, setFindingFilter] = React.useState<string>('all')
  const [candidateFilter, setCandidateFilter] = React.useState<string>('all')
  const [fraudFilter, setFraudFilter] = React.useState<string>('all')
  const [actionFilter, setActionFilter] = React.useState<string>('all')

  // Dialogs
  const [approveCandidate, setApproveCandidate] = React.useState<MarketCandidate | null>(null)
  const [rejectCandidate, setRejectCandidate] = React.useState<MarketCandidate | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [agentDetailAgent, setAgentDetailAgent] = React.useState<AgentType | null>(null)
  const [triggerAgentType, setTriggerAgentType] = React.useState<AgentType | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  // Fetch all data
  const fetchData = React.useCallback(async () => {
    try {
      const [sysRes, tasksRes, findingsRes, candRes, fraudRes, contentRes] = await Promise.all([
        fetch('/api/admin/ai-employees'),
        fetch('/api/admin/ai-employees/tasks'),
        fetch('/api/admin/ai-employees/findings'),
        fetch('/api/admin/ai-employees/candidates'),
        fetch('/api/admin/ai-employees/fraud'),
        fetch('/api/admin/ai-employees/content'),
      ])

      const sysData = await sysRes.json()
      const tasksData = await tasksRes.json()
      const findingsData = await findingsRes.json()
      const candData = await candRes.json()
      const fraudData = await fraudRes.json()
      const contentData = await contentRes.json()

      setSystemData(sysData)
      setTasks(tasksData.tasks ?? [])
      setFindings(findingsData.findings ?? [])
      setCandidates(candData.candidates ?? [])
      setFraudFlags(fraudData.flags ?? [])
      setContentItems(contentData.items ?? [])
      setActions(MOCK_AGENT_ACTIONS)
    } catch (err) {
      console.error('Failed to fetch AI employee data:', err)
      // Fallback to mock data
      setSystemData({
        configs: Object.fromEntries(
          Object.entries(AGENT_CONFIGS).map(([k, v]) => [k, { ...v, status: 'idle' }])
        ) as Record<AgentType, AgentConfig & { status: string }>,
        system_health: 0.92,
        health_status: 'healthy',
        pending_tasks: 3,
        tasks_completed_today: 14,
        tasks_failed_today: 2,
      })
      setTasks(MOCK_AGENT_TASKS)
      setFindings(MOCK_SCOUT_FINDINGS)
      setCandidates(MOCK_MARKET_CANDIDATES)
      setFraudFlags(MOCK_FRAUD_FLAGS)
      setContentItems(MOCK_CONTENT_QUEUE)
      setActions(MOCK_AGENT_ACTIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  // Toggle agent enabled/disabled
  const handleToggleAgent = async (agentType: AgentType, enabled: boolean) => {
    try {
      await fetch('/api/admin/ai-employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_type: agentType, updates: { enabled } }),
      })
      await fetchData()
    } catch (err) {
      console.error('Failed to toggle agent:', err)
    }
  }

  // Approve candidate
  const handleApproveCandidate = async () => {
    if (!approveCandidate) return
    try {
      await fetch('/api/admin/ai-employees/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: approveCandidate.id,
          action: 'approve',
          review_notes: 'Approved by admin review',
          reviewed_by: 'admin',
        }),
      })
      setApproveCandidate(null)
      await fetchData()
    } catch (err) {
      console.error('Failed to approve candidate:', err)
    }
  }

  // Reject candidate
  const handleRejectCandidate = async () => {
    if (!rejectCandidate || !rejectReason.trim()) return
    try {
      await fetch('/api/admin/ai-employees/candidates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: rejectCandidate.id,
          action: 'reject',
          review_notes: rejectReason,
          reviewed_by: 'admin',
        }),
      })
      setRejectCandidate(null)
      setRejectReason('')
      await fetchData()
    } catch (err) {
      console.error('Failed to reject candidate:', err)
    }
  }

  // Trigger agent task
  const handleTriggerAgent = async (agentType: AgentType) => {
    try {
      await fetch('/api/admin/ai-employees/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_type: agentType,
          action_type: agentType === 'scout' ? 'scout_scan' : agentType === 'oddsmaker' ? 'market_generate' : 'supervisor_coordinate',
          priority: 5,
        }),
      })
      setTriggerAgentType(null)
      await fetchData()
    } catch (err) {
      console.error('Failed to trigger agent:', err)
    }
  }

  // Fraud action handler
  const handleFraudAction = async (flagId: string, action: 'investigate' | 'resolve' | 'dismiss') => {
    try {
      await fetch('/api/admin/ai-employees/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_id: flagId,
          action,
          resolution: action === 'resolve' ? 'Resolved by admin review' : undefined,
          reviewed_by: 'admin',
        }),
      })
      await fetchData()
    } catch (err) {
      console.error('Failed to update fraud flag:', err)
    }
  }

  // Content action handler
  const handleContentAction = async (contentId: string, action: 'approve' | 'publish' | 'reject') => {
    try {
      await fetch('/api/admin/ai-employees/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          action,
          reviewed_by: 'admin',
        }),
      })
      await fetchData()
    } catch (err) {
      console.error('Failed to update content:', err)
    }
  }

  // Filtered data
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter !== 'all' && t.agent_type !== taskFilter) return false
    if (taskStatusFilter !== 'all' && t.status !== taskStatusFilter) return false
    return true
  })

  const filteredFindings = findings.filter((f) => {
    if (findingFilter !== 'all' && f.category !== findingFilter) return false
    return true
  })

  const filteredCandidates = candidates.filter((c) => {
    if (candidateFilter !== 'all' && c.status !== candidateFilter) return false
    return true
  })

  const filteredFraud = fraudFlags.filter((f) => {
    if (fraudFilter !== 'all' && f.severity !== fraudFilter) return false
    return true
  })

  const filteredActions = actions.filter((a) => {
    if (actionFilter !== 'all' && a.agent_type !== actionFilter) return false
    return true
  })

  const pendingReviewCount = candidates.filter((c) => c.status === 'pending_review').length
  const openFraudCount = fraudFlags.filter((f) => f.status === 'open' || f.status === 'escalated').length
  const activeAgents = systemData ? Object.values(systemData.configs).filter((c) => c.enabled).length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  const healthColor = systemData?.health_status === 'healthy'
    ? 'text-emerald-500'
    : systemData?.health_status === 'degraded'
      ? 'text-amber-500'
      : 'text-red-500'

  const healthBg = systemData?.health_status === 'healthy'
    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    : systemData?.health_status === 'degraded'
      ? 'bg-amber-500/15 text-amber-600 border-amber-500/20'
      : 'bg-red-500/15 text-red-600 border-red-500/20'

  return (
    <div className="space-y-6">
      {/* ── Section 1: System Overview Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fg">AI Employee Operating System</h1>
            <p className="text-sm text-fg-muted">Your 24/7 autonomous workforce</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn('text-xs font-medium border', healthBg)}>
            <Activity className="h-3 w-3 mr-1" />
            {systemData?.health_status === 'healthy' ? 'System Healthy' : systemData?.health_status === 'degraded' ? 'System Degraded' : 'System Critical'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4 text-violet-500" />
              <span className="text-2xs text-fg-muted font-medium">Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-fg">{activeAgents}<span className="text-sm text-fg-muted font-normal">/6</span></div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xs text-fg-muted font-medium">Pending Tasks</span>
            </div>
            <div className="text-2xl font-bold text-fg">{systemData?.pending_tasks ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-2xs text-fg-muted font-medium">Completed Today</span>
            </div>
            <div className="text-2xl font-bold text-fg">{systemData?.tasks_completed_today ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-subtle border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-2xs text-fg-muted font-medium">Open Fraud Flags</span>
            </div>
            <div className="text-2xl font-bold text-fg">{openFraudCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 2: Agent Status Grid ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Agent Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(AGENT_CONFIGS).map((config) => {
            const liveStatus = systemData?.configs?.[config.id]?.status ?? 'idle'
            const statusColor = liveStatus === 'running'
              ? 'text-emerald-500'
              : liveStatus === 'error'
                ? 'text-red-500'
                : 'text-fg-muted'

            return (
              <Card
                key={config.id}
                className="bg-bg-subtle border-border hover:border-brand/30 transition-colors cursor-pointer"
                onClick={() => setAgentDetailAgent(config.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.emoji}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-fg">{config.name}</h3>
                        <p className="text-2xs text-fg-muted">{config.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => handleToggleAgent(config.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', liveStatus === 'running' ? 'bg-emerald-500' : liveStatus === 'error' ? 'bg-red-500' : 'bg-gray-400')} />
                    <span className={cn('text-xs font-medium capitalize', statusColor)}>{liveStatus}</span>
                    <span className="text-2xs text-fg-muted ml-auto">
                      Last run: {config.last_run_at ? formatRelativeTime(config.last_run_at) : 'Never'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <p className="text-2xs text-fg-muted">Tasks</p>
                      <p className="text-sm font-semibold text-fg">{config.total_tasks}</p>
                    </div>
                    <div>
                      <p className="text-2xs text-fg-muted">Success</p>
                      <p className="text-sm font-semibold text-fg">{Math.round(config.success_rate * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-2xs text-fg-muted">Threshold</p>
                      <p className="text-sm font-semibold text-fg">{Math.round(config.confidence_threshold * 100)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Task Queue Monitor ─────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand" />
            Task Queue
          </h2>
          <div className="flex items-center gap-2">
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="scout">🕵️ Scout</SelectItem>
                <SelectItem value="oddsmaker">🎰 Oddsmaker</SelectItem>
                <SelectItem value="clerk">📋 Clerk</SelectItem>
                <SelectItem value="fraud_analyst">🔍 Fraud</SelectItem>
                <SelectItem value="content">✍️ Content</SelectItem>
                <SelectItem value="supervisor">👁️ Supervisor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setTriggerAgentType('scout')}
            >
              <Play className="h-3.5 w-3.5" />
              Trigger Agent
            </Button>
          </div>
        </div>
        <Card className="bg-bg-subtle border-border">
          <ScrollArea className="max-h-96">
            <div className="relative">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Agent</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Action</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Status</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Priority</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Confidence</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Started</th>
                    <th className="text-left p-3 text-2xs font-medium text-fg-muted">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.slice(0, 15).map((task) => {
                    const agentConfig = AGENT_CONFIGS[task.agent_type]
                    const duration = task.started_at && task.completed_at
                      ? Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)
                      : task.started_at
                        ? Math.round((Date.now() - new Date(task.started_at).getTime()) / 1000)
                        : null
                    return (
                      <tr key={task.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                        <td className="p-3">
                          <span className="flex items-center gap-1.5">
                            <span>{agentConfig?.emoji}</span>
                            <span className="text-xs font-medium">{agentConfig?.name}</span>
                          </span>
                        </td>
                        <td className="p-3 text-xs text-fg-muted">{task.action_type.replace(/_/g, ' ')}</td>
                        <td className="p-3">
                          <Badge className={cn('text-2xs font-medium border', getStatusColor(task.status))}>
                            {task.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-fg">{task.priority}</td>
                        <td className="p-3 text-xs text-fg">{formatConfidence(task.confidence)}</td>
                        <td className="p-3 text-2xs text-fg-muted">
                          {task.started_at ? formatRelativeTime(task.started_at) : '—'}
                        </td>
                        <td className="p-3 text-2xs text-fg-muted">
                          {duration !== null ? (duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Section 4: Scout Findings Feed ────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
            <Eye className="h-5 w-5 text-sky-500" />
            Scout Findings
            <Badge variant="secondary" className="text-2xs ml-1">
              {findings.filter((f) => !f.processed).length} unprocessed
            </Badge>
          </h2>
          <Select value={findingFilter} onValueChange={setFindingFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Crypto">₿ Crypto</SelectItem>
              <SelectItem value="Economics">📊 Economics</SelectItem>
              <SelectItem value="Politics">🏛️ Politics</SelectItem>
              <SelectItem value="Tech">💻 Tech</SelectItem>
              <SelectItem value="Sports">⚽ Sports</SelectItem>
              <SelectItem value="Science">🔬 Science</SelectItem>
              <SelectItem value="Pop Culture">🎬 Pop Culture</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="bg-bg-subtle border-border">
          <ScrollArea className="max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Source</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Title</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Category</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Confidence</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Potential</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Status</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map((finding) => (
                  <tr key={finding.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                    <td className="p-3 text-xs font-medium text-fg">{finding.source}</td>
                    <td className="p-3 text-xs text-fg-muted max-w-[200px] truncate">{finding.title}</td>
                    <td className="p-3">
                      <span className="text-xs">{getCategoryEmoji(finding.category)}</span>
                      <span className="text-xs text-fg-muted ml-1">{finding.category}</span>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        'text-xs font-semibold',
                        finding.confidence > 0.8 ? 'text-emerald-600' : finding.confidence > 0.5 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {Math.round(finding.confidence * 100)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge className={cn(
                        'text-2xs border',
                        finding.market_potential === 'high' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' :
                        finding.market_potential === 'medium' ? 'bg-amber-500/15 text-amber-600 border-amber-500/20' :
                        finding.market_potential === 'low' ? 'bg-sky-500/15 text-sky-600 border-sky-500/20' :
                        'bg-gray-500/15 text-gray-500 border-gray-500/20'
                      )}>
                        {finding.market_potential}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={cn('text-2xs border', finding.processed ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/15 text-amber-600 border-amber-500/20')}>
                        {finding.processed ? 'Processed' : 'New'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {!finding.processed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-2xs gap-1 text-brand hover:text-brand-hover"
                          onClick={async () => {
                            await fetch('/api/admin/ai-employees/findings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ finding_id: finding.id, action: 'mark_processed' }),
                            })
                            await fetchData()
                          }}
                        >
                          Create Market
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Section 5: Market Candidates Review (QUARANTINE) ──────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Market Candidates Review
            <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/20 text-2xs ml-1">
              QUARANTINE LAYER
            </Badge>
            <Badge className="bg-red-500/15 text-red-600 border border-red-500/20 text-2xs">
              <AlertOctagon className="h-3 w-3 mr-1" />
              NEVER auto-published
            </Badge>
          </h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/20 text-xs">
              {pendingReviewCount} pending review
            </Badge>
            <Select value={candidateFilter} onValueChange={setCandidateFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">⏳ Pending</SelectItem>
                <SelectItem value="approved">✅ Approved</SelectItem>
                <SelectItem value="rejected">❌ Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Card className={cn('bg-bg-subtle border-border', pendingReviewCount > 0 && 'border-amber-500/30')}>
          <ScrollArea className="max-h-[500px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Question</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Category</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Outcomes</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Est. Prob.</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Status</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={cn(
                      'border-b border-border/50 hover:bg-bg-elevated/50 transition-colors',
                      candidate.status === 'pending_review' && 'bg-amber-500/5'
                    )}
                  >
                    <td className="p-3 max-w-[250px]">
                      <p className="text-xs font-medium text-fg truncate">{candidate.question}</p>
                      <p className="text-2xs text-fg-muted mt-0.5">{candidate.short_title}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-xs">{getCategoryEmoji(candidate.category)}</span>
                      <span className="text-xs text-fg-muted ml-1">{candidate.category}</span>
                    </td>
                    <td className="p-3 text-xs text-fg-muted">
                      {candidate.outcomes.join(' / ')}
                    </td>
                    <td className="p-3 text-xs text-fg">
                      {candidate.estimated_probabilities.map((p) => `${Math.round(p * 100)}%`).join(' / ')}
                    </td>
                    <td className="p-3">
                      <Badge className={cn('text-2xs border', getStatusColor(candidate.status))}>
                        {candidate.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {candidate.status === 'pending_review' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => setApproveCandidate(candidate)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => setRejectCandidate(candidate)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {candidate.review_notes && candidate.status !== 'pending_review' && (
                        <span className="text-2xs text-fg-muted" title={candidate.review_notes}>
                          {candidate.review_notes.length > 30 ? candidate.review_notes.slice(0, 30) + '...' : candidate.review_notes}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Section 6: Fraud Alerts ───────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Fraud Alerts
            <Badge variant="secondary" className="text-2xs ml-1">
              {fraudFlags.filter((f) => f.status === 'open').length} open
            </Badge>
          </h2>
          <Select value={fraudFilter} onValueChange={setFraudFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">🔴 Critical</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🔵 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="bg-bg-subtle border-border">
          <ScrollArea className="max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Type</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Severity</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Risk Score</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Status</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Finding</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Auto-Action</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFraud.map((flag) => (
                  <tr key={flag.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                    <td className="p-3 text-xs font-medium text-fg">{flag.flag_type.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <Badge className={cn('text-2xs border capitalize', getSeverityColor(flag.severity))}>
                        {flag.severity}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={flag.risk_score * 100} className="w-16 h-1.5" />
                        <span className="text-xs font-medium text-fg">{Math.round(flag.risk_score * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={cn('text-2xs border', getStatusColor(flag.status))}>
                        {flag.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-2xs text-fg-muted max-w-[180px] truncate" title={flag.agent_finding}>
                      {flag.agent_finding}
                    </td>
                    <td className="p-3">
                      {flag.auto_action_taken ? (
                        <Badge className="text-2xs bg-violet-500/15 text-violet-600 border border-violet-500/20">
                          {flag.auto_action_taken.replace(/_/g, ' ')}
                        </Badge>
                      ) : (
                        <span className="text-2xs text-fg-subtle">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      {(flag.status === 'open' || flag.status === 'escalated') && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                            onClick={() => handleFraudAction(flag.id, 'investigate')}
                          >
                            Investigate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => handleFraudAction(flag.id, 'resolve')}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-fg-muted hover:text-fg"
                            onClick={() => handleFraudAction(flag.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                      {flag.status === 'investigating' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => handleFraudAction(flag.id, 'resolve')}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-fg-muted hover:text-fg"
                            onClick={() => handleFraudAction(flag.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Section 7: Content Queue ──────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
          ✍️
          Content Queue
        </h2>
        <Card className="bg-bg-subtle border-border">
          <ScrollArea className="max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Type</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Title</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Status</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Scheduled</th>
                  <th className="text-left p-3 text-2xs font-medium text-fg-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentItems.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                    <td className="p-3">
                      <Badge className="text-2xs border bg-violet-500/15 text-violet-600 border-violet-500/20">
                        {item.content_type.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs font-medium text-fg max-w-[250px] truncate">{item.title}</td>
                    <td className="p-3">
                      <Badge className={cn('text-2xs border', getStatusColor(item.status))}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-2xs text-fg-muted">
                      {item.scheduled_publish_at
                        ? new Date(item.scheduled_publish_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="p-3">
                      {(item.status === 'pending' || item.status === 'generating') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-2xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => handleContentAction(item.id, 'approve')}
                        >
                          Approve
                        </Button>
                      )}
                      {item.status === 'ready' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() => handleContentAction(item.id, 'publish')}
                          >
                            Publish
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-2xs text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => handleContentAction(item.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Section 8: Activity Timeline ──────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand" />
            Activity Timeline
          </h2>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="scout">🕵️ Scout</SelectItem>
              <SelectItem value="oddsmaker">🎰 Oddsmaker</SelectItem>
              <SelectItem value="clerk">📋 Clerk</SelectItem>
              <SelectItem value="fraud_analyst">🔍 Fraud</SelectItem>
              <SelectItem value="content">✍️ Content</SelectItem>
              <SelectItem value="supervisor">👁️ Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="bg-bg-subtle border-border">
          <ScrollArea className="max-h-96">
            <div className="p-4 space-y-0">
              {filteredActions.map((action, idx) => {
                const agentConfig = AGENT_CONFIGS[action.agent_type]
                return (
                  <div key={action.id} className="flex gap-3 py-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-lg">{agentConfig?.emoji}</span>
                      {idx < filteredActions.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-fg">{action.description}</span>
                        <span className="text-2xs text-fg-subtle shrink-0">{formatRelativeTime(action.created_at)}</span>
                      </div>
                      <p className="text-2xs text-fg-muted">{action.output_summary}</p>
                      <div className="flex items-center gap-3">
                        {action.confidence !== null && (
                          <span className="text-2xs text-fg-muted">Confidence: {formatConfidence(action.confidence)}</span>
                        )}
                        {action.duration_ms !== null && (
                          <span className="text-2xs text-fg-muted">Duration: {(action.duration_ms / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}

      {/* Approve Candidate Dialog */}
      <AlertDialog open={!!approveCandidate} onOpenChange={() => setApproveCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Market Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve this market candidate. After approval, the Clerk agent will publish it as an active market.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {approveCandidate && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-fg">{approveCandidate.question}</p>
              <p className="text-fg-muted">Category: {approveCandidate.category}</p>
              <p className="text-fg-muted">Outcomes: {approveCandidate.outcomes.join(' / ')}</p>
              <p className="text-fg-muted">Probabilities: {approveCandidate.estimated_probabilities.map((p) => `${Math.round(p * 100)}%`).join(' / ')}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveCandidate} className="bg-emerald-600 hover:bg-emerald-700">
              Approve Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Candidate Dialog */}
      <Dialog open={!!rejectCandidate} onOpenChange={() => { setRejectCandidate(null); setRejectReason('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Market Candidate</DialogTitle>
            <DialogDescription>
              You must provide a reason for rejecting this candidate.
            </DialogDescription>
          </DialogHeader>
          {rejectCandidate && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-fg">{rejectCandidate.question}</p>
            </div>
          )}
          <Textarea
            placeholder="Rejection reason (required)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectCandidate(null); setRejectReason('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCandidate}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trigger Agent Dialog */}
      <Dialog open={!!triggerAgentType} onOpenChange={() => setTriggerAgentType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Agent Task</DialogTitle>
            <DialogDescription>
              Manually trigger a task for a specific agent. The task will be added to the queue immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={triggerAgentType ?? 'scout'} onValueChange={(v) => setTriggerAgentType(v as AgentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AGENT_CONFIGS).map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.emoji} {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTriggerAgentType(null)}>Cancel</Button>
            <Button onClick={() => triggerAgentType && handleTriggerAgent(triggerAgentType)}>
              <Play className="h-4 w-4 mr-1" />
              Trigger Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Detail Dialog */}
      <Dialog open={!!agentDetailAgent} onOpenChange={() => setAgentDetailAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {agentDetailAgent && AGENT_CONFIGS[agentDetailAgent]?.emoji}
              {agentDetailAgent && AGENT_CONFIGS[agentDetailAgent]?.name} Details
            </DialogTitle>
            <DialogDescription>{agentDetailAgent && AGENT_CONFIGS[agentDetailAgent]?.description}</DialogDescription>
          </DialogHeader>
          {agentDetailAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      systemData?.configs?.[agentDetailAgent]?.status === 'running' ? 'bg-emerald-500' :
                      systemData?.configs?.[agentDetailAgent]?.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    )} />
                    <span className="text-sm font-medium capitalize">{systemData?.configs?.[agentDetailAgent]?.status ?? 'idle'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Schedule</p>
                  <p className="text-sm font-mono text-fg">{AGENT_CONFIGS[agentDetailAgent].schedule_cron}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Rate Limit</p>
                  <p className="text-sm text-fg">{AGENT_CONFIGS[agentDetailAgent].rate_limit_per_hour}/hr</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Timeout</p>
                  <p className="text-sm text-fg">{(AGENT_CONFIGS[agentDetailAgent].timeout_ms / 1000).toFixed(0)}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Max Retries</p>
                  <p className="text-sm text-fg">{AGENT_CONFIGS[agentDetailAgent].max_retries}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Confidence Threshold</p>
                  <p className="text-sm text-fg">{Math.round(AGENT_CONFIGS[agentDetailAgent].confidence_threshold * 100)}%</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Total Tasks</p>
                  <p className="text-lg font-bold text-fg">{AGENT_CONFIGS[agentDetailAgent].total_tasks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xs text-fg-muted">Success Rate</p>
                  <p className="text-lg font-bold text-fg">{Math.round(AGENT_CONFIGS[agentDetailAgent].success_rate * 100)}%</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentDetailAgent(null)}>Close</Button>
            <Button onClick={() => { setAgentDetailAgent(null); if (agentDetailAgent) setTriggerAgentType(agentDetailAgent) }}>
              <Play className="h-4 w-4 mr-1" />
              Trigger Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
