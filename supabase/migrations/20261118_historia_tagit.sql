-- KOKOELMARUNKO vaihe 3 ryhmä 3 (20.10.2026): Historia rungolle. Osiotagi = aikakausi (subcollection:
-- esihistoria, ruotsin-aika, autonomia, itsenaisyys, sodat, jalleenrakennus, nykyaika); läpileikkaavat
-- teemat ja läpileikkausvisa (subcollection teema / lapileikkaus) → tagi 'historian-teemat'. 23 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') ||
  array[case when q.subcollection in ('teema', 'lapileikkaus') then 'historian-teemat' else q.subcollection end]))
where q.collection = 'historia'
  and q.subcollection in ('esihistoria', 'ruotsin-aika', 'autonomia', 'itsenaisyys', 'sodat', 'jalleenrakennus', 'nykyaika', 'teema', 'lapileikkaus');
