export type Tier = 'RETENTION' | 'DEVELOPMENT' | 'MAINTENANCE' | 'ACQUISITION'

export type RelationshipLevel = 'CHAMPION' | 'TRUST' | 'RESPECT' | 'ACCEPTANCE' | 'ACKNOWLEDGE'

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type SignalType = 'ALERT' | 'NEWS' | 'LINKEDIN' | 'SOCIAL' | 'COMPETITOR' | 'REGULATION' | 'PIPELINE_MOVE'

export type EOSICArea = 'POLITICAL' | 'ECONOMIC' | 'SOCIOLOGICAL' | 'TECHNOLOGICAL' | 'LEGAL' | 'ENVIRONMENTAL'

export interface Account {
  id: string
  name: string
  hubspot_company_ids: string[]
  tier: Tier
  objective_retention: string
  objective_development: string
  why_change: string
  why_now: string
  why_us: string
  strengths: string[]
  vulnerabilities: string[]
  created_at: string
  updated_at: string
}

export interface ContactKapData {
  id: string
  account_id: string
  hubspot_contact_id: string | null
  name: string
  role: string
  relationship_level: RelationshipLevel
  buyer_type: string
  campfire_owner: string
  man_marking_owner?: string
  priority: Priority
  next_step: string
  tenure: string
  created_at: string
  updated_at: string
  // Enriched from HubSpot
  last_contacted?: string | null
  days_since_contact?: number | null
  email?: string | null
  is_stale?: boolean
}

export interface EOSICEntry {
  id: string
  account_id: string
  area: EOSICArea
  items: string[]
  implication: string
  last_updated: string
}

export interface Opportunity {
  id: string
  account_id: string
  name: string
  challenge_solved: string
  estimated_revenue: string
  status: string
  created_at: string
}

export interface ManMarking {
  id: string
  account_id: string
  campfire_member: string
  role_description: string
  marking_contacts: string[]
  action_plan: string
  created_at: string
}

export interface Signal {
  id: string
  account_id: string
  type: SignalType
  priority: Priority
  text: string
  source_url?: string
  timestamp: string
  dismissed: boolean
}

export interface HubSpotDeal {
  id: string
  dealname: string
  amount: number | null
  dealstage: string
  pipeline: string
  closedate: string | null
  hubspot_owner_id: string | null
  stage_label?: string
  win_probability?: number
}

export interface HealthScore {
  overall: number
  relationship_score: number
  pipeline_score: number
  engagement_score: number
  momentum_score: number
  status: 'Healthy' | 'At Risk' | 'Critical'
  summary: string[]
}

export interface AccountData {
  account: Account
  contacts: ContactKapData[]
  eosic: EOSICEntry[]
  opportunities: Opportunity[]
  manMarking: ManMarking[]
  signals: Signal[]
  deals: HubSpotDeal[]
  healthScore: HealthScore
}
