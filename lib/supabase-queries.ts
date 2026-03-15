import { getSupabase } from './supabase'
import type {
  Account,
  ContactKapData,
  ContactIntelligence,
  EOSICEntry,
  Opportunity,
  ManMarking,
  Signal,
  DeliveryMetrics,
  CampaignMetrics,
  CrossBrandContact,
} from './types'

// ─── Account ────────────────────────────────────────────────────────────────

/** Convert a name like "Vaseline UK" to a slug like "vaseline-uk" */
function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** UUID v4 pattern check */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getAccount(accountId: string): Promise<Account | null> {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    // If it looks like a UUID, query by id directly
    if (UUID_RE.test(accountId)) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      if (error) {
        console.error('Error fetching account by id:', error.message)
        return null
      }
      return data as Account
    }

    // Otherwise treat it as a slug — fetch all accounts and match by name
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')

    if (error || !accounts) {
      console.error('Error fetching accounts for slug lookup:', error?.message)
      return null
    }

    const match = accounts.find((a) => nameToSlug(a.name) === accountId)
    return (match as Account) ?? null
  } catch (err) {
    console.error('Unexpected error in getAccount:', err)
    return null
  }
}

// ─── Contacts with joined Intelligence ──────────────────────────────────────

export async function getContactsWithIntelligence(
  accountId: string
): Promise<ContactKapData[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data: contacts, error: contactsError } = await supabase
      .from('contact_kap_data')
      .select('*')
      .eq('account_id', accountId)

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError.message)
      return []
    }

    if (!contacts || contacts.length === 0) {
      return []
    }

    const contactIds = contacts.map((c) => c.id)

    const { data: intelligenceRows, error: intelError } = await supabase
      .from('contact_intelligence')
      .select('*')
      .in('contact_kap_id', contactIds)

    if (intelError) {
      console.error('Error fetching contact intelligence:', intelError.message)
      // Return contacts without intelligence rather than failing entirely
      return contacts as ContactKapData[]
    }

    const intelligenceByContactId = new Map<string, ContactIntelligence>()
    if (intelligenceRows) {
      for (const row of intelligenceRows) {
        intelligenceByContactId.set(
          row.contact_kap_id,
          row as ContactIntelligence
        )
      }
    }

    return contacts.map((contact) => ({
      ...contact,
      intelligence: intelligenceByContactId.get(contact.id) ?? null,
    })) as ContactKapData[]
  } catch (err) {
    console.error('Unexpected error in getContactsWithIntelligence:', err)
    return []
  }
}

// ─── Update Contact Intelligence ────────────────────────────────────────────

export async function updateContactIntelligence(
  contactKapId: string,
  data: Partial<ContactIntelligence>
): Promise<boolean> {
  try {
    const supabase = getSupabase()
    if (!supabase) return false

    const { error } = await supabase
      .from('contact_intelligence')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('contact_kap_id', contactKapId)

    if (error) {
      console.error('Error updating contact intelligence:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error in updateContactIntelligence:', err)
    return false
  }
}

// ─── Update Contact KAP Data ────────────────────────────────────────────────

export async function updateContactKapData(
  contactId: string,
  data: Partial<ContactKapData>
): Promise<boolean> {
  try {
    const supabase = getSupabase()
    if (!supabase) return false

    const { error } = await supabase
      .from('contact_kap_data')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', contactId)

    if (error) {
      console.error('Error updating contact KAP data:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error in updateContactKapData:', err)
    return false
  }
}

// ─── EOSIC Entries ──────────────────────────────────────────────────────────

export async function getEosicEntries(
  accountId: string
): Promise<EOSICEntry[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('eosic_entries')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching EOSIC entries:', error.message)
      return []
    }

    return (data ?? []) as EOSICEntry[]
  } catch (err) {
    console.error('Unexpected error in getEosicEntries:', err)
    return []
  }
}

// ─── Opportunities ──────────────────────────────────────────────────────────

export async function getOpportunities(
  accountId: string
): Promise<Opportunity[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching opportunities:', error.message)
      return []
    }

    return (data ?? []) as Opportunity[]
  } catch (err) {
    console.error('Unexpected error in getOpportunities:', err)
    return []
  }
}

// ─── Man-Marking ────────────────────────────────────────────────────────────

export async function getManMarking(
  accountId: string
): Promise<ManMarking[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('man_marking')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching man-marking:', error.message)
      return []
    }

    return (data ?? []) as ManMarking[]
  } catch (err) {
    console.error('Unexpected error in getManMarking:', err)
    return []
  }
}

// ─── Signals ────────────────────────────────────────────────────────────────

export async function getSignals(accountId: string): Promise<Signal[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('account_id', accountId)
      .eq('dismissed', false)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching signals:', error.message)
      return []
    }

    return (data ?? []) as Signal[]
  } catch (err) {
    console.error('Unexpected error in getSignals:', err)
    return []
  }
}

// ─── Upsert Signal ──────────────────────────────────────────────────────────

export async function upsertSignal(
  signal: Omit<Signal, 'id'>
): Promise<boolean> {
  try {
    const supabase = getSupabase()
    if (!supabase) return false

    const { error } = await supabase
      .from('signals')
      .upsert(signal, { onConflict: 'account_id,type,title' })

    if (error) {
      console.error('Error upserting signal:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error in upsertSignal:', err)
    return false
  }
}

// ─── Delivery Metrics ───────────────────────────────────────────────────────

export async function getDeliveryMetrics(
  accountId: string
): Promise<DeliveryMetrics[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('delivery_metrics')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching delivery metrics:', error.message)
      return []
    }

    return (data ?? []) as DeliveryMetrics[]
  } catch (err) {
    console.error('Unexpected error in getDeliveryMetrics:', err)
    return []
  }
}

// ─── Campaign Metrics ───────────────────────────────────────────────────────

export async function getCampaignMetrics(
  accountId: string
): Promise<CampaignMetrics[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching campaign metrics:', error.message)
      return []
    }

    return (data ?? []) as CampaignMetrics[]
  } catch (err) {
    console.error('Unexpected error in getCampaignMetrics:', err)
    return []
  }
}

// ─── Connected Team Members ─────────────────────────────────────────────────

export async function getConnectedTeamMembers(
  accountId: string
): Promise<any[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('connected_team_members')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      console.error('Error fetching connected team members:', error.message)
      return []
    }

    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getConnectedTeamMembers:', err)
    return []
  }
}

// ─── Cross-Brand Contacts ───────────────────────────────────────────────────

export async function getCrossBrandContacts(
  accountId: string
): Promise<CrossBrandContact[]> {
  try {
    const supabase = getSupabase()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('cross_brand_contacts')
      .select('*')
      .eq('parent_account_id', accountId)

    if (error) {
      console.error('Error fetching cross-brand contacts:', error.message)
      return []
    }

    return (data ?? []) as CrossBrandContact[]
  } catch (err) {
    console.error('Unexpected error in getCrossBrandContacts:', err)
    return []
  }
}
