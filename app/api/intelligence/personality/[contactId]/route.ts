import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        profile: null,
        error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to enable personality analysis.',
      },
      { status: 200 }
    )
  }

  try {
    const { contactData, slackMentions, emailThreads } = await request.json()

    if (!contactData) {
      return NextResponse.json(
        { profile: null, error: 'contactData is required.' },
        { status: 400 }
      )
    }

    const systemPrompt =
      'You are an expert communication analyst for Campfire, a digital marketing agency. Analyze the following data about a client contact and generate a personality and communication style profile.'

    const userPromptParts = [
      'Analyze the following contact data and generate a personality and communication style profile.',
      '',
      '## Contact Data',
      `- Name: ${contactData.name}`,
      `- Role: ${contactData.role}`,
      `- Relationship level: ${contactData.relationship_level}`,
      `- Buyer type: ${contactData.buyer_type}`,
      `- Days since last contact: ${contactData.days_since_contact ?? 'unknown'}`,
      `- Current next step: ${contactData.next_step}`,
    ]

    if (slackMentions?.length) {
      userPromptParts.push(
        '',
        '## Slack Mentions',
        JSON.stringify(slackMentions, null, 2)
      )
    }

    if (emailThreads?.length) {
      userPromptParts.push(
        '',
        '## Email Threads',
        JSON.stringify(emailThreads, null, 2)
      )
    }

    userPromptParts.push(
      '',
      'Return your analysis as a JSON object with these fields:',
      '- personality_profile: A 2-3 sentence summary of their personality type',
      '- communication_style: How they prefer to communicate (e.g. direct, formal, casual)',
      '- decision_pattern: How they typically make decisions',
      '- motivations: Array of 3-5 key motivations',
      '- frustrations: Array of 3-5 likely frustrations',
      '- recommended_approach: How the Campfire team should best engage with them',
      '',
      'Return ONLY valid JSON, no other text.'
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
      console.error(`[Intelligence/Personality] Anthropic API error ${response.status}: ${response.statusText}`)
      return NextResponse.json(
        { profile: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const text = result.content?.[0]?.text ?? null

    if (!text) {
      return NextResponse.json(
        { profile: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    // Parse the JSON response from Claude
    let profile
    try {
      // Handle cases where Claude wraps JSON in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text]
      profile = JSON.parse(jsonMatch[1].trim())
    } catch {
      console.error('[Intelligence/Personality] Failed to parse AI response as JSON:', text)
      return NextResponse.json(
        { profile: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Personality] Error:', error)
    return NextResponse.json(
      { profile: null, error: 'AI generation failed — retry' },
      { status: 500 }
    )
  }
}
