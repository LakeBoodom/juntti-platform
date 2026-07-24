-- 004_kuvavisa_ordering_and_categories.sql
-- Kuvavisojen (kuvavisas) käsin määriteltävä järjestys + 4 uutta kategoriaa.
-- Sovellettu tuotantoon 2026-07-24. Idempotentti — turvallinen ajaa uudelleen.

-- 1. Näyttöjärjestys (adminissa nuolilla, pelissä nouseva sort_order)
alter table public.kuvavisas
  add column if not exists sort_order integer not null default 0;

-- 2. Backfill: vakaa järjestys per (site_id, type) luontiajan mukaan
with ranked as (
  select id,
         row_number() over (
           partition by site_id, type
           order by created_at asc, id asc
         ) - 1 as rn
  from public.kuvavisas
)
update public.kuvavisas k
set sort_order = ranked.rn
from ranked
where ranked.id = k.id;

-- 3. Indeksi järjestettyä hakua varten
create index if not exists kuvavisas_site_type_order_idx
  on public.kuvavisas (site_id, type, sort_order);

-- 4. Uudet kategoriat: henkilot, rakennukset, kaupungit, maalaukset
alter table public.kuvavisas drop constraint if exists kuvavisas_type_check;
alter table public.kuvavisas add constraint kuvavisas_type_check
  check (type = any (array[
    'liput', 'vaakunat', 'linnut', 'kasvit', 'elaimet',
    'henkilot', 'rakennukset', 'kaupungit', 'maalaukset'
  ]));
