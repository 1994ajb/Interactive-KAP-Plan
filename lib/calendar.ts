export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  attendees: string[]
  status: string
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary'

function getCalendarToken(): string | null {
  const token = process.env.GOOGLE_CALENDAR_TOKEN
  if (!token) {
    console.log('[Calendar] GOOGLE_CALENDAR_TOKEN not set — skipping Calendar integration')
    return null
  }
  return token
}

async function calendarFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const token = getCalendarToken()
  if (!token) return null

  try {
    const url = new URL(`${CALENDAR_API_BASE}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.log(`[Calendar] API error ${res.status}: ${res.statusText}`)
      return null
    }

    return (await res.json()) as T
  } catch (error) {
    console.log('[Calendar] Request failed:', error)
    return null
  }
}

interface GoogleCalendarEvent {
  id: string
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  attendees?: { email: string; responseStatus?: string }[]
  status?: string
}

function mapEvent(event: GoogleCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.summary ?? '(No title)',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    attendees: (event.attendees ?? []).map((a) => a.email),
    status: event.status ?? 'confirmed',
  }
}

/**
 * Get upcoming calendar events matching a query within a number of days.
 */
export async function getUpcomingEvents(
  query: string,
  days: number = 14
): Promise<CalendarEvent[]> {
  const token = getCalendarToken()
  if (!token) return []

  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const result = await calendarFetch<{ items?: GoogleCalendarEvent[] }>('/events', {
    q: query,
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })

  if (!result?.items?.length) return []

  return result.items.map(mapEvent)
}

/**
 * Get historical meetings involving a contact email within the past number of days.
 */
export async function getHistoricalMeetings(
  contactEmail: string,
  days: number = 90
): Promise<CalendarEvent[]> {
  const token = getCalendarToken()
  if (!token) return []

  const now = new Date()
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const result = await calendarFetch<{ items?: GoogleCalendarEvent[] }>('/events', {
    q: contactEmail,
    timeMin: past.toISOString(),
    timeMax: now.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  })

  if (!result?.items?.length) return []

  // Filter to events where the contact is actually an attendee
  return result.items
    .filter((event) =>
      event.attendees?.some((a) => a.email.toLowerCase() === contactEmail.toLowerCase())
    )
    .map(mapEvent)
}
