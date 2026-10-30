-- Etusivu v5 (28.10.2026): pelien lähdeseuranta (brief 15.10. osa A), Tiesitkö-pooli, etusivun promot.
-- Kaikki muutokset lisäyksiä; olemassa oleva data ennallaan.

-- A1: lähdesarakkeet pelitauluihin (pituusrajat estävät roskasyötteen)
do $$
declare t text;
begin
  foreach t in array array['quiz_plays','kuntaliitos_pelit','rajanaapurit_pelit','tupla_pelit','vaalipiiriketju_pelit'] loop
    execute format('alter table public.%I add column if not exists entry text check (char_length(entry) <= 60)', t);
    execute format('alter table public.%I add column if not exists referrer_host text check (char_length(referrer_host) <= 120)', t);
    execute format('alter table public.%I add column if not exists landing_path text check (char_length(landing_path) <= 300)', t);
    execute format('grant insert (entry, referrer_host, landing_path) on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- Näkymä Coworkille: päivä × taulu × lähde → pelit ja sessiot. Ei julkista lukua.
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
  select (played_at at time zone 'Europe/Helsinki')::date, 'vaalipiiriketju_pelit', entry, referrer_host, landing_path, count(*), count(distinct session_id) from public.vaalipiiriketju_pelit group by 1,2,3,4,5;
revoke all on public.v_pelilahteet from anon, authenticated, public;
grant select on public.v_pelilahteet to service_role;

-- Tiesitkö?-pooli: koukkukysymykseksi merkityt kysymykset
alter table public.questions add column if not exists hook boolean not null default false;
create index if not exists questions_hook_idx on public.questions (quiz_id) where hook;

-- Etusivun promot (promo 1 rotaatio + promo 2). Julkinen luku vain aktiivisille.
create table if not exists public.etusivu_promot (
  id uuid primary key default gen_random_uuid(),
  paikka text not null check (paikka in ('promo1', 'promo2')),
  kicker text,
  otsikko text not null,
  cta text,
  kuva text,
  href text not null,
  alku date,
  loppu date,
  paino integer not null default 1 check (paino between 0 and 100),
  aktiivinen boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.etusivu_promot enable row level security;
drop policy if exists etusivu_promot_julkinen_luku on public.etusivu_promot;
create policy etusivu_promot_julkinen_luku on public.etusivu_promot for select to anon, authenticated using (aktiivinen);
grant select on public.etusivu_promot to anon, authenticated;
