/**
 * Google News monitoring.
 *
 * Phase 2/3: Will query a news API to surface recent articles, press
 * releases, and media coverage related to a company or topic, enabling
 * proactive account intelligence.
 */

export async function searchNews(query: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_NEWS_API_KEY;
  if (!apiKey) {
    console.log("[GoogleNews] GOOGLE_NEWS_API_KEY not set — skipping");
    return [];
  }

  // TODO: implement Google News / NewsAPI search
  return [];
}
