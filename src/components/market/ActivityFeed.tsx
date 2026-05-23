'use client'

import Link from 'next/link'
import { activity } from '@/lib/mockData'
import { formatUSD, cn } from '@/lib/utils'
import type { Activity } from '@/types'

interface ActivityFeedProps {
  marketId?: string
  limit?: number
  compact?: boolean
}

export function ActivityFeed({
  marketId,
  limit = 8,
  compact,
}: ActivityFeedProps) {
  const items = (
    marketId ? activity.filter((a) => a.market === marketId) : activity
  ).slice(0, limit)

  return (
    <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Live Activity</h3>
        <div className="flex items-center gap-1.5 text-2xs text-fg-muted">
          <span className="live-dot" /> Real time
        </div>
      </div>
      <ul className="divide-y divide-border">
        {items.map((a) => (
          <ActivityItem key={a.id} item={a} compact={compact} />
        ))}
      </ul>
    </div>
  )
}

function ActivityItem({
  item: a,
  compact,
}: {
  item: Activity
  compact?: boolean
}) {
  const isExplicitYes = a.side === 'YES'
  const isExplicitNo = a.side === 'NO'

  // Side-colored badge styling
  const badgeClass = isExplicitYes
    ? 'bg-yes-soft text-yes border-yes-border'
    : isExplicitNo
      ? 'bg-no-soft text-no border-no-border'
      : 'bg-brand-soft text-brand border-brand/30'

  return (
    <li className="px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-bg-elevated transition-colors">
      {/* Avatar */}
      <div className="h-8 w-8 shrink-0 rounded-full bg-bg flex items-center justify-center text-base border border-border">
        {a.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-fg">{a.user}</span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-subtle">{a.timeAgo} ago</span>
        </div>
        {!compact && (
          <Link
            href={`/markets/${a.market}`}
            className="text-2xs text-fg-muted hover:text-fg truncate block"
          >
            {a.marketTitle}
          </Link>
        )}
      </div>

      {/* Side badge + amount */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1.5 justify-end">
          <span
            className={cn(
              'inline-flex px-1.5 h-5 rounded text-2xs font-semibold border',
              badgeClass
            )}
          >
            {a.side}
          </span>
          <span className="text-xs font-medium text-fg tabular-nums">
            {Math.round(a.price * 100)}¢
          </span>
        </div>
        <div className="text-2xs text-fg-muted tabular-nums mt-0.5">
          {formatUSD(a.amount)}
        </div>
      </div>
    </li>
  )
}
