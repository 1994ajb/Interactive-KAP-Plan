-- KAP Intelligence Terminal — Database Schema v3
-- Run this in your Supabase SQL editor to set up the database

-- 1. Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hubspot_company_ids TEXT[] NOT NULL,
  tier TEXT CHECK (tier IN ('RETENTION', 'DEVELOPMENT', 'MAINTENANCE', 'ACQUISITION')),
  objective_retention TEXT,
  objective_development TEXT,
  why_change TEXT,
  why_now TEXT,
  why_us TEXT,
  why_validated_by_client BOOLEAN DEFAULT false,
  strengths TEXT[],
  vulnerabilities TEXT[],
  target_annual_revenue INTEGER,
  social_strategy_summary TEXT,
  key_initiatives JSONB, -- [{name, status, description}]
  client_challenges TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contact KAP overlay data
CREATE TABLE IF NOT EXISTS contact_kap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  hubspot_contact_id TEXT,
  name TEXT NOT NULL,
  role TEXT,
  relationship_level TEXT CHECK (relationship_level IN ('CHAMPION', 'TRUST', 'RESPECT', 'ACCEPTANCE', 'ACKNOWLEDGE')),
  buyer_type TEXT,
  campfire_owner TEXT,
  man_marking_owner TEXT,
  priority TEXT CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  next_step TEXT,
  next_step_generated_at TIMESTAMPTZ,
  tenure TEXT,
  linkedin_url TEXT,
  staleness_threshold_days INTEGER,
  reports_to TEXT,
  direct_reports TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contact intelligence cache (from Clay + Gmail + Calendar + AI)
CREATE TABLE IF NOT EXISTS contact_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_kap_id UUID REFERENCES contact_kap_data(id),
  -- Career layer
  work_history_summary TEXT,
  career_trajectory TEXT,
  -- Public Voice layer
  thought_leadership TEXT[],
  recent_linkedin_posts JSONB, -- [{date, text, url, engagement}]
  conference_appearances TEXT[],
  press_quotes TEXT[],
  awards TEXT[],
  -- Interactions layer
  interaction_summary TEXT, -- AI-generated from Gmail + HubSpot
  interaction_sentiment TEXT CHECK (interaction_sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'UNKNOWN')),
  meeting_frequency_days NUMERIC, -- avg days between meetings from Calendar
  invite_acceptance_rate NUMERIC, -- % of calendar invites accepted
  -- Network layer
  meeting_coattendees TEXT[],
  email_cc_patterns TEXT[],
  -- Communication Style / Personality layer
  personality_profile TEXT,
  communication_style TEXT,
  decision_pattern TEXT,
  motivations TEXT[],
  frustrations TEXT[],
  recommended_approach TEXT,
  -- Events layer
  upcoming_events JSONB, -- [{name, date, type, relevance}]
  recent_events JSONB, -- [{name, date, type, relevance}]
  -- Priorities layer
  priorities_assessment TEXT,
  -- Enrichment tracking
  enrichment_completeness NUMERIC,
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. EOSIC entries
CREATE TABLE IF NOT EXISTS eosic_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  area TEXT CHECK (area IN ('POLITICAL', 'ECONOMIC', 'SOCIOLOGICAL', 'TECHNOLOGICAL', 'LEGAL', 'ENVIRONMENTAL')),
  items TEXT[] NOT NULL,
  implication TEXT,
  sources TEXT[],
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- 5. CIS Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  challenge_solved TEXT,
  estimated_revenue TEXT,
  status TEXT DEFAULT 'concept',
  linked_hubspot_deal_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Man-Marking assignments
CREATE TABLE IF NOT EXISTS man_marking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  campfire_member TEXT NOT NULL,
  campfire_hubspot_owner_id TEXT,
  role_description TEXT,
  marking_contacts TEXT[],
  action_plan TEXT,
  this_week_recommendation TEXT, -- AI-generated weekly
  recommendation_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Signals (real-time intelligence feed)
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  type TEXT CHECK (type IN ('ENGAGEMENT_GAP', 'PIPELINE_MOVE', 'ORG_CHANGE', 'NEWS', 'LINKEDIN_POST', 'SOCIAL_ACTIVITY', 'COMPETITOR', 'REGULATION', 'DELIVERY_SLIP', 'MEETING_PREP', 'SENTIMENT_SHIFT', 'FINANCE_ALERT', 'NEW_HIRE', 'JOB_POSTING', 'EVENT', 'CAMPAIGN_DETECTED')),
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  title TEXT NOT NULL,
  detail TEXT,
  source TEXT,
  source_url TEXT,
  related_contact_id UUID REFERENCES contact_kap_data(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  dismissed_by TEXT,
  dismissed_at TIMESTAMPTZ
);

-- 8. Delivery tracking (from Asana)
CREATE TABLE IF NOT EXISTS delivery_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  period_start DATE,
  period_end DATE,
  tasks_due INTEGER,
  tasks_completed_on_time INTEGER,
  tasks_overdue INTEGER,
  delivery_velocity NUMERIC, -- % on-time
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Campaign performance (from Supermetrics)
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  period_start DATE,
  period_end DATE,
  platform TEXT, -- TikTok, Instagram, etc.
  reach BIGINT,
  impressions BIGINT,
  engagement_rate NUMERIC,
  video_views BIGINT,
  follower_growth INTEGER,
  cpm NUMERIC,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Connected team members (cross-team Gmail/Calendar visibility)
CREATE TABLE IF NOT EXISTS connected_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  gmail_connected BOOLEAN DEFAULT false,
  calendar_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contact_kap_data(account_id);
CREATE INDEX IF NOT EXISTS idx_contact_intel ON contact_intelligence(contact_kap_id);
CREATE INDEX IF NOT EXISTS idx_eosic_account ON eosic_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_account ON opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_man_marking_account ON man_marking(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_account ON signals(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_signals_contact ON signals(related_contact_id);
CREATE INDEX IF NOT EXISTS idx_delivery_account ON delivery_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_campaign_account ON campaign_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_team_members_account ON connected_team_members(account_id);
