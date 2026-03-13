'use client'

import { useState } from 'react'
import { EOSICEntry, Opportunity, Account } from '@/lib/types'
import { EOSIC_LABELS } from '@/lib/constants'
import type { EOSICArea } from '@/lib/types'

interface IntelligenceProps {
  eosic: EOSICEntry[]
  opportunities: Opportunity[]
  account: Account
}

const EOSIC_ORDER: EOSICArea[] = [
  'POLITICAL',
  'ECONOMIC',
  'SOCIOLOGICAL',
  'TECHNOLOGICAL',
  'LEGAL',
  'ENVIRONMENTAL',
]

const KEY_INITIATIVES = [
  'Vaseline Verified',
  'Gluta-Hya Expansion',
  'Creator Analytics Dashboard',
  'Healing Project',
  'Gluta-Hya Lip Serum Gloss',
]

const CHALLENGES = [
  'Regulatory tightening',
  'Clean beauty competition',
  'Operational complexity',
  'Rising media costs',
]

function formatRevenue(value: string): string {
  return value
}

export default function Intelligence({ eosic, opportunities, account }: IntelligenceProps) {
  const [expandedSections, setExpandedSections] = useState<Set<EOSICArea>>(
    new Set<EOSICArea>(['POLITICAL'])
  )

  const toggleSection = (area: EOSICArea) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(area)) {
        next.delete(area)
      } else {
        next.add(area)
      }
      return next
    })
  }

  const eosicByArea = new Map<EOSICArea, EOSICEntry>()
  for (const entry of eosic) {
    eosicByArea.set(entry.area, entry)
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - EOSIC Analysis */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              EOSIC / PESTLE Analysis
            </h3>
            <p className="text-sm text-text-secondary">
              External factors impacting the account
            </p>
          </div>

          <div className="space-y-2">
            {EOSIC_ORDER.map((area) => {
              const entry = eosicByArea.get(area)
              const config = EOSIC_LABELS[area]
              const isExpanded = expandedSections.has(area)

              return (
                <div key={area} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(area)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-page transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span className="text-sm font-medium text-text-primary">
                        {config.label}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-text-dim transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isExpanded && entry && (
                    <div className="px-4 pb-4">
                      {entry.items.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 mb-3">
                          {entry.items.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-text-primary"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {entry.implication && (
                        <div className="bg-accent-soft border-l-4 border-accent p-3 rounded">
                          <p className="text-sm italic text-text-primary">
                            {entry.implication}
                          </p>
                        </div>
                      )}
                      {entry.sources && entry.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.sources.map((src, idx) => (
                            <span key={idx} className="text-[10px] bg-page text-text-dim rounded-full px-2 py-0.5">
                              {src}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isExpanded && !entry && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-text-dim">No data available</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column - Client Strategic Position */}
        <div className="space-y-4">
          {/* Social Strategy */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="border-l-4 border-accent bg-accent-soft p-4 rounded">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Social Strategy
              </h4>
              <p className="text-sm text-text-primary">
                TikTok-led, creator-heavy approach driving cultural relevance
                with focus on skin barrier education and trend participation
              </p>
            </div>
          </div>

          {/* Key Initiatives */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="border-l-4 border-warning bg-warning-soft p-4 rounded">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Key Initiatives
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {KEY_INITIATIVES.map((item) => (
                  <li key={item} className="text-sm text-text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Challenges */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="border-l-4 border-danger bg-danger-soft p-4 rounded">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Challenges
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {CHALLENGES.map((item) => (
                  <li key={item} className="text-sm text-text-primary">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CIS Opportunities - Full Width */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          CIS Opportunities
        </h3>
        {opportunities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="border border-border rounded-lg p-4"
              >
                <p className="font-semibold text-text-primary mb-1">
                  {opp.name}
                </p>
                <p className="text-sm text-text-secondary mb-3">
                  {opp.challenge_solved}
                </p>
                <span className="inline-block text-xs font-mono font-semibold bg-accent-soft text-accent px-2 py-1 rounded">
                  {formatRevenue(opp.estimated_revenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-dim text-center py-4">
            No opportunities identified
          </p>
        )}
      </div>
    </div>
  )
}
