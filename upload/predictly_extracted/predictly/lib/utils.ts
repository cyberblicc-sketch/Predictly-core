// Small utility helpers used across the app.

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Format a number as compact USD ($1.2K, $45.7M). */
export function formatUSD(amount: number, opts: { compact?: boolean } = {}) {
  const { compact = true } = opts
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
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

/** Compact number formatter (12,345 → 12.3K). */
export function formatCompact(n: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
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
  if (hours >= 1) return `${hours}h`
  return `${minutes}m`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
