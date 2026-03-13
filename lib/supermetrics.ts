export type CampaignData = {
  reach: number
  impressions: number
  engagement_rate: number
  video_views: number
  follower_growth: number
  cpm: number
}

const SUPERMETRICS_API_BASE = 'https://api.supermetrics.com/enterprise/v2'

function getApiKey(): string | null {
  const key = process.env.SUPERMETRICS_API_KEY
  if (!key) {
    console.log('[Supermetrics] SUPERMETRICS_API_KEY not set — skipping Supermetrics integration')
    return null
  }
  return key
}

/**
 * Pull campaign performance data from Supermetrics for a given account and platform.
 */
export async function getCampaignMetrics(
  accountId: string,
  platform: string,
  startDate: string,
  endDate: string
): Promise<CampaignData | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  try {
    const res = await fetch(`${SUPERMETRICS_API_BASE}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ds_id: platform,
        ds_accounts: [accountId],
        date_range_type: 'custom',
        start_date: startDate,
        end_date: endDate,
        fields: [
          'reach',
          'impressions',
          'engagement_rate',
          'video_views',
          'follower_growth',
          'cpm',
        ],
      }),
    })

    if (!res.ok) {
      console.log(`[Supermetrics] API error ${res.status}: ${res.statusText}`)
      return null
    }

    const data = (await res.json()) as {
      data?: {
        reach?: number
        impressions?: number
        engagement_rate?: number
        video_views?: number
        follower_growth?: number
        cpm?: number
      }[]
    }

    if (!data.data?.length) return null

    // Aggregate across all returned rows
    const aggregated: CampaignData = {
      reach: 0,
      impressions: 0,
      engagement_rate: 0,
      video_views: 0,
      follower_growth: 0,
      cpm: 0,
    }

    for (const row of data.data) {
      aggregated.reach += row.reach ?? 0
      aggregated.impressions += row.impressions ?? 0
      aggregated.video_views += row.video_views ?? 0
      aggregated.follower_growth += row.follower_growth ?? 0
    }

    // Average for rate-based metrics
    const count = data.data.length
    aggregated.engagement_rate =
      data.data.reduce((sum, r) => sum + (r.engagement_rate ?? 0), 0) / count
    aggregated.cpm = data.data.reduce((sum, r) => sum + (r.cpm ?? 0), 0) / count

    return aggregated
  } catch (error) {
    console.log('[Supermetrics] getCampaignMetrics failed:', error)
    return null
  }
}
