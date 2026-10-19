-- KOKOELMARUNKO vaihe 3 ryhmä 2 (19.10.2026): Urheilu rungolle. Osiotagit nykyisistä käsilistoista
-- (lib/urheilulajit.ts UL_LOHKOT, viisi lohkoa). 16 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[v.tag]))
from (values
  ('formula-1-tiedatko-f1n-perusteet', 'f1'),
  ('formula1-suuri-tietovisa', 'f1'),
  ('formula1-suomalaiset', 'f1'),
  ('rallin-mm-sarja-historia-huippuhetket-visa', 'ralli'),
  ('suomalaiset-rallin-mm-sarjassa-visa', 'ralli'),
  ('suomen-mm-ralli-jyvaskyla', 'ralli'),
  ('pga-tour-tietovisa', 'golf'),
  ('dp-world-tour-euroopan-golfkiertue-visa', 'golf'),
  ('the-open-golfin-vanhin-major', 'golf'),
  ('suomalaiset-golfin-ammattilaiskiertueilla-visa', 'golf'),
  ('atp-tour-historia-huippuhetket-visa', 'tennis'),
  ('us-open-tennis-visa', 'tennis'),
  ('suomalaiset-atp-wta-kiertueilla-visa', 'tennis'),
  ('roger-federer-tennislegenda', 'tennis'),
  ('helsingin-olympiastadion', 'urheiluhistoria'),
  ('elaintarhan-ajot', 'urheiluhistoria')
) as v(slug, tag)
where q.slug = v.slug and q.collection = 'urheilu';
