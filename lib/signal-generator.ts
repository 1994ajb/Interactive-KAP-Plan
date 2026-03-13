import type {
  ContactKapData,
  HubSpotDeal,
  Signal,
  Priority,
  SignalType,
} from '@/lib/types'

function makeSignalId(): string {
  return `sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function makeSignal(
  overrides: Partial<Signal> & Pick<Signal, 'account_id' | 'type' | 'priority' | 'title' | 'source'>
): Signal {
  return {
    id: makeSignalId(),
    detail: null,
    source_url: null,
    related_contact_id: null,
    timestamp: new Date().toISOString(),
    dismissed: false,
    dismissed_by: null,
    dismissed_at: null,
    ...overrides,
  }
}

/**
 * Staleness thresholds by priority (in days).
 * CRITICAL/HIGH contacts should be contacted more frequently.
 */
const STALENESS_THRESHOLDS: Record<string, number> = {
  CRITICAL: 7,
  HIGH: 14,
  MEDIUM: 30,
  LOW: 60,
}

/**
 * Check contacts against staleness thresholds and generate signals for overdue contacts.
 */
export function generateEngagementGapSignals(contacts: ContactKapData[]): Signal[] {
  const signals: Signal[] = []

  for (const contact of contacts) {
    if (!contact.days_since_contact && contact.days_since_contact !== 0) continue

    const threshold = STALENESS_THRESHOLDS[contact.priority] ?? 30
    const daysSince = contact.days_since_contact

    if (daysSince > threshold) {
      const overdueDays = daysSince - threshold
      let priority: Priority = 'LOW'

      if (contact.priority === 'CRITICAL' || overdueDays > threshold * 2) {
        priority = 'CRITICAL'
      } else if (contact.priority === 'HIGH' || overdueDays > threshold) {
        priority = 'HIGH'
      } else if (overdueDays > threshold * 0.5) {
        priority = 'MEDIUM'
      }

      signals.push(
        makeSignal({
          account_id: contact.account_id,
          type: 'ENGAGEMENT_GAP' as SignalType,
          priority,
          title: `No contact with ${contact.name} in ${daysSince} days`,
          detail: `${contact.name} (${contact.role}) is ${overdueDays} days overdue for contact. ` +
            `Priority: ${contact.priority}, Relationship: ${contact.relationship_level}. ` +
            `Campfire owner: ${contact.campfire_owner}. ` +
            `Last known next step: ${contact.next_step || 'None set'}.`,
          source: 'HubSpot',
          related_contact_id: contact.id,
        })
      )
    }
  }

  return signals
}

/**
 * Detect deal stage changes and generate pipeline move signals.
 * This is a placeholder for Phase 2+ — requires historical stage tracking.
 */
export function generatePipelineMoveSignals(deals: HubSpotDeal[]): Signal[] {
  const signals: Signal[] = []

  // Placeholder: In production, this would compare current stage against
  // previously stored stage to detect moves forward/backward.
  // For now, flag deals with high amounts that may need attention.
  for (const deal of deals) {
    if (deal.amount && deal.amount > 100000 && deal.closedate) {
      const closeDate = new Date(deal.closedate)
      const now = new Date()
      const daysUntilClose = Math.ceil(
        (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntilClose <= 30 && daysUntilClose > 0) {
        signals.push(
          makeSignal({
            account_id: '', // To be populated by caller with account context
            type: 'PIPELINE_MOVE' as SignalType,
            priority: daysUntilClose <= 7 ? 'CRITICAL' : 'HIGH',
            title: `${deal.dealname} closing in ${daysUntilClose} days`,
            detail: `Deal "${deal.dealname}" worth $${deal.amount.toLocaleString()} ` +
              `is in stage "${deal.stage_label ?? deal.dealstage}" ` +
              `and closes on ${deal.closedate}. ` +
              (deal.confidence_score !== undefined
                ? `Confidence score: ${deal.confidence_score}%.`
                : ''),
            source: 'HubSpot',
          })
        )
      }
    }
  }

  return signals
}

/**
 * Generate signals for title discrepancies between KAP and verified sources.
 */
export function generateTitleDiscrepancySignals(contacts: ContactKapData[]): Signal[] {
  const signals: Signal[] = []

  for (const contact of contacts) {
    if (contact.title_discrepancy_flagged && contact.kap_title && contact.verified_title) {
      signals.push(
        makeSignal({
          account_id: contact.account_id,
          type: 'ORG_CHANGE' as SignalType,
          priority: (contact.priority === 'CRITICAL' || contact.priority === 'HIGH') ? 'HIGH' : 'MEDIUM' as Priority,
          title: `Title discrepancy detected for ${contact.name}`,
          detail: `KAP title: "${contact.kap_title}" vs verified title: "${contact.verified_title}". ` +
            `Review and update the KAP record. This may indicate a role change or incorrect data entry.`,
          source: 'Clay',
          related_contact_id: contact.id,
        })
      )
    }
  }

  return signals
}

/**
 * Generate signals for incomplete HubSpot records on priority contacts.
 */
export function generateHubSpotCompletenessSignals(contacts: ContactKapData[]): Signal[] {
  const signals: Signal[] = []

  for (const contact of contacts) {
    if (
      (contact.priority === 'CRITICAL' || contact.priority === 'HIGH') &&
      contact.intelligence?.hubspot_record_complete === false &&
      contact.intelligence?.hubspot_missing_fields?.length
    ) {
      signals.push(
        makeSignal({
          account_id: contact.account_id,
          type: 'ENGAGEMENT_GAP' as SignalType,
          priority: 'HIGH' as Priority,
          title: `Incomplete HubSpot record for ${contact.name}`,
          detail: `Missing fields: ${contact.intelligence.hubspot_missing_fields.join(', ')}. ` +
            `This is a ${contact.priority} priority contact — update their HubSpot record immediately.`,
          source: 'HubSpot',
          related_contact_id: contact.id,
        })
      )
    }
  }

  return signals
}
