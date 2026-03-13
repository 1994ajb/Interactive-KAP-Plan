import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Phase 2: On-demand Clay enrichment per contact
  // Will call Clay API to enrich: email, work history, thought leadership
  const clayApiKey = process.env.CLAY_API_KEY

  if (!clayApiKey) {
    return NextResponse.json({
      error: 'Clay API not configured',
      message: 'Set CLAY_API_KEY environment variable to enable contact enrichment.',
    }, { status: 200 })
  }

  return NextResponse.json({
    message: `Enrichment triggered for contact ${params.id}`,
    status: 'pending',
    layers: ['email', 'work_history', 'thought_leadership'],
  })
}
