import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ recommendation: null, error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY.' })
  }

  try {
    const { campfireMember, roleDescription, markingContacts, actionPlan, accountName, accountObjective } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: 'You are a Key Account Plan strategist for Campfire agency. Generate specific, actionable weekly recommendations.',
        messages: [{
          role: 'user',
          content: `Generate this week's specific actions for ${campfireMember} (${roleDescription}) who is marking: ${markingContacts.join(', ')}.

Account: ${accountName}
Objective: ${accountObjective}
Standing action plan: ${actionPlan}

Give 3-4 specific, actionable items for THIS WEEK. Be concrete (e.g., "Send email to X about Y", "Schedule 1:1 with Z to discuss W"). Plain text, bullet points.`,
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ recommendation: null, error: 'AI generation failed' }, { status: 500 })
    }

    const result = await response.json()
    return NextResponse.json({ recommendation: result.content?.[0]?.text ?? null, generated_at: new Date().toISOString() })
  } catch {
    return NextResponse.json({ recommendation: null, error: 'Failed — retry' }, { status: 500 })
  }
}
