'use client'

import { useState } from 'react'
import { ContactKapData, Signal } from '@/lib/types'
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
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

const SENTIMENT_COLORS: Record<string, { bg: string; text: string }> = {
  POSITIVE: { bg: 'bg-success-soft', text: 'text-success' },
  NEUTRAL: { bg: 'bg-accent-soft', text: 'text-accent' },
  NEGATIVE: { bg: 'bg-danger-soft', text: 'text-danger' },
  UNKNOWN: { bg: 'bg-page', text: 'text-text-secondary' },
}

function NoDataPlaceholder({ message, subtext, action }: { message: string; subtext: string; action?: React.ReactNode }) {
  return (
    <div className="bg-page rounded-lg p-4 text-sm text-text-secondary">
      <p>{message}</p>
      <p className="italic mt-1">{subtext}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export default function ContactIntelPanel({ contact, signals }: ContactIntelPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['profile', 'next-step'])
  )

  const toggleLayer = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const contactSignals = signals.filter(
    (s) => s.related_contact_id === contact.id
  )

  const relationshipColors = RELATIONSHIP_COLORS[contact.relationship_level]
  const priorityColors = PRIORITY_COLORS[contact.priority]

  const renderLayerContent = (layerId: string) => {
    switch (layerId) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xl font-semibold">{contact.name}</p>
              <p className="text-secondary">{contact.role}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-secondary">Tenure</span>
                <p>{contact.tenure}</p>
              </div>
              <div>
                <span className="text-text-secondary">Relationship Level</span>
                <p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${relationshipColors.bg} ${relationshipColors.text}`}
                  >
                    {contact.relationship_level}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Buyer Type</span>
                <p>{contact.buyer_type}</p>
              </div>
              <div>
                <span className="text-text-secondary">Campfire Owner</span>
                <p>{contact.campfire_owner}</p>
              </div>
              <div>
                <span className="text-text-secondary">Priority</span>
                <p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors.bg} ${priorityColors.text}`}
                  >
                    {contact.priority}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Email</span>
                <p>
                  {contact.email ? (
                    contact.email
                  ) : (
                    <span className="italic text-text-dim">
                      No email — trigger Clay enrichment
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-text-secondary">LinkedIn URL</span>
                <p>
                  {contact.linkedin_url ? (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {contact.linkedin_url}
                    </a>
                  ) : (
                    <span className="italic text-text-dim">
                      No LinkedIn URL
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-text-secondary">Last Contacted</span>
                <p className="font-mono">
                  {contact.last_contacted ? (
                    <>
                      {new Date(contact.last_contacted).toLocaleDateString()}
                      {contact.days_since_contact != null && (
                        <span className="text-text-dim ml-1">
                          ({contact.days_since_contact}d ago)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="italic text-text-dim">Unknown</span>
                  )}
                </p>
              </div>
            </div>
            {contact.hubspot_contact_id && (
              <a
                href={`${HUBSPOT_BASE_URL}/contacts/${HUBSPOT_PORTAL_ID}/record/0-1/${contact.hubspot_contact_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-accent hover:underline mt-1"
              >
                View in HubSpot →
              </a>
            )}
          </div>
        )

      case 'career':
        return contact.intelligence?.work_history_summary ? (
          <p className="text-sm leading-relaxed">
            {contact.intelligence.work_history_summary}
          </p>
        ) : (
          <NoDataPlaceholder
            message="No career data available"
            subtext="Connect Clay enrichment to populate work history"
            action={
              <button
                disabled
                className="bg-accent text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trigger Enrichment
              </button>
            }
          />
        )

      case 'voice': {
        const thoughtLeadership = contact.intelligence?.thought_leadership
        const posts = contact.intelligence?.recent_linkedin_posts

        if (
          (!thoughtLeadership || thoughtLeadership.length === 0) &&
          (!posts || posts.length === 0)
        ) {
          return (
            <NoDataPlaceholder
              message="No public voice data available"
              subtext="Connect Clay thought leadership enrichment to populate"
            />
          )
        }

        return (
          <div className="space-y-4">
            {thoughtLeadership && thoughtLeadership.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Thought Leadership
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {thoughtLeadership.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {posts && posts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Recent LinkedIn Posts
                </p>
                <div className="space-y-3">
                  {posts.map((post, i) => (
                    <div
                      key={i}
                      className="bg-page rounded-lg p-3 text-sm"
                    >
                      <p className="text-text-dim text-xs mb-1">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                      <p className="line-clamp-2">{post.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-text-secondary text-xs">
                          {post.engagement} engagements
                        </span>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent text-xs hover:underline"
                        >
                          View post →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

      case 'interactions': {
        const intel = contact.intelligence
        if (
          !intel?.interaction_summary &&
          !intel?.meeting_frequency_days &&
          !intel?.invite_acceptance_rate
        ) {
          return (
            <NoDataPlaceholder
              message="No interaction data available"
              subtext="Connect Gmail and HubSpot integration to populate interaction history"
            />
          )
        }

        const sentimentKey = intel?.interaction_sentiment || 'UNKNOWN'
        const sentimentStyle = SENTIMENT_COLORS[sentimentKey] || SENTIMENT_COLORS.UNKNOWN

        return (
          <div className="space-y-3">
            {intel?.interaction_summary && (
              <p className="text-sm leading-relaxed">
                {intel.interaction_summary}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sentimentStyle.bg} ${sentimentStyle.text}`}
              >
                {sentimentKey}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {intel?.meeting_frequency_days != null && (
                <p className="text-text-secondary">
                  Avg meeting frequency:{' '}
                  <span className="text-text-primary font-medium">
                    {intel.meeting_frequency_days}d
                  </span>
                </p>
              )}
              {intel?.invite_acceptance_rate != null && (
                <p className="text-text-secondary">
                  Invite acceptance:{' '}
                  <span className="text-text-primary font-medium">
                    {intel.invite_acceptance_rate}%
                  </span>
                </p>
              )}
            </div>
          </div>
        )
      }

      case 'network':
        return (
          <NoDataPlaceholder
            message="Network mapping requires org chart data from Clay and HubSpot associations."
            subtext="Connect Clay org chart enrichment to populate"
            action={contact.role ? (
              <p className="text-sm text-text-secondary">
                Role context: {contact.role}
              </p>
            ) : undefined}
          />
        )

      case 'signals':
        if (contactSignals.length === 0) {
          return (
            <p className="text-sm text-text-secondary italic">
              No recent signals for this contact
            </p>
          )
        }

        return (
          <div className="space-y-3">
            {contactSignals.map((signal) => (
              <div
                key={signal.id}
                className="flex items-start gap-3 text-sm"
              >
                <span className="text-lg leading-none mt-0.5">
                  {SIGNAL_ICONS[signal.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{signal.title}</p>
                  {signal.detail && (
                    <p className="text-text-secondary mt-0.5">
                      {signal.detail}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-page text-text-secondary">
                      {signal.source}
                    </span>
                    <span className="text-xs text-text-dim">
                      {relativeTime(signal.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'next-step':
        return (
          <div className="bg-accent-soft border-l-4 border-accent rounded-lg p-4">
            {contact.next_step ? (
              <>
                <p className="text-sm">{contact.next_step}</p>
                {contact.next_step_generated_at && (
                  <p className="text-xs text-text-dim mt-2">
                    Generated {relativeTime(contact.next_step_generated_at)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-text-secondary italic">
                No next step defined — click to generate with AI
              </p>
            )}
            <button className="mt-3 border border-accent text-accent rounded-lg px-3 py-1.5 text-sm hover:bg-accent hover:text-white transition-colors">
              Regenerate with AI
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="sticky top-40 bg-white rounded-xl border overflow-hidden">
      {INTELLIGENCE_LAYERS.map((layer, index) => {
        const isExpanded = expanded.has(layer.id)
        const isLast = index === INTELLIGENCE_LAYERS.length - 1

        return (
          <div key={layer.id} className={isLast ? '' : 'border-b border-border-light'}>
            <button
              onClick={() => toggleLayer(layer.id)}
              className="w-full px-5 py-3 flex items-center gap-3 hover:bg-page cursor-pointer transition-colors text-left"
            >
              <span className="text-lg leading-none">{layer.icon}</span>
              <span className="flex-1 text-sm font-medium">{layer.label}</span>
              <span className="text-text-dim text-xs">
                {isExpanded ? '▾' : '▸'}
              </span>
            </button>
            {isExpanded && (
              <div className="px-5 py-4">{renderLayerContent(layer.id)}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
