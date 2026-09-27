-- Rajanaapurit-reittipeli (27.9.2026): Kuntaliitoksen sisarpeli valtioilla ja lipuilla.
--
-- 1) Pelikerrat tilastoihin, sama rakenne kuin kuntaliitos_pelit.
create table if not exists rajanaapurit_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  siemen text not null check (length(siemen) <= 40),
  maanosa text check (length(maanosa) <= 40),
  paivan_reitti boolean not null default false,
  yritys smallint not null check (yritys between 1 and 99),
  oikein smallint not null check (oikein between 0 and 7),
  maat text[] not null check (cardinality(maat) = 8),
  session_id text check (length(session_id) <= 64)
);
create index if not exists rajanaapurit_pelit_idx on rajanaapurit_pelit (played_at desc);
alter table rajanaapurit_pelit enable row level security;
create policy "Anyone can insert rajanaapurit plays" on rajanaapurit_pelit for insert to anon, authenticated with check (true);

-- 2) Vain emämaan rajat (Heikki 27.9.2026): Espanja–Marokko (Ceuta ja Melilla) pois pelistä.
--    Rivi säilyy, accepted = false.
update maiden_rajat set accepted = false, note = 'Pois pelistä: vain emämaan rajat (Ceuta ja Melilla), Heikki 27.9.2026', reviewed_at = now()
where (country_a, country_b) in (('ESP', 'MAR'), ('MAR', 'ESP')) and accepted;
