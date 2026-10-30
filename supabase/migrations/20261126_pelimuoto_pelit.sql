-- PELIKERRAT KUVA-, ÄÄNI- JA JÄRJESTYSPELEISTÄ (Heikki 28.10.2026: "pelikertojen tallennus näihin peleihin
-- lähdetiedolla", etusivu v5:n jatko). Näillä peleillä ei ole quizzes-riviä eikä omaa pelitaulua, joten
-- yksi yhteinen taulu; lähdekentät (entry, referrer_host, landing_path) kuten 20261124_etusivu_v5_seuranta.
--   pelimuoto  avain                      taso
--   kuvavisa   kortisto (liput, viikko…)  variaatio / viikkoavain
--   aanivisa   ryhmä (linnut…)            vuosi-viikko
--   jarjesta   pakan slug                 –
--   jarjesta_oma  laatuattribuutti (a)    –
--   ikajarjestys  kategoria               –
-- Anonyymi saa vain lisätä rivin (sama RLS kuin tupla_pelit ja vaalipiiriketju_pelit). Lisäys, ei muutoksia vanhaan.

create table if not exists public.pelimuoto_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  pelimuoto text not null check (pelimuoto in ('kuvavisa', 'aanivisa', 'jarjesta', 'jarjesta_oma', 'ikajarjestys')),
  avain text not null check (char_length(avain) <= 80),
  taso text check (char_length(taso) <= 60),
  oikein smallint not null check (oikein >= 0),
  yhteensa smallint not null check (yhteensa > 0 and yhteensa <= 100),
  pisteet integer check (pisteet >= 0),
  session_id text check (char_length(session_id) <= 60),
  entry text check (char_length(entry) <= 60),
  referrer_host text check (char_length(referrer_host) <= 120),
  landing_path text check (char_length(landing_path) <= 300),
  check (oikein <= yhteensa)
);
create index if not exists pelimuoto_pelit_aika_idx on public.pelimuoto_pelit (played_at);
create index if not exists pelimuoto_pelit_muoto_idx on public.pelimuoto_pelit (pelimuoto, avain);

alter table public.pelimuoto_pelit enable row level security;
drop policy if exists "Anyone can insert pelimuoto plays" on public.pelimuoto_pelit;
create policy "Anyone can insert pelimuoto plays" on public.pelimuoto_pelit
  for insert to anon, authenticated with check (true);

-- v_pelilahteet: taulu-sarakkeeseen pelimuoto ("pelimuoto_pelit:kuvavisa"), jotta Cowork näkee pelit eriteltyinä.
create or replace view public.v_pelilahteet with (security_invoker = true) as
  select (played_at at time zone 'Europe/Helsinki')::date as paiva, 'quiz_plays'::text as taulu, entry, referrer_host, landing_path,
         count(*) as pelit, count(distinct session_id) as sessiot from public.quiz_plays group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'kuntaliitos_pelit', entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.kuntaliitos_pelit group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'rajanaapurit_pelit', entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.rajanaapurit_pelit group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'tupla_pelit', entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.tupla_pelit group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'vaalipiiriketju_pelit', entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.vaalipiiriketju_pelit group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'pelimuoto_pelit:' || pelimuoto, entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.pelimuoto_pelit group by 1,2,3,4,5;
revoke all on public.v_pelilahteet from anon, authenticated, public;
grant select on public.v_pelilahteet to service_role;
