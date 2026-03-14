import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        recommendation: null,
        error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to enable next-step recommendations.',
      },
      { status: 200 }
    )
  }

  try {
    const {
      contactData,
      gmailThreads,
      slackMentions,
      calendarData,
      communicationProfile,
      prioritiesAssessment,
    } = await request.json()

    if (!contactData) {
      return NextResponse.json(
        { recommendation: null, error: 'contactData is required.' },
        { status: 400 }
      )
    }

    const systemPrompt =
      'You are a Key Account Plan strategist for Campfire, a social media marketing agency. Your job is to generate specific, data-backed next step recommendations for client contacts. Every recommendation must be grounded in the data provided — never fabricate information.'

    const userPromptParts = [
      'Based on ALL of the following data, generate a specific next step recommendation for this contact.',
      '',
      '## Contact Basics',
      `- Name: ${contactData.name}`,
      `- Role: ${contactData.role}`,
      `- Relationship level: ${contactData.relationship_level}`,
      `- Buyer type: ${contactData.buyer_type}`,
      `- Priority: ${contactData.priority}`,
      `- Campfire owner: ${contactData.campfire_owner}`,
      `- Man-marking owner: ${contactData.man_marking_owner}`,
      '',
      '## HubSpot Engagement Data',
      `- Last contacted: ${contactData.last_contacted ?? 'unknown'}`,
      `- Days since last contact: ${contactData.days_since_contact ?? 'unknown'}`,
      `- Is stale: ${contactData.is_stale ?? 'unknown'}`,
      `- Staleness threshold (days): ${contactData.staleness_threshold_days ?? 'unknown'}`,
    ]

    if (gmailThreads?.length) {
      userPromptParts.push(
        '',
        '## Gmail Thread Summaries',
        JSON.stringify(gmailThreads, null, 2)
      )
    }

    if (slackMentions?.length) {
      userPromptParts.push(
        '',
        '## Slack Mentions',
        JSON.stringify(slackMentions, null, 2)
      )
    }

    if (calendarData) {
      userPromptParts.push(
        '',
        '## Calendar Data'
      )
      if (calendarData.recentMeetings?.length) {
        userPromptParts.push(
          '### Recent Meetings',
          JSON.stringify(calendarData.recentMeetings, null, 2)
        )
      }
      if (calendarData.upcomingMeetings?.length) {
        userPromptParts.push(
          '### Upcoming Meetings',
          JSON.stringify(calendarData.upcomingMeetings, null, 2)
        )
      }
    }

    if (communicationProfile) {
      userPromptParts.push(
        '',
        '## Communication Style Profile',
        `- Personality profile: ${communicationProfile.personality_profile ?? 'not assessed'}`,
        `- Communication style: ${communicationProfile.communication_style ?? 'not assessed'}`,
        `- Decision pattern: ${communicationProfile.decision_pattern ?? 'not assessed'}`,
        `- Motivations: ${communicationProfile.motivations ? JSON.stringify(communicationProfile.motivations) : 'not assessed'}`,
        `- Frustrations: ${communicationProfile.frustrations ? JSON.stringify(communicationProfile.frustrations) : 'not assessed'}`
      )
    }

    if (prioritiesAssessment) {
      userPromptParts.push(
        '',
        '## Priorities Assessment',
        JSON.stringify(prioritiesAssessment, null, 2)
      )
    }

    userPromptParts.push(
      '',
      '## Current Next Step',
      `${contactData.next_step ?? 'None set'}`,
      '',
      '## Account Context',
      `- Account name: ${contactData.account_name ?? 'unknown'}`,
      `- Account tier: ${contactData.account_tier ?? 'unknown'}`,
      `- Retention objective: ${contactData.objective_retention ?? 'unknown'}`,
      `- Development objective: ${contactData.objective_development ?? 'unknown'}`,
    )

    userPromptParts.push(
      '',
      '## Rules',
      '- Every recommendation MUST cite specific data points from the input (e.g., "Based on the 12-day engagement gap..." or "Given their ACCEPTANCE relationship level...").',
      '- Never fabricate information — only reference what is present in the input above.',
      '- If data is insufficient, explicitly state what is missing and how to get it.',
      '- Be specific about timing (e.g., "within 48 hours"), approach (e.g., "via email, not Slack"), and talking points.',
      '- Consider the relationship level and what is needed to advance it one step.',
      '- Consider the buyer type (EB = Economic Buyer, Coach, Respect, etc.) when framing the recommendation.',
      '- If a communication style profile is provided, tailor the recommendation to match their preferences.',
      '- Output should be 3-5 sentences, specific, and immediately actionable.',
      '- End with a one-line "Data sources used:" footer listing which inputs informed the recommendation (e.g., "Data sources used: HubSpot engagement, Gmail threads, communication profile").',
      '',
      'Return ONLY the recommendation text (plain text, not JSON). Do not wrap in quotes or code blocks.'
    )

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPromptParts.join('\n') }],
      }),
    })

    if (!response.ok) {
      console.error(`[Intelligence/NextStep] Anthropic API error ${response.status}: ${response.statusText}`)
      return NextResponse.json(
        { recommendation: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const text = result.content?.[0]?.text ?? null

    if (!text) {
      return NextResponse.json(
        { recommendation: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      recommendation: text,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/NextStep] Error:', error)
    return NextResponse.json(
      { recommendation: null, error: 'AI generation failed — retry' },
      { status: 500 }
    )
  }
}
