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

      {/* Depth chart visualization */}
      <DepthChart bids={bids} asks={asks} maxTotal={maxTotal} yesPrice={yesPrice} />

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

function DepthChart({
  bids,
  asks,
  maxTotal,
  yesPrice,
}: {
  bids: Level[]
  asks: Level[]
  maxTotal: number
  yesPrice: number
}) {
  const chartHeight = 80
  const barHeight = 6
  const gap = 2

  // Combine bids and asks into a unified price-sorted list for the chart
  // Show asks above center, bids below
  const allLevels = [
    ...asks.map((l) => ({ ...l, side: 'ask' as const })),
    ...bids.map((l) => ({ ...l, side: 'bid' as const })),
  ]

  return (
    <div className="mb-3 rounded-lg bg-bg border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xs font-medium text-fg-muted">Depth Chart</span>
        <span className="text-2xs tabular-nums text-fg-subtle">
          {Math.round(yesPrice * 100)}¢
        </span>
      </div>
      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 200 ${chartHeight}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Ask levels (red) — drawn from left, stacked top-down */}
        {asks.map((l, i) => {
          const width = (l.total / maxTotal) * 100
          const y = i * (barHeight + gap)
          return (
            <g key={`ask-${l.price}`}>
              <rect
                x={0}
                y={y}
                width={width}
                height={barHeight}
                rx={1.5}
                fill="#FF4D6D"
                opacity={0.5}
              />
              <text
                x={width + 4}
                y={y + barHeight - 1}
                fontSize="5"
                fill="#FF4D6D"
                fontFamily="monospace"
              >
                {Math.round(l.price * 100)}¢
              </text>
            </g>
          )
        })}

        {/* Center divider line */}
        <line
          x1={0}
          y1={asks.length * (barHeight + gap) + gap / 2}
          x2={200}
          y2={asks.length * (barHeight + gap) + gap / 2}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeDasharray="3 2"
        />

        {/* Bid levels (green) — drawn from left, stacked top-down */}
        {bids.map((l, i) => {
          const width = (l.total / maxTotal) * 100
          const y = asks.length * (barHeight + gap) + gap + i * (barHeight + gap)
          return (
            <g key={`bid-${l.price}`}>
              <rect
                x={0}
                y={y}
                width={width}
                height={barHeight}
                rx={1.5}
                fill="#00D284"
                opacity={0.5}
              />
              <text
                x={width + 4}
                y={y + barHeight - 1}
                fontSize="5"
                fill="#00D284"
                fontFamily="monospace"
              >
                {Math.round(l.price * 100)}¢
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between text-2xs mt-1">
        <span className="text-yes font-medium">Bids</span>
        <span className="text-no font-medium">Asks</span>
      </div>
    </div>
  )
}
