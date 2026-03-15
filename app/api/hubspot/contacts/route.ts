export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { searchContacts } from '@/lib/hubspot'

export async function GET() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return NextResponse.json({ contacts: [], error: 'HubSpot not configured' }, { status: 200 })
  }

  try {
    const contacts = await searchContacts('Unilever')
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('HubSpot contacts error:', error)
    return NextResponse.json({ contacts: [], error: 'Failed to fetch contacts' }, { status: 500 })
  }
}
