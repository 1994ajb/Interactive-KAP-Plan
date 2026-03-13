interface MetricCardProps {
  label: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}

const trendConfig = {
  up: { color: 'text-success', symbol: '\u25B2' },
  down: { color: 'text-danger', symbol: '\u25BC' },
  neutral: { color: 'text-text-dim', symbol: '\u25CF' },
}

export default function MetricCard({ label, value, subtitle, trend }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-card p-4">
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-mono font-semibold text-text-primary">{value}</span>
        {trend && (
          <span className={`text-xs ${trendConfig[trend].color}`}>
            {trendConfig[trend].symbol}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  )
}
