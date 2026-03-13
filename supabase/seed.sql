-- KAP Intelligence Terminal — Seed Data for Vaseline UK (v2)
-- Run this after migration.sql

-- Insert Vaseline UK account
INSERT INTO accounts (name, hubspot_company_ids, tier, objective_retention, objective_development, why_change, why_now, why_us, strengths, vulnerabilities, target_annual_revenue)
VALUES (
  'Vaseline UK',
  ARRAY['19088968678', '19088968673', '18940172240'],
  'RETENTION',
  'Stabilise the account. Reset expectations, improve transparency, evolve the partnership. Address instability from client behaviour, budget restriction and demands.',
  'Grow through strategic value, expand remit beyond UK into Global markets. Target fee growth through CIS, renegotiated rate card, and expanded services.',
  'Vaseline UK''s social success has accelerated faster than its operating model. A TikTok-led, creator-heavy approach introduces complexity, compliance risk and delivery pressure for a junior, capacity-constrained brand team.',
  'TikTok is the brand''s primary awareness engine. Regulatory scrutiny around influencer disclosure and sustainability has intensified. Fossil-origin scrutiny and packaging commitments are increasingly visible to consumers.',
  'Social-first partner built for culture, creators and credibility. We act as a capacity multiplier, bring governance and speed to creator-led social, and translate cultural moments into brand-safe, compliant, high-performing content.',
  ARRAY['2 years deep brand knowledge', 'UK + US market perspective', 'Proactive trend-aware team', 'Reliable BAU delivery'],
  ARRAY['Fee capped at 20% + reduced rate card', 'Limited strategic leadership showcase', 'Reactive workloads limiting impact', 'Prior trust issues with Sasha'],
  150000
);

-- Get the account ID for foreign keys
DO $$
DECLARE
  v_account_id UUID;
  v_jocelyn_id UUID;
  v_hannah_id UUID;
  v_sasha_id UUID;
  v_chiara_id UUID;
  v_katherine_id UUID;
  v_jasmine_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM accounts WHERE name = 'Vaseline UK' LIMIT 1;

  -- Insert contacts
  INSERT INTO contact_kap_data (account_id, hubspot_contact_id, name, role, relationship_level, buyer_type, campfire_owner, man_marking_owner, priority, tenure, next_step, linkedin_url) VALUES
    (v_account_id, '697957251306', 'Jocelyn Hsieh', 'Global Marketing Director', 'ACCEPTANCE', 'EB', 'Joseph Gradwell', 'Joseph Gradwell', 'CRITICAL', '20+ years', 'Man-mark with senior, high-impact touchpoints. Present simplified social operating model. Lead with bold, commercially grounded thinking.', NULL),
    (v_account_id, '587323488492', 'Hannah Kingsman', 'Senior Influencer & PR Manager', 'TRUST', 'Coach', 'Catrina Bannon', 'Catrina Bannon', 'HIGH', '2 years', 'Develop relationship with Jocelyn as Hannah takes background role. Ensure we maintain Hannah as advocate while building the new power centre.', NULL),
    (v_account_id, '587323488491', 'Sasha Werb', 'Influencer Marketing Specialist', 'TRUST', 'Coach', 'Olivia Lavelle', 'Olivia Lavelle', 'HIGH', '2 years', 'Show rationale and proactivity — what Sasha values most. Bi-weekly 1:1s to pre-empt blockers and secure approvals.', NULL),
    (v_account_id, NULL, 'Chiara Posca', 'Brand Lead', 'RESPECT', 'Respect', 'Olivia Lavelle', 'Olivia Lavelle', 'MEDIUM', '9 years', 'Position as her strategic partner. She doesn''t fully trust us yet. Her role is becoming more pivotal in briefings and Culture Clubs.', NULL),
    (v_account_id, NULL, 'Emily Best', 'Intern', 'TRUST', 'Coach', 'Kelly Buckley', 'Kelly Buckley', 'LOW', '2 years', 'Support where possible. She reports into Sasha. Gives us the most positive feedback.', NULL),
    (v_account_id, NULL, 'Karla Powlesland', 'Senior Social & Content Manager', 'RESPECT', 'Respect', 'Kelly Buckley', 'Kelly Buckley', 'MEDIUM', '2 years', 'Build trust so she comes to us for influencer reposts. Sometimes doesn''t consult us.', NULL),
    (v_account_id, NULL, 'Jasmine Pendrey', 'Content Lead', 'RESPECT', 'Respect', 'Kelly Buckley', 'Kelly Buckley', 'MEDIUM', '5 years', 'Develop stronger relationship — she''s increasingly involved in content approvals.', NULL),
    (v_account_id, '723163892958', 'Katherine Frizoni', 'Market R&D', 'ACCEPTANCE', 'Acceptance', 'Unassigned', NULL, 'MEDIUM', '14 years', 'Get in front of her — she accepts our presence but doesn''t understand what we do. Worked with her in Culture Club.', NULL),
    (v_account_id, NULL, 'Juan Pablo Galindo', 'B&W General Manager', 'ACKNOWLEDGE', 'Acknowledge', 'Joseph Gradwell', NULL, 'LOW', '25 years', 'Starting to join IAT calls. Good opportunity to show creativity. Rare direct contact.', NULL),
    (v_account_id, '723163892960', 'Lisa McKenty', 'TikTok Shop (freelance)', 'ACCEPTANCE', 'Acceptance', 'Unassigned', NULL, 'LOW', '1 year', 'Explore TTS offering opportunity. She''s been on IAT calls but rare direct contact.', NULL)
  RETURNING id INTO v_jocelyn_id; -- captures the last insert, we'll use contact names for signals

  -- Get specific contact IDs for signal references
  SELECT id INTO v_jocelyn_id FROM contact_kap_data WHERE name = 'Jocelyn Hsieh' AND account_id = v_account_id;
  SELECT id INTO v_hannah_id FROM contact_kap_data WHERE name = 'Hannah Kingsman' AND account_id = v_account_id;
  SELECT id INTO v_sasha_id FROM contact_kap_data WHERE name = 'Sasha Werb' AND account_id = v_account_id;
  SELECT id INTO v_chiara_id FROM contact_kap_data WHERE name = 'Chiara Posca' AND account_id = v_account_id;
  SELECT id INTO v_katherine_id FROM contact_kap_data WHERE name = 'Katherine Frizoni' AND account_id = v_account_id;
  SELECT id INTO v_jasmine_id FROM contact_kap_data WHERE name = 'Jasmine Pendrey' AND account_id = v_account_id;

  -- Insert contact intelligence (partial data — represents what Clay/Gmail would populate)
  INSERT INTO contact_intelligence (contact_kap_id, interaction_sentiment, meeting_frequency_days) VALUES
    (v_jocelyn_id, 'NEUTRAL', NULL),
    (v_hannah_id, 'POSITIVE', 14),
    (v_sasha_id, 'POSITIVE', 7);

  -- Insert EOSIC entries with sources
  INSERT INTO eosic_entries (account_id, area, items, implication, sources) VALUES
    (v_account_id, 'POLITICAL', ARRAY['Post-Brexit regulatory divergence for cosmetics', 'UK EPR rules (2025) increase costs for plastic-heavy brands', 'California SB-54 plastics law (2027) sets global standard'], 'Regulatory pressure accelerates need for compliant sustainability storytelling.', ARRAY['UK Parliamentary Briefing 2023', 'DEFRA factsheet Oct 2023']),
    (v_account_id, 'ECONOMIC', ARRAY['Petroleum jelly margins sensitive to oil volatility (Brent avg $82 in 2025)', 'Unilever B&W division grew 4.3% to €12.8bn in 2025', 'Vaseline double-digit growth for 3 consecutive years'], 'Strong tailwinds support social investment, but cost volatility increases ROI scrutiny.', ARRAY['World Bank Commodity Outlook Jan 2026', 'Cosmetics Business Feb 2026']),
    (v_account_id, 'SOCIOLOGICAL', ARRAY['Gen Z skin barrier obsession: 4bn+ #slugging views', 'Healing Project reached 27m people', 'Rising scepticism toward unsafe beauty hacks'], 'Social is a reputation channel. Creator-led education and trust-building are critical.', ARRAY['TikTok Trend Report Dec 2025', 'PR Newswire Jan 2026']),
    (v_account_id, 'TECHNOLOGICAL', ARRAY['Serum-burst technology enables premiumisation', 'Creator analytics stack: sub-72hr iteration', 'Real-time social intelligence for Vaseline Verified'], 'Competitive advantage in speed-to-culture. Prioritise rapid testing and creator partnerships.', ARRAY['CEW UK interview May 2025', 'WPP case study Jun 2025']),
    (v_account_id, 'LEGAL', ARRAY['ASA tightened influencer disclosure rules in 2025', 'Increased scrutiny on health and sustainability claims'], 'Social-first model increases legal exposure. Clear compliance processes are essential.', ARRAY['ASA Enforcement Notice Jul 2025']),
    (v_account_id, 'ENVIRONMENTAL', ARRAY['Fossil-origin scrutiny from Greenpeace (Nov 2024 watch-list)', 'Packaging redesigns saved equiv. of 11m bottles since 2018'], 'Sustainability storytelling must be credible and evidence-backed.', ARRAY['Greenpeace Nov 2024', 'SustainablePackaging.org Dec 2025']);

  -- Insert CIS Opportunities
  INSERT INTO opportunities (account_id, name, challenge_solved, estimated_revenue, status) VALUES
    (v_account_id, 'Simplified Creator Engine', 'Inconsistent creator rationale, repetitive content, internal burden', 'TBC', 'concept'),
    (v_account_id, 'Culture Command Centre (Spark & Compass)', 'Reactive trend engagement, lack of foresight, missed cultural moments', 'TBC', 'concept'),
    (v_account_id, 'Strategic Confidence Reset', 'Perceived lack of trust + executional positioning', '£50k', 'concept'),
    (v_account_id, 'Performance & ROI Framework', 'Social metrics not linked to brand KPIs', 'TBC', 'concept');

  -- Insert Man-Marking assignments
  INSERT INTO man_marking (account_id, campfire_member, campfire_hubspot_owner_id, role_description, marking_contacts, action_plan) VALUES
    (v_account_id, 'Joseph Gradwell', '1089678893', 'Exec sponsor / relationship lead', ARRAY['Jocelyn Hsieh'], 'Build high-trust relationship; lay groundwork for CIS pitching once trust established. Fewer, sharper interactions focused on strategic value.'),
    (v_account_id, 'Catrina Bannon', '31267666', 'Senior client liaison', ARRAY['Hannah Kingsman'], 'Strengthen influence with Jocelyn and Hannah for broader buy-in. Monthly 1:1 strategic reviews with Hannah.'),
    (v_account_id, 'Olivia Lavelle', '31267669', 'Day to day lead / account strategist', ARRAY['Chiara Posca', 'Sasha Werb'], 'Bi-weekly 1:1s to align KPIs, pre-empt blockers, share innovation. Demonstrate campaign ROI.'),
    (v_account_id, 'Kelly Buckley', '31267672', 'BAU lead', ARRAY['Jasmine Pendrey', 'Karla Powlesland', 'Emily Best'], 'Clear SLAs for campaign requests. Monthly report showing efficiency and proactive problem-solving.');

  -- Insert Signals with source attribution
  INSERT INTO signals (account_id, type, priority, title, detail, source, related_contact_id, timestamp) VALUES
    (v_account_id, 'ENGAGEMENT_GAP', 'HIGH', 'Jocelyn Hsieh has not been contacted in 12 days', 'Exceeds CRITICAL threshold of 7 days. As Economic Buyer, this is the highest priority engagement gap.', 'HubSpot', v_jocelyn_id, now()),
    (v_account_id, 'NEWS', 'MEDIUM', 'Unilever B&W division reports 4.3% growth to €12.8bn', 'Strong tailwind for social investment. Reference in next strategic conversation with Jocelyn.', 'Clay', NULL, now() - interval '2 days'),
    (v_account_id, 'REGULATION', 'HIGH', 'ASA issues updated guidance on influencer disclosure', 'Review all active creator briefs for compliance. Brief the team on new requirements.', 'Web', NULL, now() - interval '5 days'),
    (v_account_id, 'SOCIAL_ACTIVITY', 'MEDIUM', '#slugging reaches 4.2bn TikTok views', 'Vaseline well-positioned but no owned content this month. Opportunity for reactive content.', 'Clay', NULL, now() - interval '7 days'),
    (v_account_id, 'COMPETITOR', 'LOW', 'CeraVe launches creator-first TikTok campaign', 'Dermatologist partnership format. Monitor performance and share competitive analysis.', 'Clay', NULL, now() - interval '10 days'),
    (v_account_id, 'PIPELINE_MOVE', 'MEDIUM', 'Vaseline Gluta-Hya UK Social moved to Creating Value', 'Deal progressed from Penetrating. Good momentum — maintain engagement cadence.', 'HubSpot', NULL, now() - interval '3 days'),
    (v_account_id, 'LINKEDIN_POST', 'LOW', 'Chiara Posca shared post about brand authenticity', 'Chiara shared an article on brand authenticity in social marketing. Good conversation opener.', 'Clay', v_chiara_id, now() - interval '14 days'),
    (v_account_id, 'ENGAGEMENT_GAP', 'MEDIUM', 'Katherine Frizoni last contacted 35 days ago', 'Exceeds MEDIUM threshold of 21 days. She remains poorly understood — assign an owner.', 'HubSpot', v_katherine_id, now() - interval '1 day'),
    (v_account_id, 'ENGAGEMENT_GAP', 'MEDIUM', 'Jasmine Pendrey last contacted 22 days ago', 'Exceeds MEDIUM threshold of 21 days. She is increasingly involved in approvals.', 'HubSpot', v_jasmine_id, now() - interval '1 day');
END $$;
