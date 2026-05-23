'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OrderBookProps {
  yesPrice: number
}

type Level = { price: number; size: number; total: number }

function genLevels(
  center: number,
  side: 'bid' | 'ask',
  count = 7
): Level[] {
  const out: Level[] = []
  let running = 0
  for (let i = 1; i <= count; i++) {
    const offset = i * 0.01 * (side === 'bid' ? -1 : 1)
    const price = Math.max(0.01, Math.min(0.99, +(center + offset).toFixed(2)))
    // Deterministic pseudo-random sizes
    const size = Math.round(
      200 + Math.abs(Math.sin(i * 7.13 + (side === 'bid' ? 1 : 2)) * 2400)
    )
    running += size
    out.push({ price, size, total: running })
  }
  return out
}

export function OrderBook({ yesPrice }: OrderBookProps) {
  const { bids, asks, maxTotal, spread } = useMemo(() => {
    const bids = genLevels(yesPrice, 'bid')
    const rawAsks = genLevels(yesPrice, 'ask')
    const asks = [...rawAsks].reverse() // highest ask first
    const maxTotal = Math.max(
      ...bids.map((l) => l.total),
      ...rawAsks.map((l) => l.total)
    )
    const bestBid = bids[0]?.price ?? yesPrice - 0.01
    const bestAsk = rawAsks[0]?.price ?? yesPrice + 0.01
    const spread = Math.round((bestAsk - bestBid) * 100)
    return { bids, asks, maxTotal, spread }
  }, [yesPrice])

  return (
    <div className="rounded-xl bg-bg-subtle border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Order Book</h3>
        <span className="text-2xs text-fg-subtle">YES side</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 text-2xs text-fg-subtle uppercase tracking-wide pb-2 border-b border-border">
        <div>Price</div>
        <div className="text-right">Shares</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (sellers) — red */}
      <div className="py-1 space-y-0.5">
        {asks.map((l) => (
          <OrderRow
            key={`a-${l.price}`}
            level={l}
            side="ask"
            maxTotal={maxTotal}
          />
        ))}
      </div>

      {/* Last price / Spread indicator */}
      <div className="my-1 py-2 px-3 rounded-md bg-bg flex items-center justify-between text-xs">
        <span className="text-fg-muted">Last</span>
        <span className="font-bold tabular-nums text-fg">
          {Math.round(yesPrice * 100)}¢
        </span>
        <span className="text-fg-subtle text-2xs tabular-nums">
          spread {spread}¢
        </span>
      </div>

      {/* Bids (buyers) — green */}
      <div className="py-1 space-y-0.5">
        {bids.map((l) => (
          <OrderRow
            key={`b-${l.price}`}
            level={l}
            side="bid"
            maxTotal={maxTotal}
          />
        ))}
      </div>
    </div>
  )
}

function OrderRow({
  level,
  side,
  maxTotal,
}: {
  level: Level
  side: 'bid' | 'ask'
  maxTotal: number
}) {
  const widthPct = Math.min((level.total / maxTotal) * 100, 100)
  const isBid = side === 'bid'
  const depthBg = isBid ? 'bg-yes/8' : 'bg-no/8'
  const priceColor = isBid ? 'text-yes' : 'text-no'

  return (
    <div className="relative grid grid-cols-3 text-xs tabular-nums py-0.5 hover:bg-bg-hover transition-colors rounded-sm">
      {/* Depth bar */}
      <div
        className={cn('absolute right-0 top-0 bottom-0 rounded-sm', depthBg)}
        style={{ width: `${widthPct}%` }}
      />
      <div className={cn('relative font-medium', priceColor)}>
        {Math.round(level.price * 100)}¢
      </div>
      <div className="relative text-right text-fg-muted">
        {level.size.toLocaleString()}
      </div>
      <div className="relative text-right text-fg-subtle">
        {level.total.toLocaleString()}
      </div>
    </div>
  )
}
