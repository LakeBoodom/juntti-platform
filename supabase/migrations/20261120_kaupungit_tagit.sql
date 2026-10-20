-- KOKOELMARUNKO vaihe 3 ryhmä 3 (20.10.2026): Suomen kaupungit rungolle. Osiotagi = kaupungin alue
-- (lib/kaupungit.ts KAUPUNGIT[].region; kartta ja matkapassin pelilauta poistuvat, brief §3 V4). Visat ovat kannassa
-- collection 'yleistieto', joten kokoelma haetaan tageilla. 20 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[v.tag]))
from (values
  ('helsinki-stadin-kovat-pahkinat', 'kaupungit-paakaupunkiseutu'),
  ('espoo-viiden-keskustan-kaupunki', 'kaupungit-paakaupunkiseutu'),
  ('vantaa-kehakolmosen-kuningaskunta', 'kaupungit-paakaupunkiseutu'),
  ('porvoo-punaiset-aitat-historia-visa', 'kaupungit-etela'),
  ('lahti-suomen-chicagon-salaisuudet', 'kaupungit-etela'),
  ('hameenlinna-harmaakivi-aulanko-visa', 'kaupungit-etela'),
  ('kouvola-visa-raiteiden-risteyksessa', 'kaupungit-etela'),
  ('lappeenranta-rajakaupungin-salat', 'kaupungit-etela'),
  ('aurajoen-arvoitukset-turku-visa', 'kaupungit-lounais'),
  ('kannykkakaupungin-arvoitukset-salo', 'kaupungit-lounais'),
  ('pori-jazzia-dyyneja-karhun-katse', 'kaupungit-lounais'),
  ('tampere-visa-savupiippujen-kaupunki', 'kaupungit-lansi'),
  ('suomen-ateena-jyvaskyla-tietovisa', 'kaupungit-lansi'),
  ('seinajoki-avaruuden-paakaupungin-arvoitukset', 'kaupungit-lansi'),
  ('vaasa-lyhteen-kaupunki-tietovisa', 'kaupungit-lansi'),
  ('paamajakaupungin-arvoitukset-mikkeli', 'kaupungit-ita'),
  ('kuopio-viantaen-syvalta-savosta', 'kaupungit-ita'),
  ('jonssi-tentissa-joensuu-visa', 'kaupungit-ita'),
  ('oulu-tervan-tuoksua-merikosken-kohinaa', 'kaupungit-pohjoinen'),
  ('napapiirin-pintaa-syvemmalta-tentti', 'kaupungit-pohjoinen')
) as v(slug, tag)
where q.slug = v.slug;
