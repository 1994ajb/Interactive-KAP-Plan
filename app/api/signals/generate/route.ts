import { NextResponse } from 'next/server'
import { getAccountData } from '@/lib/live-data'
import {
  generateEngagementGapSignals,
  generatePipelineMoveSignals,
  generateTitleDiscrepancySignals,
  generateHubSpotCompletenessSignals,
} from '@/lib/signal-generator'
import type { Signal } from '@/lib/types'

export async function POST(request: Request) {
  const generated_at = new Date().toISOString()

  // ── Parse request body ──────────────────────────────────────────────────
  let accountId: string
  try {
    const body = await request.json()
    accountId = body.accountId
    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // ── Fetch live account data ─────────────────────────────────────────────
  let accountData: Awaited<ReturnType<typeof getAccountData>>
  try {
    accountData = await getAccountData(accountId)
  } catch (err) {
    console.error('[signals/generate] Failed to fetch account data:', err)
    return NextResponse.json(
      { error: 'Signal generation failed — retry', generated_at },
      { status: 500 }
    )
  }

  const { contacts, deals } = accountData

  // ── Run all signal generators ───────────────────────────────────────────
  const sources_checked: string[] = []

  const engagementSignals = generateEngagementGapSignals(contacts)
  sources_checked.push('HubSpot')

  const titleSignals = generateTitleDiscrepancySignals(contacts)
  sources_checked.push('KAP Data')

  const completenessSignals = generateHubSpotCompletenessSignals(contacts)
  // HubSpot already in sources_checked

  const pipelineSignals = generatePipelineMoveSignals(deals)
  sources_checked.push('Pipeline')

  const allSignals = [
    ...engagementSignals,
    ...titleSignals,
    ...completenessSignals,
    ...pipelineSignals,
  ]

  // ── Deduplicate by type + title ─────────────────────────────────────────
  const seen = new Set<string>()
  const signals: Signal[] = []
  for (const signal of allSignals) {
    const key = `${signal.type}::${signal.title}`
    if (!seen.has(key)) {
      seen.add(key)
      signals.push(signal)
    }
  }

  // ── Persist to Supabase if configured ───────────────────────────────────
  let signals_persisted = false

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { upsertSignal } = await import('@/lib/supabase-queries')

      const results = await Promise.all(
        signals.map((signal) => {
          const { id, ...signalWithoutId } = signal
          return upsertSignal(signalWithoutId)
        })
      )

      signals_persisted = results.every(Boolean)
    } catch (err) {
      console.error('[signals/generate] Supabase write failed:', err)
      signals_persisted = false
    }
  }

  // ── Return response ────────────────────────────────────────────────────
  return NextResponse.json({
    signals,
    generated_at,
    sources_checked,
    signals_persisted,
    total_generated: signals.length,
  })
}
