import { AccountData } from '@/lib/types'
import HealthRing from './ui/HealthRing'
import MetricCard from './ui/MetricCard'
import SignalItem from './ui/SignalItem'

interface OverviewProps {
  data: AccountData
}

export default function Overview({ data }: OverviewProps) {
  const { account, contacts, deals, signals, healthScore } = data

  // Metric calculations
  const openPipeline = deals
    .filter((d) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const wonFYToDate = deals
    .filter((d) => d.dealstage === 'closedwon')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const trustOrAbove = contacts.filter(
    (c) => c.relationship_level === 'TRUST' || c.relationship_level === 'CHAMPION'
  ).length

  const contactsWithDays = contacts.filter(
    (c) => c.days_since_contact != null
  )
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
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — spans 2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health score section */}
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
          </div>

          {/* Metric cards 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Open Pipeline" value={formatCurrency(openPipeline)} />
            <MetricCard label="Won FY to Date" value={formatCurrency(wonFYToDate)} />
            <MetricCard
              label="Relationships ≥ Trust"
              value={`${trustOrAbove} of ${contacts.length}`}
            />
            <MetricCard label="Avg Days Since Contact" value={`${avgDaysSinceContact}`} />
          </div>
        </div>

        {/* Right column — signal feed */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Signals</h3>
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[480px]">
              {sortedSignals.length > 0 ? (
                sortedSignals.map((signal) => (
                  <SignalItem key={signal.id} {...signal} />
                ))
              ) : (
                <p className="text-sm text-text-secondary">No signals yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width objectives row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention Objective */}
        <div className="bg-warning-soft border-l-4 border-warning rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Retention Objective</h3>
          <p className="text-sm text-text-secondary">{account.objective_retention}</p>
        </div>

        {/* Development Objective */}
        <div className="bg-success-soft border-l-4 border-success rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Development Objective</h3>
          <p className="text-sm text-text-secondary">{account.objective_development}</p>
        </div>
      </div>
    </div>
  )
}
