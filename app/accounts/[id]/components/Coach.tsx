'use client'

import { useState, useCallback } from 'react'
import { AccountData, UpcomingMeeting } from '@/lib/types'

interface CoachProps {
  data: AccountData
}

interface MeetingPrepState {
  loading: boolean
  briefing: string | null
  error: string | null
}

function formatMeetingDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / (86400000))
  const dateFormatted = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return `Today at ${time}`
  if (diffDays === 1) return `Tomorrow at ${time}`
  return `${dateFormatted} at ${time} (in ${diffDays}d)`
}

function renderBriefingMarkdown(text: string) {
  // Split into lines and render with basic markdown support
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 ml-1">
          {listBuffer.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  const inlineFormat = (s: string) =>
    s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
     .replace(/\*(.+?)\*/g, '<em>$1</em>')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/)
    const listMatch = line.match(/^[-•]\s+(.*)/)

    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const cls = level <= 2
        ? 'text-base font-bold text-text-primary mt-4 mb-1'
        : 'text-sm font-semibold text-text-primary mt-3 mb-1'
      elements.push(
        <div key={i} className={cls} dangerouslySetInnerHTML={{ __html: inlineFormat(text) }} />
      )
    } else if (listMatch) {
      listBuffer.push(listMatch[1])
    } else {
      flushList()
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />)
      } else {
        elements.push(
          <p key={i} className="text-sm text-text-primary leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
        )
      }
    }
  }
  flushList()
  return elements
}

const qbrSteps = [
  {
    number: 1, phase: 'Connect', time: '5 min',
    description: 'Open with shared wins: Healing Project reach (27m), double-digit growth, #slugging cultural moment',
    borderColor: 'border-accent', circleColor: 'bg-accent-soft text-accent',
  },
  {
    number: 2, phase: 'Evaluate', time: '10 min',
    description: 'Present KPIs transparently. Acknowledge rate card loss. Show BAU delivery reliability and creator campaign performance',
    borderColor: 'border-warning', circleColor: 'bg-warning-soft text-warning',
  },
  {
    number: 3, phase: 'Explore', time: '20 min',
    description: 'Introduce CIS opportunities: Simplified Creator Engine, Culture Command Centre. Frame as solutions to their operational complexity',
    borderColor: 'border-success', circleColor: 'bg-success-soft text-success',
  },
  {
    number: 4, phase: 'Demonstrate', time: '10 min',
    description: 'Share US market learnings, cross-market creator insights. Present Performance & ROI Framework concept',
    borderColor: 'border-accent', circleColor: 'bg-accent-soft text-accent',
  },
  {
    number: 5, phase: 'Commit', time: '5 min',
    description: 'Close for Strategic Confidence Reset engagement (£50k). Agree man-marking cadence with Jocelyn. Set Q3 pipeline targets',
    borderColor: 'border-success', circleColor: 'bg-success-soft text-success',
  },
]

const relationshipBadge: Record<string, { bg: string; text: string }> = {
  CHAMPION: { bg: 'bg-success-soft', text: 'text-success' },
  TRUST: { bg: 'bg-success-soft', text: 'text-success' },
  RESPECT: { bg: 'bg-warning-soft', text: 'text-warning' },
  ACCEPTANCE: { bg: 'bg-warning-soft', text: 'text-warning' },
  ACKNOWLEDGE: { bg: 'bg-danger-soft', text: 'text-danger' },
}

export default function Coach({ data }: CoachProps) {
  const [briefingVisible, setBriefingVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [meetingPrep, setMeetingPrep] = useState<Record<string, MeetingPrepState>>({})

  const { account, contacts, deals, signals, healthScore, upcomingMeetings, integrationStatus } = data

  const handleGenerateBriefing = () => {
    setBriefingVisible(false)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setBriefingVisible(true)
    }, 2000)
  }

  const handleGeneratePrep = useCallback(async (meeting: UpcomingMeeting) => {
    setMeetingPrep((prev) => ({
      ...prev,
      [meeting.id]: { loading: true, briefing: null, error: null },
    }))

    try {
      const res = await fetch('/api/coach/meeting-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting: {
            title: meeting.title,
            start_time: meeting.start_time,
            end_time: meeting.end_time,
            attendees_client: meeting.attendees_client,
            attendees_campfire: meeting.attendees_campfire,
          },
          accountData: {
            name: account.name,
            tier: account.tier,
            objective_retention: account.objective_retention,
            objective_development: account.objective_development,
            why_change: account.why_change,
            why_now: account.why_now,
            why_us: account.why_us,
            strengths: account.strengths,
            vulnerabilities: account.vulnerabilities,
            client_challenges: account.client_challenges,
            key_initiatives: account.key_initiatives,
          },
          contacts,
          deals,
          signals,
          healthScore: {
            overall: healthScore.overall,
            status: healthScore.status,
            summary: healthScore.summary,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        setMeetingPrep((prev) => ({
          ...prev,
          [meeting.id]: { loading: false, briefing: null, error: result.error || 'Failed to generate prep briefing.' },
        }))
        return
      }

      setMeetingPrep((prev) => ({
        ...prev,
        [meeting.id]: { loading: false, briefing: result.briefing, error: null },
      }))
    } catch {
      setMeetingPrep((prev) => ({
        ...prev,
        [meeting.id]: { loading: false, briefing: null, error: 'Network error — check your connection and try again.' },
      }))
    }
  }, [account, contacts, deals, signals, healthScore])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upcoming Meetings */}
      <div>
        <h2 className="font-semibold text-text-primary text-lg mb-4">Upcoming Meetings</h2>
        {!integrationStatus.calendar && upcomingMeetings.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="text-3xl mb-3">📅</div>
            <p className="font-medium text-text-primary">Google Calendar Not Connected</p>
            <p className="text-sm text-text-secondary mt-1">Connect Google Calendar to see upcoming meetings and generate prep briefings automatically.</p>
            <button disabled className="mt-4 bg-accent text-white rounded-lg px-4 py-2 text-sm opacity-50 cursor-not-allowed">
              Connect Calendar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{meeting.title}</h3>
                    <p className="text-sm text-text-secondary font-mono">{formatMeetingDate(meeting.start_time)}</p>
                  </div>
                  <button
                    onClick={() => handleGeneratePrep(meeting)}
                    disabled={meetingPrep[meeting.id]?.loading}
                    className="bg-accent text-white rounded-lg px-3 py-1.5 text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {meetingPrep[meeting.id]?.loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : meetingPrep[meeting.id]?.briefing ? (
                      'Regenerate Prep'
                    ) : (
                      'Generate Prep'
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">Client Attendees</p>
                    <div className="space-y-1.5">
                      {meeting.attendees_client.map((a, i) => {
                        const badge = a.relationship_level ? relationshipBadge[a.relationship_level] : null
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-text-primary">{a.name}</span>
                            {badge && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                                {a.relationship_level}
                              </span>
                            )}
                            {a.last_interaction && (
                              <span className="text-[10px] text-text-dim">({a.last_interaction})</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">Campfire Attendees</p>
                    <div className="space-y-1.5">
                      {meeting.attendees_campfire.map((a, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-text-primary">{a.name}</span>
                          {a.role && <span className="text-[10px] text-text-dim">({a.role})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading state */}
                {meetingPrep[meeting.id]?.loading && (
                  <div className="mt-4 bg-accent-soft border-l-4 border-accent rounded-lg p-4">
                    <div className="flex items-center gap-3 justify-center text-text-secondary py-4">
                      <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Analysing attendee intelligence and generating prep briefing...</span>
                    </div>
                  </div>
                )}

                {/* Error state with retry */}
                {meetingPrep[meeting.id]?.error && !meetingPrep[meeting.id]?.loading && (
                  <div className="mt-4 bg-danger-soft border-l-4 border-danger rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-danger mb-1">Briefing Generation Failed</p>
                        <p className="text-sm text-text-secondary">{meetingPrep[meeting.id].error}</p>
                      </div>
                      <button
                        onClick={() => handleGeneratePrep(meeting)}
                        className="bg-danger text-white rounded-lg px-3 py-1.5 text-xs hover:opacity-90 transition-colors flex-shrink-0"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Generated briefing */}
                {meetingPrep[meeting.id]?.briefing && !meetingPrep[meeting.id]?.loading && (
                  <div className="mt-4 bg-accent-soft border-l-4 border-accent rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-accent">AI Prep Briefing — Connect → Evaluate → Explore → Demonstrate → Commit</p>
                    </div>
                    <div className="space-y-1">
                      {renderBriefingMarkdown(meetingPrep[meeting.id].briefing!)}
                    </div>
                  </div>
                )}

                {/* Fallback: pre-existing static briefing (from Supabase) */}
                {meeting.prep_briefing && !meetingPrep[meeting.id]?.briefing && !meetingPrep[meeting.id]?.loading && (
                  <div className="mt-4 bg-accent-soft border-l-4 border-accent rounded-lg p-3">
                    <p className="text-xs font-semibold text-accent mb-1">AI Prep Briefing</p>
                    <p className="text-sm text-text-primary">{meeting.prep_briefing}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Briefing Box */}
      <div className="bg-accent-soft border border-accent/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 13.536a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 01-1.06-1.06l1.06-1.06zM5.404 4.343a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 11-1.06-1.06l1.06-1.06z" />
            </svg>
            <h2 className="font-semibold text-text-primary">AI QBR Preparation Briefing</h2>
          </div>
          <button
            onClick={handleGenerateBriefing}
            disabled={loading}
            className="bg-accent text-white rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading ? 'Generating...' : 'Generate Fresh Briefing'}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center text-text-secondary">
            <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Analysing account data and generating briefing...</span>
          </div>
        )}

        {briefingVisible && !loading && (
          <div className="space-y-3 text-sm text-text-primary leading-relaxed">
            <p>
              <strong>{account.name}</strong> is currently showing a health score of{' '}
              <strong>{healthScore.overall}/100</strong> ({healthScore.status}). While the account demonstrates
              strong BAU delivery and cultural relevance, there are critical areas requiring immediate attention.
            </p>
            <p>
              The most significant relationship gap is with <strong>Jocelyn Hsieh</strong> (Global Marketing Director),
              who remains at <strong>ACCEPTANCE</strong> level despite being the Economic Buyer. Given her 20+ year tenure
              and influence on budget decisions, elevating this relationship to TRUST should be the top priority.
              <em className="text-text-dim"> (Source: HubSpot contact data, KAP relationship assessment)</em>
            </p>
            <p>
              Pipeline shows £{data.deals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost').reduce((s, d) => s + (d.amount ?? 0), 0).toLocaleString()} in active deals.
              The <strong>Rate Card Renegotiation</strong> loss (£50k) signals price sensitivity — address this transparently.
              The <strong>CIS</strong> opportunities represent the strongest path to reframe the commercial relationship.
              <em className="text-text-dim"> (Source: HubSpot deals)</em>
            </p>
            <p>
              Recommendation: Lead with confidence on delivery wins, address rate card concerns transparently,
              and pivot to strategic value of CIS to reframe the relationship from executional to strategic.
            </p>
          </div>
        )}
      </div>

      {/* QBR Structure */}
      <div>
        <h2 className="font-semibold text-text-primary text-lg mb-1">Recommended QBR Structure</h2>
        <p className="text-sm text-text-secondary mb-4">
          Following the Connect &rarr; Evaluate &rarr; Explore &rarr; Demonstrate &rarr; Commit framework
        </p>
        <div className="space-y-3">
          {qbrSteps.map((step) => (
            <div key={step.number} className={`bg-white border-l-4 ${step.borderColor} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step.circleColor}`}>
                  {step.number}
                </div>
                <div>
                  <span className="font-semibold text-text-primary">{step.phase}</span>
                  <span className="text-sm text-text-dim ml-2">{step.time}</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary ml-11">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 75/25 Rule */}
      <div className="bg-page text-sm rounded-lg p-3 text-text-secondary">
        <strong>75/25 Rule:</strong> 75% of QBR time should be forward-looking
        (Explore + Demonstrate + Commit). Only 25% on evaluation.
      </div>
    </div>
  )
}
