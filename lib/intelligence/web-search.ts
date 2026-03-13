/**
 * Broad web search per contact.
 *
 * Phase 2/3: Will use Clay or a similar API to search for a contact's
 * web presence across LinkedIn, press mentions, conference talks,
 * podcasts, and other public sources.
 */

export async function searchContactWebPresence(
  name: string,
  company: string
): Promise<{ mentions: any[]; summary: string | null }> {
  const apiKey = process.env.CLAY_API_KEY;
  if (!apiKey) {
    console.log("[WebSearch] CLAY_API_KEY not set — skipping");
    return { mentions: [], summary: null };
  }

  // TODO: implement actual web search via Clay / SerpAPI
  return { mentions: [], summary: null };
}
