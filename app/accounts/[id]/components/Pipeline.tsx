import { HubSpotDeal } from '@/lib/types'
import { PIPELINE_STAGES } from '@/lib/constants'
import MetricCard from './ui/MetricCard'
import DealRow from './ui/DealRow'

interface PipelineProps {
  deals: HubSpotDeal[]
}

function formatGBP(amount: number): string {
  if (amount >= 1000) {
    return `£${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
  }
  return `£${amount.toLocaleString()}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Pipeline({ deals }: PipelineProps) {
  const activeDeals = deals
    .filter((d) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
    .sort((a, b) => {
      const orderA = PIPELINE_STAGES[a.dealstage]?.order ?? 99
      const orderB = PIPELINE_STAGES[b.dealstage]?.order ?? 99
      return orderA - orderB
    })

  const closedDeals = deals
    .filter((d) => d.dealstage === 'closedwon' || d.dealstage === 'closedlost')
    .sort((a, b) => {
      const dateA = a.closedate ? new Date(a.closedate).getTime() : 0
      const dateB = b.closedate ? new Date(b.closedate).getTime() : 0
      return dateB - dateA
    })

  const openPipeline = activeDeals.reduce(
    (sum, d) => sum + (d.amount ?? 0),
    0
  )
  const closedWonTotal = deals
    .filter((d) => d.dealstage === 'closedwon')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const closedLostTotal = deals
    .filter((d) => d.dealstage === 'closedlost')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Open Pipeline" value={formatGBP(openPipeline)} />
        <MetricCard label="Closed Won FY" value={formatGBP(closedWonTotal)} />
        <MetricCard label="Closed Lost FY" value={formatGBP(closedLostTotal)} />
      </div>

      {/* Active Deals */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Active Deals
        </h3>
        {activeDeals.length > 0 ? (
          <div>
            {activeDeals.map((deal) => (
              <DealRow key={deal.id} {...deal} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-dim py-4 text-center">
            No active deals
          </p>
        )}
      </div>

      {/* Recently Closed */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Recently Closed
        </h3>
        {closedDeals.length > 0 ? (
          <div className="space-y-3">
            {closedDeals.map((deal) => {
              const isWon = deal.dealstage === 'closedwon'
              return (
                <div
                  key={deal.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isWon ? '#dcfce7' : '#fee2e2',
                        color: isWon ? '#166534' : '#991b1b',
                      }}
                    >
                      {isWon ? 'Won' : 'Lost'}
                    </span>
                    <span className="text-sm text-text-primary truncate">
                      {deal.dealname}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="text-xs text-text-secondary">
                      {formatDate(deal.closedate)}
                    </span>
                    <span className="text-sm font-mono font-semibold text-text-primary">
                      {formatGBP(deal.amount ?? 0)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-text-dim py-4 text-center">
            No recently closed deals
          </p>
        )}
      </div>
    </div>
  )
}
