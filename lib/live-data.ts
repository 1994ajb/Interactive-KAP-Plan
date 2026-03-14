import {
  AccountData,
  ContactKapData,
  HubSpotDeal,
  IntegrationStatus,
} from './types'
import { computeHealthScore, computeDealConfidence } from './health-score'
import { PIPELINE_STAGES, OWNER_MAP, STALENESS_THRESHOLDS } from './constants'
import { searchContacts, searchDeals, HubSpotContact, HubSpotDealRaw } from './hubspot'
import { getMockAccountData } from './mock-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataSourceConnectionStatus = 'connected' | 'error' | 'offline'

export interface DataSourceStatus {
  supabase: DataSourceConnectionStatus
  hubspot: DataSourceConnectionStatus
  gmail: DataSourceConnectionStatus
  calendar: DataSourceConnectionStatus
  slack: DataSourceConnectionStatus
  clay: DataSourceConnectionStatus
  supermetrics: DataSourceConnectionStatus
  meta_ad_library: DataSourceConnectionStatus
  google_news: DataSourceConnectionStatus
}

export interface LiveAccountData extends AccountData {
  dataSourceStatus: DataSourceStatus
  lastFetchedAt: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map of env-var name → DataSourceStatus key */
const ENV_TO_SOURCE: Record<string, keyof DataSourceStatus> = {
  NEXT_PUBLIC_SUPABASE_URL: 'supabase',
  HUBSPOT_ACCESS_TOKEN: 'hubspot',
  GMAIL_ACCESS_TOKEN: 'gmail',
  GOOGLE_CALENDAR_TOKEN: 'calendar',
  SLACK_BOT_TOKEN: 'slack',
  CLAY_API_KEY: 'clay',
  SUPERMETRICS_API_KEY: 'supermetrics',
  META_AD_LIBRARY_TOKEN: 'meta_ad_library',
  GOOGLE_NEWS_API_KEY: 'google_news',
}

function detectSourceStatus(): DataSourceStatus {
  const status: DataSourceStatus = {
    supabase: 'offline',
    hubspot: 'offline',
    gmail: 'offline',
    calendar: 'offline',
    slack: 'offline',
    clay: 'offline',
    supermetrics: 'offline',
    meta_ad_library: 'offline',
    google_news: 'offline',
  }

  for (const [envVar, key] of Object.entries(ENV_TO_SOURCE)) {
    if (process.env[envVar]) {
      status[key] = 'connected'
    }
  }

  return status
}

function allOfflineStatus(): DataSourceStatus {
  return {
    supabase: 'offline',
    hubspot: 'offline',
    gmail: 'offline',
    calendar: 'offline',
    slack: 'offline',
    clay: 'offline',
    supermetrics: 'offline',
    meta_ad_library: 'offline',
    google_news: 'offline',
  }
}

function daysBetween(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// HubSpot mapping helpers
// ---------------------------------------------------------------------------

function mapHubSpotDeal(raw: HubSpotDealRaw, contacts: ContactKapData[]): HubSpotDeal {
  const props = raw.properties
  const dealstage = props.dealstage ?? ''
  const stageInfo = PIPELINE_STAGES[dealstage]

  const deal: HubSpotDeal = {
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

  deal.confidence_score = computeDealConfidence(deal, contacts)

  return deal
}

function enrichContactsFromHubSpot(
  contacts: ContactKapData[],
  hubspotContacts: HubSpotContact[],
): ContactKapData[] {
  // Build a lookup by hubspot_contact_id
  const hubspotMap = new Map<string, HubSpotContact>()
  for (const hc of hubspotContacts) {
    hubspotMap.set(hc.id, hc)
  }

  return contacts.map((contact) => {
    if (!contact.hubspot_contact_id) return contact

    const hc = hubspotMap.get(contact.hubspot_contact_id)
    if (!hc) return contact

    const props = hc.properties
    const lastContacted = props.notes_last_contacted ?? null
    const daysSince = lastContacted ? daysBetween(lastContacted) : null

    return {
      ...contact,
      email: props.email ?? contact.email ?? null,
      last_contacted: lastContacted ?? contact.last_contacted ?? null,
      days_since_contact: daysSince ?? contact.days_since_contact ?? null,
      is_stale:
        daysSince != null
          ? daysSince > STALENESS_THRESHOLDS[contact.priority]
          : contact.is_stale ?? false,
    }
  })
}

// ---------------------------------------------------------------------------
// Supabase fetch (delegates to supabase-queries module built in parallel)
// ---------------------------------------------------------------------------

interface SupabaseAccountResult {
  account: AccountData['account'] | null
  contacts: AccountData['contacts'] | null
  eosic: AccountData['eosic'] | null
  opportunities: AccountData['opportunities'] | null
  manMarking: AccountData['manMarking'] | null
  signals: AccountData['signals'] | null
  deliveryMetrics: AccountData['deliveryMetrics'] | null
  campaignMetrics: AccountData['campaignMetrics'] | null
  crossBrandContacts: AccountData['crossBrandContacts'] | null
}

async function tryFetchFromSupabase(accountId: string): Promise<SupabaseAccountResult | null> {
  try {
    // Dynamic import — the module is being built in parallel.
    // If it doesn't exist yet, the import will throw and we fall through.
    const queries = await import('./supabase-queries')

    // Resolve account first (supports both UUID and slug lookup)
    const account = await queries.getAccount(accountId)
    if (!account) return null

    // Use the resolved UUID for all subsequent queries
    const resolvedId = account.id

    const [
      contacts,
      eosic,
      opportunities,
      manMarking,
      signals,
      deliveryMetrics,
      campaignMetrics,
      crossBrandContacts,
    ] = await Promise.all([
      queries.getContactsWithIntelligence(resolvedId),
      queries.getEosicEntries(resolvedId),
      queries.getOpportunities(resolvedId),
      queries.getManMarking(resolvedId),
      queries.getSignals(resolvedId),
      queries.getDeliveryMetrics(resolvedId),
      queries.getCampaignMetrics(resolvedId),
      queries.getCrossBrandContacts(resolvedId),
    ])

    return {
      account,
      contacts,
      eosic,
      opportunities,
      manMarking,
      signals,
      deliveryMetrics,
      campaignMetrics,
      crossBrandContacts,
    }
  } catch (err) {
    console.error('[live-data] Supabase fetch failed:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function getAccountData(accountId: string): Promise<LiveAccountData> {
  const sourceStatus = detectSourceStatus()
  const supabaseConfigured = sourceStatus.supabase === 'connected'
  const hubspotConfigured = sourceStatus.hubspot === 'connected'

  // If nothing is configured, return mock data immediately
  if (!supabaseConfigured && !hubspotConfigured) {
    const mock = getMockAccountData()
    return {
      ...mock,
      dataSourceStatus: allOfflineStatus(),
      lastFetchedAt: new Date().toISOString(),
    }
  }

  // Start with mock data as the baseline — we will overlay live data on top
  const mock = getMockAccountData()
  let account = mock.account
  let contacts = mock.contacts
  let eosic = mock.eosic
  let opportunities = mock.opportunities
  let manMarking = mock.manMarking
  let signals = mock.signals
  let deliveryMetrics = mock.deliveryMetrics
  let campaignMetrics = mock.campaignMetrics
  let crossBrandContacts = mock.crossBrandContacts
  let deals = mock.deals
  let upcomingMeetings = mock.upcomingMeetings

  // ------- Step 1: Try Supabase -------
  if (supabaseConfigured) {
    try {
      const supabaseResult = await tryFetchFromSupabase(accountId)

      if (supabaseResult) {
        if (supabaseResult.account) account = supabaseResult.account
        if (supabaseResult.contacts) contacts = supabaseResult.contacts
        if (supabaseResult.eosic) eosic = supabaseResult.eosic
        if (supabaseResult.opportunities) opportunities = supabaseResult.opportunities
        if (supabaseResult.manMarking) manMarking = supabaseResult.manMarking
        if (supabaseResult.signals) signals = supabaseResult.signals
        if (supabaseResult.deliveryMetrics) deliveryMetrics = supabaseResult.deliveryMetrics
        if (supabaseResult.campaignMetrics) campaignMetrics = supabaseResult.campaignMetrics
        if (supabaseResult.crossBrandContacts) crossBrandContacts = supabaseResult.crossBrandContacts
      }
    } catch (err) {
      console.error('[live-data] Supabase integration error — falling back to mock data:', err)
      sourceStatus.supabase = 'error'
    }
  }

  // ------- Step 2: Try HubSpot -------
  if (hubspotConfigured) {
    try {
      // Search by account name (company) and a representative deal keyword
      const [hubspotContacts, hubspotDeals] = await Promise.all([
        searchContacts(account.name.split(' ')[0] ?? account.name), // e.g. "Unilever"
        searchDeals(account.name.split(' ')[0] ?? account.name),    // e.g. "Vaseline"
      ])

      // Enrich contacts with HubSpot data
      if (hubspotContacts.length > 0) {
        contacts = enrichContactsFromHubSpot(contacts, hubspotContacts)
      }

      // Map HubSpot deals
      if (hubspotDeals.length > 0) {
        deals = hubspotDeals.map((raw) => mapHubSpotDeal(raw, contacts))
      }
    } catch (err) {
      console.error('[live-data] HubSpot integration error — using existing deal/contact data:', err)
      sourceStatus.hubspot = 'error'
    }
  }

  // ------- Step 3: Recompute staleness for contacts -------
  contacts = contacts.map((c) => ({
    ...c,
    is_stale:
      c.days_since_contact != null
        ? c.days_since_contact > STALENESS_THRESHOLDS[c.priority]
        : c.is_stale ?? false,
  }))

  // ------- Step 4: Recompute deal confidence -------
  deals = deals.map((d) => ({
    ...d,
    confidence_score: computeDealConfidence(d, contacts),
  }))

  // ------- Step 5: Compute health score -------
  const healthScore = computeHealthScore({
    contacts,
    deals,
    pipelineTarget: account.target_annual_revenue,
  })

  // ------- Step 6: Build integration status (boolean flags for the existing type) -------
  const integrationStatus: IntegrationStatus = {
    hubspot: hubspotConfigured,
    gmail: sourceStatus.gmail === 'connected',
    calendar: sourceStatus.calendar === 'connected',
    slack: sourceStatus.slack === 'connected',
    clay: sourceStatus.clay === 'connected',
    supermetrics: sourceStatus.supermetrics === 'connected',
    meta_ad_library: sourceStatus.meta_ad_library === 'connected',
    google_news: sourceStatus.google_news === 'connected',
  }

  // ------- Step 7: Assemble complete AccountData -------
  return {
    account,
    contacts,
    eosic,
    opportunities,
    manMarking,
    signals,
    deals,
    healthScore,
    deliveryMetrics,
    campaignMetrics,
    upcomingMeetings,
    integrationStatus,
    crossBrandContacts,
    dataSourceStatus: sourceStatus,
    lastFetchedAt: new Date().toISOString(),
  }
}
