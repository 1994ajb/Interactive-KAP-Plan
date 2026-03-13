import { NextResponse } from 'next/server'
import { getAccountData } from '@/lib/live-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getAccountData(params.id)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API/Account] Error fetching account data:', error)

    // Fall back to mock data on any unhandled error
    try {
      const { getMockAccountData } = await import('@/lib/mock-data')
      const mock = getMockAccountData()
      return NextResponse.json({
        ...mock,
        dataSourceStatus: {
          supabase: 'error',
          hubspot: 'error',
          gmail: 'offline',
          calendar: 'offline',
          slack: 'offline',
          clay: 'offline',
          supermetrics: 'offline',
          meta_ad_library: 'offline',
          google_news: 'offline',
        },
        lastFetchedAt: new Date().toISOString(),
      })
    } catch {
      return NextResponse.json(
        { error: 'Failed to load account data' },
        { status: 500 }
      )
    }
  }
}
