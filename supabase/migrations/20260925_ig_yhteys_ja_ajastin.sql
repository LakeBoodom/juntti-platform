-- Instagram-julkaisut, vaihe 2 (25.9.2026): yhteys Instagramiin ja automaattinen julkaisu.
--
-- ig_yhteys: Instagram Business Login -yhteys (pitkäikäinen token, 60 pv, uusitaan
--   ajastimessa). Vain service_role (admin) lukee — token ei koskaan päädy selaimeen.
-- ig_ajastin: satunnainen avain, jolla pg_cron-ajo tunnistautuu adminin ajastinreitille.
--   Avain luetaan ajon aikana taulusta, joten se ei näy cron.job-komennossa.
-- ig_asetukset: automaattinen julkaisu (oletus pois) ja kellonajat per sarja.
-- ig_julkaisut: tila 'julkaistaan' (lukitus rinnakkaisia ajoja vastaan), julkaisun
--   linkki ja julkaistut kuvat.
-- Ajastin: pg_cron kymmenen minuutin välein → /api/ig/ajastin julkaisee erääntyneet
--   hyväksytyt julkaisut. Vercelin Hobby-cron sallisi vain yhden ajon päivässä.

create table if not exists public.ig_yhteys (
  site_id         uuid primary key references public.sites(id),
  ig_user_id      text not null,
  kayttajanimi    text,
  access_token    text not null,
  token_vanhenee  timestamptz not null,
  oikeudet        text,
  yhdistetty_at   timestamptz not null default now(),
  paivitetty_at   timestamptz not null default now()
);
alter table public.ig_yhteys enable row level security;
revoke all on public.ig_yhteys from anon, authenticated;

create table if not exists public.ig_ajastin (
  id     int primary key default 1 check (id = 1),
  avain  text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);
insert into public.ig_ajastin (id) values (1) on conflict (id) do nothing;
alter table public.ig_ajastin enable row level security;
revoke all on public.ig_ajastin from anon, authenticated;

alter table public.ig_asetukset
  add column if not exists automaattinen  boolean not null default false,
  add column if not exists visa_klo       time not null default '07:30',
  add column if not exists synttarit_klo  time not null default '11:00',
  add column if not exists omat_klo       time not null default '17:00';

alter table public.ig_julkaisut drop constraint if exists ig_julkaisut_tila_check;
alter table public.ig_julkaisut add constraint ig_julkaisut_tila_check
  check (tila in ('luonnos', 'hyvaksytty', 'julkaistaan', 'julkaistu', 'epaonnistui', 'ohitettu'));
alter table public.ig_julkaisut
  add column if not exists ig_permalink text,
  add column if not exists kuva_urls    text[];

select cron.unschedule('ig-julkaisu') where exists (select 1 from cron.job where jobname = 'ig-julkaisu');
select cron.schedule(
  'ig-julkaisu',
  '*/10 * * * *',
  $$ select net.http_post(
       url := 'https://juntti-admin.vercel.app/api/ig/ajastin',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-ajastin-avain', (select avain from public.ig_ajastin where id = 1)
       ),
       body := '{}'::jsonb,
       timeout_milliseconds := 60000
     ); $$
);
