'use client'

import { useState, useCallback } from 'react'
import { ContactKapData, Signal, ContactEvent } from '@/lib/types'
import {
  INTELLIGENCE_LAYERS,
  HUBSPOT_BASE_URL,
  HUBSPOT_PORTAL_ID,
  RELATIONSHIP_COLORS,
  PRIORITY_COLORS,
  SIGNAL_ICONS,
} from '@/lib/constants'

interface ContactIntelPanelProps {
  contact: ContactKapData
  signals: Signal[]
  accountName?: string
  accountTier?: string
  accountObjectiveRetention?: string
  accountObjectiveDevelopment?: string
}

export function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  if (diffMs < 0) return 'just now'
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

const SENTIMENT_COLORS: Record<string, { bg: string; text: string }> = {
  POSITIVE: { bg: 'bg-success-soft', text: 'text-success' },
  NEUTRAL: { bg: 'bg-accent-soft', text: 'text-accent' },
  NEGATIVE: { bg: 'bg-danger-soft', text: 'text-danger' },
  UNKNOWN: { bg: 'bg-page', text: 'text-text-secondary' },
}

const buyerTypeLabels: Record<string, string> = {
  EB: 'Economic Buyer',
  Coach: 'Coach',
  PB: 'Power Base',
  TB: 'Technical Buyer',
  Champion: 'Champion',
  Respect: 'Influencer',
  Acceptance: 'Stakeholder',
  Acknowledge: 'Peripheral',
}

function NoDataPlaceholder({ message, subtext, icon, action }: { message: string; subtext: string; icon?: string; action?: React.ReactNode }) {
  return (
    <div className="bg-page rounded-lg p-4 text-center">
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className="text-sm text-text-secondary">{message}</p>
      <p className="text-meta mt-1">{subtext}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function EnrichmentRing({ completeness }: { completeness: number }) {
  const size = 56
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (completeness / 100) * circumference
  const color = completeness >= 70 ? '#059669' : completeness >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-text-primary">{completeness}%</span>
    </div>
  )
}

export default function ContactIntelPanel({ contact, signals, accountName, accountTier, accountObjectiveRetention, accountObjectiveDevelopment }: ContactIntelPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['next-step', 'communication', 'interactions'])
  )
  const [nextStepLoading, setNextStepLoading] = useState(false)
  const [nextStepText, setNextStepText] = useState<string | null>(null)
  const [enrichLoading, setEnrichLoading] = useState(false)
  const [enrichResult, setEnrichResult] = useState<string | null>(null)
  const [webSearchLoading, setWebSearchLoading] = useState(false)
  const [webSearchResult, setWebSearchResult] = useState<string | null>(null)

  const toggleLayer = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const contactSignals = signals.filter((s) => s.related_contact_id === contact.id)
  const relationshipColors = RELATIONSHIP_COLORS[contact.relationship_level]
  const priorityColors = PRIORITY_COLORS[contact.priority]
  const enrichmentCompleteness = contact.intelligence?.enrichment_completeness ?? 0

  // Count layers with data
  const layerDataCount = INTELLIGENCE_LAYERS.reduce((count, layer) => {
    switch (layer.id) {
      case 'profile': return count + 1
      case 'career': return count + (contact.intelligence?.work_history_summary ? 1 : 0)
      case 'voice': return count + ((contact.intelligence?.thought_leadership?.length || contact.intelligence?.recent_linkedin_posts?.length) ? 1 : 0)
      case 'communication': return count + (contact.intelligence?.communication_style ? 1 : 0)
      case 'interactions': return count + (contact.intelligence?.interaction_summary ? 1 : 0)
      case 'network': return count + ((contact.intelligence?.meeting_coattendees?.length || contact.intelligence?.email_cc_patterns?.length) ? 1 : 0)
      case 'events': return count + ((contact.intelligence?.upcoming_events?.length || contact.intelligence?.recent_events?.length) ? 1 : 0)
      case 'priorities': return count + (contact.intelligence?.priorities_assessment ? 1 : 0)
      case 'signals': return count + (contactSignals.length > 0 ? 1 : 0)
      case 'next-step': return count + (contact.next_step ? 1 : 0)
      case 'web-footprint': return count + (contact.intelligence?.web_footprint_summary ? 1 : 0)
      case 'strategic-context': return count + (contact.intelligence?.strategic_context ? 1 : 0)
      default: return count
    }
  }, 0)

  const handleGenerateNextStep = useCallback(async () => {
    setNextStepLoading(true)
    setNextStepText(null)
    try {
      const res = await fetch(`/api/intelligence/next-step/${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactData: {
            ...contact,
            account_name: accountName ?? contact.account_id,
            account_tier: accountTier ?? 'UNKNOWN',
            objective_retention: accountObjectiveRetention ?? '',
            objective_development: accountObjectiveDevelopment ?? '',
          },
          communicationProfile: contact.intelligence ? {
            personality_profile: contact.intelligence.personality_profile,
            communication_style: contact.intelligence.communication_style,
            decision_pattern: contact.intelligence.decision_pattern,
            motivations: contact.intelligence.motivations,
            frustrations: contact.intelligence.frustrations,
          } : null,
          prioritiesAssessment: contact.intelligence?.priorities_assessment,
        }),
      })
      const data = await res.json()
      if (data.recommendation) {
        setNextStepText(data.recommendation)
        if (!expanded.has('next-step')) toggleLayer('next-step')
      } else {
        setNextStepText(data.error || 'Failed to generate recommendation')
      }
    } catch {
      setNextStepText('Network error — check your connection')
    } finally {
      setNextStepLoading(false)
    }
  }, [contact, expanded])

  const handleEnrich = useCallback(async () => {
    setEnrichLoading(true)
    setEnrichResult(null)
    try {
      const res = await fetch(`/api/intelligence/enrich/${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contact.name,
          company: accountName ?? contact.account_id,
          linkedinUrl: contact.linkedin_url,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setEnrichResult(data.error)
      } else {
        setEnrichResult('Enrichment complete')
      }
    } catch {
      setEnrichResult('Network error')
    } finally {
      setEnrichLoading(false)
    }
  }, [contact])

  const handleWebSearch = useCallback(async () => {
    setWebSearchLoading(true)
    setWebSearchResult(null)
    try {
      const res = await fetch(`/api/intelligence/web-search/${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contact.name,
          company: accountName ?? contact.account_id,
          linkedinUrl: contact.linkedin_url,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setWebSearchResult(data.error)
      } else {
        setWebSearchResult('Search complete')
        if (!expanded.has('web-footprint')) toggleLayer('web-footprint')
      }
    } catch {
      setWebSearchResult('Network error')
    } finally {
      setWebSearchLoading(false)
    }
  }, [contact, expanded])

  const renderLayerContent = (layerId: string) => {
    switch (layerId) {
      case 'profile':
        return (
          <div className="space-y-4">
            {/* HubSpot incomplete banner */}
            {contact.intelligence?.hubspot_record_complete === false && contact.intelligence?.hubspot_missing_fields?.length && (
              <div className="bg-warning-soft border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-warning">Incomplete HubSpot Record</p>
                  <p className="text-text-secondary mt-0.5">Missing: {contact.intelligence.hubspot_missing_fields.join(', ')}</p>
                  {contact.hubspot_contact_id && (
                    <a
                      href={`${HUBSPOT_BASE_URL}/contacts/${HUBSPOT_PORTAL_ID}/record/0-1/${contact.hubspot_contact_id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-accent text-xs hover:underline mt-1 inline-block"
                    >
                      Update in HubSpot →
                    </a>
                  )}
                </div>
              </div>
            )}
            {contact.title_discrepancy_flagged && (
              <div className="bg-warning-soft border border-warning/20 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-warning">Title Discrepancy</p>
                  <p className="text-text-secondary mt-0.5">KAP: &quot;{contact.kap_title}&quot;</p>
                  <p className="text-text-secondary">Verified: &quot;{contact.verified_title}&quot;</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-meta">Tenure</span><p className="mt-0.5">{contact.tenure}</p></div>
              <div><span className="text-meta">Buyer Type</span><p className="mt-0.5">{buyerTypeLabels[contact.buyer_type] ?? contact.buyer_type}</p></div>
              <div><span className="text-meta">Owner</span><p className="mt-0.5">{contact.campfire_owner}</p></div>
              <div>
                <span className="text-meta">Last Contacted</span>
                <p className="mt-0.5 font-mono text-sm">
                  {contact.last_contacted ? (
                    <>
                      {contact.days_since_contact ?? '?'}d ago
                      {contact.is_stale && <span className="text-danger ml-1">(overdue)</span>}
                    </>
                  ) : (
                    <span className="text-text-dim">Unknown</span>
                  )}
                </p>
              </div>
              {contact.email && (
                <div className="col-span-2"><span className="text-meta">Email</span><p className="mt-0.5 truncate">{contact.email}</p></div>
              )}
            </div>
            {contact.hubspot_contact_id && (
              <a
                href={`${HUBSPOT_BASE_URL}/contacts/${HUBSPOT_PORTAL_ID}/record/0-1/${contact.hubspot_contact_id}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-block text-xs text-accent hover:underline mt-1"
              >
                View in HubSpot →
              </a>
            )}
          </div>
        )

      case 'career':
        return contact.intelligence?.work_history_summary ? (
          <div>
            <p className="text-sm leading-relaxed">{contact.intelligence.work_history_summary}</p>
            {contact.intelligence.last_enriched_at && (
              <p className="text-meta mt-2">Last updated: {relativeTime(contact.intelligence.last_enriched_at)} · Source: Clay</p>
            )}
          </div>
        ) : (
          <NoDataPlaceholder icon="📈" message="No career data available" subtext="Click 'Enrich with Clay' to populate work history" />
        )

      case 'voice': {
        const tl = contact.intelligence?.thought_leadership
        const posts = contact.intelligence?.recent_linkedin_posts
        if ((!tl || tl.length === 0) && (!posts || posts.length === 0)) {
          return <NoDataPlaceholder icon="🎤" message="No public voice data" subtext="Connect Clay enrichment to discover thought leadership" />
        }
        return (
          <div className="space-y-4">
            {tl && tl.length > 0 && (
              <div>
                <p className="text-meta uppercase tracking-wide mb-2">Thought Leadership</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {tl.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            {posts && posts.length > 0 && (
              <div>
                <p className="text-meta uppercase tracking-wide mb-2">Recent LinkedIn Posts</p>
                <div className="space-y-2">
                  {posts.map((post, i) => (
                    <div key={i} className="bg-page rounded-lg p-3 text-sm">
                      <p className="text-meta mb-1">{new Date(post.date).toLocaleDateString()}</p>
                      <p className="line-clamp-2 leading-relaxed">{post.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-meta">{post.engagement} engagements</span>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-accent text-xs hover:underline">View →</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

      case 'communication': {
        const intel = contact.intelligence
        if (!intel?.personality_profile && !intel?.communication_style && !intel?.decision_pattern) {
          return <NoDataPlaceholder icon="🧠" message="No communication profile" subtext="Generate using Clay enrichment and interaction history" />
        }
        return (
          <div className="space-y-3">
            {intel?.communication_style && (
              <div><p className="text-meta uppercase tracking-wide mb-1">Communication Style</p><p className="text-sm leading-relaxed">{intel.communication_style}</p></div>
            )}
            {intel?.decision_pattern && (
              <div><p className="text-meta uppercase tracking-wide mb-1">Decision Pattern</p><p className="text-sm leading-relaxed">{intel.decision_pattern}</p></div>
            )}
            {intel?.motivations && intel.motivations.length > 0 && (
              <div><p className="text-meta uppercase tracking-wide mb-1">Motivations</p>
                <div className="flex flex-wrap gap-1.5">{intel.motivations.map((m, i) => <span key={i} className="source-pill">{m}</span>)}</div>
              </div>
            )}
            {intel?.frustrations && intel.frustrations.length > 0 && (
              <div><p className="text-meta uppercase tracking-wide mb-1">Frustrations</p>
                <div className="flex flex-wrap gap-1.5">{intel.frustrations.map((f, i) => <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-danger-soft text-danger">{f}</span>)}</div>
              </div>
            )}
            {intel?.recommended_approach && (
              <div className="bg-accent-soft rounded-lg p-3">
                <p className="text-xs font-semibold text-accent mb-1">Recommended Approach</p>
                <p className="text-sm leading-relaxed">{intel.recommended_approach}</p>
              </div>
            )}
          </div>
        )
      }

      case 'interactions': {
        const intel = contact.intelligence
        if (!intel?.interaction_summary && !intel?.meeting_frequency_days) {
          return <NoDataPlaceholder icon="💬" message="No interaction data" subtext="Connect Gmail and HubSpot to populate history" />
        }
        const sentimentKey = intel?.interaction_sentiment || 'UNKNOWN'
        const sentimentStyle = SENTIMENT_COLORS[sentimentKey] || SENTIMENT_COLORS.UNKNOWN
        return (
          <div className="space-y-3">
            {intel?.interaction_summary && <p className="text-sm leading-relaxed">{intel.interaction_summary}</p>}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sentimentStyle.bg} ${sentimentStyle.text}`}>{sentimentKey}</span>
              {intel?.meeting_frequency_days != null && <span className="text-meta">Meets every {intel.meeting_frequency_days}d</span>}
              {intel?.invite_acceptance_rate != null && <span className="text-meta">{intel.invite_acceptance_rate}% acceptance</span>}
            </div>
          </div>
        )
      }

      case 'network': {
        const intel = contact.intelligence
        const hasData = (intel?.meeting_coattendees?.length || 0) > 0 || (intel?.email_cc_patterns?.length || 0) > 0
        if (!hasData) return <NoDataPlaceholder icon="🕸" message="No network data" subtext="Connect Clay org chart enrichment" />
        return (
          <div className="space-y-3">
            {contact.reports_to && <div><p className="text-meta">Reports To</p><p className="text-sm font-medium mt-0.5">{contact.reports_to}</p></div>}
            {intel?.meeting_coattendees && intel.meeting_coattendees.length > 0 && (
              <div><p className="text-meta mb-1.5">Frequent Co-attendees</p>
                <div className="flex flex-wrap gap-1.5">{intel.meeting_coattendees.map((n, i) => <span key={i} className="source-pill">{n}</span>)}</div>
              </div>
            )}
            {intel?.email_cc_patterns && intel.email_cc_patterns.length > 0 && (
              <div><p className="text-meta mb-1.5">CC Patterns</p>
                <div className="flex flex-wrap gap-1.5">{intel.email_cc_patterns.map((n, i) => <span key={i} className="source-pill">{n}</span>)}</div>
              </div>
            )}
          </div>
        )
      }

      case 'events': {
        const intel = contact.intelligence
        const hasEvents = (intel?.upcoming_events?.length || 0) > 0 || (intel?.recent_events?.length || 0) > 0
        if (!hasEvents) return <NoDataPlaceholder icon="📅" message="No event data" subtext="Connect calendar and Clay to track events" />
        const renderEvents = (events: ContactEvent[], label: string) => (
          <div>
            <p className="text-meta uppercase tracking-wide mb-2">{label}</p>
            <div className="space-y-2">{events.map((e, i) => (
              <div key={i} className="bg-page rounded-lg p-3 text-sm flex items-start gap-3">
                <span className="text-meta font-mono mt-0.5 flex-shrink-0">{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <div><p className="font-medium">{e.name}</p><span className="source-pill mt-1">{e.type}</span></div>
              </div>
            ))}</div>
          </div>
        )
        return (
          <div className="space-y-4">
            {intel?.upcoming_events && intel.upcoming_events.length > 0 && renderEvents(intel.upcoming_events, 'Upcoming')}
            {intel?.recent_events && intel.recent_events.length > 0 && renderEvents(intel.recent_events, 'Recent')}
          </div>
        )
      }

      case 'priorities':
        return contact.intelligence?.priorities_assessment ? (
          <p className="text-sm leading-relaxed whitespace-pre-line">{contact.intelligence.priorities_assessment}</p>
        ) : (
          <NoDataPlaceholder icon="🎯" message="No priorities assessment" subtext="Generate AI-powered assessment from interaction data" />
        )

      case 'signals':
        if (contactSignals.length === 0) return <NoDataPlaceholder icon="📡" message="No signals" subtext="Signals appear when engagement gaps or changes are detected" />
        return (
          <div className="space-y-2">
            {contactSignals.map((signal) => (
              <div key={signal.id} className="flex items-start gap-2 text-sm bg-page rounded-lg p-3">
                <span className="text-base">{SIGNAL_ICONS[signal.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{signal.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="source-pill">{signal.source}</span>
                    <span className="text-meta">{relativeTime(signal.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'next-step':
        return (
          <div className="space-y-3">
            {(nextStepText || contact.next_step) && (
              <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-4">
                <p className="text-sm leading-relaxed">{nextStepText || contact.next_step}</p>
                {contact.next_step_generated_at && !nextStepText && (
                  <p className="text-meta mt-2">Generated {relativeTime(contact.next_step_generated_at)}</p>
                )}
              </div>
            )}
            {!nextStepText && !contact.next_step && (
              <p className="text-sm text-text-dim">No next step defined — click Generate Next Step above</p>
            )}
          </div>
        )

      case 'web-footprint': {
        const intel = contact.intelligence
        if (!intel?.web_footprint_summary && !(intel?.press_mentions?.length) && !(intel?.campaign_credits?.length)) {
          return <NoDataPlaceholder icon="🌐" message="No web footprint data" subtext="Click 'Web Search' to discover press mentions and campaign credits" />
        }
        return (
          <div className="space-y-4">
            {intel?.web_footprint_summary && <p className="text-sm leading-relaxed">{intel.web_footprint_summary}</p>}
            {intel?.press_mentions && intel.press_mentions.length > 0 && (
              <div><p className="text-meta uppercase tracking-wide mb-2">Press Mentions</p>
                <div className="space-y-2">{intel.press_mentions.map((m, i) => (
                  <div key={i} className="bg-page rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-accent">{m.publication}</span>
                      <span className="text-meta">{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-text-secondary">{m.context}</p>
                  </div>
                ))}</div>
              </div>
            )}
            {intel?.campaign_credits && intel.campaign_credits.length > 0 && (
              <div><p className="text-meta uppercase tracking-wide mb-2">Campaign Credits</p>
                <div className="space-y-2">{intel.campaign_credits.map((c, i) => (
                  <div key={i} className="bg-page rounded-lg p-3 text-sm flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.campaign}</p>
                      <p className="text-meta mt-0.5">{c.brand} · {c.year}{c.agency && ` · ${c.agency}`}</p>
                    </div>
                    {c.award && <span className="source-pill bg-warning-soft text-warning">{c.award}</span>}
                  </div>
                ))}</div>
              </div>
            )}
            {intel?.web_footprint_last_searched && <p className="text-meta">Last searched: {relativeTime(intel.web_footprint_last_searched)}</p>}
          </div>
        )
      }

      case 'strategic-context': {
        const intel = contact.intelligence
        if (!intel?.strategic_context && !(intel?.industry_debate?.length)) {
          return <NoDataPlaceholder icon="🏢" message="No strategic context" subtext="Run web search and news monitoring to build context" />
        }
        return (
          <div className="space-y-4">
            {intel?.strategic_context && <p className="text-sm leading-relaxed">{intel.strategic_context}</p>}
            {intel?.company_strategy_alignment && (
              <div className="bg-accent-soft rounded-lg p-3">
                <p className="text-xs font-semibold text-accent mb-1">Role–Strategy Alignment</p>
                <p className="text-sm leading-relaxed">{intel.company_strategy_alignment}</p>
              </div>
            )}
            {intel?.industry_debate && intel.industry_debate.length > 0 && (
              <div><p className="text-meta uppercase tracking-wide mb-2">Industry Debates</p>
                <div className="space-y-2">{intel.industry_debate.map((d, i) => (
                  <div key={i} className="bg-page rounded-lg p-3 text-sm">
                    <p className="font-medium">{d.topic}</p>
                    <p className="text-text-secondary mt-1">{d.position}</p>
                    <p className="text-meta mt-1">{d.source} · {new Date(d.date).toLocaleDateString()}</p>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="sticky top-40 space-y-4">
      {/* Contact header card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0 ${
            ['CHAMPION', 'TRUST'].includes(contact.relationship_level) ? 'bg-success text-white' :
            ['RESPECT', 'ACCEPTANCE'].includes(contact.relationship_level) ? 'bg-warning text-white' : 'bg-danger text-white'
          }`}>
            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary">{contact.name}</h2>
            <p className="text-sm text-text-secondary">{contact.role}</p>
            {contact.verified_title && contact.verified_title !== contact.role && (
              <p className="text-xs text-warning mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" /></svg>
                Verified: {contact.verified_title}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${relationshipColors.bg} ${relationshipColors.text}`}>
                {contact.relationship_level}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors.bg} ${priorityColors.text}`}>
                {buyerTypeLabels[contact.buyer_type] ?? contact.buyer_type}
              </span>
            </div>
          </div>
          <EnrichmentRing completeness={enrichmentCompleteness} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEnrich}
            disabled={enrichLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {enrichLoading ? <LoadingSpinner /> : null}
            Enrich with Clay
          </button>
          <button
            onClick={handleGenerateNextStep}
            disabled={nextStepLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-success text-white rounded-lg text-xs font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
          >
            {nextStepLoading ? <LoadingSpinner /> : null}
            Generate Next Step
          </button>
          <button
            onClick={handleWebSearch}
            disabled={webSearchLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            {webSearchLoading ? <LoadingSpinner /> : null}
            Web Search
          </button>
        </div>

        {/* Status messages */}
        {enrichResult && <p className="text-xs mt-2 text-text-secondary">{enrichResult}</p>}
        {webSearchResult && <p className="text-xs mt-2 text-text-secondary">{webSearchResult}</p>}
      </div>

      {/* Intelligence layers accordion */}
      <div className="card !p-0 overflow-hidden">
        {INTELLIGENCE_LAYERS.map((layer, index) => {
          const isExpanded = expanded.has(layer.id)
          const isLast = index === INTELLIGENCE_LAYERS.length - 1

          return (
            <div key={layer.id} className={isLast ? '' : 'border-b border-border-light'}>
              <button
                onClick={() => toggleLayer(layer.id)}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-page cursor-pointer transition-colors text-left"
              >
                <span className="text-base leading-none">{layer.icon}</span>
                <span className="flex-1 text-sm font-medium">{layer.label}</span>
                <svg className={`w-4 h-4 text-text-dim transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="px-5 pb-4">{renderLayerContent(layer.id)}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
