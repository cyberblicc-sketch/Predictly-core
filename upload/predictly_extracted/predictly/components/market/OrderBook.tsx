'use client'

// A faux orderbook view used on the market detail page. Real exchanges
// expose bids/asks with size; we generate plausible levels around the
// current price for visual realism.

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OrderBookProps {
  yesPrice: number  // 0..1
}

type Level = { price: number; size: number; total: number }

function genLevels(center: number, side: 'bid' | 'ask', count = 6): Level[] {
  const out: Level[] = []
  let running = 0
  for (let i = 1; i <= count; i++) {
    const offset = (i * 0.01) * (side === 'bid' ? -1 : 1)
    const price = Math.max(0.01, Math.min(0.99, +(center + offset).toFixed(2)))
    // Pseudo-random sizes derived from index — stable between renders.
    const size = Math.round(200 + Math.abs(Math.sin(i * 7.13 + (side === 'bid' ? 1 : 2)) * 2400))
    running += size
    out.push({ price, size, total: running })
  }
  return out
}

export function OrderBook({ yesPrice }: OrderBookProps) {
  const { bids, asks, maxTotal } = useMemo(() => {
    const bids = genLevels(yesPrice, 'bid')
    const asks = genLevels(yesPrice, 'ask').reverse() // highest ask first
    const maxTotal = Math.max(
      ...bids.map((l) => l.total),
      ...asks.map((l) => l.total),
    )
    return { bids, asks, maxTotal }
  }, [yesPrice])

  return (
    <div className="rounded-xl bg-bg-subtle border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Order Book</h3>
        <span className="text-2xs text-fg-subtle">YES side</span>
      </div>

      <div className="grid grid-cols-3 text-2xs text-fg-subtle uppercase tracking-wide pb-2 border-b border-border">
        <div>Price</div>
        <div className="text-right">Shares</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks */}
      <div className="py-1 space-y-0.5">
        {asks.map((l) => (
          <Row key={`a-${l.price}`} level={l} side="ask" maxTotal={maxTotal} />
        ))}
      </div>

      {/* Spread / last */}
      <div className="my-1 py-2 px-2 rounded bg-bg flex items-center justify-between text-xs">
        <span className="text-fg-muted">Last</span>
        <span className="font-semibold tabular-nums">
          {Math.round(yesPrice * 100)}¢
        </span>
        <span className="text-fg-subtle text-2xs">spread 2¢</span>
      </div>

      {/* Bids */}
      <div className="py-1 space-y-0.5">
        {bids.map((l) => (
          <Row key={`b-${l.price}`} level={l} side="bid" maxTotal={maxTotal} />
        ))}
      </div>
    </div>
  )
}

function Row({
  level, side, maxTotal,
}: {
  level: Level; side: 'bid' | 'ask'; maxTotal: number
}) {
  const widthPct = (level.total / maxTotal) * 100
  const color = side === 'bid' ? 'bg-yes/10' : 'bg-no/10'
  const textColor = side === 'bid' ? 'text-yes' : 'text-no'

  return (
    <div className="relative grid grid-cols-3 text-xs tabular-nums py-0.5">
      <div
        className={cn('absolute right-0 top-0 bottom-0', color)}
        style={{ width: `${widthPct}%` }}
      />
      <div className={cn('relative font-medium', textColor)}>
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
