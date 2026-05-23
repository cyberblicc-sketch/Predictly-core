'use client'

import * as React from 'react'
import { cn, formatCompact, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Search,
  MoreHorizontal,
  DollarSign,
  Ban,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterKyc, setFilterKyc] = React.useState<string>('all')
  const [filterTier, setFilterTier] = React.useState<string>('all')

  // Adjust balance dialog
  const [balanceDialog, setBalanceDialog] = React.useState<{
    open: boolean
    user: User | null
  }>({ open: false, user: null })
  const [balanceCurrency, setBalanceCurrency] = React.useState<'GC' | 'SC'>('GC')
  const [balanceAmount, setBalanceAmount] = React.useState('')
  const [balanceReason, setBalanceReason] = React.useState('')
  const [balanceLoading, setBalanceLoading] = React.useState(false)

  // Suspend dialog
  const [suspendDialog, setSuspendDialog] = React.useState<{
    open: boolean
    user: User | null
  }>({ open: false, user: null })
  const [suspendReason, setSuspendReason] = React.useState('')
  const [suspendLoading, setSuspendLoading] = React.useState(false)

  // KYC dialog
  const [kycDialog, setKycDialog] = React.useState<{
    open: boolean
    user: User | null
    action: 'approve' | 'reject' | null
  }>({ open: false, user: null, action: null })
  const [kycNotes, setKycNotes] = React.useState('')
  const [kycLoading, setKycLoading] = React.useState(false)

  React.useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      const matchesKyc = filterKyc === 'all' || user.kyc_status === filterKyc
      const matchesTier = filterTier === 'all' || user.user_tier === filterTier
      return matchesSearch && matchesKyc && matchesTier
    })
  }, [users, search, filterKyc, filterTier])

  async function handleAdjustBalance() {
    if (!balanceDialog.user) return
    setBalanceLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${balanceDialog.user.id}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: balanceCurrency,
          amount: Number(balanceAmount),
          reason: balanceReason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Balance adjusted for ${balanceDialog.user.username}`)
        setBalanceDialog({ open: false, user: null })
        setBalanceAmount('')
        setBalanceReason('')
      } else {
        toast.error(data.error || 'Failed to adjust balance')
      }
    } catch {
      toast.error('Failed to adjust balance')
    } finally {
      setBalanceLoading(false)
    }
  }

  async function handleSuspend() {
    if (!suspendDialog.user) return
    setSuspendLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${suspendDialog.user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspended: true,
          reason: suspendReason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${suspendDialog.user.username} has been suspended`)
        setSuspendDialog({ open: false, user: null })
        setSuspendReason('')
      } else {
        toast.error(data.error || 'Failed to suspend user')
      }
    } catch {
      toast.error('Failed to suspend user')
    } finally {
      setSuspendLoading(false)
    }
  }

  async function handleKycAction() {
    if (!kycDialog.user || !kycDialog.action) return
    setKycLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${kycDialog.user.id}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: kycDialog.action === 'approve' ? 'approved' : 'rejected',
          notes: kycNotes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`KYC ${kycDialog.action}d for ${kycDialog.user.username}`)
        setKycDialog({ open: false, user: null, action: null })
        setKycNotes('')
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === kycDialog.user?.id
              ? { ...u, kyc_status: kycDialog.action === 'approve' ? 'approved' : 'rejected' }
              : u
          )
        )
      } else {
        toast.error(data.error || 'Failed to update KYC')
      }
    } catch {
      toast.error('Failed to update KYC')
    } finally {
      setKycLoading(false)
    }
  }

  const kycBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-yes-soft text-yes border-yes-border'
      case 'pending':
        return 'bg-warn/10 text-warn border-warn/30'
      case 'rejected':
        return 'bg-no-soft text-no border-no-border'
      default:
        return 'bg-bg-elevated text-fg-muted border-border'
    }
  }

  const tierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'bg-sweeps-soft text-sweeps border-sweeps-border'
      case 'gold':
        return 'bg-gold-soft text-gold border-gold-border'
      case 'silver':
        return 'bg-bg-elevated text-fg-muted border-border-strong'
      case 'bronze':
        return 'bg-brand-soft text-brand border-brand/30'
      default:
        return 'bg-bg-elevated text-fg-subtle border-border'
    }
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
            <Users className="h-6 w-6 text-brand" />
            User Management
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
              <Input
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-bg-elevated border-border text-fg"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterKyc} onValueChange={setFilterKyc}>
                <SelectTrigger className="w-[140px] bg-bg-elevated border-border text-fg text-sm">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-[130px] bg-bg-elevated border-border text-fg text-sm">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-bg-subtle border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-fg-muted text-xs">Username</TableHead>
                  <TableHead className="text-fg-muted text-xs">Email</TableHead>
                  <TableHead className="text-fg-muted text-xs">GC Balance</TableHead>
                  <TableHead className="text-fg-muted text-xs">SC Balance</TableHead>
                  <TableHead className="text-fg-muted text-xs">KYC</TableHead>
                  <TableHead className="text-fg-muted text-xs">Tier</TableHead>
                  <TableHead className="text-fg-muted text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-bg-elevated/50">
                    <TableCell className="font-medium text-fg text-sm">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-fg-muted text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-gold">{formatCompact(user.gold_balance)}</span>
                      <span className="text-fg-subtle ml-1">GC</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-sweeps">{formatCompact(user.sweeps_balance)}</span>
                      <span className="text-fg-subtle ml-1">SC</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-2xs font-medium border', kycBadgeVariant(user.kyc_status))}
                      >
                        {user.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-2xs font-medium border capitalize', tierBadgeVariant(user.user_tier))}
                      >
                        {user.user_tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-bg-elevated border-border">
                          <DropdownMenuItem
                            onClick={() =>
                              setBalanceDialog({ open: true, user })
                            }
                            className="text-fg-muted focus:text-fg focus:bg-bg-hover"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Adjust Balance
                          </DropdownMenuItem>
                          {user.kyc_status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  setKycDialog({ open: true, user, action: 'approve' })
                                }
                                className="text-yes focus:text-yes focus:bg-yes-soft"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve KYC
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setKycDialog({ open: true, user, action: 'reject' })
                                }
                                className="text-no focus:text-no focus:bg-no-soft"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject KYC
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() =>
                              setSuspendDialog({ open: true, user })
                            }
                            className="text-no focus:text-no focus:bg-no-soft"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-fg-muted">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={balanceDialog.open} onOpenChange={(open) => setBalanceDialog({ open, user: open ? balanceDialog.user : null })}>
        <DialogContent className="bg-bg-subtle border-border">
          <DialogHeader>
            <DialogTitle className="text-fg">Adjust Balance — {balanceDialog.user?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Currency</Label>
              <Select value={balanceCurrency} onValueChange={(v: 'GC' | 'SC') => setBalanceCurrency(v)}>
                <SelectTrigger className="bg-bg-elevated border-border text-fg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border">
                  <SelectItem value="GC">Gold Coins (GC)</SelectItem>
                  <SelectItem value="SC">Sweeps Coins (SC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Amount (negative to deduct)</Label>
              <Input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="e.g. 5000 or -2000"
                className="bg-bg-elevated border-border text-fg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Reason</Label>
              <Input
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="bg-bg-elevated border-border text-fg"
              />
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated border border-border">
              <p className="text-2xs text-fg-muted">
                Current balance: {balanceDialog.user && formatCurrency(
                  balanceCurrency === 'GC' ? balanceDialog.user.gold_balance : balanceDialog.user.sweeps_balance,
                  balanceCurrency
                )}
              </p>
              {balanceAmount && (
                <p className="text-2xs text-fg-muted mt-1">
                  New balance: {balanceDialog.user && formatCurrency(
                    (balanceCurrency === 'GC' ? balanceDialog.user.gold_balance : balanceDialog.user.sweeps_balance) + Number(balanceAmount),
                    balanceCurrency
                  )}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setBalanceDialog({ open: false, user: null })}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustBalance}
              disabled={balanceLoading || !balanceAmount || !balanceReason}
              className="bg-brand hover:bg-brand-hover text-white"
            >
              {balanceLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Adjust Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open, user: open ? suspendDialog.user : null })}>
        <DialogContent className="bg-bg-subtle border-border">
          <DialogHeader>
            <DialogTitle className="text-fg">Suspend User — {suspendDialog.user?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-no-soft border border-no-border">
              <p className="text-sm text-no font-medium">Warning: This will prevent the user from accessing their account.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Reason for suspension</Label>
              <Input
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Suspicious trading pattern"
                className="bg-bg-elevated border-border text-fg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSuspendDialog({ open: false, user: null })}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSuspend}
              disabled={suspendLoading || !suspendReason}
              className="bg-no hover:bg-no/90 text-white"
            >
              {suspendLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={kycDialog.open} onOpenChange={(open) => setKycDialog({ open, user: open ? kycDialog.user : null, action: open ? kycDialog.action : null })}>
        <DialogContent className="bg-bg-subtle border-border">
          <DialogHeader>
            <DialogTitle className="text-fg">
              {kycDialog.action === 'approve' ? 'Approve' : 'Reject'} KYC — {kycDialog.user?.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className={cn(
              'p-3 rounded-lg border',
              kycDialog.action === 'approve'
                ? 'bg-yes-soft border-yes-border'
                : 'bg-no-soft border-no-border'
            )}>
              <p className={cn(
                'text-sm font-medium',
                kycDialog.action === 'approve' ? 'text-yes' : 'text-no'
              )}>
                {kycDialog.action === 'approve'
                  ? 'This user will be verified and can trade Sweeps Coins.'
                  : 'This user will not be able to trade Sweeps Coins.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-fg-muted text-sm">Notes</Label>
              <Input
                value={kycNotes}
                onChange={(e) => setKycNotes(e.target.value)}
                placeholder="Optional notes about this decision"
                className="bg-bg-elevated border-border text-fg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setKycDialog({ open: false, user: null, action: null })}
              className="text-fg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleKycAction}
              disabled={kycLoading}
              className={cn(
                kycDialog.action === 'approve'
                  ? 'bg-yes hover:bg-yes/90 text-white'
                  : 'bg-no hover:bg-no/90 text-white'
              )}
            >
              {kycLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {kycDialog.action === 'approve' ? 'Approve KYC' : 'Reject KYC'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
