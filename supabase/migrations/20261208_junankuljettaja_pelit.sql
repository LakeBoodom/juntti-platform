-- Junankuljettaja (20.11.2026): neljäs reittipeli. Ajetaan tuotantoon vasta julkaisun yhteydessä (Heikin lupa).
--
-- Pelikerrat tilastoihin, sama rakenne kuin kuntaliitos_pelit ja rajanaapurit_pelit: yksi rivi jokaisesta tarkistuksesta.
-- siemen = vuoro ("seinajoki-oulu-1k3" tai arvottu), taso = helppo / keski / vaikea, oikein = oikeat asemavälit 0–7,
-- asemat = pelaajan järjestys asemakoodeina. Ei henkilötietoja: session_id on selaimen itse luoma satunnainen tunniste.
create table if not exists junankuljettaja_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  siemen text not null check (length(siemen) <= 40),
  taso text check (taso in ('helppo', 'keski', 'vaikea')),
  paivan_reitti boolean not null default false,
  yritys smallint not null check (yritys between 1 and 99),
  oikein smallint not null check (oikein between 0 and 7),
  asemat text[] not null check (cardinality(asemat) = 8),
  session_id text check (length(session_id) <= 64),
  -- Lähdekentät kuten muissa pelitauluissa (lib/seuranta.ts seurantaKentat)
  entry text check (length(entry) <= 64),
  referrer_host text check (length(referrer_host) <= 255),
  landing_path text check (length(landing_path) <= 512)
);
create index if not exists junankuljettaja_pelit_idx on junankuljettaja_pelit (played_at desc);
alter table junankuljettaja_pelit enable row level security;
create policy "Anyone can insert junankuljettaja plays" on junankuljettaja_pelit for insert to anon, authenticated with check (true);
