'use client'

import { useState, useCallback } from 'react'
import { DeliveryMetrics, CampaignMetrics, IntegrationStatus, HubSpotDeal } from '@/lib/types'
import MetricCard from './ui/MetricCard'

interface PerformanceProps {
  deliveryMetrics: DeliveryMetrics[]
  campaignMetrics: CampaignMetrics[]
  integrationStatus: IntegrationStatus
  deals?: HubSpotDeal[]
}

function getVelocityBarColor(v: number): string {
  if (v >= 90) return 'bg-success'
  if (v >= 75) return 'bg-warning'
  return 'bg-danger'
}

export default function Performance({ deliveryMetrics, campaignMetrics, integrationStatus, deals = [] }: PerformanceProps) {
  const [valueNarrative, setValueNarrative] = useState<string | null>(null)
  const [valueLoading, setValueLoading] = useState(false)

  const hasDeliveryData = deliveryMetrics.length > 0
  const deliveryData = hasDeliveryData
    ? deliveryMetrics.map(m => ({ tasks_due: m.tasks_due, tasks_completed_on_time: m.tasks_completed_on_time, tasks_overdue: m.tasks_overdue, delivery_velocity: m.delivery_velocity }))
    : []

  const latestDelivery = deliveryData[deliveryData.length - 1]
  const last4Periods = deliveryData.slice(-4)

  const wonDeals = deals.filter(d => d.dealstage === 'closedwon')
  const wonTotal = wonDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)

  const generateValueNarrative = useCallback(async () => {
    setValueLoading(true)
    try {
      const res = await fetch('/api/coach/value-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wonTotal,
          wonDeals: wonDeals.map(d => d.dealname),
          deliveryVelocity: latestDelivery?.delivery_velocity ?? null,
        }),
      })
      const data = await res.json()
      setValueNarrative(data.narrative || data.error || 'Failed to generate')
    } catch {
      setValueNarrative('Network error — retry')
    } finally {
      setValueLoading(false)
    }
  }, [wonTotal, wonDeals, latestDelivery])

  return (
    <div className="space-y-6">
      {/* Campaign Performance - Empty State */}
      {!integrationStatus.supermetrics && campaignMetrics.length === 0 && (
        <div className="card">
          <h3 className="text-section-header text-text-primary mb-4">Campaign Performance</h3>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            This tab will show campaign performance metrics once Supermetrics is connected. These metrics feed into QBR preparation and the value delivered narrative.
          </p>
          <div className="grid grid-cols-5 gap-4">
            {['Reach', 'Engagement Rate', 'Video Views', 'Follower Growth', 'CPM'].map(metric => (
              <div key={metric} className="card text-center">
                <p className="text-meta mb-2">{metric}</p>
                <p className="text-2xl font-mono font-semibold text-text-dim">—</p>
                <p className="text-meta mt-1">Connect Supermetrics to track</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Tracker */}
      {hasDeliveryData && latestDelivery && (
        <div className="card">
          <h3 className="text-section-header text-text-primary mb-4">Delivery Tracker</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard label="Tasks Due This Week" value={String(latestDelivery.tasks_due)} />
            <MetricCard label="Overdue" value={String(latestDelivery.tasks_overdue)} trend={latestDelivery.tasks_overdue > 0 ? 'down' : 'neutral'} />
            <MetricCard label="Delivery Velocity" value={`${latestDelivery.delivery_velocity}%`} trend={latestDelivery.delivery_velocity >= 90 ? 'up' : latestDelivery.delivery_velocity >= 75 ? 'neutral' : 'down'} />
          </div>

          <h4 className="text-sm font-medium text-text-secondary mb-3">Velocity Trend</h4>
          <div className="space-y-2">
            {last4Periods.map((period, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-meta w-16 flex-shrink-0">Week {last4Periods.length - index}</span>
                <div className="flex-1 progress-bar-track h-6">
                  <div className={`h-full rounded-[3px] ${getVelocityBarColor(period.delivery_velocity)}`} style={{ width: `${period.delivery_velocity}%` }} />
                </div>
                <span className={`text-xs font-mono font-medium w-10 text-right ${period.delivery_velocity >= 90 ? 'text-success' : period.delivery_velocity >= 75 ? 'text-warning' : 'text-danger'}`}>
                  {period.delivery_velocity}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasDeliveryData && (
        <div className="card text-center py-8">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="text-section-header text-text-primary mb-2">No Delivery Data</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">Delivery metrics will appear here once task tracking data is connected via n8n automation workflows.</p>
        </div>
      )}

      {/* Value Delivered */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-section-header text-text-primary">Value Delivered</h3>
            <p className="text-meta mt-0.5">AI-generated impact summary from available data</p>
          </div>
          <button
            onClick={generateValueNarrative}
            disabled={valueLoading}
            className="bg-accent text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {valueLoading && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            Generate Narrative
          </button>
        </div>

        {valueNarrative ? (
          <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-4">
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{valueNarrative}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-page rounded-lg p-4 text-center">
              <p className="text-meta mb-1">Deals Won FY</p>
              <p className="text-xl font-mono font-semibold text-text-primary">{wonTotal > 0 ? `\u00A3${wonTotal.toLocaleString()}` : '—'}</p>
            </div>
            <div className="bg-page rounded-lg p-4 text-center">
              <p className="text-meta mb-1">Active Pipeline</p>
              <p className="text-xl font-mono font-semibold text-text-primary">
                {deals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost').length} deals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
