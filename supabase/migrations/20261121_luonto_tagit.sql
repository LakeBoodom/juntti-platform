-- KOKOELMARUNKO vaihe 3 ryhmä 3 (20.10.2026): Luonto rungolle. Osiotagi = aihe (subcollection: elaimet,
-- kasvit-sienet, maastot-vedet, ilmiot), joka oli sivun suodatinjako. Kuva- ja äänivisat ovat V6-pelejä
-- (lib/pelimuodot.ts). 24 visaa ennen ja jälkeen (lasten visat eivät olleet listassa).
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[q.subcollection]))
where q.collection = 'luonto'
  and q.subcollection in ('elaimet', 'kasvit-sienet', 'maastot-vedet', 'ilmiot');
