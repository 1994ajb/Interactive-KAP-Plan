import { NextResponse } from 'next/server'
import { searchDeals } from '@/lib/hubspot'
import { PIPELINE_STAGES } from '@/lib/constants'
import { HubSpotDeal } from '@/lib/types'

export async function GET() {
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return NextResponse.json({ deals: [], error: 'HubSpot not configured' }, { status: 200 })
  }

  try {
    const rawDeals = await searchDeals('Vaseline')
    const deals: HubSpotDeal[] = rawDeals.map(d => {
      const stage = PIPELINE_STAGES[d.properties.dealstage ?? '']
      return {
        id: d.id,
        dealname: d.properties.dealname ?? 'Untitled Deal',
        amount: d.properties.amount ? parseFloat(d.properties.amount) : null,
        dealstage: d.properties.dealstage ?? '',
        pipeline: d.properties.pipeline ?? '',
        closedate: d.properties.closedate ?? null,
        hubspot_owner_id: d.properties.hubspot_owner_id ?? null,
        stage_label: stage?.label ?? d.properties.dealstage ?? 'Unknown',
        win_probability: stage?.probability ?? 0,
      }
    })

    return NextResponse.json({ deals })
  } catch (error) {
    console.error('HubSpot deals error:', error)
    return NextResponse.json({ deals: [], error: 'Failed to fetch deals' }, { status: 500 })
  }
}
