-- HISTORIAN HENKILÖIDEN KUVAT (29.9.2026): pienet Wikimedia-kuvat (158–480 px leveitä)
-- vaihdettu Commonsin tarkempiin. Sivuston hero pyytää 1280 px:n version, joka ei toimi
-- alle 1280 px:n alkuperäisillä → vanhat näkyivät suurennettuina ja sumeina.
-- Lisenssit: PD (Canth/SLS, Ritola, Spede, Bell/LoC), CC BY 4.0 (Thunberg ja Ehrnrooth /
-- Museovirasto-JOKA, Juutilainen / SA-kuva). IG hakee tekijän ja lisenssin automaattisesti.
-- Ritola: kuvassa edellä Ritola, perässä Nurmi (Commonsin kuvaus). Matti Järvisestä ei
-- löytynyt parempaa kuvaa → ennallaan. Polttopiste arvioitu kasvojen kohdalle.
update public.celebrities c set image_url = v.u, image_focal_x = v.x, image_focal_y = v.y
from (values
  ('Minna Canth', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Minna_Canth_1844-1897_-_1880_SLSA_1270_34_foto_386.jpg/330px-Minna_Canth_1844-1897_-_1880_SLSA_1270_34_foto_386.jpg', 0.5, 0.35),
  ('Ville Ritola', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ville_Ritola_and_Paavo_Nurmi_1928.jpg/330px-Ville_Ritola_and_Paavo_Nurmi_1928.jpg', 0.33, 0.22),
  ('Clas Thunberg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Clas_Thunberg_1931_%28JOKAHBL3B_B33-1%29.tif/lossy-page1-1280px-Clas_Thunberg_1931_%28JOKAHBL3B_B33-1%29.tif.jpg', 0.45, 0.12),
  ('Adolf Ehrnrooth', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Adolf-Ehrnrooth.jpg/330px-Adolf-Ehrnrooth.jpg', 0.73, 0.3),
  ('Ilmari Juutilainen', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Ilmari_Juutilainen_26.6.1942.jpg/330px-Ilmari_Juutilainen_26.6.1942.jpg', 0.38, 0.35),
  ('Spede Pasanen', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Spede-Pasanen-in-Swedish-TV-1972.jpg/330px-Spede-Pasanen-in-Swedish-TV-1972.jpg', 0.3, 0.25),
  ('Alexander Graham Bell', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/BELL%2C_ALEXANDER_GRAHAM_LCCN2016856759.jpg/330px-BELL%2C_ALEXANDER_GRAHAM_LCCN2016856759.jpg', 0.55, 0.3)
) as v(nimi, u, x, y)
where c.name = v.nimi;

-- Pelisivun hero käyttää visan omaa polttopistettä (quizzes.hero_focal_*, asteikko 0–1).
update public.quizzes q set hero_focal_x = c.image_focal_x, hero_focal_y = c.image_focal_y
from public.celebrities c
where c.trivia_quiz_id = q.id
  and c.name in ('Minna Canth','Ville Ritola','Clas Thunberg','Adolf Ehrnrooth','Ilmari Juutilainen','Spede Pasanen','Alexander Graham Bell');
