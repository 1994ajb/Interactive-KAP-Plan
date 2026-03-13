'use client'

import Badge from './Badge'

interface HealthRingProps {
  score: number
  status: 'Healthy' | 'At Risk' | 'Critical'
  size?: number
}

const statusConfig: Record<HealthRingProps['status'], { color: string; badge: 'green' | 'amber' | 'red' }> = {
  Healthy: { color: '#059669', badge: 'green' },
  'At Risk': { color: '#d97706', badge: 'amber' },
  Critical: { color: '#dc2626', badge: 'red' },
}

export default function HealthRing({ score, status, size = 160 }: HealthRingProps) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference
  const { color, badge } = statusConfig[status]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-3xl font-bold text-text-primary">{score}</span>
        </div>
      </div>
      <Badge label={status} variant={badge} />
    </div>
  )
}
