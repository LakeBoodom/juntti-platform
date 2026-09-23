-- Instagram-julkaisut, jatko (24.9.2026):
--
-- 1. Omat julkaisut ja kampanjat (slotti 'oma'): toimitus lisää ad hoc -julkaisuja
--    mille tahansa päivälle, esim. "Luontoviikko" = joka päivä yksi luontovisa.
--    Samalle päivälle voi olla useita omia julkaisuja, joten päivä+slotti-ainutlaatuisuus
--    koskee enää Päivän visaa ja synttäreitä. kampanja ryhmittelee saman sarjan rivit.
-- 2. Slottien päälle/pois-kytkimet (ig_asetukset): esim. synttärit pois kokonaan.
--    Yksittäisen julkaisun voi jättää pois tilalla 'ohitettu' kuten ennenkin.
-- 3. Julkinen kuvavarasto ig-kuvat: toimituksen lataamat korvaavat kuvat nyt,
--    ja vaiheessa 2 valmiit julkaisukuvat, jotka Instagram hakee julkisesta osoitteesta.

alter table public.ig_julkaisut drop constraint if exists ig_julkaisut_slotti_check;
alter table public.ig_julkaisut
  add constraint ig_julkaisut_slotti_check check (slotti in ('paivan_visa', 'synttarit', 'oma'));

alter table public.ig_julkaisut drop constraint if exists ig_julkaisut_site_id_paiva_slotti_key;
create unique index if not exists ig_julkaisut_paiva_slotti_uniq
  on public.ig_julkaisut (site_id, paiva, slotti)
  where slotti <> 'oma';

alter table public.ig_julkaisut add column if not exists kampanja text;

create table if not exists public.ig_asetukset (
  site_id           uuid primary key references public.sites(id),
  visa_paalla       boolean not null default true,
  synttarit_paalla  boolean not null default true,
  updated_at        timestamptz not null default now()
);
alter table public.ig_asetukset enable row level security;
revoke all on public.ig_asetukset from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ig-kuvat', 'ig-kuvat', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
