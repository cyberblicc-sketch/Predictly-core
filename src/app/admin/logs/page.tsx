'use client'

import * as React from 'react'
import { useState } from 'react'
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
  Shield,
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

const authActionTypes = [
  'SIGN_IN',
  'SIGN_UP',
  'SIGN_OUT',
  'PASSWORD_RESET',
  'OAUTH',
  'FAILED_LOGIN',
]

const PAGE_SIZE = 20

// Mock auth logs for display
const MOCK_AUTH_LOGS = [
  { id: 'al1', user_id: 'u1', email: 'trader@predictly.io', action: 'SIGN_IN', ip_address: '192.168.1.1', user_agent: 'Chrome/120 macOS', details: 'Successful login', created_at: '2026-03-10T14:30:00Z' },
  { id: 'al2', user_id: 'u2', email: 'newuser@example.com', action: 'SIGN_UP', ip_address: '10.0.0.5', user_agent: 'Firefox/122 Windows', details: 'New account created', created_at: '2026-03-10T12:15:00Z' },
  { id: 'al3', user_id: 'u3', email: 'suspicious@bad.com', action: 'FAILED_LOGIN', ip_address: '45.33.32.156', user_agent: 'Python-requests/2.31', details: 'Invalid password (3rd attempt)', created_at: '2026-03-10T11:00:00Z' },
  { id: 'al4', user_id: 'u1', email: 'trader@predictly.io', action: 'SIGN_IN', ip_address: '192.168.1.1', user_agent: 'Safari/17 iOS', details: 'Mobile login', created_at: '2026-03-09T20:45:00Z' },
  { id: 'al5', user_id: 'u4', email: 'whale@crypto.io', action: 'OAUTH', ip_address: '172.16.0.1', user_agent: 'Chrome/120 Windows', details: 'Google OAuth sign-in', created_at: '2026-03-09T16:20:00Z' },
  { id: 'al6', user_id: 'u5', email: 'forgot@example.com', action: 'PASSWORD_RESET', ip_address: '10.0.0.8', user_agent: 'Chrome/120 macOS', details: 'Password reset requested', created_at: '2026-03-09T14:00:00Z' },
  { id: 'al7', user_id: 'u1', email: 'trader@predictly.io', action: 'SIGN_OUT', ip_address: '192.168.1.1', user_agent: 'Chrome/120 macOS', details: 'Manual sign out', created_at: '2026-03-09T08:30:00Z' },
  { id: 'al8', user_id: null, email: 'hacker@unknown.com', action: 'FAILED_LOGIN', ip_address: '185.220.101.1', user_agent: 'curl/7.88', details: 'Account not found', created_at: '2026-03-08T23:15:00Z' },
  { id: 'al9', user_id: 'u6', email: 'newbie@predictly.io', action: 'SIGN_UP', ip_address: '10.0.0.15', user_agent: 'Chrome/120 Android', details: 'Referral sign-up', created_at: '2026-03-08T17:00:00Z' },
  { id: 'al10', user_id: 'u7', email: 'admin@predictly.io', action: 'SIGN_IN', ip_address: '192.168.1.100', user_agent: 'Chrome/120 macOS', details: 'Admin login', created_at: '2026-03-08T09:00:00Z' },
]

type LogTab = 'admin' | 'auth'

export default function AdminLogsPage() {
  const [activeTab, setActiveTab] = useState<LogTab>('admin')

  // Admin logs state
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAdmin, setFilterAdmin] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Auth logs state
  const [authLogs, setAuthLogs] = useState(MOCK_AUTH_LOGS)
  const [authLoading, setAuthLoading] = useState(false)
  const [authFilterAction, setAuthFilterAction] = useState<string>('all')
  const [authSearch, setAuthSearch] = useState('')
  const [authPage, setAuthPage] = useState(1)

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

  React.useEffect(() => {
    if (activeTab === 'auth') {
      fetchAuthLogs()
    }
  }, [activeTab])

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

  async function fetchAuthLogs() {
    setAuthLoading(true)
    try {
      const res = await fetch('/api/admin/auth-logs')
      if (res.ok) {
        const data = await res.json()
        if (data.logs && data.logs.length > 0) {
          setAuthLogs(data.logs)
        }
        // Otherwise keep using mock data
      }
    } catch (err) {
      console.error('Failed to fetch auth logs:', err)
    } finally {
      setAuthLoading(false)
    }
  }

  // Admin logs filtering
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesAdmin = filterAdmin === 'all' || log.admin_id === filterAdmin
      const matchesAction = filterAction === 'all' || log.action === filterAction
      const matchesDateFrom = !filterDateFrom || new Date(log.created_at) >= new Date(filterDateFrom)
      const matchesDateTo = !filterDateTo || new Date(log.created_at) <= new Date(filterDateTo + 'T23:59:59Z')
      return matchesAdmin && matchesAction && matchesDateFrom && matchesDateTo
    })
  }, [logs, filterAdmin, filterAction, filterDateFrom, filterDateTo])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const uniqueAdmins = React.useMemo(() => {
    const admins = new Set(logs.map((l) => l.admin_id))
    return Array.from(admins)
  }, [logs])

  // Auth logs filtering
  const filteredAuthLogs = React.useMemo(() => {
    return authLogs.filter((log) => {
      const matchesAction = authFilterAction === 'all' || log.action === authFilterAction
      const matchesSearch = !authSearch ||
        (log.email?.toLowerCase().includes(authSearch.toLowerCase())) ||
        (log.ip_address?.includes(authSearch)) ||
        (log.details?.toLowerCase().includes(authSearch.toLowerCase()))
      return matchesAction && matchesSearch
    })
  }, [authLogs, authFilterAction, authSearch])

  const authTotalPages = Math.ceil(filteredAuthLogs.length / PAGE_SIZE)
  const paginatedAuthLogs = filteredAuthLogs.slice((authPage - 1) * PAGE_SIZE, authPage * PAGE_SIZE)

  const actionBadgeVariant = (action: string) => {
    if (action.includes('RESOLVE') || action.includes('APPROVE') || action.includes('SIGN_IN') || action.includes('SIGN_UP') || action.includes('OAUTH')) return 'bg-yes-soft text-yes border-yes-border'
    if (action.includes('SUSPEND') || action.includes('REJECT') || action.includes('FAILED_LOGIN')) return 'bg-no-soft text-no border-no-border'
    if (action.includes('ADJUST') || action.includes('UPDATE') || action.includes('PASSWORD_RESET') || action.includes('SIGN_OUT')) return 'bg-brand-soft text-brand border-brand/30'
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
            System Logs
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {activeTab === 'admin' ? `${filteredLogs.length} admin log entries` : `${filteredAuthLogs.length} auth log entries`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={activeTab === 'admin' ? fetchLogs : fetchAuthLogs}
            className="text-fg-muted hover:text-fg"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {activeTab === 'admin' && (
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
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('admin')}
            className={cn(
              'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'admin' ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
            )}
          >
            <ScrollText className="h-4 w-4" /> Admin Logs
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={cn(
              'shrink-0 h-10 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'auth' ? 'border-brand text-fg' : 'border-transparent text-fg-muted hover:text-fg'
            )}
          >
            <Shield className="h-4 w-4" /> Auth Logs
          </button>
        </div>
      </div>

      {/* Admin Logs Tab */}
      {activeTab === 'admin' && (
        <>
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
        </>
      )}

      {/* Auth Logs Tab */}
      {activeTab === 'auth' && (
        <>
          {/* Auth Filters */}
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Search by email, IP, or details..."
                  value={authSearch}
                  onChange={(e) => { setAuthSearch(e.target.value); setAuthPage(1) }}
                  className="bg-bg-elevated border-border text-fg text-sm flex-1"
                />
                <Select value={authFilterAction} onValueChange={(v) => { setAuthFilterAction(v); setAuthPage(1) }}>
                  <SelectTrigger className="w-[180px] bg-bg-elevated border-border text-fg text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    <SelectValue placeholder="Action type" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-elevated border-border">
                    <SelectItem value="all">All Actions</SelectItem>
                    {authActionTypes.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Auth Logs Table */}
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-fg-muted text-xs">Timestamp</TableHead>
                      <TableHead className="text-fg-muted text-xs">User</TableHead>
                      <TableHead className="text-fg-muted text-xs">Action</TableHead>
                      <TableHead className="text-fg-muted text-xs">IP Address</TableHead>
                      <TableHead className="text-fg-muted text-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAuthLogs.map((log) => (
                        <TableRow key={log.id} className="border-border hover:bg-bg-elevated/50">
                          <TableCell className="text-2xs text-fg-muted whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>
                              <div className="text-fg font-medium truncate max-w-[180px]">{log.email || 'Unknown'}</div>
                              {log.user_id && <div className="text-2xs text-fg-subtle font-mono">{log.user_id}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn('text-2xs font-medium border', actionBadgeVariant(log.action))}
                            >
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-fg-muted font-mono">
                            {log.ip_address || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-fg-muted max-w-[200px]">
                            <span className="truncate block">{log.details || '—'}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {!authLoading && paginatedAuthLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-fg-muted">
                          No auth logs found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Auth Pagination */}
          {authTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-fg-muted">
                Page {authPage} of {authTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={authPage === 1}
                  onClick={() => setAuthPage(authPage - 1)}
                  className="text-fg-muted"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={authPage === authTotalPages}
                  onClick={() => setAuthPage(authPage + 1)}
                  className="text-fg-muted"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
