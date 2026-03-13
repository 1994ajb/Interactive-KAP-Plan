/**
 * AI-powered web footprint summarisation.
 *
 * Phase 2/3: Will use an LLM to distil a list of raw web mentions into
 * a concise, actionable summary highlighting a contact's public profile,
 * expertise areas, and recent activity.
 */

export async function summarizeWebFootprint(
  mentions: any[]
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(
      "[WebFootprintSummary] ANTHROPIC_API_KEY not set — skipping"
    );
    return null;
  }

  // TODO: implement LLM-based summarisation of web mentions
  return null;
}
