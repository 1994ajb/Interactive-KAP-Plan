-- KAP Intelligence Terminal — Seed Data: Vaseline UK (Pilot Account) v4
-- Run this AFTER migration.sql in your Supabase SQL editor

-- ─── 1. Account ──────────────────────────────────────────────────────────────

INSERT INTO accounts (id, name, hubspot_company_ids, tier, objective_retention, objective_development, why_change, why_now, why_us, why_validated_by_client, strengths, vulnerabilities, target_annual_revenue, social_strategy_summary, key_initiatives, client_challenges)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Vaseline UK',
  ARRAY['19088968678', '19088968673', '18940172240'],
  'RETENTION',
  'Stabilise the account. Reset expectations, improve transparency, evolve the partnership. Address instability from client behaviour, budget restriction and demands.',
  'Grow through strategic value, expand remit beyond UK into Global markets. Target fee growth through CIS, renegotiated rate card, and expanded services.',
  'Vaseline UK''s social success has accelerated faster than its operating model. A TikTok-led, creator-heavy approach introduces complexity, compliance risk and delivery pressure for a junior, capacity-constrained brand team.',
  'TikTok is the brand''s primary awareness engine. Regulatory scrutiny around influencer disclosure and sustainability has intensified. Fossil-origin scrutiny and packaging commitments are increasingly visible to consumers.',
  'Social-first partner built for culture, creators and credibility. We act as a capacity multiplier, bring governance and speed to creator-led social, and translate cultural moments into brand-safe, compliant, high-performing content.',
  false,
  ARRAY['2 years deep brand knowledge', 'UK + US market perspective', 'Proactive trend-aware team', 'Reliable BAU delivery'],
  ARRAY['Fee capped at 20% + reduced rate card', 'Limited strategic leadership showcase', 'Reactive workloads limiting impact', 'Prior trust issues with Sasha'],
  150000,
  'TikTok-first creator strategy with #slugging cultural moment ownership. Expanding into Instagram Reels and YouTube Shorts. Focus on dermatologist-backed education content and Healing Project amplification.',
  '[{"name":"Creator Engine Simplification","status":"active","description":"Streamline creator selection, briefing, and approval workflow"},{"name":"Culture Command Centre","status":"planned","description":"Real-time trend monitoring with Spark & Compass framework"},{"name":"Vaseline Verified Content Hub","status":"active","description":"Centralised content repository with compliance tagging"}]'::jsonb,
  ARRAY['Junior brand team overwhelmed by creator volume', 'Approval bottlenecks delaying time-sensitive content', 'Budget restrictions limiting scope expansion', 'Inconsistent brief quality across campaigns']
)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Contacts ─────────────────────────────────────────────────────────────

INSERT INTO contact_kap_data (id, account_id, hubspot_contact_id, name, role, relationship_level, buyer_type, campfire_owner, man_marking_owner, priority, next_step, tenure, kap_title, verified_title, title_verified, title_discrepancy_flagged) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '697957251306', 'Jocelyn Hsieh', 'Global Marketing Director', 'ACCEPTANCE', 'EB', 'Joseph Gradwell', 'Joseph Gradwell', 'CRITICAL', 'Man-mark with senior, high-impact touchpoints. Present simplified social operating model. Lead with bold, commercially grounded thinking.', '20+ years', 'Global Marketing Director', 'Global Brand Lead, Simple Face Care & Beauty Academy', false, true),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '587323488492', 'Hannah Kingsman', 'Senior Influencer & PR Manager', 'TRUST', 'Coach', 'Catrina Bannon', 'Catrina Bannon', 'HIGH', 'Develop relationship with Jocelyn as Hannah takes background role. Ensure we maintain Hannah as advocate while building the new power centre.', '2 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '587323488491', 'Sasha Werb', 'Influencer Marketing Specialist', 'TRUST', 'Coach', 'Olivia Lavelle', 'Olivia Lavelle', 'HIGH', 'Show rationale and proactivity — what Sasha values most. Bi-weekly 1:1s to pre-empt blockers and secure approvals.', '2 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', NULL, 'Chiara Posca', 'Brand Lead', 'RESPECT', 'Respect', 'Olivia Lavelle', 'Olivia Lavelle', 'MEDIUM', 'Position as her strategic partner. She doesn''t fully trust us yet. Her role is becoming more pivotal in briefings and Culture Clubs.', '9 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', NULL, 'Emily Best', 'Intern', 'TRUST', 'Coach', 'Kelly Buckley', 'Kelly Buckley', 'LOW', 'Support where possible. She reports into Sasha. Gives us the most positive feedback.', '2 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NULL, 'Karla Powlesland', 'Senior Social & Content Manager', 'RESPECT', 'Respect', 'Kelly Buckley', 'Kelly Buckley', 'MEDIUM', 'Build trust so she comes to us for influencer reposts. Sometimes doesn''t consult us.', '2 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', NULL, 'Jasmine Pendrey', 'Content Lead', 'RESPECT', 'Respect', 'Kelly Buckley', 'Kelly Buckley', 'MEDIUM', 'Develop stronger relationship — she''s increasingly involved in content approvals.', '5 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '723163892958', 'Katherine Frizoni', 'Market R&D', 'ACCEPTANCE', 'Acceptance', 'Unassigned', NULL, 'MEDIUM', 'Get in front of her — she accepts our presence but doesn''t understand what we do. Worked with her in Culture Club.', '14 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', NULL, 'Juan Pablo Galindo', 'B&W General Manager', 'ACKNOWLEDGE', 'Acknowledge', 'Joseph Gradwell', NULL, 'LOW', 'Starting to join IAT calls. Good opportunity to show creativity. Rare direct contact.', '25 years', NULL, NULL, NULL, false),
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '723163892960', 'Lisa McKenty', 'TikTok Shop (freelance)', 'ACCEPTANCE', 'Acceptance', 'Unassigned', NULL, 'LOW', 'Explore TTS offering opportunity. She''s been on IAT calls but rare direct contact.', '1 year', NULL, NULL, NULL, false)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Contact Intelligence ─────────────────────────────────────────────────

-- Jocelyn (richest data from live audit)
INSERT INTO contact_intelligence (id, contact_kap_id, personality_profile, communication_style, decision_pattern, motivations, frustrations, recommended_approach, priorities_assessment, web_footprint_summary, press_mentions, campaign_credits, web_footprint_last_searched, strategic_context, industry_debate, company_strategy_alignment, hubspot_record_complete, hubspot_missing_fields, enrichment_completeness, interaction_sentiment)
VALUES (
  'i0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Senior leader who values strategic thinking and commercial rigour. Prefers data-backed recommendations over creative pitches. Low tolerance for operational noise.',
  'Direct and concise. Prefers structured presentations with clear recommendations. Email-first for updates, meetings for decisions only.',
  'Top-down decision maker. Requires business case and ROI projection. Typically consults Hannah before signing off.',
  ARRAY['Brand growth through innovation', 'Global market expansion', 'Operational efficiency'],
  ARRAY['Reactive agency behaviour', 'Unclear ROI on social spend', 'Too many operational escalations'],
  'Lead with commercial impact. Keep interactions strategic — avoid operational details. Present simplified models with clear next steps.',
  'Jocelyn is focused on demonstrating social ROI to the wider Unilever B&W leadership. Her immediate priority is Q2 campaign performance proving the TikTok-first strategy. Secondary focus on reducing operational friction between Campfire and the brand team.',
  'Jocelyn has a significant digital marketing footprint beyond social. She led interactive Dove DOOH campaigns at Victoria Station, has Cannes Lions credits on LoveTheWork, and has been quoted in Digital Signage Today and Marketing Week. She has deep experience in experiential and interactive marketing — not just social. Reference her Dove campaign work when positioning Campfire.',
  '[{"publication":"Marketing Week","date":"2024-09-15","context":"Quoted on the evolution of interactive OOH campaigns in skincare marketing"},{"publication":"Digital Signage Today","date":"2024-06-20","context":"Featured for Dove interactive DOOH campaign at London Victoria Station"},{"publication":"Campaign","date":"2023-11-10","context":"Mentioned in profile of Unilever''s experiential marketing leaders"}]'::jsonb,
  '[{"campaign":"Dove Interactive DOOH — Victoria Station","brand":"Dove","year":"2024","agency":"Mindshare","award":"Cannes Lions shortlist"},{"campaign":"Simple Skincare Digital Refresh","brand":"Simple","year":"2023","agency":"In-house + WPP"},{"campaign":"Dove Real Beauty — Social Extension","brand":"Dove","year":"2022","agency":"Ogilvy"}]'::jsonb,
  now() - interval '2 days',
  'Unilever CEO Fernando Fernandez has publicly declared a social-first pivot, shifting 50% of ad budget to creators. Vaseline is the poster child cited in investor presentations. This validates Campfire''s value proposition but creates intense scrutiny pressure — if social ROI disappoints, budgets may reverse rapidly. Adweek has published critical analysis questioning whether the social-first strategy is sustainable.',
  '[{"topic":"Unilever social-first pivot viability","position":"Industry critics question whether shifting 50% to creators is sustainable at scale","source":"Adweek","date":"2026-02-15"},{"topic":"Creator economy ROI measurement","position":"Brands struggling to attribute sales to influencer spend","source":"Marketing Week","date":"2026-01-20"},{"topic":"Fossil-origin ingredient scrutiny","position":"Greenpeace watch-list creates sustainability narrative risk for petroleum-based brands","source":"The Drum","date":"2025-11-05"}]'::jsonb,
  'Jocelyn sits at the intersection of Unilever''s social-first mandate and Vaseline''s explosive growth. Her success is directly tied to proving social ROI at scale. Campfire''s role is to be the evidence that the strategy works.',
  false,
  ARRAY['firstname', 'lastname', 'jobtitle', 'email'],
  68,
  'NEUTRAL'
)
ON CONFLICT (id) DO NOTHING;

-- Hannah
INSERT INTO contact_intelligence (id, contact_kap_id, interaction_summary, interaction_sentiment, meeting_frequency_days, invite_acceptance_rate, meeting_coattendees, email_cc_patterns, personality_profile, communication_style, decision_pattern, motivations, frustrations, recommended_approach, upcoming_events, recent_events, priorities_assessment, enrichment_completeness)
VALUES (
  'i0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'Hannah has been responsive and collaborative in recent weeks. Last 3 interactions focused on creator brief approvals and Q2 campaign planning. Tone is warm and supportive — she continues to advocate for Campfire internally.',
  'POSITIVE',
  14, 92,
  ARRAY['Sasha Werb', 'Chiara Posca', 'Olivia Lavelle'],
  ARRAY['Jocelyn Hsieh', 'Sasha Werb'],
  'Collaborative and detail-oriented. Acts as internal champion for Campfire. Values transparency and regular updates.',
  'Warm and open. Prefers regular check-ins over formal presentations. Slack-friendly for quick questions, email for briefs and approvals.',
  'Consensus builder. Gathers input from Sasha and Chiara before recommending to Jocelyn. Responds well to data-supported proposals.',
  ARRAY['Smooth campaign delivery', 'Team collaboration', 'Career advancement through visible wins'],
  ARRAY['Last-minute brief changes', 'Being bypassed in communication chains'],
  'Keep her in the loop on everything. Position her as the hero internally. Share wins she can present upward.',
  '[{"name":"Influencer Marketing Show London","date":"2026-04-15","type":"conference","relevance":"Speaking on panel about brand-creator partnerships"}]'::jsonb,
  '[{"name":"Unilever B&W Quarterly Review","date":"2026-03-01","type":"internal","relevance":"Presented social performance metrics"}]'::jsonb,
  'Hannah is focused on ensuring Q2 creator campaigns launch on schedule. She is also managing the transition as Jocelyn takes a more active role in social oversight. Her key concern is maintaining team morale while navigating increased scrutiny.',
  72
)
ON CONFLICT (id) DO NOTHING;

-- Sasha
INSERT INTO contact_intelligence (id, contact_kap_id, interaction_summary, interaction_sentiment, meeting_frequency_days, invite_acceptance_rate, meeting_coattendees, email_cc_patterns, personality_profile, communication_style, decision_pattern, motivations, frustrations, recommended_approach, priorities_assessment, enrichment_completeness)
VALUES (
  'i0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000003',
  'Sasha values proactivity and clear rationale. Recent interactions have been positive — she responded well to the pre-emptive creator brief update. Bi-weekly 1:1s are running smoothly.',
  'POSITIVE',
  7, 88,
  ARRAY['Hannah Kingsman', 'Emily Best', 'Olivia Lavelle'],
  ARRAY['Hannah Kingsman', 'Chiara Posca'],
  'Detail-driven executor who values proactivity and clear rationale. Past trust issues mean she watches closely for consistency between promises and delivery.',
  'Direct but fair. Prefers written briefs with clear timelines. Dislikes surprises — always pre-brief before meetings.',
  'Analytical. Needs to understand the "why" behind recommendations. Responds well to pre-emptive updates that show you are ahead of issues.',
  ARRAY['Efficient campaign execution', 'Creator quality over quantity', 'Proving influencer ROI'],
  ARRAY['Being caught off guard', 'Unclear rationale for creator selection', 'Late deliverables'],
  'Always explain rationale. Send pre-reads before meetings. Show you are anticipating issues before she raises them. Never surprise her.',
  'Sasha is laser-focused on Q2 creator campaign execution quality. She wants to see improved brief-to-delivery timelines and better creator selection rationale. Building trust through consistent, proactive delivery is the path to deepening this relationship.',
  65
)
ON CONFLICT (id) DO NOTHING;

-- ─── 4. EOSIC Entries ────────────────────────────────────────────────────────

INSERT INTO eosic_entries (id, account_id, area, items, implication, sources) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'POLITICAL', ARRAY['Post-Brexit regulatory divergence for cosmetics', 'UK EPR rules (2025) increase costs for plastic-heavy brands', 'California SB-54 plastics law (2027) sets global standard'], 'Regulatory pressure accelerates need for compliant sustainability storytelling.', ARRAY['UK Parliamentary Briefing 2023', 'DEFRA factsheet Oct 2023']),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ECONOMIC', ARRAY['Petroleum jelly margins sensitive to oil volatility (Brent avg $82 in 2025)', 'Unilever B&W division grew 4.3% to €12.8bn in 2025', 'Vaseline double-digit growth for 3 consecutive years'], 'Strong tailwinds support social investment, but cost volatility increases ROI scrutiny.', ARRAY['World Bank Commodity Outlook Jan 2026', 'Cosmetics Business Feb 2026']),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SOCIOLOGICAL', ARRAY['Gen Z skin barrier obsession: 4bn+ #slugging views', 'Healing Project reached 27m people', 'Rising scepticism toward unsafe beauty hacks'], 'Social is a reputation channel. Creator-led education and trust-building are critical.', ARRAY['TikTok Trend Report Dec 2025', 'PR Newswire Jan 2026']),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'TECHNOLOGICAL', ARRAY['Serum-burst technology enables premiumisation', 'Creator analytics stack: sub-72hr iteration', 'Real-time social intelligence for Vaseline Verified'], 'Competitive advantage in speed-to-culture. Prioritise rapid testing and creator partnerships.', ARRAY['CEW UK interview May 2025', 'WPP case study Jun 2025']),
('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'LEGAL', ARRAY['ASA tightened influencer disclosure rules in 2025', 'Increased scrutiny on health and sustainability claims'], 'Social-first model increases legal exposure. Clear compliance processes are essential.', ARRAY['ASA Enforcement Notice Jul 2025']),
('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ENVIRONMENTAL', ARRAY['Fossil-origin scrutiny from Greenpeace (Nov 2024 watch-list)', 'Packaging redesigns saved equiv. of 11m bottles since 2018'], 'Sustainability storytelling must be credible and evidence-backed.', ARRAY['Greenpeace Nov 2024', 'SustainablePackaging.org Dec 2025'])
ON CONFLICT (id) DO NOTHING;

-- ─── 5. CIS Opportunities ────────────────────────────────────────────────────

INSERT INTO opportunities (id, account_id, name, challenge_solved, estimated_revenue, status) VALUES
('o0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Simplified Creator Engine', 'Inconsistent creator rationale, repetitive content, internal burden', 'TBC', 'concept'),
('o0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Culture Command Centre (Spark & Compass)', 'Reactive trend engagement, lack of foresight, missed cultural moments', 'TBC', 'concept'),
('o0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Strategic Confidence Reset', 'Perceived lack of trust + executional positioning', '£50k', 'concept'),
('o0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Performance & ROI Framework', 'Social metrics not linked to brand KPIs', 'TBC', 'concept')
ON CONFLICT (id) DO NOTHING;

-- ─── 6. Man-Marking ──────────────────────────────────────────────────────────

INSERT INTO man_marking (id, account_id, campfire_member, campfire_hubspot_owner_id, role_description, marking_contacts, action_plan) VALUES
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Joseph Gradwell', '1089678893', 'Exec sponsor / relationship lead', ARRAY['Jocelyn Hsieh'], 'Build high-trust relationship; lay groundwork for CIS pitching once trust established. Fewer, sharper interactions focused on strategic value.'),
('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Catrina Bannon', '31267666', 'Senior client liaison', ARRAY['Hannah Kingsman'], 'Strengthen influence with Jocelyn and Hannah for broader buy-in. Monthly 1:1 strategic reviews with Hannah.'),
('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Olivia Lavelle', '31267669', 'Day to day lead / account strategist', ARRAY['Chiara Posca', 'Sasha Werb'], 'Bi-weekly 1:1s to align KPIs, pre-empt blockers, share innovation. Demonstrate campaign ROI.'),
('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Kelly Buckley', '31267672', 'BAU lead', ARRAY['Jasmine Pendrey', 'Karla Powlesland', 'Emily Best'], 'Clear SLAs for campaign requests. Monthly report showing efficiency and proactive problem-solving.')
ON CONFLICT (id) DO NOTHING;

-- ─── 7. Signals ──────────────────────────────────────────────────────────────

INSERT INTO signals (id, account_id, type, priority, title, detail, source, related_contact_id, timestamp, dismissed) VALUES
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ENGAGEMENT_GAP', 'HIGH', 'Jocelyn Hsieh has not been contacted in 12 days', 'Exceeds CRITICAL threshold of 7 days. As Economic Buyer, this is the highest priority engagement gap.', 'HubSpot', 'c0000000-0000-0000-0000-000000000001', now(), false),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'NEWS', 'MEDIUM', 'Unilever B&W division reports 4.3% growth to €12.8bn', 'Strong tailwind for social investment. Reference in next strategic conversation with Jocelyn.', 'Clay', NULL, now() - interval '2 days', false),
('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'REGULATION', 'HIGH', 'ASA issues updated guidance on influencer disclosure', 'Review all active creator briefs for compliance. Brief the team on new requirements.', 'Web', NULL, now() - interval '5 days', false),
('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'SOCIAL_ACTIVITY', 'MEDIUM', '#slugging reaches 4.2bn TikTok views', 'Vaseline well-positioned but no owned content this month. Opportunity for reactive content.', 'Clay', NULL, now() - interval '7 days', false),
('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'COMPETITOR', 'LOW', 'CeraVe launches creator-first TikTok campaign', 'Dermatologist partnership format. Monitor performance and share competitive analysis.', 'Clay', NULL, now() - interval '10 days', false),
('s0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'PIPELINE_MOVE', 'MEDIUM', 'Vaseline Gluta-Hya UK Social moved to Creating Value', 'Deal progressed from Penetrating. Good momentum — maintain engagement cadence.', 'HubSpot', NULL, now() - interval '3 days', false),
('s0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'ORG_CHANGE', 'HIGH', 'Title discrepancy: Jocelyn Hsieh', 'KAP says "Global Marketing Director" but LinkedIn/Clay returns "Global Brand Lead, Simple Face Care & Beauty Academy". Verify correct title and update KAP.', 'Clay', 'c0000000-0000-0000-0000-000000000001', now(), false),
('s0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'ENGAGEMENT_GAP', 'HIGH', 'Incomplete HubSpot record: Jocelyn Hsieh', 'HubSpot record (ID 697957251306) missing: firstname, lastname, jobtitle, email. This is the CRITICAL priority Economic Buyer — update immediately.', 'HubSpot', 'c0000000-0000-0000-0000-000000000001', now(), false),
('s0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'FINANCE_ALERT', 'HIGH', 'Overdue Vaseline UK invoices being chased', 'Slack finance channel shows overdue invoices for Vaseline UK. Do NOT enter a strategic meeting while procurement is chasing payment.', 'Slack', NULL, now() - interval '1 day', false),
('s0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'NEWS', 'HIGH', 'Adweek questions Unilever social-first pivot', 'Critical article questioning Fernando Fernandez''s mandate to shift 50% of ad budget to creators. Vaseline is cited as poster child.', 'Google News', NULL, now() - interval '4 days', false),
('s0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'JOB_POSTING', 'MEDIUM', 'Unilever posting for Senior Digital Marketing Manager — B&W', 'New role on careers.unilever.com suggests B&W division expanding digital team. May indicate budget allocation toward digital/social.', 'Web', NULL, now() - interval '3 days', false),
('s0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'SENTIMENT_SHIFT', 'MEDIUM', 'Positive client feedback captured: ski trip', '"We couldn''t have done it without you" — client feedback about Olivia from ski trip. Direct evidence of relationship strength.', 'Slack', NULL, now() - interval '6 days', false)
ON CONFLICT (id) DO NOTHING;

-- ─── 8. Delivery Metrics ─────────────────────────────────────────────────────

INSERT INTO delivery_metrics (account_id, period_start, period_end, tasks_due, tasks_completed_on_time, tasks_overdue, delivery_velocity) VALUES
('a0000000-0000-0000-0000-000000000001', '2026-02-17', '2026-02-23', 24, 22, 2, 92),
('a0000000-0000-0000-0000-000000000001', '2026-02-24', '2026-03-02', 18, 15, 3, 83),
('a0000000-0000-0000-0000-000000000001', '2026-03-03', '2026-03-09', 21, 20, 1, 95),
('a0000000-0000-0000-0000-000000000001', '2026-03-10', '2026-03-16', 20, 18, 2, 90);

-- ─── 9. Cross-Brand Contacts ─────────────────────────────────────────────────

INSERT INTO cross_brand_contacts (id, parent_account_id, name, email, brand, relationship_status, last_contacted, notes, expansion_potential) VALUES
('x0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Seyda Morran', 'seyda.morran@unilever.com', 'Wonder Wash', 'active', now() - interval '14 days', 'Discovered via Gmail thread with Joe. Active conversation about social strategy.', 'MEDIUM'),
('x0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Holly Hetherington', 'holly.hetherington@unilever.com', 'DIG', 'active', now() - interval '21 days', 'Discovered via Gmail. Has been in cc on several threads with Vaseline team.', 'MEDIUM'),
('x0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Asim Ahmed', 'asim.ahmed@unilever.com', 'Home Care', 'lost', now() - interval '60 days', 'Previous contact via Gmail. Conversation went cold. Home Care division has separate agency.', 'LOW')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- After running this seed, your account ID is:
--   a0000000-0000-0000-0000-000000000001
--
-- Access the terminal at:
--   /accounts/a0000000-0000-0000-0000-000000000001
-- ═══════════════════════════════════════════════════════════════════════════════
