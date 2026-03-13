/**
 * AI-powered campaign credit extraction.
 *
 * Phase 2/3: Will use an LLM to parse web search results and extract
 * structured campaign credits — identifying which agencies, individuals,
 * and roles were involved in notable advertising campaigns.
 */

export async function extractCampaignCredits(
  webResults: any[]
): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(
      "[CampaignHistory] ANTHROPIC_API_KEY not set — skipping"
    );
    return [];
  }

  // TODO: implement LLM-based campaign credit extraction
  return [];
}
