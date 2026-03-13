import { IntegrationStatus, HealthScore } from '@/lib/types'

interface HeaderProps {
  accountName: string
  tier: string
  healthScore: HealthScore
  integrationStatus: IntegrationStatus
}

const tierColors: Record<string, { bg: string; text: string }> = {
  RETENTION: { bg: 'bg-amber-100', text: 'text-amber-700' },
  DEVELOPMENT: { bg: 'bg-green-100', text: 'text-green-700' },
  MAINTENANCE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ACQUISITION: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

const statusColor: Record<string, string> = {
  Healthy: 'text-success',
  'At Risk': 'text-warning',
  Critical: 'text-danger',
}

const INTEGRATIONS: { key: keyof IntegrationStatus; label: string }[] = [
  { key: 'hubspot', label: 'HubSpot' },
  { key: 'gmail', label: 'Gmail' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'clay', label: 'Clay' },
  { key: 'asana', label: 'Asana' },
  { key: 'slack', label: 'Slack' },
]

export default function Header({ accountName, tier, healthScore, integrationStatus }: HeaderProps) {
  const colors = tierColors[tier.toUpperCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }
  const connectedCount = Object.values(integrationStatus).filter(Boolean).length

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: branding + account name */}
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-accent text-sm">KAP</span>
          <span className="text-lg font-semibold text-text-primary">{accountName}</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
            {tier}
          </span>
        </div>

        {/* Right: health score + integrations */}
        <div className="flex items-center gap-5">
          {/* Mini health score */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={healthScore.status === 'Healthy' ? '#059669' : healthScore.status === 'At Risk' ? '#d97706' : '#dc2626'}
                  strokeWidth="3"
                  strokeDasharray={`${(healthScore.overall / 100) * 88} 88`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-text-primary">
                {healthScore.overall}
              </span>
            </div>
            <span className={`text-xs font-medium ${statusColor[healthScore.status]}`}>
              {healthScore.status}
            </span>
          </div>

          {/* Integration status dots */}
          <div className="flex items-center gap-1.5">
            {INTEGRATIONS.map(({ key, label }) => (
              <div key={key} className="group relative">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${integrationStatus[key] ? 'bg-success' : 'bg-text-dim'}`}
                  title={`${label}: ${integrationStatus[key] ? 'Connected' : 'Offline'}`}
                />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-text-dim opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {label}
                </span>
              </div>
            ))}
            <span className="text-xs text-text-secondary ml-1">
              {connectedCount}/{INTEGRATIONS.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
