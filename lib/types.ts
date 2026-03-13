export type Tier = 'RETENTION' | 'DEVELOPMENT' | 'MAINTENANCE' | 'ACQUISITION'

export type RelationshipLevel = 'CHAMPION' | 'TRUST' | 'RESPECT' | 'ACCEPTANCE' | 'ACKNOWLEDGE'

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type SignalType =
  | 'ENGAGEMENT_GAP'
  | 'PIPELINE_MOVE'
  | 'ORG_CHANGE'
  | 'NEWS'
  | 'LINKEDIN_POST'
  | 'SOCIAL_ACTIVITY'
  | 'COMPETITOR'
  | 'REGULATION'
  | 'DELIVERY_SLIP'
  | 'MEETING_PREP'
  | 'SENTIMENT_SHIFT'
  | 'FINANCE_ALERT'
  | 'NEW_HIRE'
  | 'JOB_POSTING'
  | 'EVENT'
  | 'CAMPAIGN_DETECTED'

export type EOSICArea = 'POLITICAL' | 'ECONOMIC' | 'SOCIOLOGICAL' | 'TECHNOLOGICAL' | 'LEGAL' | 'ENVIRONMENTAL'

export type InteractionSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNKNOWN'

export type IntegrationSource = 'HubSpot' | 'Clay' | 'Gmail' | 'Google Calendar' | 'Slack' | 'Asana' | 'Supermetrics' | 'Web' | 'Manual'

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
  why_validated_by_client: boolean
  strengths: string[]
  vulnerabilities: string[]
  target_annual_revenue: number
  social_strategy_summary?: string | null
  key_initiatives?: KeyInitiative[] | null
  client_challenges?: string[] | null
  created_at: string
  updated_at: string
}

export interface KeyInitiative {
  name: string
  status: 'active' | 'planned' | 'completed'
  description: string
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
  man_marking_owner?: string | null
  priority: Priority
  next_step: string
  next_step_generated_at?: string | null
  tenure: string
  linkedin_url?: string | null
  staleness_threshold_days?: number | null
  reports_to?: string | null
  direct_reports?: string[] | null
  created_at: string
  updated_at: string
  // Enriched from HubSpot
  last_contacted?: string | null
  days_since_contact?: number | null
  email?: string | null
  is_stale?: boolean
  // Intelligence layers (from contact_intelligence table)
  intelligence?: ContactIntelligence | null
}

export interface ContactIntelligence {
  id: string
  contact_kap_id: string
  // Career layer
  work_history_summary: string | null
  career_trajectory?: string | null
  // Public Voice layer
  thought_leadership: string[] | null
  recent_linkedin_posts: LinkedInPost[] | null
  conference_appearances?: string[] | null
  press_quotes?: string[] | null
  awards?: string[] | null
  // Interactions layer
  interaction_summary: string | null
  interaction_sentiment: InteractionSentiment
  meeting_frequency_days: number | null
  invite_acceptance_rate: number | null
  // Network layer
  meeting_coattendees?: string[] | null
  email_cc_patterns?: string[] | null
  // Communication Style / Personality layer
  personality_profile?: string | null
  communication_style?: string | null
  decision_pattern?: string | null
  motivations?: string[] | null
  frustrations?: string[] | null
  recommended_approach?: string | null
  // Events layer
  upcoming_events?: ContactEvent[] | null
  recent_events?: ContactEvent[] | null
  // Priorities layer
  priorities_assessment?: string | null
  // Enrichment tracking
  enrichment_completeness?: number | null
  last_enriched_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactEvent {
  name: string
  date: string
  type: 'conference' | 'webinar' | 'internal' | 'industry'
  relevance?: string
}

export interface LinkedInPost {
  date: string
  text: string
  url: string
  engagement: number
}

export interface RecentInteraction {
  date: string
  channel: 'email' | 'call' | 'meeting' | 'note'
  campfire_member: string
  key_topics: string[]
  sentiment: InteractionSentiment
  summary: string
}

export interface EOSICEntry {
  id: string
  account_id: string
  area: EOSICArea
  items: string[]
  implication: string
  sources: string[]
  last_updated: string
}

export interface Opportunity {
  id: string
  account_id: string
  name: string
  challenge_solved: string
  estimated_revenue: string
  status: string
  linked_hubspot_deal_ids?: string[]
  created_at: string
}

export interface ManMarking {
  id: string
  account_id: string
  campfire_member: string
  campfire_hubspot_owner_id?: string
  role_description: string
  marking_contacts: string[]
  action_plan: string
  this_week_recommendation?: string | null
  recommendation_generated_at?: string | null
  created_at: string
}

export interface Signal {
  id: string
  account_id: string
  type: SignalType
  priority: Priority
  title: string
  detail?: string | null
  source: IntegrationSource
  source_url?: string | null
  related_contact_id?: string | null
  timestamp: string
  dismissed: boolean
  dismissed_by?: string | null
  dismissed_at?: string | null
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
  confidence_score?: number
}

export interface DealConfidence {
  overall: number
  stage_probability: number
  relationship_strength: number
  engagement_recency: number
  velocity: number
}

export interface HealthScore {
  overall: number
  relationship_score: number
  pipeline_score: number
  engagement_score: number
  momentum_score: number
  sentiment_score: number
  status: 'Healthy' | 'At Risk' | 'Critical'
  summary: string[]
}

export interface DeliveryMetrics {
  id: string
  account_id: string
  period_start: string
  period_end: string
  tasks_due: number
  tasks_completed_on_time: number
  tasks_overdue: number
  delivery_velocity: number
  captured_at: string
}

export interface CampaignMetrics {
  id: string
  account_id: string
  period_start: string
  period_end: string
  platform: string
  reach: number
  impressions: number
  engagement_rate: number
  video_views: number
  follower_growth: number
  cpm: number
  captured_at: string
}

export interface UpcomingMeeting {
  id: string
  title: string
  start_time: string
  end_time: string
  attendees_client: { name: string; relationship_level?: RelationshipLevel; last_interaction?: string }[]
  attendees_campfire: { name: string; role?: string }[]
  prep_briefing?: string | null
}

export interface IntegrationStatus {
  hubspot: boolean
  gmail: boolean
  calendar: boolean
  slack: boolean
  clay: boolean
  asana: boolean
  supermetrics: boolean
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
  deliveryMetrics: DeliveryMetrics[]
  campaignMetrics: CampaignMetrics[]
  upcomingMeetings: UpcomingMeeting[]
  integrationStatus: IntegrationStatus
}
