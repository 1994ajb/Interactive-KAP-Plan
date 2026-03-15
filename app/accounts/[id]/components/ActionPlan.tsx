'use client'

import { useState, useCallback } from 'react'
import { Account, ManMarking, ContactKapData } from '@/lib/types'

interface ActionPlanProps {
  account: Account
  manMarking: ManMarking[]
  contacts?: ContactKapData[]
  onNavigateToContact?: (contactName: string) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const SELLING_TEAM = [
  { campfire: 'Joe', client: 'Jocelyn', role: 'Exec sponsor' },
  { campfire: 'Catrina', client: 'Hannah', role: 'Senior liaison' },
  { campfire: 'Olivia', client: 'Chiara & Sasha', role: 'Day to day' },
  { campfire: 'Kelly', client: 'Jas, Karla & Emily', role: 'BAU' },
]

export default function ActionPlan({ account, manMarking, contacts = [], onNavigateToContact }: ActionPlanProps) {
  const [whyValidated, setWhyValidated] = useState(account.why_validated_by_client)
  const [weeklyRecs, setWeeklyRecs] = useState<Record<string, { loading: boolean; text: string | null }>>({})

  const toggleValidation = async () => {
    const newValue = !whyValidated
    setWhyValidated(newValue)
    // Persist to Supabase
    try {
      const res = await fetch('/api/account/update-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, validated: newValue }),
      })
      if (!res.ok) console.error('[toggleValidation] Failed:', res.status)
    } catch { /* silent */ }
  }

  const handleGenerateWeekly = useCallback(async (member: ManMarking) => {
    setWeeklyRecs(prev => ({ ...prev, [member.id]: { loading: true, text: null } }))
    try {
      const res = await fetch('/api/coach/weekly-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campfireMember: member.campfire_member,
          roleDescription: member.role_description,
          markingContacts: member.marking_contacts,
          actionPlan: member.action_plan,
          accountName: account.name,
          accountObjective: account.objective_retention,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setWeeklyRecs(prev => ({ ...prev, [member.id]: { loading: false, text: data.recommendation || data.error || 'Failed to generate' } }))
    } catch {
      setWeeklyRecs(prev => ({ ...prev, [member.id]: { loading: false, text: 'Network error — retry' } }))
    }
  }, [account])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - 3 Whys */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-section-header text-text-primary">The 3 Whys</h2>
            <button onClick={toggleValidation} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${whyValidated ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-xs text-text-secondary">
                {whyValidated ? 'Validated by client' : 'Not yet validated'}
              </span>
            </button>
          </div>

          <div className="card border-l-4 border-l-danger">
            <h3 className="text-sm font-semibold text-danger mb-1">Why Change</h3>
            <p className="text-sm text-text-primary leading-relaxed">{account.why_change}</p>
          </div>

          <div className="card border-l-4 border-l-warning">
            <h3 className="text-sm font-semibold text-warning mb-1">Why Now</h3>
            <p className="text-sm text-text-primary leading-relaxed">{account.why_now}</p>
          </div>

          <div className="card border-l-4 border-l-success">
            <h3 className="text-sm font-semibold text-success mb-1">Why Us</h3>
            <p className="text-sm text-text-primary leading-relaxed">{account.why_us}</p>
          </div>

          {/* Strengths & Vulnerabilities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-success mb-2">Strengths</h3>
              <ul className="space-y-1.5">
                {account.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-danger mb-2">Vulnerabilities</h3>
              <ul className="space-y-1.5">
                {account.vulnerabilities.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-text-primary leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-danger flex-shrink-0" />{v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - Man-Marking */}
        <div>
          <h2 className="text-section-header text-text-primary mb-4">Man-Marking Assignments</h2>

          <div className="space-y-3">
            {manMarking.map((member) => (
              <div key={member.id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-accent-soft text-accent w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm">
                    {getInitials(member.campfire_member)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{member.campfire_member}</div>
                    <div className="text-meta">{member.role_description}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-meta">Marking: </span>
                  <span className="inline-flex flex-wrap gap-1.5">
                    {member.marking_contacts.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigateToContact?.(name)}
                        className="bg-accent-soft text-accent px-2 py-0.5 rounded-full text-xs font-medium hover:bg-accent/20 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{member.action_plan}</p>

                {/* This week's recommendation */}
                {member.this_week_recommendation || weeklyRecs[member.id]?.text ? (
                  <div className="mt-3 bg-accent-soft border-l-4 border-accent rounded-lg p-3">
                    <p className="text-xs font-semibold text-accent mb-1">This Week</p>
                    <p className="text-sm text-text-primary leading-relaxed">{weeklyRecs[member.id]?.text || member.this_week_recommendation}</p>
                  </div>
                ) : null}

                <button
                  onClick={() => handleGenerateWeekly(member)}
                  disabled={weeklyRecs[member.id]?.loading}
                  className="mt-3 text-xs text-accent hover:text-accent/80 font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  {weeklyRecs[member.id]?.loading ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Generating...
                    </>
                  ) : (
                    "Generate This Week's Actions"
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Selling Team */}
          <div className="card mt-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Selling Team</h3>
            <div className="space-y-2">
              {SELLING_TEAM.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1.5">
                  <span className="text-sm font-medium text-text-primary w-16">{row.campfire}</span>
                  <svg className="w-4 h-4 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  <span className="text-sm text-text-primary flex-1">{row.client}</span>
                  <span className="text-meta">{row.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
