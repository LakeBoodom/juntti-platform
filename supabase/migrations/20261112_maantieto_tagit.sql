-- KOKOELMARUNKO vaihe 3 (19.10.2026): Maantieto (/kokoelma/matkakohteet) rungolle. Sivulla ei ollut
-- osioita (poiminnat + Lauran ja Mikon valinta + ruudukko); jako kolmeen osioon entisen ruudukon
-- järjestyksen ryhmistä: maapallon ennätykset, sää ja ilmasto, matkakohteet. 20 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[v.tag]))
from (values
  ('maailman-syrjaisimmat-paikat', 'maapallon-ennatykset'),
  ('pohjoisin-ja-etelaisin', 'maapallon-ennatykset'),
  ('maailman-korkeimmat-vuoret-visa', 'maapallon-ennatykset'),
  ('maailman-pisimmat-joet', 'maapallon-ennatykset'),
  ('maailman-suurimmat-jarvet', 'maapallon-ennatykset'),
  ('maailman-suurimmat-saaret', 'maapallon-ennatykset'),
  ('maailman-suurimmat-kaupungit', 'maapallon-ennatykset'),
  ('maailman-korkeimmat-rakennukset-visa', 'maapallon-ennatykset'),
  ('maailman-kylmimmat-kolkat', 'saa-ja-ilmasto'),
  ('maailman-kuumimmat-kolkat', 'saa-ja-ilmasto'),
  ('maailman-sateisimmat-kolkat', 'saa-ja-ilmasto'),
  ('hurjimmat-myrskyt-suomessa', 'saa-ja-ilmasto'),
  ('kanariansaaret-tiedatko-tarpeeksi', 'matkakohteet'),
  ('valimeren-saaret-visa-tunnetko-saaristot', 'matkakohteet'),
  ('sisilia-valimeren-helmi', 'matkakohteet'),
  ('rooma-ikuinen-kaupunki', 'matkakohteet'),
  ('new-york-big-apple', 'matkakohteet'),
  ('tiedatko-lontoosta-kaiken', 'matkakohteet'),
  ('tallinna-tietovisa', 'matkakohteet'),
  ('suomen-majakat', 'matkakohteet')
) as v(slug, tag)
where q.slug = v.slug and q.collection = 'matkakohteet';
