'use client'

import * as React from 'react'
import { cn, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  ScrollText,
  Filter,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { AdminLog } from '@/types'

const actionTypes = [
  'MARKET_RESOLVE',
  'BALANCE_ADJUST',
  'USER_SUSPEND',
  'USER_UNSUSPEND',
  'AI_CONFIG_UPDATE',
  'FEE_UPDATE',
  'KYC_APPROVE',
  'KYC_REJECT',
  'MARKET_CREATE',
  'MARKET_SUSPEND',
  'FRAUD_RESOLVE',
]

const PAGE_SIZE = 20

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<AdminLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterAdmin, setFilterAdmin] = React.useState<string>('all')
  const [filterAction, setFilterAction] = React.useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = React.useState('')
  const [filterDateTo, setFilterDateTo] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [autoRefresh, setAutoRefresh] = React.useState(false)

  React.useEffect(() => {
    fetchLogs()
  }, [])

  React.useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchLogs()
    }, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  async function fetchLogs() {
    try {
      const res = await fetch('/api/admin/activity')
      const data = await res.json()
      setLogs(data)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesAdmin = filterAdmin === 'all' || log.admin_id === filterAdmin
      const matchesAction = filterAction === 'all' || log.action === filterAction
      const matchesDateFrom =
        !filterDateFrom || new Date(log.created_at) >= new Date(filterDateFrom)
      const matchesDateTo =
        !filterDateTo || new Date(log.created_at) <= new Date(filterDateTo + 'T23:59:59Z')
      return matchesAdmin && matchesAction && matchesDateFrom && matchesDateTo
    })
  }, [logs, filterAdmin, filterAction, filterDateFrom, filterDateTo])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const uniqueAdmins = React.useMemo(() => {
    const admins = new Set(logs.map((l) => l.admin_id))
    return Array.from(admins)
  }, [logs])

  const actionBadgeVariant = (action: string) => {
    if (action.includes('RESOLVE') || action.includes('APPROVE')) return 'bg-yes-soft text-yes border-yes-border'
    if (action.includes('SUSPEND') || action.includes('REJECT')) return 'bg-no-soft text-no border-no-border'
    if (action.includes('ADJUST') || action.includes('UPDATE')) return 'bg-brand-soft text-brand border-brand/30'
    if (action.includes('CREATE')) return 'bg-yes-soft text-yes border-yes-border'
    return 'bg-bg-elevated text-fg-muted border-border'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-brand" />
            Audit Logs
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {filteredLogs.length} log entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLogs}
            className="text-fg-muted hover:text-fg"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              autoRefresh
                ? 'bg-brand hover:bg-brand-hover text-white'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', autoRefresh ? 'bg-white live-dot' : 'bg-fg-subtle')} />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterAdmin} onValueChange={setFilterAdmin}>
              <SelectTrigger className="w-[140px] bg-bg-elevated border-border text-fg text-sm">
                <SelectValue placeholder="Admin" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border">
                <SelectItem value="all">All Admins</SelectItem>
                {uniqueAdmins.map((admin) => (
                  <SelectItem key={admin} value={admin}>{admin}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(1) }}>
              <SelectTrigger className="w-[180px] bg-bg-elevated border-border text-fg text-sm">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border">
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1) }}
              className="bg-bg-elevated border-border text-fg text-sm w-[150px]"
              placeholder="From"
            />
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => { setFilterDateTo(e.target.value); setPage(1) }}
              className="bg-bg-elevated border-border text-fg text-sm w-[150px]"
              placeholder="To"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-fg-muted text-xs">Timestamp</TableHead>
                  <TableHead className="text-fg-muted text-xs">Admin</TableHead>
                  <TableHead className="text-fg-muted text-xs">Action</TableHead>
                  <TableHead className="text-fg-muted text-xs">Target</TableHead>
                  <TableHead className="text-fg-muted text-xs">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-bg-elevated/50">
                    <TableCell className="text-2xs text-fg-muted whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-fg">
                      {log.admin_id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-2xs font-medium border', actionBadgeVariant(log.action))}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-fg-muted">
                      {log.target_user_id || log.target_market_id || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-fg-muted max-w-[200px]">
                      <span className="truncate block">
                        {log.reason || JSON.stringify(log.changes)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-fg-muted">
                      No logs found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="text-fg-muted"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="text-fg-muted"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
