import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        assessment: null,
        error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to enable priorities analysis.',
      },
      { status: 200 }
    )
  }

  try {
    const { contactData, accountContext } = await request.json()

    if (!contactData) {
      return NextResponse.json(
        { assessment: null, error: 'contactData is required.' },
        { status: 400 }
      )
    }

    const systemPrompt =
      'You are an expert Key Account Plan strategist. Based on the contact data and account context, assess this contact\'s likely priorities - what they need to achieve, what pressures they face, and what would make them successful.'

    const userPromptParts = [
      'Assess the likely priorities of the following client contact.',
      '',
      '## Contact Data',
      JSON.stringify(contactData, null, 2),
    ]

    if (accountContext) {
      userPromptParts.push(
        '',
        '## Account Context',
        JSON.stringify(accountContext, null, 2)
      )
    }

    userPromptParts.push(
      '',
      'Provide a 2-3 paragraph assessment covering:',
      '1. What this person likely needs to achieve in their role',
      '2. What pressures and challenges they face',
      '3. What would make them successful and how Campfire can support that'
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
      console.error(`[Intelligence/Priorities] Anthropic API error ${response.status}: ${response.statusText}`)
      return NextResponse.json(
        { assessment: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const assessment = result.content?.[0]?.text ?? null

    if (!assessment) {
      return NextResponse.json(
        { assessment: null, error: 'AI generation failed — retry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      assessment,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Priorities] Error:', error)
    return NextResponse.json(
      { assessment: null, error: 'AI generation failed — retry' },
      { status: 500 }
    )
  }
}
