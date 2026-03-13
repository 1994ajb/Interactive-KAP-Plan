import type { ContactKapData } from '@/lib/types'

const CLAY_BASE_URL = 'https://api.clay.com/v1'

function getApiKey(): string | null {
  const key = process.env.CLAY_API_KEY
  if (!key) {
    console.log('[Clay] CLAY_API_KEY not set — skipping Clay enrichment')
    return null
  }
  return key
}

async function clayFetch<T>(path: string, body: object): Promise<T | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null

  try {
    const res = await fetch(`${CLAY_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.log(`[Clay] API error ${res.status}: ${res.statusText}`)
      return null
    }

    return (await res.json()) as T
  } catch (error) {
    console.log('[Clay] Request failed:', error)
    return null
  }
}

/**
 * Get a verified email address for a contact via Clay enrichment.
 */
export async function enrichContactEmail(
  name: string,
  company: string
): Promise<string | null> {
  const result = await clayFetch<{ email: string }>('/enrich/email', {
    name,
    company,
  })
  return result?.email ?? null
}

/**
 * Summarize a contact's career trajectory from their LinkedIn profile.
 */
export async function summarizeWorkHistory(
  linkedinUrl: string
): Promise<string | null> {
  const result = await clayFetch<{ summary: string }>('/enrich/work-history', {
    linkedin_url: linkedinUrl,
  })
  return result?.summary ?? null
}

/**
 * Find recent thought leadership content (posts, talks, articles) for a contact.
 */
export async function findThoughtLeadership(
  name: string,
  company: string
): Promise<string[] | null> {
  const result = await clayFetch<{ items: string[] }>('/enrich/thought-leadership', {
    name,
    company,
  })
  return result?.items ?? null
}

/**
 * Get recent media coverage and news for a company.
 */
export async function enrichCompanyNews(
  companyName: string
): Promise<string[] | null> {
  const result = await clayFetch<{ articles: string[] }>('/enrich/company-news', {
    company: companyName,
  })
  return result?.articles ?? null
}

/**
 * Get open job positions for a company.
 */
export async function enrichCompanyJobs(
  companyName: string
): Promise<{ title: string; url: string }[] | null> {
  const result = await clayFetch<{ jobs: { title: string; url: string }[] }>(
    '/enrich/company-jobs',
    { company: companyName }
  )
  return result?.jobs ?? null
}
