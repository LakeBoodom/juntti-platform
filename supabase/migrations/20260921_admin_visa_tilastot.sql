-- Adminin visalista: pelikerrat ja palaute visoittain yhdellä kutsulla (21.9.2026).
--
-- Ennen: lista luki quizzes.play_count-kenttää, jota mikään ei päivitä (0 kaikilla
-- 705 visalla), ja haki palautteen hakemalla quiz_plays-rivit selaimeen. Jälkimmäinen
-- olisi katkennut hiljaa 1000 rivin kohdalla (PostgREST:n oletusraja).
-- Nyt summat lasketaan kannassa.
--
-- Vain service_role (admin) saa kutsua; ei anon- eikä authenticated-käyttöön.

create or replace function public.admin_visa_tilastot(p_site uuid)
returns table (
  quiz_id uuid,
  pelit bigint,
  pelit_30pv bigint,
  peukku_ylos bigint,
  peukku_alas bigint
)
language sql
stable
set search_path = public
as $$
  select p.quiz_id,
         count(*)                                                   as pelit,
         count(*) filter (where p.played_at > now() - interval '30 days') as pelit_30pv,
         count(*) filter (where p.feedback = 1)                     as peukku_ylos,
         count(*) filter (where p.feedback = -1)                    as peukku_alas
  from quiz_plays p
  join quizzes q on q.id = p.quiz_id
  where q.site_id = p_site
  group by p.quiz_id
$$;

revoke all on function public.admin_visa_tilastot(uuid) from public, anon, authenticated;
grant execute on function public.admin_visa_tilastot(uuid) to service_role;
