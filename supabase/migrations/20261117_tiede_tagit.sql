-- KOKOELMARUNKO vaihe 3 ryhmä 2 (19.10.2026): Tiede & teknologia rungolle. Osiotagi = nykyinen aihepiiri
-- (subcollection: elama-ja-ihminen, maa-ja-avaruus, fysiikka-kemia-matematiikka, keksinnot-ja-tiedehistoria).
-- 20 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[q.subcollection]))
where q.category = 'tiede-teknologia'
  and q.subcollection in ('elama-ja-ihminen', 'maa-ja-avaruus', 'fysiikka-kemia-matematiikka', 'keksinnot-ja-tiedehistoria');
