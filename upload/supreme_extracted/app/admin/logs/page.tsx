'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose
} from '@/components/ui/Modal'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  AlertTriangle,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react'

interface LogEntry {
  id: string
  admin_id: string
  action: string
  target_user_id: string | null
  target_market_id: string | null
  changes: Record<string, unknown>
  reason: string
  created_at: string
  admin?: { email: string; handle: string | null }
  target_user?: { email: string; handle: string | null }
  target_market?: { title: string }
}

const ACTION_COLORS: Record<string, string> = {
  USER_EDIT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  USER_SUSPEND: 'bg-red-500/20 text-red-400 border-red-500/30',
  USER_UNSUSPEND: 'bg-green-500/20 text-green-400 border-green-500/30',
  MARKET_CREATE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MARKET_RESOLVE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  MARKET_SUSPEND: 'bg-red-500/20 text-red-400 border-red-500/30',
  MARKET_UNSUSPEND: 'bg-green-500/20 text-green-400 border-green-500/30',
  BALANCE_ADJUST: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  KYC_REVIEW: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  FRAUD_FLAG: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DISPUTE_RESOLVE: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  BULK_SUSPEND: 'bg-red-500/20 text-red-400 border-red-500/30',
  BULK_UNSUSPEND: 'bg-green-500/20 text-green-400 border-green-500/30',
  BULK_VERIFY_KYC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  AI_SWARM_DISABLE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  AI_SWARM_ENABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
  DEFAULT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  USER_EDIT: <User className="w-3 h-3" />,
  USER_SUSPEND: <Ban className="w-3 h-3" />,
  USER_UNSUSPEND: <CheckCircle className="w-3 h-3" />,
  MARKET_CREATE: <FileText className="w-3 h-3" />,
  MARKET_RESOLVE: <CheckCircle className="w-3 h-3" />,
  MARKET_SUSPEND: <XCircle className="w-3 h-3" />,
  BALANCE_ADJUST: <Settings className="w-3 h-3" />,
  KYC_REVIEW: <Eye className="w-3 h-3" />,
  FRAUD_FLAG: <AlertTriangle className="w-3 h-3" />,
  DISPUTE_RESOLVE: <CheckCircle className="w-3 h-3" />,
  AI_SWARM_DISABLE: <AlertTriangle className="w-3 h-3" />,
  AI_SWARM_ENABLE: <CheckCircle className="w-3 h-3" />,
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const pageSize = 50

  useEffect(() => { fetchLogs() }, [page, actionFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      })
      if (actionFilter) params.set('action', actionFilter)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.activities || [])
        // Estimate total pages based on returned count
        const returned = data.activities?.length || 0
        if (returned === pageSize) {
          setTotalPages(page + 1)
          setTotalCount(page * pageSize + returned)
        } else {
          setTotalPages(page)
          setTotalCount((page - 1) * pageSize + returned)
        }
      }
    } catch (error) { console.error('Failed to fetch logs:', error) }
    finally { setLoading(false) }
  }

  const getActionBadge = (action: string) => {
    const colorClass = ACTION_COLORS[action] || ACTION_COLORS.DEFAULT
    const icon = ACTION_ICONS[action]

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${colorClass}`}>
        {icon}
        {action.replace(/_/g, ' ')}
      </span>
    )
  }

  const formatChanges = (changes: Record<string, unknown>) => {
    if (!changes || Object.keys(changes).length === 0) return null

    return Object.entries(changes).map(([key, value]) => (
      <div key={key} className="flex gap-2 text-xs">
        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
        <span className="text-slate-300 font-mono">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ))
  }

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div>
          <h1 className="text-3xl font-semibold text-white">Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-1">{totalCount.toLocaleString()} total actions</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Timestamp</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Admin</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Action</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Target</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">
                  <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No logs found</td></tr>
              ) : logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-white">
                    {log.admin?.email || log.admin_id.substring(0, 8) + '...'}
                  </td>
                  <td className="p-3">{getActionBadge(log.action)}</td>
                  <td className="p-3 text-sm text-slate-400">
                    {log.target_user_id ? (
                      <span>User: {log.target_user?.email || log.target_user_id.substring(0, 8)}</span>
                    ) : log.target_market_id ? (
                      <span>Market: {log.target_market?.title || log.target_market_id}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-slate-400 max-w-[200px] truncate">
                    {log.reason || <span className="text-slate-600">No reason</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-800">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" />Previous
          </Button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={logs.length < pageSize} onClick={() => setPage(page + 1)}>
            Next<ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      <Modal open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <ModalContent className="max-w-xl">
          <ModalHeader>
            <ModalTitle>Log Details</ModalTitle>
            <ModalDescription>
              {selectedLog && new Date(selectedLog.created_at).toLocaleString()}
            </ModalDescription>
          </ModalHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Admin ID</p>
                  <p className="text-sm text-white font-mono">{selectedLog.admin_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Action</p>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
              </div>

              {selectedLog.target_user_id && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Target User</p>
                  <p className="text-sm text-white font-mono">{selectedLog.target_user_id}</p>
                </div>
              )}

              {selectedLog.target_market_id && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Target Market</p>
                  <p className="text-sm text-white font-mono">{selectedLog.target_market_id}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Reason</p>
                <p className="text-sm text-white">{selectedLog.reason || 'No reason provided'}</p>
              </div>

              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Changes</p>
                  <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
                    {formatChanges(selectedLog.changes)}
                  </div>
                </div>
              )}
            </div>
          )}
          <ModalClose />
        </ModalContent>
      </Modal>
    </div>
  )
}