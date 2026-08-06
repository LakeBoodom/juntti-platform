-- UUSI-badge: aikaikkuna 14 pv -> 7 pv (Heikki vahvisti 5.8.2026).
-- Syy: 2.0-katselmuksen löydös #4 — lähes joka kortissa näkyi UUSI, koska
-- heinä-elokuussa julkaistiin paljon. Badge-prioriteetti ennallaan: uusi > vaikea > suosittu.
-- Ajettu tuotantoon Supabase-MCP:llä 5.8.2026 (migraatio quiz_cards_badge_uusi_7_days).
create or replace view quiz_cards as
select id,
       slug,
       custom_slug,
       title,
       display_title,
       teaser,
       description,
       collection,
       genre,
       subcollection,
       category,
       difficulty,
       game_mode,
       tags,
       play_count,
       published_at,
       site_id,
       (select count(*)::integer from questions qu where qu.quiz_id = q.id) as question_count,
       case
           when published_at > (now() - interval '7 days') then 'uusi'
           when difficulty = 'vaikea' then 'vaikea'
           when play_count >= 25 then 'suosittu'
           else null
       end as badge
from quizzes q
where status = 'published';
