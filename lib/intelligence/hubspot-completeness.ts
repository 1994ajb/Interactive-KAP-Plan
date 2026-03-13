/**
 * HubSpot completeness checker.
 *
 * Phase 2/3: Will query HubSpot's CRM API to evaluate how complete a
 * contact record is, flagging missing fields (email, phone, title,
 * lifecycle stage, etc.) to drive data hygiene improvements.
 */

export async function checkRecordCompleteness(
  hubspotContactId: string
): Promise<{ complete: boolean; missingFields: string[] }> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    console.log(
      "[HubSpotCompleteness] HUBSPOT_ACCESS_TOKEN not set — skipping"
    );
    return { complete: false, missingFields: [] };
  }

  // TODO: implement HubSpot contact completeness check
  return { complete: false, missingFields: [] };
}
