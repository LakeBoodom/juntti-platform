-- Kuntaliitos-reittipeli (26.9.2026).
--
-- 1) Pelikerrat tilastoihin: yksi rivi jokaisesta tarkistuksesta ("Rakenna reitti").
--    yritys = monesko tarkistus samalla reitillä (Korjaa katkos → uusi yritys),
--    oikein = oikeat yhteydet 0–7, kunnat = pelaajan järjestys kuntakoodeina.
--    Ei henkilötietoja: session_id on selaimen itse luoma satunnainen tunniste.
create table if not exists kuntaliitos_pelit (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  siemen text not null check (length(siemen) <= 40),
  paivan_reitti boolean not null default false,
  yritys smallint not null check (yritys between 1 and 99),
  oikein smallint not null check (oikein between 0 and 7),
  kunnat text[] not null check (cardinality(kunnat) = 8),
  session_id text check (length(session_id) <= 64)
);
create index if not exists kuntaliitos_pelit_idx on kuntaliitos_pelit (played_at desc);
alter table kuntaliitos_pelit enable row level security;
create policy "Anyone can insert kuntaliitos plays" on kuntaliitos_pelit for insert to anon, authenticated with check (true);

-- 2) Rajojen pistokoe (Tilastokeskus kunta1000k_2026, 1:1 milj.): kahdeksan lyhyttä
--    maarajaa puuttui 1:4,5 milj. geometriasta lasketuista pareista.
insert into kuntien_rajat (kunta_a, kunta_b, border_type, accepted, note, source)
select a, b, 'land', true, note, 'Tilastokeskus kunta1000k_2026 (26.9.2026)'
from (values
  ('052', '924', 'Lyhyt maaraja (0,2 km), puuttui 1:4,5 milj. aineistosta'),
  ('287', '846', 'Lyhyt maaraja (0,2 km), puuttui 1:4,5 milj. aineistosta'),
  ('504', '638', 'Lyhyt maaraja (0,3 km), puuttui 1:4,5 milj. aineistosta'),
  ('009', '563', 'Lyhyt maaraja (0,4 km), puuttui 1:4,5 milj. aineistosta'),
  ('062', '941', 'Lyhyt maaraja (0,4 km), puuttui 1:4,5 milj. aineistosta'),
  ('845', '976', 'Lyhyt maaraja (0,7 km), puuttui 1:4,5 milj. aineistosta'),
  ('082', '635', 'Lyhyt maaraja (1,3 km), puuttui 1:4,5 milj. aineistosta'),
  ('077', '850', 'Lyhyt maaraja (1,6 km), puuttui 1:4,5 milj. aineistosta')
) as v(a, b, note)
where not exists (
  select 1 from kuntien_rajat r
  where (r.kunta_a = v.a and r.kunta_b = v.b) or (r.kunta_a = v.b and r.kunta_b = v.a)
);

-- 3) Humppilan vaakuna (Wikimedia Commons, Humppilan_vaakuna.svg, public domain) —
--    ainoa puuttuva. Kuva on sivuston omissa tiedostoissa.
update kunnat
set vaakuna_url = 'https://tietoniekka.fi/20/kuntaliitos/humppila.png',
    vaakuna_source = 'Wikipedia / Wikimedia Commons',
    vaakuna_license = 'Public domain'
where code = '103' and vaakuna_url is null;
