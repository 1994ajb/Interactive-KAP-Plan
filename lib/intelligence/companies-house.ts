/**
 * UK Companies House integration.
 *
 * Phase 2/3: Will query the Companies House API to retrieve officer
 * information (directors, secretaries) for a given UK company number,
 * useful for verifying decision-maker roles and org-chart mapping.
 */

export async function getCompanyOfficers(
  companyNumber: string
): Promise<any[]> {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    console.log(
      "[CompaniesHouse] COMPANIES_HOUSE_API_KEY not set — skipping"
    );
    return [];
  }

  // TODO: implement Companies House API call
  return [];
}
