/**
 * Title verification.
 *
 * Phase 2/3: Will cross-reference a contact's title stored in the KAP
 * against public sources (LinkedIn, Companies House, press releases)
 * to verify accuracy and flag stale or incorrect role information.
 */

export async function verifyContactTitle(
  contactName: string,
  kapTitle: string
): Promise<{
  verified: boolean;
  verifiedTitle: string | null;
  source: string | null;
}> {
  const apiKey = process.env.CLAY_API_KEY;
  if (!apiKey) {
    console.log("[TitleVerification] CLAY_API_KEY not set — skipping");
    return { verified: false, verifiedTitle: null, source: null };
  }

  // TODO: implement title verification via Clay / LinkedIn
  return { verified: false, verifiedTitle: null, source: null };
}
