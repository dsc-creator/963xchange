'use client'

import { useMemo } from 'react'

interface MiniChartProps {
  up: boolean
  width?: number
  height?: number
  strokeWidth?: number
}

export default function MiniChart({ up, width = 120, height = 40, strokeWidth = 1.5 }: MiniChartProps) {
  const color = up ? 'var(--accent-green)' : 'var(--accent-red)'
  const uid = useMemo(() => Math.random().toString(36).slice(2, 7), [])

  const pts = useMemo(() => {
    const arr: [number, number][] = []
    let val = height / 2
    for (let i = 0; i < 16; i++) {
      const x = (i / 15) * width
      val = Math.max(4, Math.min(height - 4, val + (Math.random() - (up ? 0.42 : 0.58)) * 10))
      arr.push([x, val])
    }
    return arr
  }, [up, width, height])

  const line = 'M ' + pts.map(p => p.join(',')).join(' L ')
  const area = `M 0,${height} L ${line.slice(2)} L ${width},${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0}   />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
