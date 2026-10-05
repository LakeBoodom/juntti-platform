-- VAALIPIIRIKETJU (toteutusbrief 5.10.2026 §3): pelitilasto + vaalipiirigraafin julkinen luku.
--
-- 1) vaalipiiriketju_pelit — sama rakenne ja RLS kuin kuntaliitos_pelit: anonyymi saa lisätä
--    rivin, ei lukea. edustajat = fact_entities.id pelaajan järjestyksessä.
-- 2) vaalipiirit ja vaalipiirien_rajat ovat julkista viitedataa (nimet, paikat, rajat). RLS oli
--    päällä ilman policya, joten sivuston anon-avain ei nähnyt niitä. Peli lukee graafin näistä.
--    Rajoista vain hyväksytyt (accepted).
-- Korvaa ajamatta jääneen 20261031_vaalipiirit_julkinen_luku.sql:n.

create table if not exists public.vaalipiiriketju_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  siemen text not null,
  paivan_reitti boolean not null default true,
  yritys smallint not null,
  oikein smallint not null,
  edustajat text[] not null,
  session_id text
);
create index if not exists vaalipiiriketju_pelit_siemen_idx on public.vaalipiiriketju_pelit (siemen);

alter table public.vaalipiiriketju_pelit enable row level security;
create policy "Anyone can insert vaalipiiriketju plays" on public.vaalipiiriketju_pelit
  for insert to anon, authenticated with check (true);

create policy "vaalipiirit public read" on public.vaalipiirit
  for select to anon, authenticated using (true);
create policy "vaalipiirien_rajat public read" on public.vaalipiirien_rajat
  for select to anon, authenticated using (accepted);
