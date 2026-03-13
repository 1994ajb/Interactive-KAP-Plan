import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      briefing: null,
      error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to generate meeting prep.',
    })
  }

  try {
    const { meetingData, accountData } = await request.json()

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
        messages: [{
          role: 'user',
          content: `You are a senior account strategist preparing an account manager for a client meeting.

Account: ${accountData.account.name}
Account tier: ${accountData.account.tier}
Health score: ${accountData.healthScore.overall}/100
Current objective: ${accountData.account.objective_retention}

Meeting: ${meetingData.title}
Date: ${meetingData.start_time}

Attendees from client side:
${meetingData.attendees_client.map((a: { name: string; relationship_level?: string; last_interaction?: string }) =>
  `- ${a.name} (${a.relationship_level ?? 'unknown level'}, last contact: ${a.last_interaction ?? 'unknown'})`
).join('\n')}

Attendees from Campfire:
${meetingData.attendees_campfire.map((a: { name: string; role?: string }) =>
  `- ${a.name} (${a.role ?? 'team member'})`
).join('\n')}

Generate a meeting preparation briefing with:
1. Opening approach (what to lead with, what tone to set)
2. Key topics to raise (with specific data points to reference)
3. Topics to avoid or handle carefully
4. Ask/close (what specific commitment to seek)
5. Risk factors (what could go wrong in this meeting)

Every recommendation must be grounded in the data above. No generic advice.`,
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ briefing: null, error: 'AI generation failed' })
    }

    const result = await response.json()
    const briefing = result.content[0]?.text ?? null

    return NextResponse.json({
      briefing,
      generated_at: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ briefing: null, error: 'Failed to generate meeting prep' })
  }
}
