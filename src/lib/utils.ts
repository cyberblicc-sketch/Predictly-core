import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as compact USD ($1.2K, $45.7M). Uses deterministic formatting to avoid SSR/client hydration mismatches. */
export function formatUSD(amount: number, opts: { compact?: boolean } = {}) {
  const { compact = true } = opts
  if (compact) {
    const abs = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`
    return `${sign}$${abs.toFixed(0)}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format a probability (0..1) as a percentage like "67%". */
export function formatPct(p: number, decimals = 0) {
  return `${(p * 100).toFixed(decimals)}%`
}

/** Format a price in cents ($0.67 → "67¢"). */
export function formatCents(p: number) {
  return `${Math.round(p * 100)}¢`
}

/** Compact number formatter (12,345 → 12.3K). Uses deterministic formatting to avoid SSR/client hydration mismatches. */
export function formatCompact(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return n.toFixed(0)
}

/** "Closes in 3d", "Closes in 2h", etc. */
export function timeUntil(dateISO: string) {
  const target = new Date(dateISO).getTime()
  const now = Date.now()
  const diff = target - now
  if (diff <= 0) return 'Closed'
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days >= 30) return `${Math.floor(days / 30)}mo`
  if (days >= 1) return `${days}d`
  return `${hours >= 1 ? `${hours}h` : `${minutes}m`}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Format currency with type label */
export function formatCurrency(amount: number, currency: 'GC' | 'SC' | 'USD' = 'USD') {
  if (currency === 'GC') return `${amount.toLocaleString()} GC`
  if (currency === 'SC') return `${amount.toLocaleString()} SC`
  return formatUSD(amount, { compact: false })
}

// ── Predictly Utility Functions ──────────────────────────────────────────

/** Calculate P&L from entry and current prices */
export function calculatePnl(
  entryPrice: number,
  currentPrice: number,
  stake: number,
  side: 'YES' | 'NO' = 'YES'
): number {
  if (side === 'YES') {
    return ((currentPrice - entryPrice) / entryPrice) * stake
  }
  return ((entryPrice - currentPrice) / entryPrice) * stake
}

/** Human-readable relative time ("3 hours ago", "Just now") */
export function timeAgo(dateOrStr: string | Date): string {
  const date = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 0) return 'Just now'

  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`

  const years = Math.floor(months / 12)
  return `${years}y ago`
}

/** Shorten a wallet address or long ID for display */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/** Format a decimal as percentage with configurable decimals */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}
