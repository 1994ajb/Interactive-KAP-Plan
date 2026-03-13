-- KAP Intelligence Terminal — Seed Data for Vaseline UK
-- Run this after migration.sql

-- Insert Vaseline UK account
INSERT INTO accounts (name, hubspot_company_ids, tier, objective_retention, objective_development, why_change, why_now, why_us, strengths, vulnerabilities)
VALUES (
  'Vaseline UK',
  ARRAY['19088968678', '19088968673', '18940172240'],
  'RETENTION',
  'Stabilise the account. Reset expectations, improve transparency, evolve the partnership. Address instability from client behaviour, budget restriction and demands.',
  'Grow through strategic value, expand remit beyond UK into Global markets. Target fee growth through CIS, renegotiated rate card, and expanded services.',
  'Vaseline UK''s social success has accelerated faster than its operating model. A TikTok-led, creator-heavy approach now drives cultural relevance, but introduces greater complexity, compliance risk and delivery pressure for a junior, capacity-constrained brand team.',
  'TikTok is the brand''s primary awareness engine. Regulatory scrutiny around influencer disclosure and sustainability has intensified. Fossil-origin scrutiny and packaging commitments are becoming more visible to consumers.',
  'Social-first partner built for brands at the intersection of culture, creators and credibility. We act as a capacity multiplier, bring governance and speed to creator-led social, and translate cultural moments into brand-safe, compliant, high-performing content.',
  ARRAY['2 years deep brand knowledge', 'UK + US market perspective', 'Proactive, trend-aware team', 'Reliable BAU delivery'],
  ARRAY['Fee capped at 20% + reduced rate card', 'Limited strategic leadership showcase', 'Reactive workloads limiting impact', 'Prior trust issues with Sasha']
);

-- Get the account ID for foreign keys
DO $$
DECLARE
  v_account_id UUID;
BEGIN
  SELECT id INTO v_account_id FROM accounts WHERE name = 'Vaseline UK' LIMIT 1;

  -- Insert contacts
  INSERT INTO contact_kap_data (account_id, hubspot_contact_id, name, role, relationship_level, buyer_type, campfire_owner, priority, next_step, tenure) VALUES
    (v_account_id, '697957251306', 'Jocelyn Hsieh', 'Global Marketing Director', 'ACCEPTANCE', 'EB', 'Joe Gradwell', 'CRITICAL', 'Man-mark with senior, high-impact touchpoints. Present simplified social operating model.', '20+ years'),
    (v_account_id, '587323488492', 'Hannah Kingsman', 'Senior Influencer & PR Manager', 'TRUST', 'Coach', 'Catrina Bannon', 'HIGH', 'Develop relationship with Jocelyn as Hannah takes a background role.', '2 years'),
    (v_account_id, '587323488491', 'Sasha Werb', 'Influencer Marketing Specialist', 'TRUST', 'Coach', 'Olivia Lavelle', 'HIGH', 'Show rationale and proactivity — what Sasha values most.', '2 years'),
    (v_account_id, NULL, 'Chiara Posca', 'Brand Lead', 'RESPECT', 'Respect', 'Olivia Lavelle', 'MEDIUM', 'Position as her strategic partner. She doesn''t fully trust us yet.', '9 years'),
    (v_account_id, NULL, 'Emily Best', 'Intern', 'TRUST', 'Coach', 'Kelly Buckley', 'LOW', 'Support her where possible. She reports into Sasha.', '2 years'),
    (v_account_id, NULL, 'Karla Powlesland', 'Senior Social & Content Manager', 'RESPECT', 'Respect', 'Kelly Buckley', 'MEDIUM', 'Build trust so she comes to us for influencer reposts.', '2 years'),
    (v_account_id, NULL, 'Jasmine Pendrey', 'Content Lead', 'RESPECT', 'Respect', 'Kelly Buckley', 'MEDIUM', 'Develop relationship — she''s increasingly involved in approvals.', '5 years'),
    (v_account_id, '723163892958', 'Katherine Frizoni', 'Market R&D', 'ACCEPTANCE', 'Acceptance', 'Unassigned', 'MEDIUM', 'Get in front of her — she doesn''t understand what we do.', '14 years'),
    (v_account_id, NULL, 'Juan Pablo Galindo', 'B&W General Manager', 'ACKNOWLEDGE', 'Acknowledge', 'Joe Gradwell', 'LOW', 'Starting to join IAT calls. Good opportunity to show creativity.', '25 years'),
    (v_account_id, '723163892960', 'Lisa McKenty', 'TikTok Shop (freelance)', 'ACCEPTANCE', 'Acceptance', 'Unassigned', 'LOW', 'Explore TTS offering opportunity.', '1 year');

  -- Insert EOSIC entries
  INSERT INTO eosic_entries (account_id, area, items, implication) VALUES
    (v_account_id, 'POLITICAL', ARRAY['Post-Brexit regulatory divergence for cosmetics', 'UK EPR rules (2025) increase costs for plastic-heavy brands', 'California SB-54 plastics law (2027) sets global standard'], 'Regulatory pressure accelerates need for compliant sustainability storytelling.'),
    (v_account_id, 'ECONOMIC', ARRAY['Petroleum jelly margins sensitive to oil volatility', 'Unilever B&W division grew 4.3% to €12.8bn in 2025', 'Vaseline double-digit growth for 3 consecutive years'], 'Strong tailwinds support social investment, but cost volatility increases ROI scrutiny.'),
    (v_account_id, 'SOCIOLOGICAL', ARRAY['Gen Z skin barrier obsession: 4bn+ #slugging views', 'Healing Project reached 27m people', 'Rising scepticism toward unsafe beauty hacks'], 'Social is a reputation channel. Creator-led education and trust-building are critical.'),
    (v_account_id, 'TECHNOLOGICAL', ARRAY['Serum-burst technology enables premiumisation', 'Creator analytics stack: sub-72hr iteration', 'Real-time social intelligence for Vaseline Verified'], 'Competitive advantage in speed-to-culture. Prioritise rapid testing and creator partnerships.'),
    (v_account_id, 'LEGAL', ARRAY['ASA tightened influencer disclosure rules', 'Increased scrutiny on health and sustainability claims'], 'Social-first model increases legal exposure. Clear compliance processes are essential.'),
    (v_account_id, 'ENVIRONMENTAL', ARRAY['Fossil-origin scrutiny from Greenpeace', 'Packaging redesigns saved equiv. of 11m bottles'], 'Sustainability storytelling must be credible and evidence-backed.');

  -- Insert CIS Opportunities
  INSERT INTO opportunities (account_id, name, challenge_solved, estimated_revenue) VALUES
    (v_account_id, 'Simplified Creator Engine', 'Inconsistent creator rationale, repetitive content, internal burden', 'TBC'),
    (v_account_id, 'Culture Command Centre (Spark & Compass)', 'Reactive trend engagement, lack of foresight, missed cultural moments', 'TBC'),
    (v_account_id, 'Strategic Confidence Reset', 'Perceived lack of trust + executional positioning', '£50k'),
    (v_account_id, 'Performance & ROI Framework', 'Social metrics not linked to brand KPIs', 'TBC');

  -- Insert Man-Marking assignments
  INSERT INTO man_marking (account_id, campfire_member, role_description, marking_contacts, action_plan) VALUES
    (v_account_id, 'Joe Gradwell', 'Exec sponsor / relationship lead', ARRAY['Jocelyn Hsieh'], 'Build high-trust relationship; lay groundwork for CIS pitching'),
    (v_account_id, 'Catrina Bannon', 'Senior client liaison', ARRAY['Hannah Kingsman'], 'Strengthen influence with Jocelyn and Hannah for broader buy-in'),
    (v_account_id, 'Olivia Lavelle', 'Day to day lead / account strategist', ARRAY['Chiara Posca', 'Sasha Werb'], 'Bi-weekly 1:1s to align KPIs, pre-empt blockers, share innovation'),
    (v_account_id, 'Kelly Buckley', 'BAU lead', ARRAY['Jasmine Pendrey', 'Karla Powlesland', 'Emily Best'], 'Clear SLAs; monthly report showing efficiency and problem-solving');

  -- Insert Signals
  INSERT INTO signals (account_id, type, priority, text, timestamp) VALUES
    (v_account_id, 'ALERT', 'HIGH', 'Jocelyn Hsieh has not been contacted in 12 days — exceeds CRITICAL threshold (7 days)', now()),
    (v_account_id, 'NEWS', 'MEDIUM', 'Unilever B&W division reports 4.3% growth to €12.8bn — strong tailwind for social investment', now() - interval '2 days'),
    (v_account_id, 'REGULATION', 'HIGH', 'ASA issues updated guidance on influencer disclosure — review all active creator briefs', now() - interval '5 days'),
    (v_account_id, 'SOCIAL', 'MEDIUM', '#slugging reaches 4.2bn TikTok views — Vaseline well-positioned but no owned content this month', now() - interval '7 days'),
    (v_account_id, 'COMPETITOR', 'LOW', 'CeraVe launches creator-first TikTok campaign with dermatologist partnership format', now() - interval '10 days'),
    (v_account_id, 'PIPELINE_MOVE', 'MEDIUM', 'Vaseline Gluta-Hya UK Social deal moved to Creating Value stage', now() - interval '3 days'),
    (v_account_id, 'LINKEDIN', 'LOW', 'Chiara Posca shared a post about brand authenticity in social marketing', now() - interval '14 days');
END $$;
