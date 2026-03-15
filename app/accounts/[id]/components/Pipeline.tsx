'use client'

import { useState } from 'react'
import { HubSpotDeal, ContactKapData } from '@/lib/types'
import { PIPELINE_STAGES, STAGE_COLORS, HUBSPOT_BASE_URL, HUBSPOT_PORTAL_ID } from '@/lib/constants'
import MetricCard from './ui/MetricCard'

interface PipelineProps {
  deals: HubSpotDeal[]
  contacts: ContactKapData[]
}

type MarketFilter = 'all' | 'uk' | 'us'

function formatGBP(amount: number): string {
  if (amount >= 1000) return `\u00A3${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
  return `\u00A3${amount.toLocaleString()}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function confidenceColor(score: number): string {
  if (score > 75) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-danger'
}

const FUNNEL_COLORS: Record<string, string> = {
  '879430867': '#94a3b8',
  'appointmentscheduled': '#3b82f6',
  'qualifiedtobuy': '#8b5cf6',
  'presentationscheduled': '#d97706',
  'decisionmakerboughtin': '#f97316',
  'contractsent': '#059669',
}

export default function Pipeline({ deals, contacts }: PipelineProps) {
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all')

  const filteredDeals = deals.filter(d => {
    if (marketFilter === 'all') return true
    const name = d.dealname.toLowerCase()
    if (marketFilter === 'uk') return name.includes('uk') || (!name.includes('us') && !name.includes('global'))
    if (marketFilter === 'us') return name.includes('us')
    return true
  })

  const activeDeals = filteredDeals
    .filter((d) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
    .sort((a, b) => {
      const orderA = PIPELINE_STAGES[a.dealstage]?.order ?? 99
      const orderB = PIPELINE_STAGES[b.dealstage]?.order ?? 99
      return orderA - orderB
    })

  const closedLostDeals = filteredDeals
    .filter(d => d.dealstage === 'closedlost')
    .sort((a, b) => {
      const dateA = a.closedate ? new Date(a.closedate).getTime() : 0
      const dateB = b.closedate ? new Date(b.closedate).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)

  const openPipeline = activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const closedWonTotal = filteredDeals.filter(d => d.dealstage === 'closedwon').reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const closedLostTotal = filteredDeals.filter(d => d.dealstage === 'closedlost').reduce((sum, d) => sum + (d.amount ?? 0), 0)

  // Funnel data
  const stageCounts: Record<string, number> = {}
  for (const deal of activeDeals) {
    stageCounts[deal.dealstage] = (stageCounts[deal.dealstage] ?? 0) + 1
  }
  const totalActive = activeDeals.length

  const openDealUrl = (dealId: string) => {
    window.open(`${HUBSPOT_BASE_URL}/contacts/${HUBSPOT_PORTAL_ID}/record/0-3/${dealId}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Market filter */}
      <div className="flex items-center gap-2">
        {(['all', 'uk', 'us'] as MarketFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setMarketFilter(f)}
            className={`filter-btn ${marketFilter === f ? 'filter-btn-active' : ''}`}
          >
            {f === 'all' ? 'All Markets' : f === 'uk' ? '🇬🇧 UK Only' : '🇺🇸 US Only'}
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Open Pipeline" value={formatGBP(openPipeline)} />
        <MetricCard label="Closed Won FY" value={formatGBP(closedWonTotal)} />
        <MetricCard label="Closed Lost FY" value={formatGBP(closedLostTotal)} />
      </div>

      {/* Pipeline funnel bar */}
      {totalActive > 0 && (
        <div className="card">
          <h3 className="text-section-header text-text-primary mb-3">Pipeline Funnel</h3>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {Object.entries(PIPELINE_STAGES)
              .filter(([key]) => key !== 'closedwon' && key !== 'closedlost' && (stageCounts[key] ?? 0) > 0)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, stage]) => {
                const count = stageCounts[key] ?? 0
                const pct = (count / totalActive) * 100
                return (
                  <div
                    key={key}
                    className="flex items-center justify-center text-white text-xs font-medium relative group"
                    style={{ width: `${pct}%`, backgroundColor: FUNNEL_COLORS[key] ?? '#94a3b8', minWidth: count > 0 ? '40px' : '0' }}
                    title={`${stage.label}: ${count} deal${count > 1 ? 's' : ''}`}
                  >
                    {pct >= 15 && <span>{count}</span>}
                  </div>
                )
              })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(PIPELINE_STAGES)
              .filter(([key]) => key !== 'closedwon' && key !== 'closedlost' && (stageCounts[key] ?? 0) > 0)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, stage]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: FUNNEL_COLORS[key] ?? '#94a3b8' }} />
                  <span className="text-meta">{stage.label} ({stageCounts[key]})</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Active Deals */}
      <div className="card">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Active Deals</h3>
        {activeDeals.length > 0 ? (
          <div>
            <div className="flex items-center px-3 py-2 text-meta font-medium border-b border-border-light">
              <div className="flex-1">Deal</div>
              <div className="w-28 text-center">Stage</div>
              <div className="w-24 text-center">Close Date</div>
              <div className="w-20 text-right">Amount</div>
              <div className="w-20 text-right">Confidence</div>
            </div>
            {activeDeals.map((deal) => {
              const stageColor = STAGE_COLORS[deal.dealstage] ?? 'bg-text-dim'
              const isUK = deal.dealname.toLowerCase().includes('uk')
              const isUS = deal.dealname.toLowerCase().includes('us')
              return (
                <button
                  key={deal.id}
                  onClick={() => openDealUrl(deal.id)}
                  className="w-full flex items-center px-3 py-2.5 border-b border-border-light last:border-b-0 hover:bg-page transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stageColor}`} />
                    <span className="text-sm text-text-primary truncate">{deal.dealname}</span>
                    {isUK && <span className="text-meta flex-shrink-0">🇬🇧</span>}
                    {isUS && <span className="text-meta flex-shrink-0">🇺🇸</span>}
                    <svg className="w-3 h-3 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </div>
                  <div className="w-28 text-center"><span className="text-xs text-text-secondary">{deal.stage_label}</span></div>
                  <div className="w-24 text-center"><span className="text-meta font-mono">{formatDate(deal.closedate)}</span></div>
                  <div className="w-20 text-right"><span className="text-sm font-mono font-semibold text-text-primary">{deal.amount ? formatGBP(deal.amount) : '—'}</span></div>
                  <div className="w-20 text-right"><span className={`text-sm font-mono font-semibold ${confidenceColor(deal.confidence_score ?? 0)}`}>{deal.confidence_score ?? 0}%</span></div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6"><div className="text-2xl mb-2">📊</div><p className="text-sm text-text-secondary">No active deals match this filter</p></div>
        )}
      </div>

      {/* Recently Lost */}
      {closedLostDeals.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Recently Lost</h3>
          <div className="space-y-2">
            {closedLostDeals.map((deal) => (
              <button
                key={deal.id}
                onClick={() => openDealUrl(deal.id)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-page transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger-soft text-danger flex-shrink-0">Lost</span>
                  <span className="text-sm text-text-primary truncate">{deal.dealname}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <span className="text-meta">{formatDate(deal.closedate)}</span>
                  <span className="text-sm font-mono font-semibold text-text-primary">{formatGBP(deal.amount ?? 0)}</span>
                </div>
              </button>
            ))}
          </div>
          {closedLostDeals.length >= 2 && (
            <div className="mt-4 bg-warning-soft border-l-4 border-warning rounded-lg p-3">
              <p className="text-sm text-text-primary">
                <strong>Pattern:</strong> {closedLostDeals.length} recent loss{closedLostDeals.length > 1 ? 'es' : ''} detected.
                {closedLostDeals.some(d => d.dealname.toLowerCase().includes('rate')) &&
                  ' Rate card losses suggest price sensitivity — consider adjusting the proactive approach strategy.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
