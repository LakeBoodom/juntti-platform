-- Kuvavisa: kolmen kuvan vaihto sallitulla lisenssillä oleviin Commons-kuviin (Heikki hyväksyi 20.11.2026)
--
-- Vanhojen kuvien lisenssi ei ollut sallittujen listalla (Coworkin kuvalähdetäydennys 17.11.2026):
--   Kultapiisku  GPL (Solidago virgaurea08.jpg)
--   Taistelevat metsot  Free Art License (Ateneumin kuva)
--   Oman  OGL-om 1.0
-- Uudet kuvat (tarkistettu Commonsin extmetadatasta 20.11.: kaikki Public domain) ovat sivuston public-kansiossa
-- apps/tietoniekka/public/20/kuvavisat/<tyyppi>/<nimi>.webp (sama tapa kuin elainkuvat-vaihto-2026-10-09.sql).
-- Mitat: 1280 × 960, 1280 × 827 ja 1280 × 854 (Omanin lippu 3:2, kuvio sama).
--
-- AJA VASTA KUN KUVAT OVAT TUOTANNOSSA, muuten visassa näkyy rikkinäisiä kuvia.
-- Vanhat arvot: image_url-kentät alla kommentteina.
--   d39107a8-… Oman  …/kuvavisa-images/tietoniekka/liput/1788559784300-lt9wlg.jpg
--   a3ec29d0-… Kultapiisku  …/kuvavisa-images/tietoniekka/kasvit/1788504961344-xcp4v9.jpg
--   fee6fb1e-… Taistelevat metsot  …/kuvavisa-images/tietoniekka/maalaukset/taistelevat-metsot.jpg

update kuvavisas k
set image_url = v.image_url, source_credit = v.source_credit, license_note = v.license_note, updated_at = now()
from (values
  ('a3ec29d0-451d-4846-8ddb-c082c280f3b9'::uuid, '/20/kuvavisat/kasvit/kultapiisku.webp',
   'Frank Förster / Wikimedia Commons, Public domain',
   'Public domain, https://commons.wikimedia.org/wiki/File:Solidago_virgaurea_Vrango.jpg'),
  ('fee6fb1e-7328-463c-ad5f-11be4672f434'::uuid, '/20/kuvavisat/maalaukset/taistelevat-metsot.webp',
   'Ferdinand von Wright / Wikimedia Commons, Public domain',
   'Public domain, https://commons.wikimedia.org/wiki/File:Ferdinand_von_Wright_-_The_Fighting_Capercaillies_-_Google_Art_Project.jpg'),
  ('d39107a8-25de-4711-acc2-4a6c1750ddbb'::uuid, '/20/kuvavisat/liput/oman.webp',
   'Sangjinhwa / Wikimedia Commons, Public domain',
   'Public domain, https://commons.wikimedia.org/wiki/File:Flag_of_Oman_(3-2).svg')
) as v(id, image_url, source_credit, license_note)
where k.id = v.id
returning k.id, k.correct_option, k.image_url;
