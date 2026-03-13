import {
  Account, ContactKapData, ContactIntelligence, EOSICEntry, Opportunity,
  ManMarking, Signal, HubSpotDeal, DeliveryMetrics, CampaignMetrics,
  UpcomingMeeting, IntegrationStatus, AccountData,
} from './types'
import { computeHealthScore } from './health-score'
import { computeDealConfidence } from './health-score'
import { STALENESS_THRESHOLDS } from './constants'

const VASELINE_ACCOUNT: Account = {
  id: 'vaseline-uk',
  name: 'Vaseline UK',
  hubspot_company_ids: ['19088968678', '19088968673', '18940172240'],
  tier: 'RETENTION',
  objective_retention: 'Stabilise the account. Reset expectations, improve transparency, evolve the partnership. Address instability from client behaviour, budget restriction and demands.',
  objective_development: 'Grow through strategic value, expand remit beyond UK into Global markets. Target fee growth through CIS, renegotiated rate card, and expanded services.',
  why_change: "Vaseline UK's social success has accelerated faster than its operating model. A TikTok-led, creator-heavy approach introduces complexity, compliance risk and delivery pressure for a junior, capacity-constrained brand team.",
  why_now: "TikTok is the brand's primary awareness engine. Regulatory scrutiny around influencer disclosure and sustainability has intensified. Fossil-origin scrutiny and packaging commitments are increasingly visible to consumers.",
  why_us: "Social-first partner built for culture, creators and credibility. We act as a capacity multiplier, bring governance and speed to creator-led social, and translate cultural moments into brand-safe, compliant, high-performing content.",
  why_validated_by_client: false,
  strengths: ['2 years deep brand knowledge', 'UK + US market perspective', 'Proactive trend-aware team', 'Reliable BAU delivery'],
  vulnerabilities: ['Fee capped at 20% + reduced rate card', 'Limited strategic leadership showcase', 'Reactive workloads limiting impact', 'Prior trust issues with Sasha'],
  target_annual_revenue: 150000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// Partial intelligence data — represents what Clay/Gmail would populate
const INTEL_JOCELYN: ContactIntelligence = {
  id: 'intel-1', contact_kap_id: '1',
  work_history_summary: null, // Not enriched yet
  thought_leadership: null,
  recent_linkedin_posts: null,
  interaction_summary: null,
  interaction_sentiment: 'NEUTRAL',
  meeting_frequency_days: null,
  invite_acceptance_rate: null,
  last_enriched_at: null,
  created_at: '', updated_at: '',
}

const INTEL_HANNAH: ContactIntelligence = {
  id: 'intel-2', contact_kap_id: '2',
  work_history_summary: null,
  thought_leadership: null,
  recent_linkedin_posts: null,
  interaction_summary: 'Hannah has been responsive and collaborative in recent weeks. Last 3 interactions focused on creator brief approvals and Q2 campaign planning. Tone is warm and supportive — she continues to advocate for Campfire internally.',
  interaction_sentiment: 'POSITIVE',
  meeting_frequency_days: 14,
  invite_acceptance_rate: 92,
  last_enriched_at: null,
  created_at: '', updated_at: '',
}

const INTEL_SASHA: ContactIntelligence = {
  id: 'intel-3', contact_kap_id: '3',
  work_history_summary: null,
  thought_leadership: null,
  recent_linkedin_posts: null,
  interaction_summary: 'Sasha values proactivity and clear rationale. Recent interactions have been positive — she responded well to the pre-emptive creator brief update. Bi-weekly 1:1s are running smoothly.',
  interaction_sentiment: 'POSITIVE',
  meeting_frequency_days: 7,
  invite_acceptance_rate: 88,
  last_enriched_at: null,
  created_at: '', updated_at: '',
}

const VASELINE_CONTACTS: ContactKapData[] = [
  {
    id: '1', account_id: 'vaseline-uk', hubspot_contact_id: '697957251306',
    name: 'Jocelyn Hsieh', role: 'Global Marketing Director',
    relationship_level: 'ACCEPTANCE', buyer_type: 'EB',
    campfire_owner: 'Joseph Gradwell', man_marking_owner: 'Joseph Gradwell', priority: 'CRITICAL',
    next_step: 'Man-mark with senior, high-impact touchpoints. Present simplified social operating model. Lead with bold, commercially grounded thinking.',
    tenure: '20+ years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(12), days_since_contact: 12, is_stale: true,
    intelligence: INTEL_JOCELYN,
  },
  {
    id: '2', account_id: 'vaseline-uk', hubspot_contact_id: '587323488492',
    name: 'Hannah Kingsman', role: 'Senior Influencer & PR Manager',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Catrina Bannon', man_marking_owner: 'Catrina Bannon', priority: 'HIGH',
    next_step: 'Develop relationship with Jocelyn as Hannah takes background role. Ensure we maintain Hannah as advocate while building the new power centre.',
    tenure: '2 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(5), days_since_contact: 5, is_stale: false,
    intelligence: INTEL_HANNAH,
  },
  {
    id: '3', account_id: 'vaseline-uk', hubspot_contact_id: '587323488491',
    name: 'Sasha Werb', role: 'Influencer Marketing Specialist',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Olivia Lavelle', man_marking_owner: 'Olivia Lavelle', priority: 'HIGH',
    next_step: 'Show rationale and proactivity — what Sasha values most. Bi-weekly 1:1s to pre-empt blockers and secure approvals.',
    tenure: '2 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(3), days_since_contact: 3, is_stale: false,
    intelligence: INTEL_SASHA,
  },
  {
    id: '4', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Chiara Posca', role: 'Brand Lead',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Olivia Lavelle', man_marking_owner: 'Olivia Lavelle', priority: 'MEDIUM',
    next_step: "Position as her strategic partner. She doesn't fully trust us yet. Her role is becoming more pivotal in briefings and Culture Clubs.",
    tenure: '9 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(18), days_since_contact: 18, is_stale: false,
  },
  {
    id: '5', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Emily Best', role: 'Intern',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Kelly Buckley', man_marking_owner: 'Kelly Buckley', priority: 'LOW',
    next_step: 'Support where possible. She reports into Sasha. Gives us the most positive feedback.',
    tenure: '2 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(8), days_since_contact: 8, is_stale: false,
  },
  {
    id: '6', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Karla Powlesland', role: 'Senior Social & Content Manager',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Kelly Buckley', man_marking_owner: 'Kelly Buckley', priority: 'MEDIUM',
    next_step: "Build trust so she comes to us for influencer reposts. Sometimes doesn't consult us.",
    tenure: '2 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(15), days_since_contact: 15, is_stale: false,
  },
  {
    id: '7', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Jasmine Pendrey', role: 'Content Lead',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Kelly Buckley', man_marking_owner: 'Kelly Buckley', priority: 'MEDIUM',
    next_step: "Develop stronger relationship — she's increasingly involved in content approvals.",
    tenure: '5 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(22), days_since_contact: 22, is_stale: true,
  },
  {
    id: '8', account_id: 'vaseline-uk', hubspot_contact_id: '723163892958',
    name: 'Katherine Frizoni', role: 'Market R&D',
    relationship_level: 'ACCEPTANCE', buyer_type: 'Acceptance',
    campfire_owner: 'Unassigned', man_marking_owner: null, priority: 'MEDIUM',
    next_step: "Get in front of her — she accepts our presence but doesn't understand what we do. Worked with her in Culture Club.",
    tenure: '14 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(35), days_since_contact: 35, is_stale: true,
  },
  {
    id: '9', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Juan Pablo Galindo', role: 'B&W General Manager',
    relationship_level: 'ACKNOWLEDGE', buyer_type: 'Acknowledge',
    campfire_owner: 'Joseph Gradwell', man_marking_owner: null, priority: 'LOW',
    next_step: 'Starting to join IAT calls. Good opportunity to show creativity. Rare direct contact.',
    tenure: '25 years', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(45), days_since_contact: 45, is_stale: true,
  },
  {
    id: '10', account_id: 'vaseline-uk', hubspot_contact_id: '723163892960',
    name: 'Lisa McKenty', role: 'TikTok Shop (freelance)',
    relationship_level: 'ACCEPTANCE', buyer_type: 'Acceptance',
    campfire_owner: 'Unassigned', man_marking_owner: null, priority: 'LOW',
    next_step: "Explore TTS offering opportunity. She's been on IAT calls but rare direct contact.",
    tenure: '1 year', linkedin_url: null, created_at: '', updated_at: '',
    last_contacted: daysAgo(20), days_since_contact: 20, is_stale: false,
  },
]

const VASELINE_EOSIC: EOSICEntry[] = [
  {
    id: '1', account_id: 'vaseline-uk', area: 'POLITICAL',
    items: ['Post-Brexit regulatory divergence for cosmetics', 'UK EPR rules (2025) increase costs for plastic-heavy brands', 'California SB-54 plastics law (2027) sets global standard'],
    implication: 'Regulatory pressure accelerates need for compliant sustainability storytelling.',
    sources: ['UK Parliamentary Briefing 2023', 'DEFRA factsheet Oct 2023'],
    last_updated: new Date().toISOString(),
  },
  {
    id: '2', account_id: 'vaseline-uk', area: 'ECONOMIC',
    items: ['Petroleum jelly margins sensitive to oil volatility (Brent avg $82 in 2025)', 'Unilever B&W division grew 4.3% to €12.8bn in 2025', 'Vaseline double-digit growth for 3 consecutive years'],
    implication: 'Strong tailwinds support social investment, but cost volatility increases ROI scrutiny.',
    sources: ['World Bank Commodity Outlook Jan 2026', 'Cosmetics Business Feb 2026'],
    last_updated: new Date().toISOString(),
  },
  {
    id: '3', account_id: 'vaseline-uk', area: 'SOCIOLOGICAL',
    items: ['Gen Z skin barrier obsession: 4bn+ #slugging views', 'Healing Project reached 27m people', 'Rising scepticism toward unsafe beauty hacks'],
    implication: 'Social is a reputation channel. Creator-led education and trust-building are critical.',
    sources: ['TikTok Trend Report Dec 2025', 'PR Newswire Jan 2026'],
    last_updated: new Date().toISOString(),
  },
  {
    id: '4', account_id: 'vaseline-uk', area: 'TECHNOLOGICAL',
    items: ['Serum-burst technology enables premiumisation', 'Creator analytics stack: sub-72hr iteration', 'Real-time social intelligence for Vaseline Verified'],
    implication: 'Competitive advantage in speed-to-culture. Prioritise rapid testing and creator partnerships.',
    sources: ['CEW UK interview May 2025', 'WPP case study Jun 2025'],
    last_updated: new Date().toISOString(),
  },
  {
    id: '5', account_id: 'vaseline-uk', area: 'LEGAL',
    items: ['ASA tightened influencer disclosure rules in 2025', 'Increased scrutiny on health and sustainability claims'],
    implication: 'Social-first model increases legal exposure. Clear compliance processes are essential.',
    sources: ['ASA Enforcement Notice Jul 2025'],
    last_updated: new Date().toISOString(),
  },
  {
    id: '6', account_id: 'vaseline-uk', area: 'ENVIRONMENTAL',
    items: ['Fossil-origin scrutiny from Greenpeace (Nov 2024 watch-list)', 'Packaging redesigns saved equiv. of 11m bottles since 2018'],
    implication: 'Sustainability storytelling must be credible and evidence-backed.',
    sources: ['Greenpeace Nov 2024', 'SustainablePackaging.org Dec 2025'],
    last_updated: new Date().toISOString(),
  },
]

const VASELINE_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1', account_id: 'vaseline-uk',
    name: 'Simplified Creator Engine',
    challenge_solved: 'Inconsistent creator rationale, repetitive content, internal burden',
    estimated_revenue: 'TBC', status: 'concept', created_at: '',
  },
  {
    id: '2', account_id: 'vaseline-uk',
    name: 'Culture Command Centre (Spark & Compass)',
    challenge_solved: 'Reactive trend engagement, lack of foresight, missed cultural moments',
    estimated_revenue: 'TBC', status: 'concept', created_at: '',
  },
  {
    id: '3', account_id: 'vaseline-uk',
    name: 'Strategic Confidence Reset',
    challenge_solved: 'Perceived lack of trust + executional positioning',
    estimated_revenue: '£50k', status: 'concept', created_at: '',
  },
  {
    id: '4', account_id: 'vaseline-uk',
    name: 'Performance & ROI Framework',
    challenge_solved: 'Social metrics not linked to brand KPIs',
    estimated_revenue: 'TBC', status: 'concept', created_at: '',
  },
]

const VASELINE_MAN_MARKING: ManMarking[] = [
  {
    id: '1', account_id: 'vaseline-uk',
    campfire_member: 'Joseph Gradwell', campfire_hubspot_owner_id: '1089678893',
    role_description: 'Exec sponsor / relationship lead',
    marking_contacts: ['Jocelyn Hsieh'],
    action_plan: 'Build high-trust relationship; lay groundwork for CIS pitching once trust established. Fewer, sharper interactions focused on strategic value.',
    this_week_recommendation: null, recommendation_generated_at: null,
    created_at: '',
  },
  {
    id: '2', account_id: 'vaseline-uk',
    campfire_member: 'Catrina Bannon', campfire_hubspot_owner_id: '31267666',
    role_description: 'Senior client liaison',
    marking_contacts: ['Hannah Kingsman'],
    action_plan: 'Strengthen influence with Jocelyn and Hannah for broader buy-in. Monthly 1:1 strategic reviews with Hannah.',
    this_week_recommendation: null, recommendation_generated_at: null,
    created_at: '',
  },
  {
    id: '3', account_id: 'vaseline-uk',
    campfire_member: 'Olivia Lavelle', campfire_hubspot_owner_id: '31267669',
    role_description: 'Day to day lead / account strategist',
    marking_contacts: ['Chiara Posca', 'Sasha Werb'],
    action_plan: 'Bi-weekly 1:1s to align KPIs, pre-empt blockers, share innovation. Demonstrate campaign ROI.',
    this_week_recommendation: null, recommendation_generated_at: null,
    created_at: '',
  },
  {
    id: '4', account_id: 'vaseline-uk',
    campfire_member: 'Kelly Buckley', campfire_hubspot_owner_id: '31267672',
    role_description: 'BAU lead',
    marking_contacts: ['Jasmine Pendrey', 'Karla Powlesland', 'Emily Best'],
    action_plan: 'Clear SLAs for campaign requests. Monthly report showing efficiency and proactive problem-solving.',
    this_week_recommendation: null, recommendation_generated_at: null,
    created_at: '',
  },
]

const VASELINE_SIGNALS: Signal[] = [
  {
    id: '1', account_id: 'vaseline-uk', type: 'ENGAGEMENT_GAP', priority: 'HIGH',
    title: 'Jocelyn Hsieh has not been contacted in 12 days',
    detail: 'Exceeds CRITICAL threshold of 7 days. As Economic Buyer, this is the highest priority engagement gap.',
    source: 'HubSpot', related_contact_id: '1',
    timestamp: daysAgo(0), dismissed: false,
  },
  {
    id: '2', account_id: 'vaseline-uk', type: 'NEWS', priority: 'MEDIUM',
    title: 'Unilever B&W division reports 4.3% growth to €12.8bn',
    detail: 'Strong tailwind for social investment. Reference in next strategic conversation with Jocelyn.',
    source: 'Clay',
    timestamp: daysAgo(2), dismissed: false,
  },
  {
    id: '3', account_id: 'vaseline-uk', type: 'REGULATION', priority: 'HIGH',
    title: 'ASA issues updated guidance on influencer disclosure',
    detail: 'Review all active creator briefs for compliance. Brief the team on new requirements.',
    source: 'Web',
    timestamp: daysAgo(5), dismissed: false,
  },
  {
    id: '4', account_id: 'vaseline-uk', type: 'SOCIAL_ACTIVITY', priority: 'MEDIUM',
    title: '#slugging reaches 4.2bn TikTok views',
    detail: 'Vaseline well-positioned but no owned content this month. Opportunity for reactive content.',
    source: 'Clay',
    timestamp: daysAgo(7), dismissed: false,
  },
  {
    id: '5', account_id: 'vaseline-uk', type: 'COMPETITOR', priority: 'LOW',
    title: 'CeraVe launches creator-first TikTok campaign',
    detail: 'Dermatologist partnership format. Monitor performance and share competitive analysis.',
    source: 'Clay',
    timestamp: daysAgo(10), dismissed: false,
  },
  {
    id: '6', account_id: 'vaseline-uk', type: 'PIPELINE_MOVE', priority: 'MEDIUM',
    title: 'Vaseline Gluta-Hya UK Social moved to Creating Value',
    detail: 'Deal progressed from Penetrating. Good momentum — maintain engagement cadence.',
    source: 'HubSpot',
    timestamp: daysAgo(3), dismissed: false,
  },
  {
    id: '7', account_id: 'vaseline-uk', type: 'LINKEDIN_POST', priority: 'LOW',
    title: 'Chiara Posca shared post about brand authenticity',
    detail: 'Chiara shared an article on brand authenticity in social marketing. Good conversation opener.',
    source: 'Clay', related_contact_id: '4',
    timestamp: daysAgo(14), dismissed: false,
  },
  {
    id: '8', account_id: 'vaseline-uk', type: 'ENGAGEMENT_GAP', priority: 'MEDIUM',
    title: 'Katherine Frizoni last contacted 35 days ago',
    detail: 'Exceeds MEDIUM threshold of 21 days. She remains poorly understood — assign an owner.',
    source: 'HubSpot', related_contact_id: '8',
    timestamp: daysAgo(1), dismissed: false,
  },
  {
    id: '9', account_id: 'vaseline-uk', type: 'ENGAGEMENT_GAP', priority: 'MEDIUM',
    title: 'Jasmine Pendrey last contacted 22 days ago',
    detail: 'Exceeds MEDIUM threshold of 21 days. She is increasingly involved in approvals.',
    source: 'HubSpot', related_contact_id: '7',
    timestamp: daysAgo(1), dismissed: false,
  },
]

const VASELINE_DEALS: HubSpotDeal[] = [
  {
    id: '1', dealname: 'Vaseline UK Social Retainer 2025', amount: 180000,
    dealstage: 'closedwon', pipeline: 'default', closedate: '2025-01-15',
    hubspot_owner_id: '31267669', stage_label: 'Closed Won', win_probability: 1.0,
  },
  {
    id: '2', dealname: 'Vaseline Gluta-Hya UK Social', amount: 45000,
    dealstage: 'presentationscheduled', pipeline: 'default', closedate: '2025-06-30',
    hubspot_owner_id: '31267669', stage_label: 'Creating Value', win_probability: 0.60,
  },
  {
    id: '3', dealname: 'Vaseline UK Creator Campaign Q2', amount: 32000,
    dealstage: 'qualifiedtobuy', pipeline: 'default', closedate: '2025-04-30',
    hubspot_owner_id: '31267672', stage_label: 'Penetrating', win_probability: 0.40,
  },
  {
    id: '4', dealname: 'Vaseline Healing Project Social', amount: 28000,
    dealstage: 'decisionmakerboughtin', pipeline: 'default', closedate: '2025-05-15',
    hubspot_owner_id: '1089678893', stage_label: 'Preparing', win_probability: 0.75,
  },
  {
    id: '5', dealname: 'Vaseline UK TikTok Shop Pilot', amount: 15000,
    dealstage: '879430867', pipeline: 'default', closedate: '2025-07-31',
    hubspot_owner_id: '31267669', stage_label: 'Prospecting', win_probability: 0.10,
  },
  {
    id: '6', dealname: 'Vaseline UK Rate Card Renegotiation', amount: 50000,
    dealstage: 'closedlost', pipeline: 'default', closedate: '2025-02-28',
    hubspot_owner_id: '1089678893', stage_label: 'Closed Lost', win_probability: 0.0,
  },
  {
    id: '7', dealname: 'Vaseline UK Influencer Compliance Audit', amount: 12000,
    dealstage: 'appointmentscheduled', pipeline: 'default', closedate: '2025-05-31',
    hubspot_owner_id: '31267672', stage_label: 'Investigating', win_probability: 0.20,
  },
  {
    id: '8', dealname: 'Vaseline Verified Content Hub', amount: 25000,
    dealstage: 'contractsent', pipeline: 'default', closedate: '2025-04-15',
    hubspot_owner_id: '31267669', stage_label: 'Pitching', win_probability: 0.90,
  },
]

const VASELINE_DELIVERY_METRICS: DeliveryMetrics[] = [
  {
    id: '1', account_id: 'vaseline-uk',
    period_start: '2026-02-17', period_end: '2026-02-23',
    tasks_due: 24, tasks_completed_on_time: 22, tasks_overdue: 2,
    delivery_velocity: 92, captured_at: daysAgo(21),
  },
  {
    id: '2', account_id: 'vaseline-uk',
    period_start: '2026-02-24', period_end: '2026-03-02',
    tasks_due: 18, tasks_completed_on_time: 15, tasks_overdue: 3,
    delivery_velocity: 83, captured_at: daysAgo(14),
  },
  {
    id: '3', account_id: 'vaseline-uk',
    period_start: '2026-03-03', period_end: '2026-03-09',
    tasks_due: 21, tasks_completed_on_time: 20, tasks_overdue: 1,
    delivery_velocity: 95, captured_at: daysAgo(7),
  },
  {
    id: '4', account_id: 'vaseline-uk',
    period_start: '2026-03-10', period_end: '2026-03-16',
    tasks_due: 20, tasks_completed_on_time: 18, tasks_overdue: 2,
    delivery_velocity: 90, captured_at: daysAgo(0),
  },
]

const VASELINE_UPCOMING_MEETINGS: UpcomingMeeting[] = [
  {
    id: '1', title: 'Vaseline UK Weekly Status',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    attendees_client: [
      { name: 'Sasha Werb', relationship_level: 'TRUST', last_interaction: '3 days ago' },
      { name: 'Chiara Posca', relationship_level: 'RESPECT', last_interaction: '18 days ago' },
    ],
    attendees_campfire: [
      { name: 'Olivia Lavelle', role: 'Day to day lead' },
      { name: 'Kelly Buckley', role: 'BAU lead' },
    ],
    prep_briefing: null,
  },
  {
    id: '2', title: 'Vaseline UK Q2 Strategy Review',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    attendees_client: [
      { name: 'Jocelyn Hsieh', relationship_level: 'ACCEPTANCE', last_interaction: '12 days ago' },
      { name: 'Hannah Kingsman', relationship_level: 'TRUST', last_interaction: '5 days ago' },
      { name: 'Sasha Werb', relationship_level: 'TRUST', last_interaction: '3 days ago' },
    ],
    attendees_campfire: [
      { name: 'Joseph Gradwell', role: 'Exec sponsor' },
      { name: 'Olivia Lavelle', role: 'Day to day lead' },
      { name: 'Catrina Bannon', role: 'Senior client liaison' },
    ],
    prep_briefing: null,
  },
]

const INTEGRATION_STATUS: IntegrationStatus = {
  hubspot: false, // Will be true when HUBSPOT_ACCESS_TOKEN is set
  gmail: false,
  calendar: false,
  slack: false,
  clay: false,
  asana: false,
  supermetrics: false,
}

export function getMockAccountData(): AccountData {
  const contacts = VASELINE_CONTACTS.map(c => ({
    ...c,
    is_stale: c.days_since_contact != null
      ? c.days_since_contact > STALENESS_THRESHOLDS[c.priority]
      : false,
  }))

  // Add confidence scores to deals
  const deals = VASELINE_DEALS.map(d => ({
    ...d,
    confidence_score: computeDealConfidence(d, contacts),
  }))

  const healthScore = computeHealthScore({
    contacts,
    deals,
    deliveryMetrics: VASELINE_DELIVERY_METRICS,
    pipelineTarget: VASELINE_ACCOUNT.target_annual_revenue,
  })

  return {
    account: VASELINE_ACCOUNT,
    contacts,
    eosic: VASELINE_EOSIC,
    opportunities: VASELINE_OPPORTUNITIES,
    manMarking: VASELINE_MAN_MARKING,
    signals: VASELINE_SIGNALS,
    deals,
    healthScore,
    deliveryMetrics: VASELINE_DELIVERY_METRICS,
    campaignMetrics: [], // No Supermetrics data yet
    upcomingMeetings: VASELINE_UPCOMING_MEETINGS,
    integrationStatus: INTEGRATION_STATUS,
  }
}
