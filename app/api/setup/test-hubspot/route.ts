import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { portalId, apiKey } = await request.json()
    if (!portalId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Portal ID and API key required' })
    }

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `HubSpot API returned ${res.status}` })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Connection failed' })
  }
}
