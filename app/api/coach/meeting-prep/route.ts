import { NextResponse } from 'next/server'
import type { ContactKapData, HubSpotDeal, Signal } from '@/lib/types'

interface MeetingData {
  title: string
  start_time: string
  end_time: string
  attendees_client: { name: string; relationship_level?: string; last_interaction?: string }[]
  attendees_campfire: { name: string; role?: string }[]
}

interface AccountInput {
  name: string
  tier: string
  objective_retention: string
  objective_development: string
  why_change: string
  why_now: string
  why_us: string
  strengths: string[]
  vulnerabilities: string[]
  client_challenges?: string[] | null
  key_initiatives?: { name: string; status: string; description: string }[] | null
}

interface HealthScoreInput {
  overall: number
  status: string
  summary: string[]
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      briefing: null,
      error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to generate meeting prep.',
      generated_at: new Date().toISOString(),
    })
  }

  try {
    const { meeting, accountData, contacts, deals, signals, healthScore } = await request.json() as {
      meeting: MeetingData
      accountData: AccountInput
      contacts: ContactKapData[]
      deals: HubSpotDeal[]
      signals: Signal[]
      healthScore: HealthScoreInput
    }

    if (!meeting || !meeting.title || !meeting.start_time) {
      return NextResponse.json(
        { briefing: null, error: 'Meeting data is required (title, start_time).' },
        { status: 400 }
      )
    }

    // Build attendee detail blocks for each client attendee
    const attendeeDetails = (meeting.attendees_client ?? []).map((attendee) => {
      const contact = (contacts ?? []).find(
        (c: ContactKapData) => c.name === attendee.name
      )
      const contactSignals = (signals ?? []).filter(
        (s: Signal) => s.related_contact_id && contact && s.related_contact_id === contact.id
      )

      let detail = `- ${attendee.name} | Relationship: ${attendee.relationship_level ?? 'UNKNOWN'} | Last interaction: ${attendee.last_interaction ?? 'unknown'}`

      if (contact) {
        detail += `\n  Role: ${contact.role}`
        detail += `\n  Buyer type: ${contact.buyer_type}`
        detail += `\n  Priority: ${contact.priority}`
        if (contact.intelligence) {
          if (contact.intelligence.communication_style) {
            detail += `\n  Communication style: ${contact.intelligence.communication_style}`
          }
          if (contact.intelligence.personality_profile) {
            detail += `\n  Personality: ${contact.intelligence.personality_profile}`
          }
          if (contact.intelligence.decision_pattern) {
            detail += `\n  Decision pattern: ${contact.intelligence.decision_pattern}`
          }
          if (contact.intelligence.motivations?.length) {
            detail += `\n  Motivations: ${contact.intelligence.motivations.join(', ')}`
          }
          if (contact.intelligence.frustrations?.length) {
            detail += `\n  Frustrations: ${contact.intelligence.frustrations.join(', ')}`
          }
          if (contact.intelligence.recommended_approach) {
            detail += `\n  Recommended approach: ${contact.intelligence.recommended_approach}`
          }
          if (contact.intelligence.priorities_assessment) {
            detail += `\n  Current priorities: ${contact.intelligence.priorities_assessment}`
          }
          if (contact.intelligence.interaction_summary) {
            detail += `\n  Interaction summary: ${contact.intelligence.interaction_summary}`
          }
          if (contact.intelligence.interaction_sentiment) {
            detail += `\n  Sentiment: ${contact.intelligence.interaction_sentiment}`
          }
          if (contact.intelligence.thought_leadership?.length) {
            detail += `\n  Thought leadership: ${contact.intelligence.thought_leadership.join('; ')}`
          }
          if (contact.intelligence.recent_linkedin_posts?.length) {
            const recentPost = contact.intelligence.recent_linkedin_posts[0]
            detail += `\n  Recent LinkedIn post: "${recentPost.text.substring(0, 150)}..." (${recentPost.date})`
          }
        }
        if (contactSignals.length > 0) {
          detail += `\n  Recent signals about this contact:`
          contactSignals.forEach((s: Signal) => {
            detail += `\n    - [${s.type}] ${s.title}${s.detail ? ': ' + s.detail : ''}`
          })
        }
      }

      return detail
    }).join('\n\n')

    // Build deals summary
    const activeDeals = (deals ?? []).filter(
      (d: HubSpotDeal) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost'
    )
    const dealsSummary = activeDeals.length > 0
      ? activeDeals.map((d: HubSpotDeal) =>
        `- ${d.dealname} | Stage: ${d.stage_label ?? d.dealstage} | Amount: £${(d.amount ?? 0).toLocaleString()}${d.closedate ? ' | Close: ' + d.closedate : ''}${d.win_probability != null ? ' | Win prob: ' + d.win_probability + '%' : ''}`
      ).join('\n')
      : 'No active deals in pipeline.'

    const totalPipeline = activeDeals.reduce((sum: number, d: HubSpotDeal) => sum + (d.amount ?? 0), 0)

    // Filter recent signals (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentSignals = (signals ?? []).filter(
      (s: Signal) => new Date(s.timestamp) >= sevenDaysAgo && !s.dismissed
    )
    const signalsSummary = recentSignals.length > 0
      ? recentSignals.map((s: Signal) =>
        `- [${s.priority}] ${s.type}: ${s.title}${s.detail ? ' — ' + s.detail : ''} (${s.source}, ${s.timestamp})`
      ).join('\n')
      : 'No signals in the last 7 days.'

    // Build Campfire attendees
    const campfireAttendees = (meeting.attendees_campfire ?? []).map(
      (a) => `- ${a.name} (${a.role ?? 'team member'})`
    ).join('\n')

    // Build account context
    const initiativesSummary = (accountData.key_initiatives ?? []).map(
      (i) => `- ${i.name} (${i.status}): ${i.description}`
    ).join('\n') || 'None specified.'

    const challengesSummary = (accountData.client_challenges ?? []).map(
      (c) => `- ${c}`
    ).join('\n') || 'None specified.'

    const userPrompt = `Prepare a meeting briefing for the following meeting.

## MEETING DETAILS
Title: ${meeting.title}
Start: ${meeting.start_time}
End: ${meeting.end_time}

Campfire attendees:
${campfireAttendees}

## CLIENT ATTENDEES (with relationship intelligence)
${attendeeDetails}

## ACCOUNT CONTEXT
Account: ${accountData.name}
Tier: ${accountData.tier}
Retention objective: ${accountData.objective_retention}
Development objective: ${accountData.objective_development}
Why change: ${accountData.why_change}
Why now: ${accountData.why_now}
Why us: ${accountData.why_us}

Strengths:
${accountData.strengths.map((s) => `- ${s}`).join('\n')}

Vulnerabilities:
${accountData.vulnerabilities.map((v) => `- ${v}`).join('\n')}

Client challenges:
${challengesSummary}

Key initiatives:
${initiativesSummary}

## ACCOUNT HEALTH
Score: ${healthScore.overall}/100
Status: ${healthScore.status}
Summary: ${(healthScore.summary ?? []).join('; ')}

## PIPELINE STATUS
Active deals (${activeDeals.length}), total pipeline: £${totalPipeline.toLocaleString()}
${dealsSummary}

## RECENT SIGNALS (last 7 days)
${signalsSummary}

---

Generate a structured meeting prep briefing following the Connect → Evaluate → Explore → Demonstrate → Commit framework. Use these exact sections:

1. **CONNECT** (5 min): Opening rapport — specific talking points based on each attendee's interests, recent interactions, and communication style
2. **EVALUATE** (10 min): What to present — KPIs, delivery metrics, wins to highlight
3. **EXPLORE** (20 min): Opportunities to introduce — CIS items, strategic initiatives
4. **DEMONSTRATE** (10 min): Evidence of value — case studies, cross-market learnings
5. **COMMIT** (5 min): Close items — specific asks, next steps, timeline agreements

Also include:
- **RISK FLAGS**: Sensitive topics to avoid or address carefully (from signals, vulnerabilities)
- **ATTENDEE CHEAT SHEET**: For each client attendee, a 2-line summary of their communication preference and what they care about

Every recommendation must be grounded in the data above. No generic advice. Be specific and actionable.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: 'You are an expert meeting preparation coach for Campfire, a social media marketing agency. Generate a structured meeting prep briefing following the Connect → Evaluate → Explore → Demonstrate → Commit framework.',
        messages: [{
          role: 'user',
          content: userPrompt,
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { briefing: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const briefing = result.content[0]?.text ?? null

    return NextResponse.json({
      briefing,
      generated_at: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { briefing: null, error: 'AI generation failed — retry' },
      { status: 500 }
    )
  }
}
