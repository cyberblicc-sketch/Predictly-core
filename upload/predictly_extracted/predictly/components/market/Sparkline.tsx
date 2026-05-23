'use client'

// Tiny inline SVG sparkline. No external library — keeps render fast and
// avoids any client/server chart hydration overhead.

interface SparklineProps {
  data: { t: number; price: number }[]
  positive?: boolean
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  positive = true,
  width = 120,
  height = 36,
  className,
}: SparklineProps) {
  if (!data.length) return null
  const prices = data.map((d) => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const step = data.length > 1 ? width / (data.length - 1) : width

  const points = data.map((d, i) => {
    const x = i * step
    const y = height - ((d.price - min) / range) * height
    return [x, y] as const
  })

  const pathD = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(' ')

  const areaD =
    `M0,${height} ` +
    points.map(([x, y]) => `L${x},${y}`).join(' ') +
    ` L${width},${height} Z`

  const color = positive ? '#00D284' : '#FF4D6D'
  const id = `spark-${positive ? 'y' : 'n'}-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
