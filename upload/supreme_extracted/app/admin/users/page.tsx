'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
  User,
  Mail,
  Calendar,
  Wallet,
  CheckCircle,
  XCircle,
  Ban,
  Download
} from 'lucide-react'

interface UserRecord {
  id: string
  email: string
  name: string | null
  handle: string | null
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected'
  gc_balance: number
  sc_balance: number
  user_tier: string
  is_admin: boolean
  is_publisher: boolean
  is_restricted: boolean
  created_at: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  balance_before: number
  balance_after: number
  description: string
  created_at: string
}

interface Position {
  id: string
  market_id: string
  side: string
  stake: number
  entry_prob: number
  is_settled: boolean
  markets?: { question: string }
}

type SortField = 'email' | 'created_at'
type SortDirection = 'asc' | 'desc'

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [userPositions, setUserPositions] = useState<Position[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [adjustBalanceOpen, setAdjustBalanceOpen] = useState(false)
  const [adjustCurrency, setAdjustCurrency] = useState<'gc' | 'sc'>('sc')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const pageSize = 20

  useEffect(() => { fetchUsers() }, [page, search, sortField, sortDirection])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: pageSize.toString(),
        sort: sortField, direction: sortDirection
      })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
        setTotalCount(data.total)
      }
    } catch (error) { console.error('Failed to fetch users:', error) }
    finally { setLoading(false) }
  }

  const openUserDetail = async (user: UserRecord) => {
    setSelectedUser(user)
    setLoadingDetail(true)
    setAdjustBalanceOpen(false)
    try {
      const [txRes, posRes] = await Promise.all([
        fetch(`/api/admin/users/${user.id}/transactions`),
        fetch(`/api/admin/users/${user.id}/positions`)
      ])
      if (txRes.ok) { const d = await txRes.json(); setUserTransactions(d.transactions || []) }
      if (posRes.ok) { const d = await posRes.json(); setUserPositions(d.positions || []) }
    } catch (error) { console.error('Failed to fetch user detail:', error) }
    finally { setLoadingDetail(false) }
  }

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount || !adjustReason) return
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/adjust-balance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: adjustCurrency, amount: parseFloat(adjustAmount), reason: adjustReason })
      })
      if (res.ok) { openUserDetail({ ...selectedUser }); setAdjustBalanceOpen(false); setAdjustAmount(''); setAdjustReason('') }
      else { const d = await res.json(); alert(d.error || 'Failed to adjust balance') }
    } catch { alert('Failed to adjust balance') }
  }

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    if (!confirm(suspend ? 'Suspend this user?' : 'Unsuspend this user?')) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend })
      })
      if (res.ok) { fetchUsers(); if (selectedUser?.id === userId) openUserDetail({ ...selectedUser, is_restricted: suspend }) }
    } catch { alert('Failed to update user status') }
  }

  const handleKycReview = async (userId: string, status: 'verified' | 'rejected') => {
    if (!confirm(`${status === 'verified' ? 'Approve' : 'Reject'} KYC for this user?`)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) { fetchUsers(); if (selectedUser?.id === userId) openUserDetail({ ...selectedUser, kyc_status: status }) }
    } catch { alert('Failed to update KYC status') }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('desc') }
  }

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) newSelected.delete(userId)
    else newSelected.add(userId)
    setSelectedUsers(newSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return
    if (!confirm(`Apply ${action} to ${selectedUsers.size} users?`)) return
    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user_ids: Array.from(selectedUsers) })
      })
      if (res.ok) { setSelectedUsers(new Set()); fetchUsers() }
    } catch { alert('Bulk action failed') }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="success">Verified</Badge>
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="secondary">None</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div>
          <h1 className="text-3xl font-semibold text-white">Users</h1>
          <p className="text-sm text-slate-400 mt-1">{totalCount.toLocaleString()} total users</p>
        </div>
        <Button variant="outline" onClick={() => {
          const csv = ['ID,Email,Handle,KYC,GC,SC,Joined,Status']
          users.forEach(u => csv.push(`${u.id},${u.email},${u.handle || ''},${u.kyc_status},${u.gc_balance},${u.sc_balance},${u.created_at},${u.is_restricted ? 'Suspended' : 'Active'}`))
          const blob = new Blob([csv.join('
')], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a'); a.href = url; a.download = `users-${new Date().toISOString().split('T')[0]}.csv`; a.click()
        }}>
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by email, handle, or name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10 bg-slate-800/50 border-slate-700" />
          </div>
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-slate-800/50 rounded-lg">
            <span className="text-sm text-slate-400">{selectedUsers.size} selected</span>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('suspend')}>Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('unsuspend')}>Unsuspend</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>Clear</Button>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-3 text-left"><input type="checkbox" checked={selectedUsers.size === users.length && users.length > 0} onChange={() => selectedUsers.size === users.length ? setSelectedUsers(new Set()) : setSelectedUsers(new Set(users.map(u => u.id)))} className="rounded bg-slate-700 border-slate-600" /></th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('email')}>Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Handle</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">KYC</th>
                <th className="p-3 text-right text-xs text-slate-400 uppercase">GC</th>
                <th className="p-3 text-right text-xs text-slate-400 uppercase">SC</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase cursor-pointer hover:text-white" onClick={() => toggleSort('created_at')}>Joined {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 text-left text-xs text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-400"><svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer" onClick={() => openUserDetail(user)}>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedUsers.has(user.id)} onChange={() => toggleSelectUser(user.id)} className="rounded bg-slate-700 border-slate-600" />
                  </td>
                  <td className="p-3"><div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /><span className="text-sm text-white">{user.email}</span></div></td>
                  <td className="p-3 text-sm text-slate-400">{user.handle || '—'}</td>
                  <td className="p-3">{getKycBadge(user.kyc_status)}</td>
                  <td className="p-3 text-right font-mono text-sm text-amber-400">{user.gc_balance.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-sm text-emerald-400">{user.sc_balance.toLocaleString()}</td>
                  <td className="p-3 text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{user.is_restricted ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="success">Active</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-800">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Card>

      <Modal open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>User Details</ModalTitle>
            <ModalDescription>{selectedUser?.email}</ModalDescription>
          </ModalHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center p-8"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
          ) : selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><p className="text-xs text-slate-400">Name</p><p className="text-sm text-white flex items-center gap-2"><User className="w-4 h-4" />{selectedUser.name || 'Not set'}</p></div>
                <div className="space-y-1"><p className="text-xs text-slate-400">Handle</p><p className="text-sm text-white">@{selectedUser.handle || '—'}</p></div>
                <div className="space-y-1"><p className="text-xs text-slate-400">Email</p><p className="text-sm text-white flex items-center gap-2"><Mail className="w-4 h-4" />{selectedUser.email}</p></div>
                <div className="space-y-1"><p className="text-xs text-slate-400">Joined</p><p className="text-sm text-white flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-slate-400 mb-1">Gold Coins</p><p className="text-2xl font-mono text-amber-400">{selectedUser.gc_balance.toLocaleString()}</p></div>
                <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-xs text-slate-400 mb-1">Sweeps Coins</p><p className="text-2xl font-mono text-emerald-400">{selectedUser.sc_balance.toLocaleString()}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getKycBadge(selectedUser.kyc_status)}
                {selectedUser.is_admin && <Badge variant="warning">Admin</Badge>}
                {selectedUser.is_publisher && <Badge variant="secondary">Publisher</Badge>}
                {selectedUser.is_restricted && <Badge variant="destructive">Suspended</Badge>}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                <Button variant="outline" size="sm" onClick={() => setAdjustBalanceOpen(true)}><Wallet className="w-4 h-4 mr-1" />Adjust Balance</Button>
                {selectedUser.kyc_status === 'pending' && (
                  <><Button variant="success" size="sm" onClick={() => handleKycReview(selectedUser.id, 'verified')}><CheckCircle className="w-4 h-4 mr-1" />Approve KYC</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleKycReview(selectedUser.id, 'rejected')}><XCircle className="w-4 h-4 mr-1" />Reject KYC</Button></>
                )}
                <Button variant={selectedUser.is_restricted ? 'outline' : 'destructive'} size="sm" onClick={() => handleSuspendUser(selectedUser.id, !selectedUser.is_restricted)}><Ban className="w-4 h-4 mr-1" />{selectedUser.is_restricted ? 'Unsuspend' : 'Suspend'}</Button>
              </div>
              {adjustBalanceOpen && (
                <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
                  <h3 className="font-semibold text-white">Adjust Balance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-slate-400 mb-1 block">Currency</label><select value={adjustCurrency} onChange={(e) => setAdjustCurrency(e.target.value as 'gc' | 'sc')} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"><option value="sc">SC</option><option value="gc">GC</option></select></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Amount</label><Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Enter amount" className="bg-slate-700 border-slate-600" /></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">Reason</label><Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Required reason" className="bg-slate-700 border-slate-600" /></div>
                  </div>
                  <div className="flex gap-2"><Button size="sm" onClick={handleAdjustBalance}>Apply</Button><Button size="sm" variant="ghost" onClick={() => setAdjustBalanceOpen(false)}>Cancel</Button></div>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white mb-3">Recent Transactions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userTransactions.length === 0 ? <p className="text-sm text-slate-500">No transactions</p> : userTransactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg text-sm">
                      <div><p className="text-white">{tx.description}</p><p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p></div>
                      <div className={`font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Active Positions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userPositions.length === 0 ? <p className="text-sm text-slate-500">No positions</p> : userPositions.map((pos) => (
                    <div key={pos.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg text-sm">
                      <div><p className="text-white">{pos.markets?.question || pos.market_id}</p><p className="text-xs text-slate-500">{pos.side.toUpperCase()} • Entry: {(pos.entry_prob * 100).toFixed(1)}%</p></div>
                      <div className="font-mono text-emerald-400">{pos.stake} SC</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <ModalClose />
        </ModalContent>
      </Modal>
    </div>
  )
}
