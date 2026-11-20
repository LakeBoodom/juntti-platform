-- KUMPI? 2.0 — vastausten kirjaus (brief 20.11.2026, A6): jokaisesta vastauksesta pari, valinta, oikein/väärin,
-- vastausaika ja pelitapa. duel_pair_stats on summataulu (shown/correct) ilman valintaa, aikaa ja pelitapaa, joten
-- kirjaus tulee omaan tauluun. Selain kirjoittaa (lib/kumpi/kirjaus.ts), ei lue. Ei henkilötietoja: session_id on
-- selaimen satunnaistunniste kuten pelikerroissa. Yleisövertailu (≥ 200 vastausta parille) lasketaan tästä myöhemmin.
create table if not exists public.kumpi_vastaukset (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  pelitapa text not null check (pelitapa in ('kierros', 'paivan', 'putki')),
  teema text not null check (teema ~ '^[a-z0-9-]{1,40}$'),
  attr_key text not null check (length(attr_key) between 1 and 60),
  pari text not null check (length(pari) between 1 and 200),
  entity_a uuid not null,
  entity_b uuid not null,
  valinta uuid,              -- null = aika loppui (Putki)
  oikein boolean not null,
  vastausaika_ms integer check (vastausaika_ms between 0 and 600000),
  kysymys_nro smallint check (kysymys_nro between 1 and 1000),
  session_id text check (length(session_id) <= 64)
);
create index if not exists kumpi_vastaukset_pari on public.kumpi_vastaukset (pari);
create index if not exists kumpi_vastaukset_created_at on public.kumpi_vastaukset (created_at);

alter table public.kumpi_vastaukset enable row level security;
drop policy if exists kumpi_vastaukset_insert on public.kumpi_vastaukset;
create policy kumpi_vastaukset_insert on public.kumpi_vastaukset for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute' and created_at < now() + interval '1 minute');
revoke all on public.kumpi_vastaukset from anon, authenticated;
grant insert (pelitapa, teema, attr_key, pari, entity_a, entity_b, valinta, oikein, vastausaika_ms, kysymys_nro, session_id)
  on public.kumpi_vastaukset to anon, authenticated;
