const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN

const HUBSPOT_API = 'https://api.hubapi.com'

async function hubspotFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${HUBSPOT_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 300 }, // cache for 5 minutes
  })
  if (!res.ok) {
    console.error(`HubSpot API error: ${res.status} ${res.statusText}`)
    return null
  }
  return res.json()
}

export interface HubSpotContact {
  id: string
  properties: {
    firstname?: string
    lastname?: string
    email?: string
    jobtitle?: string
    hubspot_owner_id?: string
    notes_last_contacted?: string
  }
}

export interface HubSpotDealRaw {
  id: string
  properties: {
    dealname?: string
    amount?: string
    dealstage?: string
    pipeline?: string
    closedate?: string
    hubspot_owner_id?: string
  }
}

export async function searchContacts(query: string): Promise<HubSpotContact[]> {
  const data = await hubspotFetch('/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      query,
      limit: 100,
      properties: ['firstname', 'lastname', 'email', 'jobtitle', 'hubspot_owner_id', 'notes_last_contacted'],
    }),
  })
  return data?.results ?? []
}

export async function searchDeals(query: string): Promise<HubSpotDealRaw[]> {
  const data = await hubspotFetch('/crm/v3/objects/deals/search', {
    method: 'POST',
    body: JSON.stringify({
      query,
      limit: 100,
      properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'hubspot_owner_id'],
    }),
  })
  return data?.results ?? []
}

export async function getContact(contactId: string): Promise<HubSpotContact | null> {
  const data = await hubspotFetch(
    `/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,jobtitle,hubspot_owner_id,notes_last_contacted`
  )
  return data ?? null
}
