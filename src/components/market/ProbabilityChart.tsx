'use client'

import { useState, useMemo, useId } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { ChartDataPoint } from '@/types'
import { cn } from '@/lib/utils'

interface ProbabilityChartProps {
  data: ChartDataPoint[]
  outcomeLabel?: string
  className?: string
}

const RANGES = [
  { id: '1h', label: '1H', hours: 1 },
  { id: '6h', label: '6H', hours: 6 },
  { id: '1d', label: '1D', hours: 24 },
  { id: '1w', label: '1W', hours: 24 * 7 },
  { id: '1m', label: '1M', hours: 24 * 30 },
  { id: 'all', label: 'ALL', hours: Infinity },
] as const

type RangeId = (typeof RANGES)[number]['id']

export function ProbabilityChart({
  data,
  outcomeLabel = 'Yes',
  className,
}: ProbabilityChartProps) {
  const [range, setRange] = useState<RangeId>('1w')
  const uid = useId()
  const gradId = `prob-grad-${uid}`

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.id === range)!
    if (!isFinite(r.hours)) return data
    const cutoff = Date.now() - r.hours * 3_600_000
    return data.filter((d) => d.t >= cutoff)
  }, [data, range])

  const latest = filtered[filtered.length - 1]?.price ?? 0
  const first = filtered[0]?.price ?? 0
  const delta = latest - first
  const deltaPos = delta >= 0
  const color = deltaPos ? '#00D284' : '#FF4D6D'

  return (
    <div className={cn('rounded-xl bg-bg-subtle border border-border p-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-xs text-fg-muted mb-1">
            {outcomeLabel} probability
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tabular-nums">
              {Math.round(latest * 100)}%
            </span>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                deltaPos ? 'text-yes' : 'text-no'
              )}
            >
              {deltaPos ? '+' : ''}
              {(delta * 100).toFixed(1)}% in {range.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-bg border border-border">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'px-2.5 h-7 rounded-md text-xs font-medium transition-colors',
                range === r.id
                  ? 'bg-bg-elevated text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tickFormatter={(t: number) =>
                new Date(t).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
              stroke="#5A6378"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
              stroke="#5A6378"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <ReferenceLine y={0.5} stroke="#2A3040" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: '#11131A',
                border: '1px solid #2A3040',
                borderRadius: 8,
                fontSize: 12,
                color: '#F5F7FA',
              }}
              labelStyle={{ color: '#9098A8' }}
              formatter={(v: number) => [
                `${Math.round(v * 100)}%`,
                outcomeLabel,
              ]}
              labelFormatter={(t: number) =>
                new Date(t).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              }
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
