-- Urheilu (Heikki 3.11.2026): Palloilulajit-osio jaetaan lajeittain koripalloon, lentopalloon, salibandyyn ja käsipalloon.
-- 12 visaa ennen ja jälkeen. Yhteinen palloilulajit-tagi poistuu vasta, kun uusi osiolista on tuotannossa.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[v.tag]))
from (values
  ('korisliigan-historia-ja-mestarit', 'koripallo'),
  ('koripallon-suomalaislegendat', 'koripallo'),
  ('susijengin-arvokisatarina', 'koripallo'),
  ('lentopallon-legendat-suomessa', 'lentopallo'),
  ('lentopallon-mestaruusliiga', 'lentopallo'),
  ('veljekset-lentopallomiehet', 'lentopallo'),
  ('f-liiga-salibandyn-paasarja', 'salibandy'),
  ('salibandyn-tahdet-ja-legendat', 'salibandy'),
  ('suomen-salibandynaiset', 'salibandy'),
  ('suomi-salibandyn-mm-kisoissa', 'salibandy'),
  ('aktialiiga-kasipallon-paasarja', 'kasipallo'),
  ('kasipallon-tahdet-ja-legendat', 'kasipallo')
) as v(slug, tag)
where q.slug = v.slug;

update public.quizzes set section_tags = array_remove(section_tags, 'palloilulajit')
where section_tags @> array['palloilulajit']::text[];
