import { AccountData } from '@/lib/types'
import HealthRing from './ui/HealthRing'
import MetricCard from './ui/MetricCard'
import SignalItem from './ui/SignalItem'

interface OverviewProps {
  data: AccountData
}

export default function Overview({ data }: OverviewProps) {
  const { account, contacts, deals, signals, healthScore } = data

  const openPipeline = deals
    .filter((d) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const wonFYToDate = deals
    .filter((d) => d.dealstage === 'closedwon')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const trustOrAbove = contacts.filter(
    (c) => c.relationship_level === 'TRUST' || c.relationship_level === 'CHAMPION'
  ).length

  const contactsWithDays = contacts.filter((c) => c.days_since_contact != null)
  const avgDaysSinceContact =
    contactsWithDays.length > 0
      ? Math.round(
          contactsWithDays.reduce((sum, c) => sum + (c.days_since_contact ?? 0), 0) /
            contactsWithDays.length
        )
      : 0

  const formatCurrency = (value: number): string => {
    if (value >= 1000) {
      return `£${Math.round(value / 1000)}k`
    }
    return `£${value}`
  }

  const sortedSignals = [...signals]
    .filter((s) => !s.dismissed)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Health Score</h3>
            <div className="flex items-start gap-6">
              <HealthRing score={healthScore.overall} status={healthScore.status} />
              <ul className="space-y-2 flex-1">
                {healthScore.summary.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-text-dim flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            {/* Score breakdown */}
            <div className="mt-4 pt-4 border-t border-border-light grid grid-cols-3 gap-3 text-xs">
              <div><span className="text-text-dim">Relationships</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.relationship_score}%</span></div>
              <div><span className="text-text-dim">Pipeline</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.pipeline_score}%</span></div>
              <div><span className="text-text-dim">Engagement</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.engagement_score}%</span></div>
              <div><span className="text-text-dim">Delivery</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.delivery_score}%</span></div>
              <div><span className="text-text-dim">Momentum</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.momentum_score}%</span></div>
              <div><span className="text-text-dim">Sentiment</span> <span className="font-mono font-medium text-text-primary ml-1">{healthScore.sentiment_score}%</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Open Pipeline" value={formatCurrency(openPipeline)} />
            <MetricCard label="Won FY to Date" value={formatCurrency(wonFYToDate)} />
            <MetricCard label="Relationships ≥ Trust" value={`${trustOrAbove} of ${contacts.length}`} />
            <MetricCard label="Avg Days Since Contact" value={`${avgDaysSinceContact}`} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Signals</h3>
            <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[520px]">
              {sortedSignals.length > 0 ? (
                sortedSignals.map((signal) => (
                  <SignalItem
                    key={signal.id}
                    type={signal.type}
                    priority={signal.priority}
                    title={signal.title}
                    detail={signal.detail}
                    source={signal.source}
                    source_url={signal.source_url}
                    timestamp={signal.timestamp}
                  />
                ))
              ) : (
                <p className="text-sm text-text-secondary">No signals yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-warning-soft border-l-4 border-warning rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Retention Objective</h3>
          <p className="text-sm text-text-secondary">{account.objective_retention}</p>
        </div>
        <div className="bg-success-soft border-l-4 border-success rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Development Objective</h3>
          <p className="text-sm text-text-secondary">{account.objective_development}</p>
        </div>
      </div>
    </div>
  )
}
