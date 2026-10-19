-- KOKOELMARUNKO vaihe 2 (19.10.2026): Euroviisut-kokoelman osiotagit olemassa oleville visoille.
-- Visa voi kuulua useaan kokoelmaan: tagi lisätään olemassa olevien perään (ei korvata).
update public.quizzes q set section_tags = array(select distinct unnest(q.section_tags || array[v.tag]))
from (values
  ('krista-siegfrids-euroviisuista-tv-ruutuun', 'euroviisut-suomi'),
  ('suomi-euroviisuissa', 'euroviisut-suomi'),
  ('carola-ruotsin-euroviisupriima', 'euroviisut-voittajat')
) as v(slug, tag)
where q.slug = v.slug;
