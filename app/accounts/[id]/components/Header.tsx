'use client'

import { IntegrationStatus, HealthScore } from '@/lib/types'

interface HeaderProps {
  accountName: string
  tier: string
  healthScore: HealthScore
  integrationStatus: IntegrationStatus
  lastFetchedAt?: string
  onHealthClick?: () => void
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

const INTEGRATIONS: { key: keyof IntegrationStatus; label: string; description: string }[] = [
  { key: 'hubspot', label: 'HubSpot', description: 'CRM contacts, deals & engagement data' },
  { key: 'gmail', label: 'Gmail', description: 'Email interaction history & sentiment' },
  { key: 'calendar', label: 'Calendar', description: 'Meeting scheduling & attendance' },
  { key: 'clay', label: 'Clay', description: 'Contact enrichment & company intelligence' },
  { key: 'slack', label: 'Slack', description: 'Team mentions & client feedback' },
  { key: 'meta_ad_library', label: 'Meta Ads', description: 'Ad campaign monitoring' },
  { key: 'google_news', label: 'News', description: 'Industry & company news alerts' },
]

function getTimeSince(isoString?: string): string {
  if (!isoString) return ''
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  return `${hours}h ago`
}

export default function Header({ accountName, tier, healthScore, integrationStatus, lastFetchedAt, onHealthClick }: HeaderProps) {
  const colors = tierColors[tier.toUpperCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }
  const connectedCount = Object.values(integrationStatus).filter(Boolean).length

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: branding + account name */}
        <div className="flex items-center gap-3">
          <a href="/" className="font-mono font-bold text-accent text-sm hover:text-accent/80 transition-colors">KAP</a>
          <span className="text-page-title text-text-primary">{accountName}</span>
          <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
            {tier}
          </span>
        </div>

        {/* Right: health score + integrations + last synced */}
        <div className="flex items-center gap-5">
          {/* Last synced */}
          {lastFetchedAt && (
            <span className="text-meta hidden lg:block">
              Last synced: {getTimeSince(lastFetchedAt)}
            </span>
          )}

          {/* Mini health score - clickable */}
          <button
            onClick={onHealthClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Click to view health score breakdown"
          >
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
          </button>

          {/* Integration status dots with tooltips */}
          <div className="flex items-center gap-1.5">
            {INTEGRATIONS.map(({ key, label, description }) => (
              <div key={key} className="tooltip-wrapper">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${integrationStatus[key] ? 'bg-success' : 'bg-text-dim'}`}
                />
                <span className="tooltip-content">
                  {label}: {integrationStatus[key] ? 'Connected' : 'Not connected'}
                  <br />
                  <span className="text-gray-300">{description}</span>
                </span>
              </div>
            ))}
            <span className="text-meta ml-1">
              {connectedCount}/{INTEGRATIONS.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
