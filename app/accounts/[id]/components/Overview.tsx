'use client'

import { useState } from 'react'
import { AccountData, Signal } from '@/lib/types'
import HealthRing from './ui/HealthRing'
import MetricCard from './ui/MetricCard'
import SignalItem from './ui/SignalItem'

interface OverviewProps {
  data: AccountData
}

type SignalFilter = 'all' | 'high' | 'engagement' | 'pipeline' | 'competitor' | 'news'

const SIGNAL_FILTERS: { id: SignalFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High Priority' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'competitor', label: 'Competitor' },
  { id: 'news', label: 'News' },
]

function filterSignals(signals: Signal[], filter: SignalFilter): Signal[] {
  switch (filter) {
    case 'high':
      return signals.filter(s => s.priority === 'HIGH' || s.priority === 'CRITICAL')
    case 'engagement':
      return signals.filter(s => s.type === 'ENGAGEMENT_GAP' || s.type === 'SENTIMENT_SHIFT')
    case 'pipeline':
      return signals.filter(s => s.type === 'PIPELINE_MOVE' || s.type === 'FINANCE_ALERT')
    case 'competitor':
      return signals.filter(s => s.type === 'COMPETITOR')
    case 'news':
      return signals.filter(s => s.type === 'NEWS' || s.type === 'REGULATION' || s.type === 'JOB_POSTING')
    default:
      return signals
  }
}

export default function Overview({ data }: OverviewProps) {
  const { account, contacts, deals, signals, healthScore } = data
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all')
  const [healthExpanded, setHealthExpanded] = useState(false)

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
    if (value >= 1000) return `\u00A3${Math.round(value / 1000)}k`
    return `\u00A3${value}`
  }

  const sortedSignals = [...signals]
    .filter((s) => !s.dismissed)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filteredSignals = filterSignals(sortedSignals, signalFilter).slice(0, 15)

  const handleDismissSignal = (id: string) => {
    // optimistic update - parent would ideally track this
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Health Score Card */}
          <div className="card" id="health-score-section">
            <div className="flex items-start gap-6">
              <HealthRing score={healthScore.overall} status={healthScore.status} />
              <div className="flex-1">
                <h3 className="text-section-header text-text-primary mb-3">Account Health</h3>
                <ul className="space-y-2">
                  {healthScore.summary.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-dim flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Expandable breakdown */}
            <button
              onClick={() => setHealthExpanded(!healthExpanded)}
              className="mt-4 pt-4 border-t border-border-light w-full text-left flex items-center justify-between"
            >
              <span className="text-xs text-text-secondary font-medium">Score Breakdown</span>
              <svg className={`w-4 h-4 text-text-dim transition-transform ${healthExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {healthExpanded && (
              <div className="mt-3 space-y-3">
                {[
                  { label: 'Relationships', value: healthScore.relationship_score, weight: '30%' },
                  { label: 'Pipeline', value: healthScore.pipeline_score, weight: '20%' },
                  { label: 'Engagement', value: healthScore.engagement_score, weight: '25%' },
                  { label: 'Momentum', value: healthScore.momentum_score, weight: '15%' },
                  { label: 'Sentiment', value: healthScore.sentiment_score, weight: '10%' },
                ].map(({ label, value, weight }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-24">{label} <span className="text-text-dim">({weight})</span></span>
                    <div className="flex-1 progress-bar-track">
                      <div
                        className={`progress-bar-fill ${value >= 70 ? 'bg-success' : value >= 45 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-medium text-text-primary w-8 text-right">{value}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Open Pipeline" value={formatCurrency(openPipeline)} />
            <MetricCard label="Won FY to Date" value={formatCurrency(wonFYToDate)} />
            <MetricCard label="Relationships at Trust+" value={`${trustOrAbove} of ${contacts.length}`} />
            <MetricCard label="Avg Days Since Contact" value={`${avgDaysSinceContact}`} />
          </div>
        </div>

        {/* Signals panel */}
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            <h3 className="text-section-header text-text-primary mb-3">Signal Feed</h3>

            {/* Filters */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SIGNAL_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSignalFilter(f.id)}
                  className={`filter-btn ${signalFilter === f.id ? 'filter-btn-active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[520px]">
              {filteredSignals.length > 0 ? (
                filteredSignals.map((signal) => (
                  <SignalItem
                    key={signal.id}
                    id={signal.id}
                    type={signal.type}
                    priority={signal.priority}
                    title={signal.title}
                    detail={signal.detail}
                    source={signal.source}
                    source_url={signal.source_url}
                    timestamp={signal.timestamp}
                    onDismiss={handleDismissSignal}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📡</div>
                  <p className="text-sm text-text-secondary">No signals match this filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-l-4 border-l-warning">
          <h3 className="text-section-header text-text-primary mb-2">Retention Objective</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{account.objective_retention}</p>
        </div>
        <div className="card border-l-4 border-l-success">
          <h3 className="text-section-header text-text-primary mb-2">Development Objective</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{account.objective_development}</p>
        </div>
      </div>
    </div>
  )
}
