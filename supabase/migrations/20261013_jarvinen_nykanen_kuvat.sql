-- 29.9.2026 (Heikin valitsemat kuvat):
-- Matti Järvinen: Museovirasto, Historian kuvakokoelma, 1930, CC BY 4.0 (Finna
-- museovirasto.3F85D3EABD8361A3E47AE94F9F1FA71D). Ei Wikimediassa → tallennettu sivustolle
-- (public/20/henkilot/), krediitti visan hero_alt-kenttään ("Kuva: …" näkyy pelisivulla).
-- Matti Nykänen: tiiviimpi rajaus samasta 2014 kuvauksesta (Jakke Nikkarinen / Suomen Moneta,
-- CC BY 3.0, Commons "Matti Nykänen (FIN) 2014.jpg").
update public.celebrities set image_url = '/20/henkilot/matti-jarvinen-1930.jpg', image_focal_x = 0.4, image_focal_y = 0.2
where name = 'Matti Järvinen' and birth_date = '1909-02-18';
update public.quizzes q set hero_focal_x = 0.4, hero_focal_y = 0.2,
  hero_alt = 'Matti Järvinen keihäänheitossa 1930. Kuva: Museovirasto, Historian kuvakokoelma / CC BY 4.0'
from public.celebrities c where c.trivia_quiz_id = q.id and c.name = 'Matti Järvinen' and c.birth_date = '1909-02-18';

update public.celebrities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Matti_Nyk%C3%A4nen_%28FIN%29_2014.jpg/330px-Matti_Nyk%C3%A4nen_%28FIN%29_2014.jpg',
  image_focal_x = 0.55, image_focal_y = 0.35
where name = 'Matti Nykänen' and birth_date = '1963-07-17';
update public.quizzes q set hero_focal_x = 0.55, hero_focal_y = 0.35
from public.celebrities c where c.trivia_quiz_id = q.id and c.name = 'Matti Nykänen' and c.birth_date = '1963-07-17';
