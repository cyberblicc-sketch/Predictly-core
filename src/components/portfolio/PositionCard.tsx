'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react'
import { cn, formatUSD, formatCents } from '@/lib/utils'
import type { Position } from '@/types'

interface PositionCardProps {
  position: Position
  onClose?: (positionId: string) => Promise<void>
}

export function PositionCard({ position, onClose }: PositionCardProps) {
  const [isClosing, setIsClosing] = React.useState(false)

  const pnl =
    position.pnl ??
    (position.currentPrice - position.avgPrice) * position.shares
  const pnlPct =
    position.avgPrice > 0
      ? ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100
      : 0
  const isProfit = pnl >= 0
  const value = position.currentPrice * position.shares

  const handleClose = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onClose) return
    setIsClosing(true)
    try {
      await onClose(position.id)
    } catch (error) {
      console.error('Close position failed:', error)
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <Link
      href={`/markets/${position.marketId}`}
      className="group block rounded-xl bg-bg-subtle border border-border hover:border-border-strong hover:bg-bg-elevated transition-all p-4"
    >
      <div className="flex items-start gap-3">
        {/* Market emoji icon */}
        <div
          className={cn(
            'shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg border border-border',
            position.imageColor
          )}
        >
          {position.imageEmoji}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate group-hover:text-fg transition-colors">
              {position.marketTitle}
            </h3>
            <span
              className={cn(
                'shrink-0 px-1.5 h-5 rounded text-2xs font-semibold',
                position.side === 'YES'
                  ? 'bg-yes-soft text-yes'
                  : position.side === 'NO'
                    ? 'bg-no-soft text-no'
                    : 'bg-brand-soft text-brand'
              )}
            >
              {position.outcome}
            </span>
          </div>

          {/* Details row */}
          <div className="flex items-center gap-2 text-xs text-fg-muted flex-wrap">
            <span className="tabular-nums">
              {position.shares.toLocaleString()} shares
            </span>
            <span className="text-fg-subtle">·</span>
            <span>Avg {formatCents(position.avgPrice)}</span>
            <span className="text-fg-subtle">·</span>
            <span>Now {formatCents(position.currentPrice)}</span>
            <span className="text-fg-subtle">·</span>
            <span
              className={cn(
                'font-medium',
                position.currency === 'GC' ? 'text-gold' : 'text-sweeps'
              )}
            >
              {position.currency}
            </span>
          </div>

          {/* Value display */}
          <div className="mt-1.5 text-xs text-fg-muted">
            Value:{' '}
            <span className="font-medium text-fg tabular-nums">
              {formatUSD(value, { compact: false })}
            </span>
          </div>
        </div>

        {/* P&L column */}
        <div className="text-right shrink-0">
          <div
            className={cn(
              'text-sm font-bold tabular-nums',
              isProfit ? 'text-profit' : 'text-loss'
            )}
          >
            {isProfit ? '+' : ''}
            {formatUSD(Math.abs(pnl), { compact: false })}
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium tabular-nums justify-end',
              isProfit ? 'text-profit' : 'text-loss'
            )}
          >
            {isProfit ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {isProfit ? '+' : ''}
            {pnlPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Close position button */}
      {onClose && (
        <div className="mt-3 pt-3 border-t border-border/70 flex justify-end">
          <button
            onClick={handleClose}
            disabled={isClosing}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-all',
              isProfit
                ? 'text-profit bg-profit/10 border border-profit/20 hover:bg-profit/20'
                : 'text-loss bg-loss/10 border border-loss/20 hover:bg-loss/20',
              isClosing && 'opacity-50 cursor-not-allowed'
            )}
          >
            <X className="h-3 w-3" />
            {isClosing ? 'Closing...' : 'Close Position'}
          </button>
        </div>
      )}
    </Link>
  )
}
