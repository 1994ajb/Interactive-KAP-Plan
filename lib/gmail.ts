export type GmailThread = {
  id: string
  subject: string
  snippet: string
  date: string
  from: string
  to: string
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

function getAccessToken(): string | null {
  const token = process.env.GMAIL_ACCESS_TOKEN
  if (!token) {
    console.log('[Gmail] GMAIL_ACCESS_TOKEN not set — skipping Gmail integration')
    return null
  }
  return token
}

async function gmailFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const token = getAccessToken()
  if (!token) return null

  try {
    const url = new URL(`${GMAIL_API_BASE}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.log(`[Gmail] API error ${res.status}: ${res.statusText}`)
      return null
    }

    return (await res.json()) as T
  } catch (error) {
    console.log('[Gmail] Request failed:', error)
    return null
  }
}

/**
 * Search for email threads matching a query string.
 */
export async function searchThreads(
  query: string,
  maxResults: number = 10
): Promise<GmailThread[]> {
  const token = getAccessToken()
  if (!token) return []

  try {
    // Step 1: Search for thread IDs
    const searchResult = await gmailFetch<{ threads?: { id: string }[] }>(
      '/threads',
      { q: query, maxResults: String(maxResults) }
    )

    if (!searchResult?.threads?.length) return []

    // Step 2: Fetch thread details
    const threads: GmailThread[] = []

    for (const { id } of searchResult.threads) {
      const thread = await gmailFetch<{
        id: string
        messages?: {
          payload?: {
            headers?: { name: string; value: string }[]
          }
          snippet?: string
          internalDate?: string
        }[]
      }>(`/threads/${id}`, { format: 'metadata', metadataHeaders: 'Subject,From,To,Date' })

      if (!thread?.messages?.length) continue

      const firstMessage = thread.messages[0]
      const headers = firstMessage.payload?.headers ?? []
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

      threads.push({
        id: thread.id,
        subject: getHeader('Subject'),
        snippet: firstMessage.snippet ?? '',
        date: getHeader('Date'),
        from: getHeader('From'),
        to: getHeader('To'),
      })
    }

    return threads
  } catch (error) {
    console.log('[Gmail] searchThreads failed:', error)
    return []
  }
}

/**
 * Get the full content of a thread for AI summarization.
 */
export async function getThreadSummary(threadId: string): Promise<string | null> {
  const thread = await gmailFetch<{
    messages?: {
      payload?: {
        headers?: { name: string; value: string }[]
        body?: { data?: string }
        parts?: { mimeType: string; body?: { data?: string } }[]
      }
      snippet?: string
    }[]
  }>(`/threads/${threadId}`, { format: 'full' })

  if (!thread?.messages?.length) return null

  const parts: string[] = []

  for (const message of thread.messages) {
    const headers = message.payload?.headers ?? []
    const from = headers.find((h) => h.name === 'From')?.value ?? 'Unknown'
    const date = headers.find((h) => h.name === 'Date')?.value ?? ''

    // Try to extract plain text body
    let body = ''
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
    } else if (message.payload?.parts) {
      const textPart = message.payload.parts.find((p) => p.mimeType === 'text/plain')
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      }
    }

    if (!body) {
      body = message.snippet ?? ''
    }

    parts.push(`From: ${from}\nDate: ${date}\n\n${body}`)
  }

  return parts.join('\n\n---\n\n')
}
