-- Tulosnäkymä ja jakaminen, vaihe C (22.10.2026). Ajettu Supabase MCP:llä
-- (tulos_c_share_channel_korttinimi + tulos_c_share_channel_grant).

-- Viimeisin jakokanava; kirjataan GameClientin markShared()-kutsussa.
alter table public.quiz_plays add column if not exists share_channel text
  check (share_channel in ('whatsapp','facebook','kopioi','jaa'));
comment on column public.quiz_plays.share_channel is 'Viimeisin jakokanava (Tulosnäkymä ja jakaminen, vaihe C, 22.10.2026)';
-- anon päivittää vain feedback- ja shared-sarakkeita → sama oikeus uudelle sarakkeelle.
grant update (share_channel) on public.quiz_plays to anon, authenticated;

-- Jakokortin, og:n ja jakotekstin nimi; tyhjä → lyhennetty title (apps/tietoniekka/lib/korttinimi.ts).
alter table public.quizzes add column if not exists korttinimi text null;
comment on column public.quizzes.korttinimi is 'Jakokortin, og:n ja jakotekstin nimi; tyhjä → lyhennetty title (lib/korttinimi.ts)';
