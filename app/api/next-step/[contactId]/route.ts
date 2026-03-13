import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      next_step: null,
      error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to generate AI next steps.',
    })
  }

  try {
    const { contactData } = await request.json()

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
        messages: [{
          role: 'user',
          content: `You are an account intelligence advisor for a social media marketing agency called Campfire.

Given the following verified data about a client contact, generate a specific, actionable next step for the Campfire team member assigned to this contact.

Rules:
- Every recommendation must reference specific data points from the input
- Never fabricate information
- If data is insufficient, say what's missing and how to get it
- Be specific about timing, approach, and talking points
- Consider the relationship level and what's needed to advance it

Contact data:
- Name: ${contactData.name}
- Role: ${contactData.role}
- Relationship level: ${contactData.relationship_level}
- Buyer type: ${contactData.buyer_type}
- Campfire owner: ${contactData.campfire_owner}
- Days since last contact: ${contactData.days_since_contact ?? 'unknown'}
- Priority: ${contactData.priority}
- Current next step: ${contactData.next_step}

Generate a next step that is 2-3 sentences, specific, and immediately actionable.`,
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ next_step: null, error: 'AI generation failed' })
    }

    const result = await response.json()
    const nextStep = result.content[0]?.text ?? null

    return NextResponse.json({
      next_step: nextStep,
      generated_at: new Date().toISOString(),
      contact_id: params.contactId,
    })
  } catch {
    return NextResponse.json({ next_step: null, error: 'Failed to generate next step' })
  }
}
