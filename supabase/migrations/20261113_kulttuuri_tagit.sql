-- KOKOELMARUNKO vaihe 3 (19.10.2026): Kulttuuri rungolle. Osiotagit = nykyinen alakokoelma
-- (subcollection: taide-design, kirjallisuus-tarinat, musiikki-nayttamo, elamantapa-ilmiot), joka oli
-- sivun suodatinchippien jako. 20 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[q.subcollection]))
where q.collection = 'kulttuuri'
  and q.subcollection in ('taide-design', 'kirjallisuus-tarinat', 'musiikki-nayttamo', 'elamantapa-ilmiot');
