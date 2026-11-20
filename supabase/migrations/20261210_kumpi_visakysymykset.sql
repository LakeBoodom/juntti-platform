-- KUMPI? 2.0 — visakysymykset Kumpi?-muodossa (Heikki 20.11.2026, pilotti ennen julkaisua). Olemassa oleva
-- tietovisakysymys muunnetaan kahden vaihtoehdon kysymykseksi: oikea vastaus + uskottavin väärä vaihtoehto, lause
-- "Kumpi … [avainsana] …?" ja kortin arvoriville lyhyet faktat. Enintään 3/10 kierroksen kysymyksistä.
-- Rivit syntyvät luonnoksina (status draft); esikatselu lukee ne palvelimella, tuotanto vain published-rivit.
create table if not exists public.kumpi_visakysymykset (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  -- Kumpi?-teemat, joihin kysymys kuuluu: urheilu, ihmiset, suomikiekon-legendat, liiga, seura-<seura>.
  teemat text[] not null check (array_length(teemat, 1) >= 1),
  kysymys text not null check (kysymys ~ '\[[^]]+\]' and length(kysymys) <= 90),
  oikea text not null check (length(oikea) between 1 and 40),
  vaara text not null check (length(vaara) between 1 and 40),
  oikea_fakta text check (length(oikea_fakta) <= 40),
  vaara_fakta text check (length(vaara_fakta) <= 40),
  vaikeus text not null check (vaikeus in ('helppo', 'keski', 'vaikea')),
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  huomio text,
  created_at timestamptz not null default now()
);
create index if not exists kumpi_visakysymykset_teemat on public.kumpi_visakysymykset using gin (teemat);

alter table public.kumpi_visakysymykset enable row level security;
drop policy if exists kumpi_visakysymykset_luku on public.kumpi_visakysymykset;
create policy kumpi_visakysymykset_luku on public.kumpi_visakysymykset for select to anon, authenticated
  using (status = 'published');
revoke all on public.kumpi_visakysymykset from anon, authenticated;
grant select on public.kumpi_visakysymykset to anon, authenticated;

-- Vastausten kirjaus: visakysymyksellä ei ole entiteettipareja. entity_a = visakysymyksen id, entity_b tyhjä,
-- valinta_ix = valitun vaihtoehdon paikka (0/1).
alter table public.kumpi_vastaukset alter column entity_b drop not null;
alter table public.kumpi_vastaukset add column if not exists valinta_ix smallint check (valinta_ix in (0, 1));
grant insert (valinta_ix) on public.kumpi_vastaukset to anon, authenticated;
