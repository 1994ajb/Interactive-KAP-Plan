import { RelationshipLevel, Priority, EOSICArea, SignalType } from './types'

export const RELATIONSHIP_LEVEL_ORDER: RelationshipLevel[] = [
  'CHAMPION', 'TRUST', 'RESPECT', 'ACCEPTANCE', 'ACKNOWLEDGE'
]

export const RELATIONSHIP_COLORS: Record<RelationshipLevel, { bg: string; text: string; dot: string }> = {
  CHAMPION: { bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' },
  TRUST: { bg: 'bg-success-soft', text: 'text-success', dot: 'bg-success' },
  RESPECT: { bg: 'bg-warning-soft', text: 'text-warning', dot: 'bg-warning' },
  ACCEPTANCE: { bg: 'bg-warning-soft', text: 'text-warning', dot: 'bg-warning' },
  ACKNOWLEDGE: { bg: 'bg-danger-soft', text: 'text-danger', dot: 'bg-danger' },
}

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  CRITICAL: { bg: 'bg-danger-soft', text: 'text-danger' },
  HIGH: { bg: 'bg-warning-soft', text: 'text-warning' },
  MEDIUM: { bg: 'bg-accent-soft', text: 'text-accent' },
  LOW: { bg: 'bg-page', text: 'text-text-secondary' },
}

export const STALENESS_THRESHOLDS: Record<Priority, number> = {
  CRITICAL: 7,
  HIGH: 14,
  MEDIUM: 21,
  LOW: 30,
}

export const PIPELINE_STAGES: Record<string, { label: string; probability: number; order: number }> = {
  '879430867': { label: 'Prospecting', probability: 0.10, order: 1 },
  'appointmentscheduled': { label: 'Investigating', probability: 0.20, order: 2 },
  'qualifiedtobuy': { label: 'Penetrating', probability: 0.40, order: 3 },
  'presentationscheduled': { label: 'Creating Value', probability: 0.60, order: 4 },
  'decisionmakerboughtin': { label: 'Preparing', probability: 0.75, order: 5 },
  'contractsent': { label: 'Pitching (Moved to Scoro)', probability: 0.90, order: 6 },
  'closedwon': { label: 'Closed Won', probability: 1.00, order: 7 },
  'closedlost': { label: 'Closed Lost', probability: 0.00, order: 8 },
}

export const STAGE_COLORS: Record<string, string> = {
  '879430867': 'bg-text-dim',
  'appointmentscheduled': 'bg-accent',
  'qualifiedtobuy': 'bg-accent',
  'presentationscheduled': 'bg-warning',
  'decisionmakerboughtin': 'bg-warning',
  'contractsent': 'bg-success',
  'closedwon': 'bg-success',
  'closedlost': 'bg-danger',
}

export const SIGNAL_ICONS: Record<SignalType, string> = {
  ALERT: '⚠',
  NEWS: '📰',
  LINKEDIN: '💼',
  SOCIAL: '📱',
  COMPETITOR: '🏁',
  REGULATION: '📋',
  PIPELINE_MOVE: '💰',
}

export const EOSIC_LABELS: Record<EOSICArea, { label: string; icon: string }> = {
  POLITICAL: { label: 'Political', icon: '🏛' },
  ECONOMIC: { label: 'Economic', icon: '📊' },
  SOCIOLOGICAL: { label: 'Sociological', icon: '👥' },
  TECHNOLOGICAL: { label: 'Technological', icon: '⚡' },
  LEGAL: { label: 'Legal', icon: '⚖' },
  ENVIRONMENTAL: { label: 'Environmental', icon: '🌍' },
}

export const BUYER_WEIGHT: Record<string, number> = {
  EB: 3,
  Coach: 2,
  PB: 2,
  TB: 1,
  Champion: 2,
}

export const HUBSPOT_BASE_URL = 'https://app-eu1.hubspot.com'
export const HUBSPOT_PORTAL_ID = '145447962'

export const OWNER_MAP: Record<string, string> = {
  '1089678893': 'Joseph Gradwell',
  '31267666': 'Catrina Bannon',
  '31267669': 'Olivia Lavelle',
  '31267672': 'Kelly Buckley',
  '31267668': 'Rebecca Nuttall',
  '229794769': 'Alex Brown',
  '30673941': 'Lewis Wilkinson',
  '31267667': 'Francesca Denny',
}

export const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'action-plan', label: 'Action Plan' },
  { id: 'coach', label: 'Coach' },
] as const

export type TabId = typeof TABS[number]['id']
