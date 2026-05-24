'use client'

import { useId } from 'react'

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
  const uid = useId()
  const gradId = `spark-grad-${uid}`

  if (!data.length) return null

  const prices = data.map((d) => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const step = data.length > 1 ? width / (data.length - 1) : width

  const points = data.map((d, i) => {
    const x = i * step
    const y = height - ((d.price - min) / range) * height * 0.85 - height * 0.075
    return { x, y }
  })

  // Smooth cubic bezier path
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M${pt.x},${pt.y}`
    const prev = points[i - 1]
    const cpx1 = prev.x + (pt.x - prev.x) * 0.4
    const cpx2 = prev.x + (pt.x - prev.x) * 0.6
    return `${acc} C${cpx1},${prev.y} ${cpx2},${pt.y} ${pt.x},${pt.y}`
  }, '')

  const areaD =
    `M0,${height} ` +
    points.reduce((acc, pt, i) => {
      if (i === 0) return `L${pt.x},${pt.y}`
      const prev = points[i - 1]
      const cpx1 = prev.x + (pt.x - prev.x) * 0.4
      const cpx2 = prev.x + (pt.x - prev.x) * 0.6
      return `${acc} C${cpx1},${prev.y} ${cpx2},${pt.y} ${pt.x},${pt.y}`
    }, '') +
    ` L${width},${height} Z`

  const color = positive ? '#00D284' : '#FF4D6D'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
