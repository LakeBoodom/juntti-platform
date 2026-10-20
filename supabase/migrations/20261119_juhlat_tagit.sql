-- KOKOELMARUNKO vaihe 3 ryhmä 3 (20.10.2026): Juhlat rungolle. Osiotagi = juhlan slug (lib/juhlat.ts JUHLAT[].visat)
-- tai 'ympari-vuoden'; lasten visat lasten_aihe-kentästä. Isän- ja äitienpäivän yhteinen visa saa molemmat tagit,
-- sivu näyttää sen vain lähimmässä juhlassa (uniikitOsiot). 26 visaa ennen ja jälkeen (22 + 4 lasten visaa).
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || v.tags))
from (select slug, array_agg(tag) as tags from (values
  ('halloween-historia-ja-symbolit', 'halloween'),
  ('kekrista-pyhainpaivaan-visa', 'pyhainpaiva'),
  ('isanpaiva-ja-aitienpaiva-visa', 'isanpaiva'),
  ('kiitospaiva-thanksgiving-visa', 'kiitospaiva'),
  ('itsenaisyyspaivan-vietto-visa', 'itsenaisyyspaiva'),
  ('lucian-paiva-visa', 'lucia'),
  ('adventista-jouluaattoon-visa', 'joulu'),
  ('joulun-oudoimmat-tarinat-visa', 'joulu'),
  ('joulupukki-visa', 'joulu'),
  ('joulupoydan-antimet-visa', 'joulu'),
  ('joulu-maailmalla-visa', 'joulu'),
  ('joulun-historia-ja-perinteet-visa', 'joulu'),
  ('suomalaisen-joulun-hiljaiset-tavat', 'joulu'),
  ('joulun-kulttuuri-ikonit-visa', 'joulu'),
  ('uudenvuoden-taiat-ja-lupaukset-visa', 'uusivuosi'),
  ('loppiainen-ja-nuutinpaiva-visa', 'loppiainen'),
  ('laskiainen-perinteet-ja-herkut-visa', 'laskiainen'),
  ('ystavanpaiva-suomessa-ja-maailmalla-visa', 'ystavanpaiva'),
  ('paasiainen-perinteet-ja-herkut-visa', 'paasiainen'),
  ('vappu-perinteet-historia-suomi', 'vappu'),
  ('isanpaiva-ja-aitienpaiva-visa', 'aitienpaiva'),
  ('juhlia-maailman-ympari-visa', 'ympari-vuoden'),
  ('suomalainen-juhlakahvipoyta-visa', 'ympari-vuoden')

) as t(slug, tag) group by slug) as v
where q.slug = v.slug and q.collection = 'juhlat';

update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[q.lasten_aihe]))
where q.collection = 'juhlat' and q.target_age in ('4-7', '8-12') and q.lasten_aihe is not null;
