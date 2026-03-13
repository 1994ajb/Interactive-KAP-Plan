import type {
  ContactKapData,
  HubSpotDeal,
  DeliveryMetrics,
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
 * Alert if delivery velocity drops below 80% for any metrics period.
 */
export function generateDeliverySlipSignals(metrics: DeliveryMetrics[]): Signal[] {
  const VELOCITY_THRESHOLD = 80
  const signals: Signal[] = []

  for (const metric of metrics) {
    if (metric.delivery_velocity < VELOCITY_THRESHOLD) {
      const severity = metric.delivery_velocity < 50 ? 'CRITICAL' : 'HIGH'

      signals.push(
        makeSignal({
          account_id: metric.account_id,
          type: 'DELIVERY_SLIP' as SignalType,
          priority: severity as Priority,
          title: `Delivery velocity at ${metric.delivery_velocity}% (below ${VELOCITY_THRESHOLD}%)`,
          detail: `Period: ${metric.period_start} to ${metric.period_end}. ` +
            `Tasks due: ${metric.tasks_due}, Completed on time: ${metric.tasks_completed_on_time}, ` +
            `Overdue: ${metric.tasks_overdue}. ` +
            `Velocity has dropped to ${metric.delivery_velocity}% — investigate project blockers.`,
          source: 'Asana',
        })
      )
    }
  }

  return signals
}
