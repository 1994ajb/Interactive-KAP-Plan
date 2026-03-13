import { ContactKapData, HubSpotDeal, HealthScore } from './types'
import { BUYER_WEIGHT, PIPELINE_STAGES } from './constants'

export function computeHealthScore(
  contacts: ContactKapData[],
  deals: HubSpotDeal[],
  pipelineTarget: number = 200000
): HealthScore {
  const relationshipScore = computeRelationshipScore(contacts)
  const pipelineScore = computePipelineScore(deals, pipelineTarget)
  const engagementScore = computeEngagementScore(contacts)
  const momentumScore = computeMomentumScore(deals, contacts)

  const overall = Math.round(
    (relationshipScore * 0.35) +
    (pipelineScore * 0.30) +
    (engagementScore * 0.20) +
    (momentumScore * 0.15)
  )

  const status = overall >= 70 ? 'Healthy' : overall >= 45 ? 'At Risk' : 'Critical'

  const summary = generateSummary(contacts, deals, relationshipScore, pipelineScore, engagementScore, momentumScore)

  return {
    overall,
    relationship_score: Math.round(relationshipScore),
    pipeline_score: Math.round(pipelineScore),
    engagement_score: Math.round(engagementScore),
    momentum_score: Math.round(momentumScore),
    status,
    summary,
  }
}

function computeRelationshipScore(contacts: ContactKapData[]): number {
  if (contacts.length === 0) return 0

  let totalWeight = 0
  let trustWeight = 0

  for (const c of contacts) {
    const weight = BUYER_WEIGHT[c.buyer_type] ?? 1
    totalWeight += weight
    if (c.relationship_level === 'CHAMPION' || c.relationship_level === 'TRUST') {
      trustWeight += weight
    }
  }

  return totalWeight > 0 ? (trustWeight / totalWeight) * 100 : 0
}

function computePipelineScore(deals: HubSpotDeal[], target: number): number {
  let weightedValue = 0
  for (const deal of deals) {
    if (deal.dealstage === 'closedwon' || deal.dealstage === 'closedlost') continue
    const stage = PIPELINE_STAGES[deal.dealstage]
    const prob = stage?.probability ?? 0.1
    weightedValue += (deal.amount ?? 0) * prob
  }
  const ratio = weightedValue / target
  return Math.min(ratio * 100, 100)
}

function computeEngagementScore(contacts: ContactKapData[]): number {
  const priorityContacts = contacts.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
  if (priorityContacts.length === 0) return 50

  let totalScore = 0
  for (const c of priorityContacts) {
    const days = c.days_since_contact ?? 30
    // Exponential decay after 14 days
    if (days <= 14) {
      totalScore += 100
    } else {
      totalScore += Math.max(0, 100 * Math.exp(-0.05 * (days - 14)))
    }
  }

  return totalScore / priorityContacts.length
}

function computeMomentumScore(deals: HubSpotDeal[], contacts: ContactKapData[]): number {
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  let won = 0
  let lost = 0

  for (const deal of deals) {
    if (!deal.closedate) continue
    const closeDate = new Date(deal.closedate)
    if (closeDate < ninetyDaysAgo) continue

    if (deal.dealstage === 'closedwon') won++
    if (deal.dealstage === 'closedlost') lost++
  }

  const total = won + lost
  const winRatio = total > 0 ? won / total : 0.5

  return Math.min(winRatio * 100, 100)
}

function generateSummary(
  contacts: ContactKapData[],
  deals: HubSpotDeal[],
  relScore: number,
  pipScore: number,
  engScore: number,
  momScore: number,
): string[] {
  const items: string[] = []

  const trustCount = contacts.filter(c => c.relationship_level === 'CHAMPION' || c.relationship_level === 'TRUST').length
  items.push(`${trustCount} of ${contacts.length} contacts at Trust or Champion level (${Math.round(relScore)}%)`)

  const activeDeals = deals.filter(d => d.dealstage !== 'closedwon' && d.dealstage !== 'closedlost')
  const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  items.push(`£${totalPipeline.toLocaleString()} in active pipeline across ${activeDeals.length} deals`)

  const staleContacts = contacts.filter(c => c.is_stale)
  if (staleContacts.length > 0) {
    items.push(`${staleContacts.length} contact${staleContacts.length > 1 ? 's' : ''} overdue for engagement`)
  } else {
    items.push('All priority contacts engaged within thresholds')
  }

  if (momScore >= 60) {
    items.push('Positive deal momentum in trailing 90 days')
  } else if (momScore >= 40) {
    items.push('Mixed deal momentum — monitor closely')
  } else {
    items.push('Negative deal momentum — action required')
  }

  return items
}
