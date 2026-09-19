-- Päivän visa -admin (toteutusohje 19.9.2026, luku 8)
--
-- 1) Toimituksen sisäiset kentät eivät näy julkisesti. schedule_rules on
--    RLS:llä luettavissa anonille (aktiiviset rivit); sarakeoikeuksilla
--    intro_source_url ja editorial_note jäävät vain palvelun (admin) luettaviksi.
revoke select on public.schedule_rules from anon, authenticated;
grant select (id, site_id, content_type, content_id, strategy, scheduled_date, tag,
              weight, active, created_at, intro_headline, intro_text, auto_filled)
  on public.schedule_rules to anon, authenticated;

-- 2) Päivän sankarit aikavälille (adminin varoitus "sama visa kuin sankarilla"
--    ja viikkonäkymä) yhdellä kutsulla.
create or replace function public.paivan_sankarit(p_site uuid, p_from date, p_to date)
returns table (paiva date, name text, quiz_id uuid, death_date date, ika integer)
language sql stable security invoker set search_path = public
as $$
  select d::date, s.name, s.quiz_id, s.death_date, s.ika
  from generate_series(p_from, least(p_to, p_from + 400), interval '1 day') d
  cross join lateral public.paivan_sankari(p_site, d::date) s
$$;
grant execute on function public.paivan_sankarit(uuid, date, date) to anon, authenticated;
