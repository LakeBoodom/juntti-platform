-- Tupla tai kuitti -pelikerrat (26.9.2026): tilastot ja vaikeustasojen kalibrointi.
-- kysymykset = pelatut kysymykset järjestyksessä; oikein-määrä kertoo, mitkä osuivat
-- (ensimmäiset `oikein` kpl oikein, jäähyllä seuraava väärin). Ei henkilötietoja:
-- session_id on selaimen itse luoma satunnainen tunniste kuten quiz_plays-taulussa.
create table if not exists tupla_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  teema text not null check (length(teema) <= 40),
  siemen text not null check (length(siemen) <= 40),
  paivan_sarja boolean not null default false,
  syy text not null check (syy in ('kuittasi', 'jaahy', 'taydet')),
  saalis integer not null check (saalis between 0 and 512),
  oikein smallint not null check (oikein between 0 and 10),
  kysymykset uuid[] not null default '{}' check (cardinality(kysymykset) <= 10),
  session_id text check (length(session_id) <= 64)
);
create index if not exists tupla_pelit_teema_idx on tupla_pelit (teema, played_at desc);
alter table tupla_pelit enable row level security;
-- Selain saa vain lisätä rivejä; lukeminen vain palvelinavaimella (admin, raportit).
create policy "Anyone can insert tupla plays" on tupla_pelit for insert to anon, authenticated with check (true);
