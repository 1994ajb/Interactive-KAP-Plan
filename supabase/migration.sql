-- KAP Intelligence Terminal — Database Schema
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
  strengths TEXT[],
  vulnerabilities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contact KAP Data
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
  tenure TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EOSIC Entries
CREATE TABLE IF NOT EXISTS eosic_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  area TEXT CHECK (area IN ('POLITICAL', 'ECONOMIC', 'SOCIOLOGICAL', 'TECHNOLOGICAL', 'LEGAL', 'ENVIRONMENTAL')),
  items TEXT[] NOT NULL,
  implication TEXT,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- 4. CIS Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  name TEXT NOT NULL,
  challenge_solved TEXT,
  estimated_revenue TEXT,
  status TEXT DEFAULT 'concept',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Man-Marking Assignments
CREATE TABLE IF NOT EXISTS man_marking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  campfire_member TEXT NOT NULL,
  role_description TEXT,
  marking_contacts TEXT[],
  action_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id),
  type TEXT CHECK (type IN ('ALERT', 'NEWS', 'LINKEDIN', 'SOCIAL', 'COMPETITOR', 'REGULATION', 'PIPELINE_MOVE')),
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  text TEXT NOT NULL,
  source_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  dismissed BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contact_kap_data(account_id);
CREATE INDEX IF NOT EXISTS idx_eosic_account ON eosic_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_account ON opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_man_marking_account ON man_marking(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_account ON signals(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
