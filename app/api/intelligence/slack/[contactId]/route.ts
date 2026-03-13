import { NextResponse } from 'next/server'
import { searchMessages } from '@/lib/slack'
import type { SlackMessage } from '@/lib/slack'

const DEFAULT_CHANNELS = [
  'in:#vas-uk-gluta-lip-2026',
  'in:#vas-uk-gluta-body-y2',
  'in:#unilever-global',
  'in:#finance-general',
  'in:#general',
]

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  if (!process.env.SLACK_BOT_TOKEN) {
    return NextResponse.json(
      {
        mentions: [],
        error: 'Slack not configured. Set SLACK_BOT_TOKEN to enable Slack intelligence.',
      },
      { status: 200 }
    )
  }

  try {
    const { contactName, channels } = await request.json()

    if (!contactName) {
      return NextResponse.json(
        { mentions: [], error: 'contactName is required.' },
        { status: 400 }
      )
    }

    const channelFilters: string[] = channels ?? DEFAULT_CHANNELS
    const allMentions: SlackMessage[] = []
    const seenPermalinks = new Set<string>()

    for (const channelFilter of channelFilters) {
      const messages = await searchMessages(`${contactName} ${channelFilter}`)

      for (const msg of messages) {
        if (!seenPermalinks.has(msg.permalink)) {
          seenPermalinks.add(msg.permalink)
          allMentions.push(msg)
        }
      }
    }

    // Sort by timestamp descending
    allMentions.sort((a, b) => {
      const tsA = parseFloat(a.timestamp) || 0
      const tsB = parseFloat(b.timestamp) || 0
      return tsB - tsA
    })

    return NextResponse.json({
      mentions: allMentions,
      channelsSearched: channelFilters,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Intelligence/Slack] Error:', error)
    return NextResponse.json(
      { mentions: [], error: 'Slack connection error — retry' },
      { status: 500 }
    )
  }
}
