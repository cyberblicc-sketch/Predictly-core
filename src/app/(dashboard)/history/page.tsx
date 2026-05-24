'use client'

import { useState, useMemo } from 'react'
import {
  Download, Calendar, Filter, Activity, Search,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { transactions } from '@/lib/mockData'
import { cn, formatDate } from '@/lib/utils'

const TYPES = ['All', 'TRADE', 'DEPOSIT', 'WITHDRAWAL', 'REFERRAL', 'KYC_REWARD', 'STAKE', 'SETTLEMENT', 'GC_PURCHASE', 'SC_BONUS'] as const
const CURRENCIES = ['All', 'GC', 'SC'] as const
const STATUSES = ['All', 'COMPLETED', 'PENDING', 'FAILED'] as const
const PAGE_SIZE = 8

export default function HistoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [currencyFilter, setCurrencyFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (typeFilter !== 'All') list = list.filter((t) => t.type === typeFilter)
    if (currencyFilter !== 'All') list = list.filter((t) => t.currency === currencyFilter)
    if (statusFilter !== 'All') list = list.filter((t) => t.status === statusFilter)
    if (dateFrom) list = list.filter((t) => new Date(t.createdAt) >= new Date(dateFrom))
    if (dateTo) list = list.filter((t) => new Date(t.createdAt) <= new Date(dateTo + 'T23:59:59'))
    return list
  }, [typeFilter, currencyFilter, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Description'].join(','),
      ...filtered.map((t) =>
        [t.createdAt, t.type, t.amount, t.currency, t.status, `"${t.description}"`].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-fg-muted mt-1">View and export all your transactions</p>
        </div>
        <button
          onClick={handleExport}
          className="h-10 px-4 rounded-lg bg-bg-subtle border border-border hover:border-border-strong text-sm font-medium flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl bg-bg-subtle border border-border p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date range */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-subtle" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg border border-border text-xs focus:outline-none focus:border-brand"
                placeholder="From"
              />
            </div>
            <span className="text-fg-subtle text-xs">to</span>
            <div className="relative flex-1">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-subtle" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg border border-border text-xs focus:outline-none focus:border-brand"
                placeholder="To"
              />
            </div>
          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-lg bg-bg border border-border text-xs focus:outline-none focus:border-brand"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.replace('_', ' ')}</option>)}
          </select>

          {/* Currency */}
          <select
            value={currencyFilter}
            onChange={(e) => { setCurrencyFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-lg bg-bg border border-border text-xs focus:outline-none focus:border-brand"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Currencies' : c}</option>)}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 rounded-lg bg-bg border border-border text-xs focus:outline-none focus:border-brand"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Transaction table */}
      <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-2xs text-fg-subtle uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Currency</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((tx) => (
                <tr key={tx.id} className="hover:bg-bg-elevated transition-colors">
                  <td className="px-4 py-3 text-fg-muted tabular-nums whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-2xs font-semibold',
                      tx.type === 'TRADE' ? 'bg-brand-soft text-brand' :
                      tx.type === 'DEPOSIT' || tx.type === 'GC_PURCHASE' ? 'bg-yes-soft text-yes' :
                      tx.type === 'WITHDRAWAL' ? 'bg-no-soft text-no' :
                      'bg-gold-soft text-gold'
                    )}>
                      <Activity className="h-3 w-3" />
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={cn(
                    'px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap',
                    tx.type === 'WITHDRAWAL' ? 'text-loss' : 'text-profit'
                  )}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      tx.currency === 'GC' ? 'text-gold' : 'text-sweeps'
                    )}>
                      {tx.currency === 'GC' ? '🪙' : '💎'} {tx.currency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex px-2 h-5 rounded-full text-2xs font-medium',
                      tx.status === 'COMPLETED' ? 'bg-yes-soft text-yes' :
                      tx.status === 'PENDING' ? 'bg-gold-soft text-gold' :
                      'bg-no-soft text-no'
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-fg-muted max-w-[250px] truncate">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginated.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-10 w-10 text-fg-subtle opacity-40 mb-3" />
            <p className="text-sm text-fg-muted">No transactions match your filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-fg-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors',
                    p === page ? 'bg-brand text-white' : 'border border-border hover:bg-bg-elevated'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
