import { NextResponse } from 'next/server'
import { getUpcomingEvents, getHistoricalMeetings } from '@/lib/calendar'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  if (!process.env.GOOGLE_CALENDAR_TOKEN) {
    return NextResponse.json(
      {
        upcoming: [],
        historical: [],
        error: 'Google Calendar not configured. Set GOOGLE_CALENDAR_TOKEN to enable calendar intelligence.',
      },
      { status: 200 }
    )
  }

  try {
    const { email, contactName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { upcoming: [], historical: [], error: 'Email address is required.' },
        { status: 400 }
      )
    }

    const [upcoming, historical] = await Promise.all([
      getUpcomingEvents('Vaseline OR Unilever', 30),
      getHistoricalMeetings(email, 90),
    ])

    return NextResponse.json({
      upcoming,
      historical,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Calendar] Error:', error)
    return NextResponse.json(
      { upcoming: [], historical: [], error: 'Calendar connection error — retry' },
      { status: 500 }
    )
  }
}
