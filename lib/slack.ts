export type SlackMessage = {
  channel: string
  text: string
  user: string
  timestamp: string
  permalink: string
}

const SLACK_API_BASE = 'https://slack.com/api'

function getBotToken(): string | null {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) {
    console.log('[Slack] SLACK_BOT_TOKEN not set — skipping Slack integration')
    return null
  }
  return token
}

/**
 * Search Slack messages matching a query string.
 */
export async function searchMessages(
  query: string,
  limit: number = 20
): Promise<SlackMessage[]> {
  const token = getBotToken()
  if (!token) return []

  try {
    const url = new URL(`${SLACK_API_BASE}/search.messages`)
    url.searchParams.set('query', query)
    url.searchParams.set('count', String(limit))
    url.searchParams.set('sort', 'timestamp')
    url.searchParams.set('sort_dir', 'desc')

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.log(`[Slack] API error ${res.status}: ${res.statusText}`)
      return []
    }

    const data = (await res.json()) as {
      ok: boolean
      error?: string
      messages?: {
        matches?: {
          channel?: { name?: string }
          text?: string
          user?: string
          ts?: string
          permalink?: string
        }[]
      }
    }

    if (!data.ok) {
      console.log(`[Slack] API returned error: ${data.error}`)
      return []
    }

    const matches = data.messages?.matches ?? []

    return matches.map((m) => ({
      channel: m.channel?.name ?? '',
      text: m.text ?? '',
      user: m.user ?? '',
      timestamp: m.ts ?? '',
      permalink: m.permalink ?? '',
    }))
  } catch (error) {
    console.log('[Slack] searchMessages failed:', error)
    return []
  }
}
