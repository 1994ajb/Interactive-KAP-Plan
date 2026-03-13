import { ContactKapData, HubSpotDeal, HealthScore } from './types'
import { BUYER_WEIGHT, PIPELINE_STAGES, ENGAGEMENT_PRIORITY_WEIGHT } from './constants'

export interface HealthScoreInputs {
  contacts: ContactKapData[]
  deals: HubSpotDeal[]
  sentimentOverride?: number | null
  pipelineTarget?: number
}

export function computeHealthScore({
  contacts,
  deals,
  sentimentOverride = null,
  pipelineTarget = 150000,
}: HealthScoreInputs): HealthScore {
  const relationshipScore = computeRelationshipScore(contacts)
  const pipelineScore = computePipelineScore(deals, pipelineTarget)
  const engagementScore = computeEngagementScore(contacts)
  const momentumScore = computeMomentumScore(deals, contacts)
  const sentimentScore = sentimentOverride ?? computeSentimentScore(contacts)

  // V3: 5-component formula (delivery removed as separate component)
  const overall = Math.round(
    (relationshipScore * 0.30) +
    (pipelineScore * 0.20) +
    (engagementScore * 0.25) +
    (momentumScore * 0.15) +
    (sentimentScore * 0.10)
  )

  const status = overall >= 70 ? 'Healthy' : overall >= 45 ? 'At Risk' : 'Critical'

  const summary = generateSummary(
    contacts, deals,
    relationshipScore, pipelineScore, engagementScore, momentumScore, sentimentScore,
  )

  return {
    overall,
    relationship_score: Math.round(relationshipScore),
    pipeline_score: Math.round(pipelineScore),
    engagement_score: Math.round(engagementScore),
    momentum_score: Math.round(momentumScore),
    sentiment_score: Math.round(sentimentScore),
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
  let totalWeight = 0

  for (const c of priorityContacts) {
    const days = c.days_since_contact ?? 30
    const weight = ENGAGEMENT_PRIORITY_WEIGHT[c.priority]
    let score: number

    if (days <= 14) {
      score = 100
    } else {
      score = Math.max(0, 100 * Math.exp(-0.05 * (days - 14)))
    }

    totalScore += score * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalScore / totalWeight : 50
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

function computeSentimentScore(contacts: ContactKapData[]): number {
  const priorityContacts = contacts.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
  if (priorityContacts.length === 0) return 50

  let total = 0
  let count = 0
  for (const c of priorityContacts) {
    const sentiment = c.intelligence?.interaction_sentiment
    if (!sentiment || sentiment === 'UNKNOWN') continue
    if (sentiment === 'POSITIVE') total += 100
    else if (sentiment === 'NEUTRAL') total += 60
    else if (sentiment === 'NEGATIVE') total += 20
    count++
  }

  return count > 0 ? total / count : 50
}

// V3 deal confidence scoring: stage 35%, relationship 30%, engagement 20%, sentiment 15%
export function computeDealConfidence(
  deal: HubSpotDeal,
  contacts: ContactKapData[],
): number {
  const stage = PIPELINE_STAGES[deal.dealstage]
  const stageProbability = stage?.probability ?? 0.1

  // Relationship strength: avg of associated contacts
  const associatedContacts = contacts.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
  let relStrength = 0.5
  if (associatedContacts.length > 0) {
    const LEVEL_SCORE: Record<string, number> = { CHAMPION: 1, TRUST: 0.8, RESPECT: 0.6, ACCEPTANCE: 0.4, ACKNOWLEDGE: 0.2 }
    relStrength = associatedContacts.reduce((sum, c) => sum + (LEVEL_SCORE[c.relationship_level] ?? 0.2), 0) / associatedContacts.length
  }

  // Engagement recency
  let engRecency = 0.5
  if (associatedContacts.length > 0) {
    const avgDays = associatedContacts.reduce((sum, c) => sum + (c.days_since_contact ?? 30), 0) / associatedContacts.length
    engRecency = avgDays <= 7 ? 1 : avgDays <= 14 ? 0.8 : avgDays <= 21 ? 0.5 : 0.2
  }

  // Sentiment from contact intelligence
  let sentimentFactor = 0.5
  const contactsWithSentiment = associatedContacts.filter(c => c.intelligence?.interaction_sentiment && c.intelligence.interaction_sentiment !== 'UNKNOWN')
  if (contactsWithSentiment.length > 0) {
    const sentimentValues: Record<string, number> = { POSITIVE: 1, NEUTRAL: 0.6, NEGATIVE: 0.2 }
    sentimentFactor = contactsWithSentiment.reduce((sum, c) => sum + (sentimentValues[c.intelligence!.interaction_sentiment] ?? 0.5), 0) / contactsWithSentiment.length
  }

  const confidence = (stageProbability * 0.35) + (relStrength * 0.30) + (engRecency * 0.20) + (sentimentFactor * 0.15)
  return Math.round(confidence * 100)
}

function generateSummary(
  contacts: ContactKapData[],
  deals: HubSpotDeal[],
  relScore: number,
  pipScore: number,
  engScore: number,
  momScore: number,
  sentScore: number,
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

  if (sentScore < 50) {
    items.push('Sentiment trending negative — review recent interactions')
  }

  return items
}
