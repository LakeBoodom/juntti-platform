-- Tietoniekka 2.0 Vaihe 1: quiz_cards-näkymä (TOTEUTUSSUUNNITELMA_2.0.md §3.3B)
-- Ajettu tuotantoon Supabase-MCP:llä 2026-07-30; tiedosto kirjanpitoa varten.
-- Badge-prioriteetti: uusi > vaikea > suosittu. Suosittu-kynnys kiinteä 25 alkuun.

create or replace view quiz_cards
with (security_invoker = on) as
select
  q.id, q.slug, q.custom_slug, q.title, q.display_title, q.teaser, q.description,
  q.collection, q.genre, q.subcollection, q.category, q.difficulty, q.game_mode, q.tags,
  q.play_count, q.published_at, q.site_id,
  (select count(*)::int from questions qu where qu.quiz_id = q.id) as question_count,
  case
    when q.published_at > now() - interval '14 days' then 'uusi'
    when q.difficulty = 'vaikea' then 'vaikea'
    when q.play_count >= 25 then 'suosittu'
    else null
  end as badge
from quizzes q
where q.status = 'published';
