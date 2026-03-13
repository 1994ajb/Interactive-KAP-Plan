import { Account, ContactKapData, EOSICEntry, Opportunity, ManMarking, Signal, HubSpotDeal, AccountData } from './types'
import { computeHealthScore } from './health-score'
import { STALENESS_THRESHOLDS, PIPELINE_STAGES } from './constants'

const VASELINE_ACCOUNT: Account = {
  id: 'vaseline-uk',
  name: 'Vaseline UK',
  hubspot_company_ids: ['19088968678', '19088968673', '18940172240'],
  tier: 'RETENTION',
  objective_retention: 'Stabilise the account. Reset expectations, improve transparency, evolve the partnership. Address instability from client behaviour, budget restriction and demands.',
  objective_development: 'Grow through strategic value, expand remit beyond UK into Global markets. Target fee growth through CIS, renegotiated rate card, and expanded services.',
  why_change: "Vaseline UK's social success has accelerated faster than its operating model. A TikTok-led, creator-heavy approach now drives cultural relevance, but introduces greater complexity, compliance risk and delivery pressure for a junior, capacity-constrained brand team.",
  why_now: "TikTok is the brand's primary awareness engine. Regulatory scrutiny around influencer disclosure and sustainability has intensified. Fossil-origin scrutiny and packaging commitments are becoming more visible to consumers.",
  why_us: "Social-first partner built for brands at the intersection of culture, creators and credibility. We act as a capacity multiplier, bring governance and speed to creator-led social, and translate cultural moments into brand-safe, compliant, high-performing content.",
  strengths: ['2 years deep brand knowledge', 'UK + US market perspective', 'Proactive, trend-aware team', 'Reliable BAU delivery'],
  vulnerabilities: ['Fee capped at 20% + reduced rate card', 'Limited strategic leadership showcase', 'Reactive workloads limiting impact', 'Prior trust issues with Sasha'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const VASELINE_CONTACTS: ContactKapData[] = [
  {
    id: '1', account_id: 'vaseline-uk', hubspot_contact_id: '697957251306',
    name: 'Jocelyn Hsieh', role: 'Global Marketing Director',
    relationship_level: 'ACCEPTANCE', buyer_type: 'EB',
    campfire_owner: 'Joe Gradwell', priority: 'CRITICAL',
    next_step: 'Man-mark with senior, high-impact touchpoints. Present simplified social operating model.',
    tenure: '20+ years', created_at: '', updated_at: '',
    last_contacted: daysAgo(12), days_since_contact: 12, is_stale: true,
  },
  {
    id: '2', account_id: 'vaseline-uk', hubspot_contact_id: '587323488492',
    name: 'Hannah Kingsman', role: 'Senior Influencer & PR Manager',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Catrina Bannon', priority: 'HIGH',
    next_step: 'Develop relationship with Jocelyn as Hannah takes a background role.',
    tenure: '2 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(5), days_since_contact: 5, is_stale: false,
  },
  {
    id: '3', account_id: 'vaseline-uk', hubspot_contact_id: '587323488491',
    name: 'Sasha Werb', role: 'Influencer Marketing Specialist',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Olivia Lavelle', priority: 'HIGH',
    next_step: 'Show rationale and proactivity — what Sasha values most.',
    tenure: '2 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(3), days_since_contact: 3, is_stale: false,
  },
  {
    id: '4', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Chiara Posca', role: 'Brand Lead',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Olivia Lavelle', priority: 'MEDIUM',
    next_step: "Position as her strategic partner. She doesn't fully trust us yet.",
    tenure: '9 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(18), days_since_contact: 18, is_stale: false,
  },
  {
    id: '5', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Emily Best', role: 'Intern',
    relationship_level: 'TRUST', buyer_type: 'Coach',
    campfire_owner: 'Kelly Buckley', priority: 'LOW',
    next_step: 'Support her where possible. She reports into Sasha.',
    tenure: '2 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(8), days_since_contact: 8, is_stale: false,
  },
  {
    id: '6', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Karla Powlesland', role: 'Senior Social & Content Manager',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Kelly Buckley', priority: 'MEDIUM',
    next_step: 'Build trust so she comes to us for influencer reposts.',
    tenure: '2 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(15), days_since_contact: 15, is_stale: false,
  },
  {
    id: '7', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Jasmine Pendrey', role: 'Content Lead',
    relationship_level: 'RESPECT', buyer_type: 'Respect',
    campfire_owner: 'Kelly Buckley', priority: 'MEDIUM',
    next_step: "Develop relationship — she's increasingly involved in approvals.",
    tenure: '5 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(22), days_since_contact: 22, is_stale: true,
  },
  {
    id: '8', account_id: 'vaseline-uk', hubspot_contact_id: '723163892958',
    name: 'Katherine Frizoni', role: 'Market R&D',
    relationship_level: 'ACCEPTANCE', buyer_type: 'Acceptance',
    campfire_owner: 'Unassigned', priority: 'MEDIUM',
    next_step: "Get in front of her — she doesn't understand what we do.",
    tenure: '14 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(35), days_since_contact: 35, is_stale: true,
  },
  {
    id: '9', account_id: 'vaseline-uk', hubspot_contact_id: null,
    name: 'Juan Pablo Galindo', role: 'B&W General Manager',
    relationship_level: 'ACKNOWLEDGE', buyer_type: 'Acknowledge',
    campfire_owner: 'Joe Gradwell', priority: 'LOW',
    next_step: 'Starting to join IAT calls. Good opportunity to show creativity.',
    tenure: '25 years', created_at: '', updated_at: '',
    last_contacted: daysAgo(45), days_since_contact: 45, is_stale: true,
  },
  {
    id: '10', account_id: 'vaseline-uk', hubspot_contact_id: '723163892960',
    name: 'Lisa McKenty', role: 'TikTok Shop (freelance)',
    relationship_level: 'ACCEPTANCE', buyer_type: 'Acceptance',
    campfire_owner: 'Unassigned', priority: 'LOW',
    next_step: 'Explore TTS offering opportunity.',
    tenure: '1 year', created_at: '', updated_at: '',
    last_contacted: daysAgo(20), days_since_contact: 20, is_stale: false,
  },
]

const VASELINE_EOSIC: EOSICEntry[] = [
  {
    id: '1', account_id: 'vaseline-uk', area: 'POLITICAL',
    items: ['Post-Brexit regulatory divergence for cosmetics', 'UK EPR rules (2025) increase costs for plastic-heavy brands', 'California SB-54 plastics law (2027) sets global standard'],
    implication: 'Regulatory pressure accelerates need for compliant sustainability storytelling.',
    last_updated: new Date().toISOString(),
  },
  {
    id: '2', account_id: 'vaseline-uk', area: 'ECONOMIC',
    items: ['Petroleum jelly margins sensitive to oil volatility', 'Unilever B&W division grew 4.3% to €12.8bn in 2025', 'Vaseline double-digit growth for 3 consecutive years'],
    implication: 'Strong tailwinds support social investment, but cost volatility increases ROI scrutiny.',
    last_updated: new Date().toISOString(),
  },
  {
    id: '3', account_id: 'vaseline-uk', area: 'SOCIOLOGICAL',
    items: ['Gen Z skin barrier obsession: 4bn+ #slugging views', 'Healing Project reached 27m people', 'Rising scepticism toward unsafe beauty hacks'],
    implication: 'Social is a reputation channel. Creator-led education and trust-building are critical.',
    last_updated: new Date().toISOString(),
  },
  {
    id: '4', account_id: 'vaseline-uk', area: 'TECHNOLOGICAL',
    items: ['Serum-burst technology enables premiumisation', 'Creator analytics stack: sub-72hr iteration', 'Real-time social intelligence for Vaseline Verified'],
    implication: 'Competitive advantage in speed-to-culture. Prioritise rapid testing and creator partnerships.',
    last_updated: new Date().toISOString(),
  },
  {
    id: '5', account_id: 'vaseline-uk', area: 'LEGAL',
    items: ['ASA tightened influencer disclosure rules', 'Increased scrutiny on health and sustainability claims'],
    implication: 'Social-first model increases legal exposure. Clear compliance processes are essential.',
    last_updated: new Date().toISOString(),
  },
  {
    id: '6', account_id: 'vaseline-uk', area: 'ENVIRONMENTAL',
    items: ['Fossil-origin scrutiny from Greenpeace', 'Packaging redesigns saved equiv. of 11m bottles'],
    implication: 'Sustainability storytelling must be credible and evidence-backed.',
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
    campfire_member: 'Joe Gradwell', role_description: 'Exec sponsor / relationship lead',
    marking_contacts: ['Jocelyn Hsieh'],
    action_plan: 'Build high-trust relationship; lay groundwork for CIS pitching',
    created_at: '',
  },
  {
    id: '2', account_id: 'vaseline-uk',
    campfire_member: 'Catrina Bannon', role_description: 'Senior client liaison',
    marking_contacts: ['Hannah Kingsman'],
    action_plan: 'Strengthen influence with Jocelyn and Hannah for broader buy-in',
    created_at: '',
  },
  {
    id: '3', account_id: 'vaseline-uk',
    campfire_member: 'Olivia Lavelle', role_description: 'Day to day lead / account strategist',
    marking_contacts: ['Chiara Posca', 'Sasha Werb'],
    action_plan: 'Bi-weekly 1:1s to align KPIs, pre-empt blockers, share innovation',
    created_at: '',
  },
  {
    id: '4', account_id: 'vaseline-uk',
    campfire_member: 'Kelly Buckley', role_description: 'BAU lead',
    marking_contacts: ['Jasmine Pendrey', 'Karla Powlesland', 'Emily Best'],
    action_plan: 'Clear SLAs; monthly report showing efficiency and problem-solving',
    created_at: '',
  },
]

const VASELINE_SIGNALS: Signal[] = [
  {
    id: '1', account_id: 'vaseline-uk', type: 'ALERT', priority: 'HIGH',
    text: 'Jocelyn Hsieh has not been contacted in 12 days — exceeds CRITICAL threshold (7 days)',
    timestamp: daysAgo(0), dismissed: false,
  },
  {
    id: '2', account_id: 'vaseline-uk', type: 'NEWS', priority: 'MEDIUM',
    text: 'Unilever B&W division reports 4.3% growth to €12.8bn — strong tailwind for social investment',
    timestamp: daysAgo(2), dismissed: false,
  },
  {
    id: '3', account_id: 'vaseline-uk', type: 'REGULATION', priority: 'HIGH',
    text: 'ASA issues updated guidance on influencer disclosure — review all active creator briefs',
    timestamp: daysAgo(5), dismissed: false,
  },
  {
    id: '4', account_id: 'vaseline-uk', type: 'SOCIAL', priority: 'MEDIUM',
    text: '#slugging reaches 4.2bn TikTok views — Vaseline well-positioned but no owned content this month',
    timestamp: daysAgo(7), dismissed: false,
  },
  {
    id: '5', account_id: 'vaseline-uk', type: 'COMPETITOR', priority: 'LOW',
    text: 'CeraVe launches creator-first TikTok campaign with dermatologist partnership format',
    timestamp: daysAgo(10), dismissed: false,
  },
  {
    id: '6', account_id: 'vaseline-uk', type: 'PIPELINE_MOVE', priority: 'MEDIUM',
    text: 'Vaseline Gluta-Hya UK Social deal moved to Creating Value stage',
    timestamp: daysAgo(3), dismissed: false,
  },
  {
    id: '7', account_id: 'vaseline-uk', type: 'LINKEDIN', priority: 'LOW',
    text: 'Chiara Posca shared a post about brand authenticity in social marketing',
    timestamp: daysAgo(14), dismissed: false,
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
    hubspot_owner_id: '31267669', stage_label: 'Pitching (Moved to Scoro)', win_probability: 0.90,
  },
]

export function getMockAccountData(): AccountData {
  const contacts = VASELINE_CONTACTS.map(c => ({
    ...c,
    is_stale: c.days_since_contact != null
      ? c.days_since_contact > STALENESS_THRESHOLDS[c.priority]
      : false,
  }))

  const healthScore = computeHealthScore(contacts, VASELINE_DEALS)

  return {
    account: VASELINE_ACCOUNT,
    contacts,
    eosic: VASELINE_EOSIC,
    opportunities: VASELINE_OPPORTUNITIES,
    manMarking: VASELINE_MAN_MARKING,
    signals: VASELINE_SIGNALS,
    deals: VASELINE_DEALS,
    healthScore,
  }
}
