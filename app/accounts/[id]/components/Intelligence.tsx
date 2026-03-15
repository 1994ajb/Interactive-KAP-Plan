'use client'

import { useState } from 'react'
import { EOSICEntry, Opportunity, Account, CrossBrandContact } from '@/lib/types'
import { EOSIC_LABELS } from '@/lib/constants'
import type { EOSICArea } from '@/lib/types'

interface IntelligenceProps {
  eosic: EOSICEntry[]
  opportunities: Opportunity[]
  account: Account
  crossBrandContacts?: CrossBrandContact[]
}

const EOSIC_ORDER: EOSICArea[] = ['POLITICAL', 'ECONOMIC', 'SOCIOLOGICAL', 'TECHNOLOGICAL', 'LEGAL', 'ENVIRONMENTAL']

const expansionColors: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: 'bg-success-soft', text: 'text-success' },
  MEDIUM: { bg: 'bg-warning-soft', text: 'text-warning' },
  LOW: { bg: 'bg-page', text: 'text-text-dim' },
  NONE: { bg: 'bg-page', text: 'text-text-dim' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-success-soft', text: 'text-success' },
  planned: { bg: 'bg-warning-soft', text: 'text-warning' },
  completed: { bg: 'bg-accent-soft', text: 'text-accent' },
}

export default function Intelligence({ eosic, opportunities, account, crossBrandContacts = [] }: IntelligenceProps) {
  const [expandedSections, setExpandedSections] = useState<Set<EOSICArea>>(
    new Set<EOSICArea>(['POLITICAL', 'ECONOMIC'])
  )

  const toggleSection = (area: EOSICArea) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(area)) next.delete(area)
      else next.add(area)
      return next
    })
  }

  const eosicByArea = new Map<EOSICArea, EOSICEntry>()
  for (const entry of eosic) eosicByArea.set(entry.area, entry)

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* EOSIC Analysis */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-section-header text-text-primary">EOSIC / PESTLE Analysis</h3>
            <p className="text-meta mt-1">External factors impacting the account</p>
          </div>

          <div className="space-y-2">
            {EOSIC_ORDER.map((area) => {
              const entry = eosicByArea.get(area)
              const config = EOSIC_LABELS[area]
              const isExpanded = expandedSections.has(area)
              const itemCount = entry?.items?.length ?? 0

              return (
                <div key={area} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(area)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-page transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span className="text-sm font-medium text-text-primary">{config.label}</span>
                      {!isExpanded && itemCount > 0 && (
                        <span className="text-meta">({itemCount})</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-text-dim transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && entry && (
                    <div className="px-4 pb-4">
                      {entry.items.length > 0 && (
                        <ul className="list-disc list-inside space-y-1.5 mb-3">
                          {entry.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-text-primary leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      )}
                      {entry.implication && (
                        <div className="bg-accent-soft border-l-4 border-accent p-3 rounded">
                          <p className="text-xs font-semibold text-accent mb-1">Implication</p>
                          <p className="text-sm text-text-primary leading-relaxed">{entry.implication}</p>
                        </div>
                      )}
                      {entry.sources && entry.sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {entry.sources.map((src, idx) => (
                            <span key={idx} className="source-pill">{src}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isExpanded && !entry && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-text-dim">No data available for this area</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column - Strategy */}
        <div className="space-y-4">
          {/* Social Strategy */}
          {account.social_strategy_summary && (
            <div className="card border-l-4 border-l-accent">
              <h4 className="text-section-header text-text-primary mb-2">Social Strategy</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{account.social_strategy_summary}</p>
            </div>
          )}

          {/* Key Initiatives */}
          {account.key_initiatives && account.key_initiatives.length > 0 && (
            <div className="card">
              <h4 className="text-section-header text-text-primary mb-3">Key Initiatives</h4>
              <div className="space-y-3">
                {account.key_initiatives.map((initiative, idx) => {
                  const colors = statusColors[initiative.status] ?? statusColors.planned
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5 ${colors.bg} ${colors.text}`}>
                        {initiative.status}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{initiative.name}</p>
                        <p className="text-meta mt-0.5">{initiative.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Client Challenges */}
          {account.client_challenges && account.client_challenges.length > 0 && (
            <div className="card border-l-4 border-l-danger">
              <h4 className="text-section-header text-text-primary mb-2">Client Challenges</h4>
              <ul className="space-y-1.5">
                {account.client_challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-danger flex-shrink-0" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Cross-Brand Contacts */}
      {crossBrandContacts.length > 0 && (
        <div className="card">
          <h3 className="text-section-header text-text-primary mb-1">Expansion Opportunities</h3>
          <p className="text-meta mb-4">Cross-brand contacts discovered via email analysis</p>
          <div className="grid md:grid-cols-3 gap-4">
            {crossBrandContacts.map((contact) => {
              const epColors = expansionColors[contact.expansion_potential] ?? expansionColors.LOW
              return (
                <div key={contact.id} className="border border-border rounded-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{contact.name}</p>
                      <p className="text-meta mt-0.5">{contact.brand}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${epColors.bg} ${epColors.text}`}>
                      {contact.expansion_potential}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      contact.relationship_status === 'active' ? 'bg-success' :
                      contact.relationship_status === 'dormant' ? 'bg-warning' : 'bg-danger'
                    }`} />
                    <span className="text-meta capitalize">{contact.relationship_status}</span>
                  </div>
                  {contact.notes && <p className="text-meta mt-2 leading-relaxed">{contact.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CIS Opportunities */}
      <div className="card">
        <h3 className="text-section-header text-text-primary mb-4">CIS Opportunities</h3>
        {opportunities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="border border-border rounded-card p-4 hover:border-border/70 transition-colors">
                <p className="font-semibold text-sm text-text-primary mb-1">{opp.name}</p>
                <p className="text-meta mb-3 leading-relaxed">{opp.challenge_solved}</p>
                <span className="inline-block text-xs font-mono font-semibold bg-accent-soft text-accent px-2 py-1 rounded">
                  {opp.estimated_revenue}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">💡</div>
            <p className="text-sm text-text-secondary">No CIS opportunities identified yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
