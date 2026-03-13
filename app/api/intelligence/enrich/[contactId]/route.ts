import { NextResponse } from 'next/server'
import {
  enrichContactEmail,
  summarizeWorkHistory,
  findThoughtLeadership,
} from '@/lib/clay'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  if (!process.env.CLAY_API_KEY) {
    return NextResponse.json(
      {
        error: 'Clay not configured. Set CLAY_API_KEY to enable contact enrichment.',
      },
      { status: 200 }
    )
  }

  try {
    const { contactName, company, linkedinUrl } = await request.json()

    if (!contactName || !company) {
      return NextResponse.json(
        { error: 'contactName and company are required.' },
        { status: 400 }
      )
    }

    // Run enrichment calls in parallel where possible
    const emailPromise = enrichContactEmail(contactName, company)
    const thoughtLeadershipPromise = findThoughtLeadership(contactName, company)
    const workHistoryPromise = linkedinUrl
      ? summarizeWorkHistory(linkedinUrl)
      : Promise.resolve(null)

    const [email, thoughtLeadership, workHistory] = await Promise.all([
      emailPromise,
      thoughtLeadershipPromise,
      workHistoryPromise,
    ])

    return NextResponse.json({
      email,
      workHistory,
      thoughtLeadership,
      enrichedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Enrich] Error:', error)
    return NextResponse.json(
      { error: 'Clay enrichment failed — retry' },
      { status: 500 }
    )
  }
}
