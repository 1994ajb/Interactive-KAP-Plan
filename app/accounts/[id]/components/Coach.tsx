'use client'

import { useState } from 'react'
import { AccountData } from '@/lib/types'

interface CoachProps {
  data: AccountData
}

const qbrSteps = [
  {
    number: 1,
    phase: 'Connect',
    time: '5 min',
    description:
      'Open with shared wins: Healing Project reach (27m), double-digit growth, #slugging cultural moment',
    borderColor: 'border-accent',
    circleColor: 'bg-accent-soft text-accent',
  },
  {
    number: 2,
    phase: 'Evaluate',
    time: '10 min',
    description:
      'Present KPIs transparently. Acknowledge rate card loss. Show BAU delivery reliability and creator campaign performance',
    borderColor: 'border-warning',
    circleColor: 'bg-warning-soft text-warning',
  },
  {
    number: 3,
    phase: 'Explore',
    time: '20 min',
    description:
      'Introduce CIS opportunities: Simplified Creator Engine, Culture Command Centre. Frame as solutions to their operational complexity',
    borderColor: 'border-success',
    circleColor: 'bg-success-soft text-success',
  },
  {
    number: 4,
    phase: 'Demonstrate',
    time: '10 min',
    description:
      'Share US market learnings, cross-market creator insights. Present Performance & ROI Framework concept',
    borderColor: 'border-accent',
    circleColor: 'bg-accent-soft text-accent',
  },
  {
    number: 5,
    phase: 'Commit',
    time: '5 min',
    description:
      'Close for Strategic Confidence Reset engagement (£50k). Agree man-marking cadence with Jocelyn. Set Q3 pipeline targets',
    borderColor: 'border-success',
    circleColor: 'bg-success-soft text-success',
  },
]

export default function Coach({ data }: CoachProps) {
  const [briefingVisible, setBriefingVisible] = useState(true)
  const [loading, setLoading] = useState(false)

  const { account, healthScore } = data

  const handleGenerateBriefing = () => {
    setBriefingVisible(false)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setBriefingVisible(true)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* AI Briefing Box */}
      <div className="bg-accent-soft border border-accent/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-accent"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 13.536a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 01-1.06-1.06l1.06-1.06zM5.404 4.343a.75.75 0 011.06 1.06l-1.06 1.061a.75.75 0 11-1.06-1.06l1.06-1.06z" />
            </svg>
            <h2 className="font-semibold text-text-primary">
              AI Account Intelligence Briefing
            </h2>
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
            <svg
              className="animate-spin h-5 w-5 text-accent"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Analysing account data and generating briefing...</span>
          </div>
        )}

        {briefingVisible && !loading && (
          <div className="space-y-3 text-sm text-text-primary leading-relaxed">
            <p>
              <strong>{account.name}</strong> is currently showing a health score of{' '}
              <strong>{healthScore.overall}/100</strong> with a status of{' '}
              <strong>{healthScore.status}</strong>. While the account demonstrates
              strong BAU delivery and cultural relevance, there are critical areas
              requiring immediate attention.
            </p>
            <p>
              The most significant relationship gap is with{' '}
              <strong>Jocelyn Hsieh</strong>, who remains at{' '}
              <strong>ACCEPTANCE</strong> level. Given her influence on budget
              decisions and strategic direction, elevating this relationship to TRUST
              level should be the top priority heading into the QBR.
            </p>
            <p>
              Pipeline health needs focus — the current pipeline shows opportunities
              in play but conversion confidence remains moderate. The{' '}
              <strong>CIS (Creator Intelligence Suite)</strong> opportunity represents
              the strongest path to account growth and should be positioned as the
              centrepiece of forward-looking discussions.
            </p>
            <p>
              Recommendation: Lead the QBR with confidence on delivery wins, address
              rate card concerns transparently, and pivot quickly to the strategic
              value of CIS to reframe the commercial relationship.
            </p>
          </div>
        )}
      </div>

      {/* QBR Structure */}
      <div>
        <h2 className="font-semibold text-text-primary text-lg mb-1">
          Recommended QBR Structure
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Following the Connect &rarr; Evaluate &rarr; Explore &rarr; Demonstrate
          &rarr; Commit framework
        </p>

        <div className="space-y-3">
          {qbrSteps.map((step) => (
            <div
              key={step.number}
              className={`bg-white border-l-4 ${step.borderColor} rounded-xl p-4`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step.circleColor}`}
                >
                  {step.number}
                </div>
                <div>
                  <span className="font-semibold text-text-primary">
                    {step.phase}
                  </span>
                  <span className="text-sm text-text-dim ml-2">
                    {step.time}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-secondary ml-11">
                {step.description}
              </p>
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
