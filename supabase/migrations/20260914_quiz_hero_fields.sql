-- TIETONIEKKA 2.0 — visan oma hero-kuva (CD kierros 4–5, Heikin spesifikaatio 13.9.2026)
--
-- Tausta: hero-kuva haettiin kokoelman oletuksesta, minkä vuoksi esim. golfvisassa
-- näkyi tennisvisan kuva. Kuva ja sen rajaus tulevat jatkossa visan omasta datasta.
-- Kaikki kolme näkymää (desktop, mobiili, tabletti) käyttävät SAMAA kuvaa ja samoja
-- focal-arvoja — ei erillisiä leikkeitä.
--
-- hero_side on tallennettu kenttä, oletus NULL: NULL → puoli lasketaan hero_focal_x:stä
-- (> 0.5 → teksti vasemmalle, muuten oikealle), asetettu arvo voittaa laskennan aina.
-- Focal-oletukset (0.5 / 0.4; henkilövisat 0.5 / 0.15) ovat koodissa, eivät
-- sarakkeen oletusarvona, jotta "ei asetettu" ja "asetettu keskelle" erottuvat.

alter table public.quizzes
  add column if not exists hero_image   text,
  add column if not exists hero_focal_x numeric(4, 3),
  add column if not exists hero_focal_y numeric(4, 3),
  add column if not exists hero_side    text,
  add column if not exists hero_alt     text;

alter table public.quizzes
  drop constraint if exists quizzes_hero_focal_x_range,
  drop constraint if exists quizzes_hero_focal_y_range,
  drop constraint if exists quizzes_hero_side_values;

alter table public.quizzes
  add constraint quizzes_hero_focal_x_range check (hero_focal_x is null or (hero_focal_x >= 0 and hero_focal_x <= 1)),
  add constraint quizzes_hero_focal_y_range check (hero_focal_y is null or (hero_focal_y >= 0 and hero_focal_y <= 1)),
  add constraint quizzes_hero_side_values  check (hero_side is null or hero_side in ('left', 'right'));

comment on column public.quizzes.hero_image   is 'Alkuperäinen, rajaamaton hero-kuva (min. 1600 px leveä). NULL = kuvaton hero: kategoriaväri ja teksti koko leveydelle.';
comment on column public.quizzes.hero_focal_x is 'Kohteen vaakakeskipiste 0–1 (0 = vasen reuna). Oletus koodissa 0.5.';
comment on column public.quizzes.hero_focal_y is 'Kohteen pystykeskipiste 0–1 (0 = ylä). Oletus koodissa 0.4, henkilövisoissa 0.15.';
comment on column public.quizzes.hero_side    is 'left/right = kummalle puolelle teksti menee. NULL = lasketaan hero_focal_x:stä.';
comment on column public.quizzes.hero_alt     is 'Saavutettavuustekstin lisäksi kuvalähde (esim. "Kuva: Wikimedia Commons").';
