export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getDealsForCompanies } from '@/lib/hubspot'
import { computeHealthScore } from '@/lib/health-score'
import { getMockAccountData } from '@/lib/mock-data'
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

/** Slug from account name — matches the mock-data convention */
function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json([])
  }

  try {
    // Fetch all accounts from Supabase
    const { data: accounts, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .order('name')

    if (accErr || !accounts || accounts.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all contacts and signals in bulk
    const accountIds = accounts.map((a: Account) => a.id)

    const [contactsResult, signalsResult] = await Promise.all([
      supabase.from('contact_kap_data').select('*').in('account_id', accountIds),
      supabase.from('signals').select('*').in('account_id', accountIds).eq('dismissed', false),
    ])

    const dbContacts: ContactKapData[] = (contactsResult.data ?? []) as ContactKapData[]
    const dbSignals: Signal[] = (signalsResult.data ?? []) as Signal[]

    // Load mock data for fallback (Vaseline UK has rich mock data)
    const mockData = getMockAccountData()
    const mockSlug = nameToSlug(mockData.account.name) // 'vaseline-uk'

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

    // HubSpot deals
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

    // Build summaries with mock-data fallback
    const summaries: AccountSummary[] = accounts.map((a: Account) => {
      const slug = nameToSlug(a.name)
      const isMockAccount = slug === mockSlug

      // Use DB data, fall back to mock for the matching account
      let acctContacts = contactsByAccount.get(a.id) ?? []
      let acctSignals = signalsByAccount.get(a.id) ?? []
      let acctDeals = dealsByAccount.get(a.id) ?? []

      if (isMockAccount) {
        if (acctContacts.length === 0) acctContacts = mockData.contacts
        if (acctSignals.length === 0) acctSignals = mockData.signals
        if (acctDeals.length === 0) acctDeals = mockData.deals
      }

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
        pipelineTarget: a.target_annual_revenue,
      })

      // Latest activity
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
        signalCount: acctSignals.length,
        lastActivity,
      }
    })

    return NextResponse.json(summaries)
  } catch (err) {
    console.error('[/api/accounts] Error:', err)
    return NextResponse.json([])
  }
}
