-- KOKOELMARUNKO vaihe 3 (19.10.2026): Elokuvat rungolle. Osiotagit nykyisistä käsilistoista
-- (lib/elokuvat.ts ELOKUVAT_SECTIONS); entiset kolme poimintaa (Odyssey, Hämähäkkimies, Joker) eivät
-- olleet missään aihepiirissä → Hollywoodiin. 29 visaa ennen ja jälkeen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array[v.tag]))
from (values
  ('the-odyssey-nolan-2026', 'hollywood'),
  ('hamahakkimies-brand-new-day', 'hollywood'),
  ('joker-2019-tietovisa', 'hollywood'),
  ('star-wars-tietovisa', 'hollywood'),
  ('james-bond-elokuvat', 'hollywood'),
  ('jurassic-park-dinosaurussaari', 'hollywood'),
  ('top-gun-maverick-2022-tietovisa', 'hollywood'),
  ('dune-osa-kaksi-2024-tietovisa', 'hollywood'),
  ('barbie-2023-tietovisa', 'hollywood'),
  ('oppenheimer-2023-tietovisa', 'hollywood'),
  ('taru-sormusten-herrasta-keski-maa', 'hollywood'),
  ('titanic-elokuva-tiedatko-kaiken', 'hollywood'),
  ('leijonakuningas-ylpeyskallio', 'hollywood'),
  ('toy-story-lelujen-seikkailu', 'hollywood'),
  ('frozen-huurteinen-seikkailu', 'hollywood'),
  ('tappajahai-kesahitti', 'hollywood'),
  ('uuno-turhapuro-elokuvat', 'kotimaiset-elokuvat'),
  ('hajyt-2-pohjalaisdraama', 'kotimaiset-elokuvat'),
  ('talvisota-sotaklassikko', 'kotimaiset-elokuvat'),
  ('myrskyluodon-maija-saaristodraama', 'kotimaiset-elokuvat'),
  ('luottomies-all-in-komedia', 'kotimaiset-elokuvat'),
  ('casablanca-elokuva', 'elokuvaklassikot'),
  ('kummiseta-corleonen-perhe', 'elokuvaklassikot'),
  ('pulp-fiction-rikoksen-ydin', 'elokuvaklassikot'),
  ('matrix-heraa-totuuteen', 'elokuvaklassikot'),
  ('takaisin-tulevaisuuteen-aikamatka', 'elokuvaklassikot'),
  ('forrest-gump-elamantarina', 'elokuvaklassikot'),
  ('alfred-hitchcock-jannityksen-mestari', 'ohjaajat'),
  ('aki-kaurismaki-tunnetko-mestarisi', 'ohjaajat')
) as v(slug, tag)
where q.slug = v.slug and q.collection = 'elokuvat';
