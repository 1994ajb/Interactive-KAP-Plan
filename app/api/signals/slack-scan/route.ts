import { NextResponse } from 'next/server'

const FINANCE_KEYWORDS = ['invoice', 'overdue', 'PO', 'payment', 'billing', 'purchase order']
const COMPETITOR_KEYWORDS = ['Gravity Road', 'Ogilvy', 'SEEN', 'Edelman']

export async function POST() {
  const slackToken = process.env.SLACK_BOT_TOKEN
  if (!slackToken) {
    return NextResponse.json({ signals: [], error: 'SLACK_BOT_TOKEN not configured' })
  }

  try {
    const { searchMessages } = await import('@/lib/slack')
    const newSignals: { type: string; title: string; detail: string; source: string }[] = []

    // Search for finance keywords
    for (const keyword of FINANCE_KEYWORDS) {
      const results = await searchMessages(`${keyword} in:#finance-general`, 5)
      for (const msg of results) {
        newSignals.push({
          type: 'FINANCE_ALERT',
          title: `Finance mention: "${keyword}" detected`,
          detail: msg.text.substring(0, 200),
          source: 'Slack',
        })
      }
    }

    // Search for competitor mentions
    for (const competitor of COMPETITOR_KEYWORDS) {
      const results = await searchMessages(competitor, 5)
      for (const msg of results) {
        newSignals.push({
          type: 'COMPETITOR',
          title: `Competitor mention: ${competitor}`,
          detail: msg.text.substring(0, 200),
          source: 'Slack',
        })
      }
    }

    // Persist to Supabase if configured
    let persisted = 0
    try {
      const { upsertSignal } = await import('@/lib/supabase-queries')
      for (const signal of newSignals.slice(0, 10)) {
        const success = await upsertSignal({
          account_id: 'vaseline-uk',
          type: signal.type as 'FINANCE_ALERT' | 'COMPETITOR',
          priority: signal.type === 'FINANCE_ALERT' ? 'HIGH' : 'MEDIUM',
          title: signal.title,
          detail: signal.detail,
          source: 'Slack' as const,
          timestamp: new Date().toISOString(),
          dismissed: false,
        })
        if (success) persisted++
      }
    } catch { /* Supabase not configured */ }

    return NextResponse.json({
      signals_found: newSignals.length,
      signals_persisted: persisted,
      scanned_at: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ signals: [], error: 'Slack scan failed' }, { status: 500 })
  }
}
