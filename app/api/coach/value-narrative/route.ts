import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ narrative: null, error: 'Anthropic API not configured.' })
  }

  try {
    const { wonTotal, wonDeals, deliveryVelocity } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: 'You are a QBR preparation assistant for Campfire, a social media agency. Generate concise value-delivered narratives.',
        messages: [{ role: 'user', content: `Generate a value-delivered narrative for a QBR based on:
- Won deals total: £${wonTotal?.toLocaleString() ?? 0}
- Won deal names: ${wonDeals?.join(', ') || 'none'}
- Delivery velocity: ${deliveryVelocity ?? 'not measured'}%

Write 2-3 paragraphs suitable for a QBR presentation. Focus on measurable impact and commercial value delivered. Plain text.` }],
      }),
    })

    if (!response.ok) return NextResponse.json({ narrative: null, error: 'AI generation failed' }, { status: 500 })
    const result = await response.json()
    return NextResponse.json({ narrative: result.content?.[0]?.text ?? null })
  } catch {
    return NextResponse.json({ narrative: null, error: 'Failed' }, { status: 500 })
  }
}
