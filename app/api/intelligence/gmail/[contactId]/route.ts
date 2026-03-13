import { NextResponse } from 'next/server'
import { searchThreads } from '@/lib/gmail'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  if (!process.env.GMAIL_ACCESS_TOKEN) {
    return NextResponse.json(
      {
        threads: [],
        error: 'Gmail not configured. Set GMAIL_ACCESS_TOKEN to enable email intelligence.',
      },
      { status: 200 }
    )
  }

  try {
    const { email, contactName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { threads: [], error: 'Email address is required.' },
        { status: 400 }
      )
    }

    const threads = await searchThreads(`from:${email} OR to:${email}`, 5)

    if (!threads.length && email) {
      return NextResponse.json({
        threads: [],
        message:
          'No email history from connected accounts. Connect additional team Gmail accounts for coverage.',
      })
    }

    return NextResponse.json({
      threads,
      connectedAs: 'alex@campfire.co.uk',
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Gmail] Error:', error)
    return NextResponse.json(
      { threads: [], error: 'Gmail connection error — retry' },
      { status: 500 }
    )
  }
}
