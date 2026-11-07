-- VIHJEPELI (Mikä maa? -brief 25.–28.10.2026, Heikki 7.11.2026): aiheesta riippumaton vihjepeli.
-- Ensimmäinen aihe on 'maa' (kohde = ISO-3, aineisto lib/vihjepeli/maat.json), myöhemmin 'henkilo', 'kaupunki', 'elain'.
--
-- vihjepeli_vihjeet: kirjoitetut vihjeet tasoille 1–3 (1 erikoisuus, 2 kulttuuri/historia, 3 Suomi-kytkös).
--   Taso 4 (siluetti + maanosa) ja 5 (pääkaupunki tai lippu) tulevat aineistosta; taso 5 -rivi kirjoitetaan vain,
--   kun aineiston vihje ei kelpaa. Vihjeet ovat kannassa, jotta niitä voi korjata ilman julkaisua.
--   Anonyymi näkee vain tarkistetut (Heikki katselmoi erän raportista ennen tarkistettu = true).
-- vihjepeli_pelit: yksi rivi per kierros, kirjoitetaan lopussa. Lähdekentät kuten muissa pelitauluissa.
--   Ei share_channel-saraketta: rivi syntyy ennen jakoa, eikä anonyymi voi päivittää riviä.

create table if not exists public.vihjepeli_vihjeet (
  id uuid primary key default gen_random_uuid(),
  aihe text not null check (aihe in ('maa', 'henkilo', 'kaupunki', 'elain')),
  kohde text not null check (char_length(kohde) <= 80),
  taso smallint not null check (taso between 1 and 5),
  teksti text not null check (char_length(teksti) <= 200),
  lahde text check (char_length(lahde) <= 500),
  tarkistettu boolean not null default false,
  luotu timestamptz not null default now(),
  unique (aihe, kohde, taso)
);

alter table public.vihjepeli_vihjeet enable row level security;
drop policy if exists "Anyone can read checked hints" on public.vihjepeli_vihjeet;
create policy "Anyone can read checked hints" on public.vihjepeli_vihjeet
  for select to anon, authenticated using (tarkistettu);

create table if not exists public.vihjepeli_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  aihe text not null check (aihe in ('maa', 'henkilo', 'kaupunki', 'elain')),
  siemen text not null check (char_length(siemen) <= 40),
  kohde text not null check (char_length(kohde) <= 80),
  paivan_kohde boolean not null default false,
  arvaukset text[] check (cardinality(arvaukset) <= 6),
  oikein boolean not null,
  pisteet smallint check (pisteet between 0 and 6),
  session_id text check (char_length(session_id) <= 60),
  entry text check (char_length(entry) <= 60),
  referrer_host text check (char_length(referrer_host) <= 120),
  landing_path text check (char_length(landing_path) <= 300)
);
create index if not exists vihjepeli_pelit_aika_idx on public.vihjepeli_pelit (played_at);
create index if not exists vihjepeli_pelit_kohde_idx on public.vihjepeli_pelit (aihe, kohde);

alter table public.vihjepeli_pelit enable row level security;
drop policy if exists "Anyone can insert vihjepeli plays" on public.vihjepeli_pelit;
create policy "Anyone can insert vihjepeli plays" on public.vihjepeli_pelit
  for insert to anon, authenticated with check (true);

-- v_pelilahteet: vihjepeli aiheittain ("vihjepeli_pelit:maa"), kuten pelimuoto_pelit.
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
  select (played_at at time zone 'Europe/Helsinki')::date, 'pelimuoto_pelit:' || pelimuoto, entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.pelimuoto_pelit group by 1,2,3,4,5
  union all
  select (played_at at time zone 'Europe/Helsinki')::date, 'vihjepeli_pelit:' || aihe, entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.vihjepeli_pelit group by 1,2,3,4,5;
revoke all on public.v_pelilahteet from anon, authenticated, public;
grant select on public.v_pelilahteet to service_role;
