export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDealsForCompanies } from '@/lib/hubspot'
import { computeHealthScore } from '@/lib/health-score'
import { STALENESS_THRESHOLDS, PIPELINE_STAGES } from '@/lib/constants'
import type { ContactKapData, HubSpotDeal, Signal, Account } from '@/lib/types'

interface AccountSummary {
  id: string
  name: string
  tier: string
  healthScore: number
  contactCount: number
  activeDeals: number
  pipelineValue: number
  signalCount: number
  lastActivity: string
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    console.log('[/api/accounts] Supabase client is null — env vars missing')
    return NextResponse.json([])
  }

  try {
    // Fetch all accounts from Supabase
    const { data: accounts, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .order('name')

    console.log('[/api/accounts] accounts query:', {
      count: accounts?.length ?? 0,
      error: accErr?.message ?? null,
      ids: accounts?.map((a: any) => ({ id: a.id, name: a.name })) ?? [],
    })

    if (accErr || !accounts || accounts.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all contacts and signals in bulk
    const accountIds = accounts.map((a: Account) => a.id)

    const [contactsResult, signalsResult] = await Promise.all([
      supabase.from('contact_kap_data').select('*').in('account_id', accountIds),
      supabase.from('signals').select('*').in('account_id', accountIds).eq('dismissed', false),
    ])

    console.log('[/api/accounts] contacts query:', {
      count: contactsResult.data?.length ?? 0,
      error: contactsResult.error?.message ?? null,
    })
    console.log('[/api/accounts] signals query:', {
      count: signalsResult.data?.length ?? 0,
      error: signalsResult.error?.message ?? null,
    })

    // Log a sample of contact account_ids to verify they match
    if (contactsResult.data && contactsResult.data.length > 0) {
      const sampleContactAccountIds = Array.from(new Set(contactsResult.data.map((c: any) => c.account_id)))
      console.log('[/api/accounts] contact account_ids in DB:', sampleContactAccountIds)
      console.log('[/api/accounts] account UUIDs we queried:', accountIds)
    }

    const dbContacts: ContactKapData[] = (contactsResult.data ?? []) as ContactKapData[]
    const dbSignals: Signal[] = (signalsResult.data ?? []) as Signal[]

    // Group DB contacts and signals by account
    const contactsByAccount = new Map<string, ContactKapData[]>()
    for (const c of dbContacts) {
      const list = contactsByAccount.get(c.account_id) ?? []
      list.push(c)
      contactsByAccount.set(c.account_id, list)
    }

    const signalsByAccount = new Map<string, Signal[]>()
    for (const s of dbSignals) {
      const list = signalsByAccount.get(s.account_id) ?? []
      list.push(s)
      signalsByAccount.set(s.account_id, list)
    }

    // Log grouped counts per account
    for (const a of accounts) {
      const cCount = contactsByAccount.get(a.id)?.length ?? 0
      const sCount = signalsByAccount.get(a.id)?.length ?? 0
      console.log(`[/api/accounts] ${a.name} (${a.id}): ${cCount} contacts, ${sCount} signals`)
    }

    // HubSpot deals
    const hubspotConfigured = !!process.env.HUBSPOT_ACCESS_TOKEN
    const dealsByAccount = new Map<string, HubSpotDeal[]>()

    if (hubspotConfigured) {
      const dealPromises = accounts.map(async (a: Account) => {
        const companyIds = a.hubspot_company_ids ?? []
        if (companyIds.length === 0) return { accountId: a.id, deals: [] as HubSpotDeal[] }

        try {
          const rawDeals = await getDealsForCompanies(companyIds)
          console.log(`[/api/accounts] HubSpot deals for ${a.name}: ${rawDeals.length} raw deals`)
          const mapped: HubSpotDeal[] = rawDeals.map(raw => {
            const props = raw.properties
            const dealstage = props.dealstage ?? ''
            const stageInfo = PIPELINE_STAGES[dealstage]
            return {
              id: raw.id,
              dealname: props.dealname ?? '',
              amount: props.amount ? parseFloat(props.amount) : null,
              dealstage,
              pipeline: props.pipeline ?? 'default',
              closedate: props.closedate ?? null,
              hubspot_owner_id: props.hubspot_owner_id ?? null,
              stage_label: stageInfo?.label ?? dealstage,
              win_probability: stageInfo?.probability ?? 0,
            }
          })
          return { accountId: a.id, deals: mapped }
        } catch (e) {
          console.error(`[/api/accounts] HubSpot error for ${a.name}:`, e)
          return { accountId: a.id, deals: [] as HubSpotDeal[] }
        }
      })

      const results = await Promise.all(dealPromises)
      for (const r of results) {
        dealsByAccount.set(r.accountId, r.deals)
      }
    } else {
      console.log('[/api/accounts] HubSpot not configured — no deals')
    }

    // Build summaries from live Supabase data
    const summaries: AccountSummary[] = accounts.map((a: Account) => {
      const acctContacts = contactsByAccount.get(a.id) ?? []
      const acctSignals = signalsByAccount.get(a.id) ?? []
      const acctDeals = dealsByAccount.get(a.id) ?? []

      // Recompute staleness
      const enrichedContacts = acctContacts.map(c => ({
        ...c,
        is_stale: c.days_since_contact != null
          ? c.days_since_contact > STALENESS_THRESHOLDS[c.priority]
          : c.is_stale ?? false,
      }))

      // Active deals
      const activeDeals = acctDeals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
      const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)

      // Health score
      const healthScore = computeHealthScore({
        contacts: enrichedContacts,
        deals: acctDeals,
        pipelineTarget: a.target_annual_revenue || 150000,
      })

      // Latest activity
      const timestamps = [
        a.updated_at,
        ...acctContacts.map(c => c.last_contacted).filter(Boolean),
      ].filter(Boolean) as string[]
      const lastActivity = timestamps.length > 0
        ? timestamps.sort().reverse()[0]
        : a.created_at || new Date().toISOString()

      const summary = {
        id: a.id,
        name: a.name,
        tier: a.tier || 'MAINTENANCE',
        healthScore: healthScore.overall,
        contactCount: acctContacts.length,
        activeDeals: activeDeals.length,
        pipelineValue,
        signalCount: acctSignals.length,
        lastActivity,
      }

      console.log(`[/api/accounts] FINAL ${a.name}:`, JSON.stringify(summary))

      return summary
    })

    return NextResponse.json(summaries)
  } catch (err) {
    console.error('[/api/accounts] Unhandled error:', err)
    return NextResponse.json([])
  }
}
