-- Vaikeustaso pois näkyvistä (Heikki 6.8.2026): visoille ei ole oikeasti
-- luotu vaikeusaste-skaalaa, joten "Vaikea"-badge on harhaanjohtava.
-- difficulty-sarake säilyy kannassa tulevaa käyttöä varten, mutta
-- quiz_cards-badge ei enää nosta sitä: badge = uusi (7 pv) > suosittu (25+).
-- Ajettu tuotantoon Supabase-MCP:llä 6.8.2026.
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
           when play_count >= 25 then 'suosittu'
           else null
       end as badge
from quizzes q
where status = 'published';
