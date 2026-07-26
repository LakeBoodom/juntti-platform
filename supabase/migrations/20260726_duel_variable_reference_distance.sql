-- Vaihtuva vertailupiste etäisyyskysymyksiin. Ajettu tuotantoon 26.7.2026,
-- tiedosto kirjanpitoa varten.
--
-- Ennen: kaupungille tallennettiin valmis "etäisyys Helsingistä", joten ainoa
-- mahdollinen kysymys oli "kumpi on lähempänä Helsinkiä". Helsingin etäisyydet
-- ovat monella hallussa, joten kysymykset olivat helppoja.
--
-- Nyt: kaupungille tallennetaan sijainti, ja etäisyys lasketaan pelin aikana
-- mihin tahansa arvottuun vertailukaupunkiin ("kumpi on lähempänä Vaasaa").
-- 13 kaupunkia -> 858 mahdollista yhdistelmää, joista 279 kelpaa kysymykseksi
-- (aiemmin 66 paria, joista suurin osa itsestään selviä).

alter table duel_entities
  add column if not exists lat numeric,
  add column if not exists lon numeric,
  -- Suomen taivutus ei ole johdettavissa säännöllä (Tampere -> Tamperetta,
  -- Lahti -> Lahtea), joten partitiivi tallennetaan käsin.
  add column if not exists name_partitive text;

comment on column duel_entities.lat is 'Leveysaste. Vaaditaan compare_mode=distance -kysymyksiin.';
comment on column duel_entities.lon is 'Pituusaste. Vaaditaan compare_mode=distance -kysymyksiin.';
comment on column duel_entities.name_partitive is 'Partitiivi ("Vaasaa"). Käytetään kun entiteetti on vertailupisteenä.';

alter table duel_attribute_defs drop constraint if exists duel_attribute_defs_compare_mode_check;
alter table duel_attribute_defs add constraint duel_attribute_defs_compare_mode_check
  check (compare_mode = any (array['numeric','flag','distance']));

comment on column duel_attribute_defs.min_gap is
  'Alaraja erolle. Sitä pienempi ero = arvauskysymys, ei generoida. Etäisyyksissä välttämätön: kaupungit ovat usein lähes yhtä kaukana.';

-- 13 kaupungin sijainnit ja partitiivit
update duel_entities e set lat = c.lat, lon = c.lon, name_partitive = c.part
from (values
  ('Helsinki',  60.1699, 24.9384, 'Helsinkiä'),  ('Espoo',     60.2055, 24.6559, 'Espoota'),
  ('Vantaa',    60.2934, 25.0378, 'Vantaata'),   ('Tampere',   61.4978, 23.7610, 'Tamperetta'),
  ('Turku',     60.4518, 22.2666, 'Turkua'),     ('Oulu',      65.0121, 25.4651, 'Oulua'),
  ('Jyväskylä', 62.2426, 25.7473, 'Jyväskylää'), ('Kuopio',    62.8924, 27.6770, 'Kuopiota'),
  ('Lahti',     60.9827, 25.6612, 'Lahtea'),     ('Pori',      61.4851, 21.7974, 'Poria'),
  ('Joensuu',   62.6010, 29.7636, 'Joensuuta'),  ('Vaasa',     63.0951, 21.6165, 'Vaasaa'),
  ('Rovaniemi', 66.5039, 25.7294, 'Rovaniemeä')
) as c(name, lat, lon, part)
where e.name = c.name and e.kind = 'city';

insert into duel_attribute_defs
  (attr_key, kind, theme, question_text, winner, easy_gap, mid_gap, max_gap, min_gap,
   unit_label, enabled, subject_label, compare_mode, flag_difficulty, fact_template, max_domain_distance)
values
  ('coords', 'city', 'suomi', 'on lähempänä {ref}?', 'low', 0.20, 0.09, 0.30, 0.04,
   'km', true, 'KUMPI KAUPUNKI', 'distance', 'keski',
   'Linnuntietä: {a} {aarvo}, {b} {barvo}.', 1)
on conflict (attr_key) do nothing;

-- Vanha jää talteen mutta pois pelistä: sama kysymys syntyy nyt coords-määrittelystä.
update duel_attribute_defs set enabled = false where attr_key = 'dist_hki';
