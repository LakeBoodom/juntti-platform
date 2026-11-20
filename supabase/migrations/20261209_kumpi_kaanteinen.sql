-- KUMPI? 2.0 — vastakkainen kysymysmuoto (Heikki 20.11.2026): "Kumpi on suurempi?" ↔ "Kumpi on pienempi?".
-- Peli käyttää kumpaakin suuntaa satunnaisesti, joten sama vertailu ei toistu samanlaisena. Vain mitoille, ajalle ja
-- iälle; saavutusten määrille (voitot, maalit, mitalit) ei, koska "vähemmän olympiakultaa" ei ole luonteva kysymys.
-- Hakasulkeissa avainsana kuten kumpi_kysymys-kentässä. NULL = kysytään vain perussuuntaan.
alter table public.fact_attribute_defs add column if not exists kumpi_kysymys_kaanteinen text;

update public.fact_attribute_defs d set kumpi_kysymys_kaanteinen = v.k
from (values
  -- Suomi
  ('population',        'Kummassa kaupungissa on vähemmän [asukkaita]?'),
  ('founded_year',      'Kumpi näistä kaupungeista on [perustettu] myöhemmin?'),
  ('region_pop',        'Kummassa maakunnassa on vähemmän [asukkaita]?'),
  ('region_area',       'Kumpi maakunta on [pinta-alaltaan] pienempi?'),
  ('dist_hki',          'Kumpi kaupunki on [kauempana] Helsingistä?'),
  -- Luonto
  ('area_km2',          'Kumpi järvi on [pienempi]?'),
  ('river_length',      'Kumpi joki on [lyhyempi]?'),
  ('height_m',          'Kumpi tunturi on [matalampi]?'),
  ('park_area_km2',     'Kumpi kansallispuisto on [pinta-alaltaan] pienempi?'),
  ('park_founded',      'Kumpi kansallispuisto on [perustettu] myöhemmin?'),
  ('park_visits',       'Kummassa kansallispuistossa käy vähemmän [vierailijoita]?'),
  ('lh_built',          'Kumpi majakka on [rakennettu] myöhemmin?'),
  ('lh_height_m',       'Kumpi majakka on [matalampi]?'),
  ('length_cm',         'Kumpi laji on [lyhyempi]?'),
  ('species_weight_kg', 'Kumpi laji on [kevyempi]?'),
  ('lifespan_years',    'Kummalla lajilla on [lyhyempi] elinikä?'),
  ('wingspan_cm',       'Kummalla lajilla on kapeammat [siivet]?'),
  ('population_fi',     'Kumpi laji on Suomessa [harvinaisempi]?'),
  -- Maailma
  ('country_area',      'Kumpi maa on [pinta-alaltaan] pienempi?'),
  ('country_pop',       'Kummassa maassa on vähemmän [asukkaita]?'),
  ('mountain_height',   'Kumpi vuori on [matalampi]?'),
  -- Ihmiset ja historia
  ('birth',             'Kumpi heistä on [nuorempi]?'),
  ('mp_first_year',     'Kumpi heistä tuli eduskuntaan [aiemmin]?'),
  ('mp_years',          'Kumpi heistä on ollut [kansanedustajana] lyhyemmän aikaa?'),
  ('pm_days',           'Kumpi heistä oli lyhyemmän aikaa [pääministerinä]?'),
  ('pm_start',          'Kumpi heistä aloitti [pääministerinä] myöhemmin?'),
  ('pres_start',        'Kumpi heistä aloitti [presidenttinä] myöhemmin?'),
  ('year',              'Kumpi [tapahtui] myöhemmin?'),
  ('start_year',        'Kumpi tapahtumista on [nuorempi]?'),
  -- Jääkiekko
  ('height_cm',         'Kumpi heistä on [lyhyempi]?'),
  ('liiga_debut',       'Kumpi heistä [debytoi] Liigassa myöhemmin?'),
  ('nhl_debut',         'Kumpi heistä [debytoi] NHL:ssä myöhemmin?'),
  ('home_capacity',     'Kumman seuran [kotihalliin] mahtuu vähemmän katsojia?'),
  ('first_title_year',  'Kumpi seura voitti ensimmäisen [mestaruutensa] myöhemmin?'),
  ('latest_title_year', 'Kumpi seura voitti viimeisimmän mestaruutensa [aiemmin]?')
) as v(attr, k)
where d.attr_key = v.attr;
