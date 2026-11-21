-- KUMPI? 2.0 — Coworkin tarkistama lisädata peliin (Cowork 20.11.2026, kohdat 1–3). Koodi: feat/kumpi-lisadata.
-- Eläimet Luonto-teemaan, Liiga-seurat Liiga-teemaan, presidenttien aloitusvuosi Ihmiset-teemaan.

-- 1. Eläimet: 50 lajia julkaistuiksi (kuvia ei ole; Kumpi? on kuvaton).
update public.fact_entities set status = 'published' where kind = 'species' and status = 'draft';

-- 2. Määrittelyt päälle. founded_hockey (emoseuran / edeltäjän vuosi osalla seuroista) ja speed_kmh (4 lajia) jäävät pois.
update public.fact_attribute_defs set enabled = true where attr_key in (
  'length_cm', 'species_weight_kg', 'lifespan_years', 'wingspan_cm', 'population_fi',
  'titles', 'has_title', 'first_title_year', 'latest_title_year', 'home_capacity', 'is_founding_member', 'liiga_since', 'city_pop',
  'pres_start'
);

-- 3. Lauseet vastaamaan dataa. liiga_since = seuran ensimmäinen SM-liigakausi (Sport 1975, vaikka välissä 1976–2014
--    alemmalla tasolla), joten "pelannut pidempään" olisi väärin. city_pop = kotikaupungin asukasluku.
update public.fact_attribute_defs set
  kumpi_kysymys = 'Kumpi seura pelasi ensimmäisen [SM-liigakautensa] aiemmin?',
  kumpi_kysymys_kaanteinen = 'Kumpi seura pelasi ensimmäisen [SM-liigakautensa] myöhemmin?',
  fact_template = 'Ensimmäinen SM-liigakausi: {a} {av}, {b} {bv}.'
where attr_key = 'liiga_since';
update public.fact_attribute_defs set
  kumpi_kysymys = 'Kumman seuran [kotikaupungissa] on enemmän asukkaita?',
  fact_template = 'Asukkaita kotikaupungissa: {a} {av}, {b} {bv}.'
where attr_key = 'city_pop';

-- 4. Coworkin maatagien korjaus: Iso Orjajärvi (Great Slave Lake, Kanada) ja Yläjärvi (Lake Superior) eivät ole Suomessa.
update public.fact_entities set tags = array['ulkomaat'] where kind = 'lake' and name in ('Iso Orjajärvi', 'Yläjärvi');
