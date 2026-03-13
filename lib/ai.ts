const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

function getApiKey(): string | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    console.log('[AI] ANTHROPIC_API_KEY not set — skipping AI generation')
    return null
  }
  return key
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      console.log(`[AI] Anthropic API error ${res.status}: ${res.statusText}`)
      return null
    }

    const data = (await res.json()) as {
      content?: { type: string; text: string }[]
    }

    return data.content?.[0]?.text ?? null
  } catch (error) {
    console.log('[AI] Request failed:', error)
    return null
  }
}

/**
 * Generate an AI-powered next step recommendation for a contact.
 * Uses contact data including relationship level, interaction history, and account context.
 */
export async function generateNextStep(contactData: object): Promise<string> {
  const systemPrompt = `You are an expert Key Account Plan strategist for Campfire, a digital marketing agency.
Your job is to recommend the single most impactful next action a team member should take with a client contact.
Consider the contact's relationship level, last interaction, buyer type, and account objectives.
Be specific, actionable, and concise (1-2 sentences). Include a suggested timeframe.`

  const userPrompt = `Based on the following contact data, recommend the best next step:

${JSON.stringify(contactData, null, 2)}`

  const result = await callClaude(systemPrompt, userPrompt)
  return result ?? 'AI next step generation unavailable. Review contact manually and update next step.'
}

/**
 * Generate a meeting preparation briefing.
 * Takes meeting data including attendees, account context, and recent interactions.
 */
export async function generateMeetingPrep(meetingData: object): Promise<string> {
  const systemPrompt = `You are an expert meeting preparation assistant for Campfire, a digital marketing agency.
Generate a concise meeting briefing that includes:
- Key context about each attendee (relationship level, recent interactions, sentiment)
- Account health summary and any active signals
- Suggested talking points and objectives for this meeting
- Potential risks or sensitive topics to be aware of
Keep the briefing scannable with clear sections and bullet points.`

  const userPrompt = `Prepare a meeting briefing based on the following data:

${JSON.stringify(meetingData, null, 2)}`

  const result = await callClaude(systemPrompt, userPrompt)
  return result ?? 'AI meeting prep unavailable. Review account dashboard for manual preparation.'
}

/**
 * Generate a Quarterly Business Review preparation document.
 * Takes account data including health scores, delivery metrics, and pipeline data.
 */
export async function generateQBRPrep(accountData: object): Promise<string> {
  const systemPrompt = `You are an expert QBR preparation assistant for Campfire, a digital marketing agency.
Generate a comprehensive QBR preparation document that includes:
- Executive summary of account health and trajectory
- Key wins and deliverables from the period
- Areas of concern or risk with mitigation strategies
- Pipeline and revenue outlook
- Recommended strategic initiatives for next quarter
- Relationship map insights and engagement gaps to address
Format with clear headers and bullet points for easy scanning.`

  const userPrompt = `Prepare a QBR document based on the following account data:

${JSON.stringify(accountData, null, 2)}`

  const result = await callClaude(systemPrompt, userPrompt)
  return result ?? 'AI QBR preparation unavailable. Use the account dashboard to compile QBR materials manually.'
}

/**
 * Summarize recent interactions across channels (email, meetings, Slack, etc.).
 * Returns a narrative summary of communication patterns and key themes.
 */
export async function summarizeInteractions(interactions: object[]): Promise<string> {
  const systemPrompt = `You are an expert communication analyst for Campfire, a digital marketing agency.
Summarize the provided interactions into a concise narrative that captures:
- Overall communication frequency and pattern
- Key themes and topics discussed
- Sentiment trajectory (improving, stable, declining)
- Any action items or commitments mentioned
- Notable gaps or changes in communication pattern
Keep the summary to 3-5 sentences.`

  const userPrompt = `Summarize the following recent interactions:

${JSON.stringify(interactions, null, 2)}`

  const result = await callClaude(systemPrompt, userPrompt)
  return result ?? 'AI interaction summary unavailable. Review recent interactions manually.'
}
