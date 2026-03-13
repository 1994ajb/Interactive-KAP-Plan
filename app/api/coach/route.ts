import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { briefing: getStaticBriefing() },
      { status: 200 }
    )
  }

  try {
    const { accountData } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a strategic account intelligence assistant for a social media marketing agency called Campfire. Generate a concise QBR (Quarterly Business Review) preparation briefing for the following account.

Account: ${accountData.account.name}
Tier: ${accountData.account.tier}
Health Score: ${accountData.healthScore.overall}/100 (${accountData.healthScore.status})
Health Summary: ${accountData.healthScore.summary.join('; ')}
Active Deals: ${accountData.deals.filter((d: { dealstage: string }) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost').length}
Total Pipeline: £${accountData.deals.filter((d: { dealstage: string }) => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost').reduce((s: number, d: { amount: number | null }) => s + (d.amount ?? 0), 0).toLocaleString()}
Key Relationship Gaps: ${accountData.contacts.filter((c: { relationship_level: string; priority: string }) => (c.priority === 'CRITICAL' || c.priority === 'HIGH') && c.relationship_level !== 'TRUST' && c.relationship_level !== 'CHAMPION').map((c: { name: string; relationship_level: string }) => c.name + ' (' + c.relationship_level + ')').join(', ')}
CIS Opportunities: ${accountData.opportunities.map((o: { name: string }) => o.name).join(', ')}
Retention Objective: ${accountData.account.objective_retention}
Development Objective: ${accountData.account.objective_development}

Write a focused 3-4 paragraph briefing covering: current account health assessment, key risks and opportunities, and recommended priorities for the next QBR. Be specific and reference the data above. Keep it professional and actionable.`
        }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ briefing: getStaticBriefing() })
    }

    const result = await response.json()
    const briefing = result.content[0]?.text ?? getStaticBriefing()

    return NextResponse.json({ briefing })
  } catch {
    return NextResponse.json({ briefing: getStaticBriefing() })
  }
}

function getStaticBriefing(): string {
  return `Vaseline UK sits at a critical inflection point. The account health score reflects a partnership with strong operational foundations but significant strategic gaps. The most pressing concern is the relationship with Jocelyn Hsieh — as Global Marketing Director and Economic Buyer, her current ACCEPTANCE level represents the single biggest risk to account growth. Without elevating this relationship, CIS opportunities worth potentially £50k+ will remain out of reach.

Pipeline activity shows positive momentum with multiple deals in progress, but the recent loss of the Rate Card Renegotiation deal signals price sensitivity and positions the relationship as transactional rather than strategic. The active pipeline across Gluta-Hya Social, Creator Campaign Q2, and the Healing Project represents genuine growth opportunity — but each needs to be framed as strategic value delivery, not just execution.

The 75/25 rule should guide QBR preparation: dedicate most time to exploring CIS opportunities (Simplified Creator Engine, Culture Command Centre) and demonstrating cross-market value. The Strategic Confidence Reset at £50k should be the primary close target. Lead with the #slugging cultural moment (4bn+ views) and Healing Project reach (27m) as proof of impact, then transition to how the CIS offerings solve their operational complexity challenges.

Priority actions before QBR: (1) Joe Gradwell must secure a senior touchpoint with Jocelyn Hsieh, (2) prepare a simplified social operating model one-pager, (3) compile ROI evidence linking social activity to brand KPIs, (4) brief the team on man-marking cadence expectations.`
}
