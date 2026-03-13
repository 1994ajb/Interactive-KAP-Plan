'use client'

import { useState } from 'react'
import { DeliveryMetrics, CampaignMetrics, IntegrationStatus } from '@/lib/types'
import MetricCard from './ui/MetricCard'

interface DeliverablesProps {
  deliveryMetrics: DeliveryMetrics[]
  campaignMetrics: CampaignMetrics[]
  integrationStatus: IntegrationStatus
}

// Mock delivery data for connected state demo
const MOCK_DELIVERY_DATA: Pick<DeliveryMetrics, 'tasks_due' | 'tasks_completed_on_time' | 'tasks_overdue' | 'delivery_velocity'>[] = [
  { tasks_due: 24, tasks_completed_on_time: 22, tasks_overdue: 2, delivery_velocity: 92 },
  { tasks_due: 18, tasks_completed_on_time: 15, tasks_overdue: 3, delivery_velocity: 83 },
  { tasks_due: 21, tasks_completed_on_time: 20, tasks_overdue: 1, delivery_velocity: 95 },
  { tasks_due: 20, tasks_completed_on_time: 18, tasks_overdue: 2, delivery_velocity: 90 },
]

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

function getVelocityBarColor(velocity: number): string {
  if (velocity >= 90) return 'bg-success'
  if (velocity >= 75) return 'bg-amber-500'
  return 'bg-danger'
}

function getVelocityTextColor(velocity: number): string {
  if (velocity >= 90) return 'text-success'
  if (velocity >= 75) return 'text-amber-500'
  return 'text-danger'
}

export default function Deliverables({
  deliveryMetrics,
  campaignMetrics,
  integrationStatus,
}: DeliverablesProps) {
  const [activePlatform, setActivePlatform] = useState<string | null>(null)

  const hasDeliveryData = deliveryMetrics.length > 0
  const hasCampaignData = campaignMetrics.length > 0

  // Use real data if available, otherwise use mock data for demo
  const deliveryData = deliveryMetrics.length > 0
    ? deliveryMetrics.map((m) => ({
        tasks_due: m.tasks_due,
        tasks_completed_on_time: m.tasks_completed_on_time,
        tasks_overdue: m.tasks_overdue,
        delivery_velocity: m.delivery_velocity,
      }))
    : MOCK_DELIVERY_DATA

  const latestDelivery = deliveryData[deliveryData.length - 1]
  const last4Periods = deliveryData.slice(-4)

  // Campaign data
  const uniquePlatforms = Array.from(new Set(campaignMetrics.map((m) => m.platform)))
  const filteredCampaigns = activePlatform
    ? campaignMetrics.filter((m) => m.platform === activePlatform)
    : campaignMetrics
  const latestCampaign = filteredCampaigns.length > 0
    ? filteredCampaigns[filteredCampaigns.length - 1]
    : null

  return (
    <div className="flex flex-col gap-6">
      {/* Delivery Tracker */}
      {!hasDeliveryData ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Delivery Data
          </h3>
          <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">
            Delivery metrics will appear here once task tracking data is connected
            via n8n automation workflows.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Delivery Tracker
            </h3>
            <span className="text-xs bg-page text-text-secondary rounded-full px-2 py-0.5">
              Source: Task Tracking
            </span>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              label="Tasks Due This Week"
              value={String(latestDelivery.tasks_due)}
            />
            <MetricCard
              label="Overdue"
              value={String(latestDelivery.tasks_overdue)}
              trend={latestDelivery.tasks_overdue > 0 ? 'down' : 'neutral'}
            />
            <MetricCard
              label="Delivery Velocity"
              value={`${latestDelivery.delivery_velocity}%`}
              trend={
                latestDelivery.delivery_velocity >= 90
                  ? 'up'
                  : latestDelivery.delivery_velocity >= 75
                    ? 'neutral'
                    : 'down'
              }
            />
          </div>

          {/* Delivery Velocity Trend */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-secondary mb-3">
              Delivery Velocity Trend
            </h4>
            <div className="flex flex-col gap-2">
              {last4Periods.map((period, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-16 shrink-0">
                    Week {last4Periods.length - index}
                  </span>
                  <div className="flex-1 h-6 bg-page rounded-md overflow-hidden">
                    <div
                      className={`h-full rounded-md ${getVelocityBarColor(period.delivery_velocity)}`}
                      style={{ width: `${period.delivery_velocity}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono font-medium w-10 text-right ${getVelocityTextColor(period.delivery_velocity)}`}
                  >
                    {period.delivery_velocity}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity alert */}
          {latestDelivery.delivery_velocity < 80 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <span className="text-amber-500 text-sm mt-0.5">&#9888;</span>
              <p className="text-sm text-amber-800">
                Delivery velocity has dropped below 80% — this will impact account
                health score
              </p>
            </div>
          )}
        </div>
      )}

      {/* Campaign Performance (Supermetrics) */}
      {!integrationStatus.supermetrics && !hasCampaignData ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Supermetrics Not Connected
          </h3>
          <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">
            Connect Supermetrics to pull campaign performance data from ad
            platforms.
          </p>
          <button
            disabled
            className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Supermetrics
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <h3 className="text-lg font-semibold text-text-primary">
              Campaign Performance
            </h3>
            {uniquePlatforms.length > 0 && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => setActivePlatform(null)}
                  className={`text-xs rounded-full px-3 py-1 transition-colors ${
                    activePlatform === null
                      ? 'bg-accent text-white'
                      : 'bg-page text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {uniquePlatforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`text-xs rounded-full px-3 py-1 transition-colors ${
                      activePlatform === platform
                        ? 'bg-accent text-white'
                        : 'bg-page text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}
          </div>

          {latestCampaign ? (
            <>
              {/* First row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <MetricCard
                  label="Reach"
                  value={formatCompact(latestCampaign.reach)}
                />
                <MetricCard
                  label="Engagement Rate"
                  value={`${latestCampaign.engagement_rate.toFixed(1)}%`}
                />
                <MetricCard
                  label="Video Views"
                  value={formatCompact(latestCampaign.video_views)}
                />
              </div>

              {/* Second row */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <MetricCard
                  label="Follower Growth"
                  value={`${latestCampaign.follower_growth >= 0 ? '+' : ''}${formatCompact(latestCampaign.follower_growth)}`}
                  trend={latestCampaign.follower_growth > 0 ? 'up' : latestCampaign.follower_growth < 0 ? 'down' : 'neutral'}
                />
                <MetricCard
                  label="CPM"
                  value={`\u00A3${latestCampaign.cpm.toFixed(2)}`}
                  subtitle="font-mono"
                />
                <MetricCard
                  label="Impressions"
                  value={formatCompact(latestCampaign.impressions)}
                />
              </div>

              <p className="text-xs text-text-secondary italic">
                Campaign data feeds directly into QBR preparation and
                value-delivered narrative
              </p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              No campaign data available for the selected filter.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
