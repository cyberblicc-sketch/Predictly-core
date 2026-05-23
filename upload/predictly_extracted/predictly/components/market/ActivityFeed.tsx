'use client'

import Link from 'next/link'
import { activity } from '@/lib/mockData'
import { formatUSD, cn } from '@/lib/utils'

interface ActivityFeedProps {
  marketId?: string
  limit?: number
  compact?: boolean
}

export function ActivityFeed({ marketId, limit = 8, compact }: ActivityFeedProps) {
  const items = (marketId
    ? activity.filter((a) => a.market === marketId)
    : activity
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
        {items.map((a) => {
          const isYes = a.side === 'YES' || (a.side !== 'NO' && !a.side.startsWith('No'))
          const isExplicitNo = a.side === 'NO'
          const tone = isExplicitNo ? 'text-no' : isYes ? 'text-yes' : 'text-fg'
          return (
            <li key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-bg-elevated transition-colors">
              <div className="h-8 w-8 rounded-full bg-bg flex items-center justify-center text-base border border-border">
                {a.avatar}
              </div>
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
              <div className="text-right">
                <div className={cn('text-xs font-semibold', tone)}>
                  {a.side} · {Math.round(a.price * 100)}¢
                </div>
                <div className="text-2xs text-fg-muted tabular-nums">
                  {formatUSD(a.amount)}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
