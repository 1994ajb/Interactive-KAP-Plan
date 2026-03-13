/**
 * Career page monitoring.
 *
 * Phase 2/3: Will scrape a company's careers page to extract current
 * job postings, providing signals about team growth, budget allocation,
 * and technology stack adoption.
 */

export async function scrapeJobPostings(
  careerPageUrl: string
): Promise<any[]> {
  const apiKey = process.env.CLAY_API_KEY;
  if (!apiKey) {
    console.log("[CareerPageScraper] CLAY_API_KEY not set — skipping");
    return [];
  }

  // TODO: implement career page scraping via Clay or Puppeteer
  return [];
}
