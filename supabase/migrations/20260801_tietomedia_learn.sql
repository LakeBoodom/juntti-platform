-- TIETOMEDIA (1.8.2026): oppimiskerrokset visoihin (ajettu tuotantoon MCP:llä).
-- quizzes.learn jsonb: { intro, heading, key_facts[{k,v,qi?}], title,
--   sections[{h,p[]}], faq[{q,a}], sources[{name,url}], last_reviewed }
alter table quizzes add column if not exists learn jsonb;
