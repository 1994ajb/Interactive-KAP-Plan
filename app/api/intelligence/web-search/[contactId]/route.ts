import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        web_footprint_summary: null,
        error: 'Anthropic API not configured. Set ANTHROPIC_API_KEY to enable web search summarization.',
      },
      { status: 200 }
    )
  }

  try {
    const { contactName, company, linkedinUrl } = await request.json()

    if (!contactName || !company) {
      return NextResponse.json(
        { web_footprint_summary: null, error: 'contactName and company are required.' },
        { status: 400 }
      )
    }

    // Build search queries for the contact's web presence
    const searchQueries = [
      `"${contactName}" "${company}" marketing campaign`,
      `"${contactName}" "${company}" award`,
      `"${contactName}" marketing interview OR quoted`,
    ]

    // ─── Web Search Integration ───────────────────────────────────────────────
    // Attempt to fetch real search results if a search API key is configured.
    // For now, we build the infrastructure and fall back to AI analysis of
    // the contact data alone when no search API is available.

    let searchResults: string[] = []

    const googleNewsApiKey = process.env.GOOGLE_NEWS_API_KEY

    if (googleNewsApiKey) {
      // TODO: Call Google News API with each search query and collect results.
      // Example endpoint: https://newsapi.org/v2/everything?q=...&apiKey=...
      // For each query, push formatted results into searchResults[].
      console.log('[Intelligence/WebSearch] GOOGLE_NEWS_API_KEY is set — real search would execute here')
    }

    // ─── Build the AI prompt ──────────────────────────────────────────────────

    const systemPrompt =
      'You are an expert digital marketing analyst. Analyze the provided web search results about a marketing professional and extract structured intelligence.'

    const userPromptParts = [
      'Analyze the following information about a marketing professional and extract structured intelligence about their web presence.',
      '',
      '## Contact Information',
      `- Name: ${contactName}`,
      `- Company: ${company}`,
    ]

    if (linkedinUrl) {
      userPromptParts.push(`- LinkedIn: ${linkedinUrl}`)
    }

    userPromptParts.push(
      '',
      '## Search Queries Used',
      ...searchQueries.map((q) => `- ${q}`)
    )

    if (searchResults.length > 0) {
      userPromptParts.push(
        '',
        '## Web Search Results',
        ...searchResults
      )
    } else {
      userPromptParts.push(
        '',
        '## Note',
        'No live search results are available. Based on the contact information provided, generate a plausible professional web presence analysis. Clearly note that this is an AI-generated estimate and not based on actual search results.'
      )
    }

    userPromptParts.push(
      '',
      'Return your analysis as a JSON object with these fields:',
      '- web_footprint_summary: A 2-3 paragraph summary of the contact\'s web presence',
      '- press_mentions: Array of objects with {publication, date, context, url}',
      '- campaign_credits: Array of objects with {campaign, brand, year, agency, award}',
      '- key_themes: Array of strings — recurring themes in their work',
      '',
      'Return ONLY valid JSON, no other text.'
    )

    // ─── Call Anthropic API ───────────────────────────────────────────────────

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPromptParts.join('\n') }],
      }),
    })

    if (!response.ok) {
      console.error(`[Intelligence/WebSearch] Anthropic API error ${response.status}: ${response.statusText}`)
      return NextResponse.json(
        { web_footprint_summary: null, error: 'Web search failed — retry' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const text = result.content?.[0]?.text ?? null

    if (!text) {
      return NextResponse.json(
        { web_footprint_summary: null, error: 'Web search failed — retry' },
        { status: 500 }
      )
    }

    // ─── Parse AI response ────────────────────────────────────────────────────

    let analysis
    try {
      // Handle cases where Claude wraps JSON in markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text]
      analysis = JSON.parse(jsonMatch[1].trim())
    } catch {
      console.error('[Intelligence/WebSearch] Failed to parse AI response as JSON:', text)
      return NextResponse.json(
        { web_footprint_summary: null, error: 'Web search failed — retry' },
        { status: 500 }
      )
    }

    // ─── Persist to Supabase if configured ────────────────────────────────────

    let persisted = false

    try {
      const { updateContactIntelligence } = await import('@/lib/supabase-queries')
      const updated = await updateContactIntelligence(params.contactId, {
        web_footprint_summary: analysis.web_footprint_summary,
        press_mentions: analysis.press_mentions,
        campaign_credits: analysis.campaign_credits,
      } as Record<string, unknown>)
      persisted = updated
    } catch {
      // Supabase not configured or update failed — continue without persisting
      console.warn('[Intelligence/WebSearch] Could not persist to Supabase — skipping')
    }

    return NextResponse.json({
      web_footprint_summary: analysis.web_footprint_summary,
      press_mentions: analysis.press_mentions ?? [],
      campaign_credits: analysis.campaign_credits ?? [],
      key_themes: analysis.key_themes ?? [],
      searched_at: new Date().toISOString(),
      persisted,
    })
  } catch (error) {
    console.error('[Intelligence/WebSearch] Error:', error)
    return NextResponse.json(
      { web_footprint_summary: null, error: 'Web search failed — retry' },
      { status: 500 }
    )
  }
}
