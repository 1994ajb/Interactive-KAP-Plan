import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // If Supabase is configured, create the first account
    if (data.supabaseUrl && data.supabaseKey && data.accountName) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const client = createClient(data.supabaseUrl, data.supabaseKey)

        const slug = data.accountName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const companyIds = data.hubspotCompanyIds
          ? data.hubspotCompanyIds.split(',').map((id: string) => id.trim()).filter(Boolean)
          : []

        await client.from('accounts').upsert({
          id: slug,
          name: data.accountName,
          tier: data.accountTier || 'RETENTION',
          hubspot_company_ids: companyIds,
          objective_retention: '',
          objective_development: '',
          why_change: '',
          why_now: '',
          why_us: '',
          why_validated_by_client: false,
          strengths: [],
          vulnerabilities: [],
          target_annual_revenue: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      } catch {
        // Supabase write failed — continue anyway
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Setup failed' }, { status: 500 })
  }
}
