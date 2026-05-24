'use client'

import * as React from 'react'
import { cn, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FraudReport } from '@/types'

export default function AdminDisputesPage() {
  const [reports, setReports] = React.useState<FraudReport[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterStatus, setFilterStatus] = React.useState<string>('all')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  // Resolve dialog
  const [resolveDialog, setResolveDialog] = React.useState<{
    open: boolean
    report: FraudReport | null
  }>({ open: false, report: null })
  const [resolution, setResolution] = React.useState<string>('')
  const [resolveNotes, setResolveNotes] = React.useState('')
  const [resolveLoading, setResolveLoading] = React.useState(false)

  React.useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const res = await fetch('/api/admin/fraud-reports')
      const data = await res.json()
      setReports(data)
    } catch (err) {
      console.error('Failed to fetch fraud reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus
      return matchesStatus
    })
  }, [reports, filterStatus])

  async function handleResolve() {
    if (!resolveDialog.report) return
    setResolveLoading(true)
    try {
      const res = await fetch(`/api/admin/fraud-reports/${resolveDialog.report.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution,
          notes: resolveNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Report ${resolution === 'dismiss' ? 'dismissed' : 'upheld'}`)
        setResolveDialog({ open: false, report: null })
        setResolution('')
        setResolveNotes('')
        setReports((prev) =>
          prev.map((r) =>
            r.id === resolveDialog.report?.id
              ? {
                  ...r,
                  status: resolution === 'dismiss' ? 'dismissed' : 'resolved',
                  resolved_at: new Date().toISOString(),
                }
              : r
          )
        )
      } else {
        toast.error(data.error || 'Failed to resolve report')
      }
    } catch {
      toast.error('Failed to resolve report')
    } finally {
      setResolveLoading(false)
    }
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warn/10 text-warn border-warn/30'
      case 'investigating':
        return 'bg-brand-soft text-brand border-brand/30'
      case 'resolved':
        return 'bg-yes-soft text-yes border-yes-border'
      case 'dismissed':
        return 'bg-bg-elevated text-fg-muted border-border'
      default:
        return 'bg-bg-elevated text-fg-muted border-border'
    }
  }

  const pendingCount = reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length

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
      <div>
        <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warn" />
          Dispute Resolution
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          {pendingCount} open dispute{pendingCount !== 1 ? 's' : ''} requiring attention
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-fg-subtle" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] bg-bg-elevated border-border text-fg text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-fg-muted">
              Showing {filteredReports.length} of {reports.length} reports
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <div className="space-y-3">
        {filteredReports.map((report) => {
          const isExpanded = expandedId === report.id
          return (
            <Card key={report.id} className="bg-bg-subtle border-border overflow-hidden">
              {/* Header Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                className="w-full text-left p-4 hover:bg-bg-elevated/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      (report.status === 'pending' || report.status === 'investigating')
                        ? 'bg-warn'
                        : 'bg-fg-subtle'
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-fg">
                          {report.market?.shortTitle || `Market ${report.market_id}`}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn('text-2xs font-medium border capitalize', statusBadgeVariant(report.status))}
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-2xs text-fg-muted mt-0.5">
                        Reported by {report.reporter_id} &middot; {report.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xs text-fg-subtle hidden sm:block">
                      {formatDate(report.created_at)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-fg-subtle" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-fg-subtle" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="border-t border-border pt-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">
                        Reason
                      </h4>
                      <p className="text-sm text-fg">{report.reason}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">
                        Evidence
                      </h4>
                      <p className="text-sm text-fg">{report.evidence}</p>
                    </div>

                    <div className="flex items-center gap-4 text-2xs text-fg-muted">
                      <span>Created: {formatDate(report.created_at)}</span>
                      {report.resolved_at && (
                        <span>Resolved: {formatDate(report.resolved_at)}</span>
                      )}
                    </div>

                    {(report.status === 'pending' || report.status === 'investigating') && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setResolveDialog({ open: true, report })
                            setResolution('uphold')
                          }}
                          className="bg-yes hover:bg-yes/90 text-white gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Uphold
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setResolveDialog({ open: true, report })
                            setResolution('dismiss')
                          }}
                          variant="outline"
                          className="border-border text-fg-muted hover:text-fg hover:bg-bg-elevated gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
        {filteredReports.length === 0 && (
          <Card className="bg-bg-subtle border-border">
            <CardContent className="p-8 text-center text-fg-muted">
              No disputes found matching your criteria
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog.open} onOpenChange={(open) => setResolveDialog({ open, report: open ? resolveDialog.report : null })}>
        <DialogContent className="bg-bg-subtle border-border">
          <DialogHeader>
            <DialogTitle className="text-fg">
              {resolution === 'uphold' ? 'Uphold' : 'Dismiss'} Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className={cn(
              'p-3 rounded-lg border',
              resolution === 'uphold'
                ? 'bg-yes-soft border-yes-border'
                : 'bg-no-soft border-no-border'
            )}>
              <p className={cn(
                'text-sm font-medium',
                resolution === 'uphold' ? 'text-yes' : 'text-no'
              )}>
                {resolution === 'uphold'
                  ? 'This report will be upheld. The market may be paused and affected trades investigated.'
                  : 'This report will be dismissed. No further action will be taken.'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated border border-border">
              <p className="text-sm text-fg font-medium">{resolveDialog.report?.reason}</p>
              <p className="text-2xs text-fg-muted mt-1">{resolveDialog.report?.evidence}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Notes</Label>
              <Textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                className="bg-bg-elevated border-border text-fg min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setResolveDialog({ open: false, report: null })
                setResolution('')
                setResolveNotes('')
              }}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolveLoading}
              className={cn(
                resolution === 'uphold'
                  ? 'bg-yes hover:bg-yes/90 text-white'
                  : 'bg-no hover:bg-no/90 text-white'
              )}
            >
              {resolveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {resolution === 'uphold' ? 'Uphold Report' : 'Dismiss Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
