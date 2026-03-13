interface HeaderProps {
  accountName: string
  tier: string
  hubspotConnected: boolean
}

const tierColors: Record<string, { bg: string; text: string }> = {
  RETENTION: { bg: 'bg-amber-100', text: 'text-amber-700' },
  DEVELOPMENT: { bg: 'bg-green-100', text: 'text-green-700' },
  STRATEGIC: { bg: 'bg-blue-100', text: 'text-blue-700' },
  NURTURE: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

export default function Header({ accountName, tier, hubspotConnected }: HeaderProps) {
  const colors = tierColors[tier.toUpperCase()] ?? { bg: 'bg-gray-100', text: 'text-gray-700' }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-accent">KAP</span>
          <span className="text-lg font-semibold text-text-primary">{accountName}</span>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {tier}
          </span>

          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                hubspotConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-text-secondary">
              {hubspotConnected ? 'HubSpot Connected' : 'HubSpot Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
