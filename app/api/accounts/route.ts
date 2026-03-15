export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDealsForCompanies } from '@/lib/hubspot'
import { computeHealthScore } from '@/lib/health-score'
import { STALENESS_THRESHOLDS, PIPELINE_STAGES } from '@/lib/constants'
import type { ContactKapData, HubSpotDeal, Account } from '@/lib/types'

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
    return NextResponse.json([])
  }

  try {
    // Fetch all accounts
    const { data: accounts, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .order('name')

    if (accErr || !accounts || accounts.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all contacts and signals in bulk (two queries, not N)
    const accountIds = accounts.map((a: Account) => a.id)

    const [contactsResult, signalsResult] = await Promise.all([
      supabase.from('contact_kap_data').select('*').in('account_id', accountIds),
      supabase.from('signals').select('account_id').in('account_id', accountIds).eq('dismissed', false),
    ])

    const contacts: ContactKapData[] = (contactsResult.data ?? []) as ContactKapData[]
    const signals = signalsResult.data ?? []

    // Group contacts and signals by account
    const contactsByAccount = new Map<string, ContactKapData[]>()
    for (const c of contacts) {
      const list = contactsByAccount.get(c.account_id) ?? []
      list.push(c)
      contactsByAccount.set(c.account_id, list)
    }

    const signalCountByAccount = new Map<string, number>()
    for (const s of signals) {
      signalCountByAccount.set(s.account_id, (signalCountByAccount.get(s.account_id) ?? 0) + 1)
    }

    // Fetch HubSpot deals for all accounts in parallel
    const hubspotConfigured = !!process.env.HUBSPOT_ACCESS_TOKEN
    const dealsByAccount = new Map<string, HubSpotDeal[]>()

    if (hubspotConfigured) {
      const dealPromises = accounts.map(async (a: Account) => {
        const companyIds = a.hubspot_company_ids ?? []
        if (companyIds.length === 0) return { accountId: a.id, deals: [] as HubSpotDeal[] }

        try {
          const rawDeals = await getDealsForCompanies(companyIds)
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
        } catch {
          return { accountId: a.id, deals: [] as HubSpotDeal[] }
        }
      })

      const results = await Promise.all(dealPromises)
      for (const r of results) {
        dealsByAccount.set(r.accountId, r.deals)
      }
    }

    // Build summaries
    const summaries: AccountSummary[] = accounts.map((a: Account) => {
      const acctContacts = contactsByAccount.get(a.id) ?? []
      const acctDeals = dealsByAccount.get(a.id) ?? []
      const acctSignalCount = signalCountByAccount.get(a.id) ?? 0

      // Recompute staleness on contacts for health score
      const enrichedContacts = acctContacts.map(c => ({
        ...c,
        is_stale: c.days_since_contact != null
          ? c.days_since_contact > STALENESS_THRESHOLDS[c.priority]
          : c.is_stale ?? false,
      }))

      // Active deals (not closed)
      const activeDeals = acctDeals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
      const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)

      // Compute health score
      const healthScore = computeHealthScore({
        contacts: enrichedContacts,
        deals: acctDeals,
        pipelineTarget: a.target_annual_revenue,
      })

      // Find latest activity timestamp
      const timestamps = [
        a.updated_at,
        ...acctContacts.map(c => c.last_contacted).filter(Boolean),
      ].filter(Boolean) as string[]
      const lastActivity = timestamps.length > 0
        ? timestamps.sort().reverse()[0]
        : a.created_at || new Date().toISOString()

      return {
        id: a.id,
        name: a.name,
        tier: a.tier || 'MAINTENANCE',
        healthScore: healthScore.overall,
        contactCount: acctContacts.length,
        activeDeals: activeDeals.length,
        pipelineValue,
        signalCount: acctSignalCount,
        lastActivity,
      }
    })

    return NextResponse.json(summaries)
  } catch (err) {
    console.error('[/api/accounts] Error:', err)
    return NextResponse.json([])
  }
}
