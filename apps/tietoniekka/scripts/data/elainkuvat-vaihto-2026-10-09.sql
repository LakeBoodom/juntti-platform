-- Eläinten kuvavisa: 27 kuvan vaihto Wikimedia Commonsin lisensoituihin kuviin (9.10.2026)
--
-- Kenguru, Sarvikuono ja Liito-orava: vanhan kuvan lisenssi ei ollut sallittu.
-- Muut 24: vanhan kuvan alkuperä tuntematon (yleinen "Wikipedia / Wikimedia Commons" -merkintä).
-- Uudet kuvat ovat sivuston public-kansiossa: apps/tietoniekka/public/20/kuvavisat/elaimet/<laji>.webp
-- (sama tapa kuin lintujen kuvissa, /20/aanivisat/suomen_linnut/kuvat/*.webp).
-- Sallitut lisenssit: CC0, Public domain, CC BY, CC BY-SA.
--
-- AJA VASTA KUN KUVAT OVAT TUOTANNOSSA (haara feat/elainkuvat-lahteet yhdistetty mainiin ja julkaistu),
-- muuten visassa näkyy rikkinäisiä kuvia.
--
-- Osa 1 päivittää kuvavisas-rivit (27 riviä).
-- Osa 2 päivittää lasten visojen (target_age 4-7 / 8-12) kysymykset, jotka käyttävät vanhoja kuvia:
--   2a kysymyskuvat (image_url, image_credit, image_license_note): Liito-orava ja Saimaannorppa (2 riviä)
--   2b vastausvaihtoehtojen kuvat (answers[i].image_url, answers[i].image_credit): Mäyrä (3 riviä)
--   Yhteensä 5 kysymysriviä (tilanne 9.10.2026).

begin;

-- Osa 1: eläinten kuvavisa
update kuvavisas k
set image_url = v.image_url,
    source_credit = v.source_credit,
    license_note = v.license_note,
    updated_at = now()
from (values
  ('Kenguru', '/20/kuvavisat/elaimet/kenguru.webp', 'PotMart186 / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Red_Kangaroos_at_Sturt_National_Park_NSW.jpg'),
  ('Sarvikuono', '/20/kuvavisat/elaimet/sarvikuono.webp', 'Giles Laurent / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:081_White_rhinoceros_(male)_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg'),
  ('Liito-orava', '/20/kuvavisat/elaimet/liito-orava.webp', 'Andrew Bazdyrev / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Pteromys_volans_292232567.jpg'),
  ('Aasiannorsu', '/20/kuvavisat/elaimet/aasiannorsu.webp', 'Tisha Mukherjee / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_04.jpg'),
  ('Afrikanvillikoira', '/20/kuvavisat/elaimet/afrikanvillikoira.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:African_wild_dog_(Lycaon_pictus_pictus).jpg'),
  ('Gnu', '/20/kuvavisat/elaimet/gnu.webp', 'Diego Delso / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:%C3%91u_com%C3%BAn_(Connochaetes_taurinus),_parque_nacional_de_Amboseli,_Kenia,_2024-05-23,_DD_16.jpg'),
  ('Isomuurahaiskarhu', '/20/kuvavisat/elaimet/isomuurahaiskarhu.webp', 'Fernando Flores / Wikimedia Commons, CC BY-SA 2.0', 'CC BY-SA 2.0, https://commons.wikimedia.org/wiki/File:Oso_hormiguero_(Myrmecophaga_tridactyla)_(8697865538).jpg'),
  ('Jakki', '/20/kuvavisat/elaimet/jakki.webp', 'Alexandr frolov / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Sarlyk_Yak2.jpg'),
  ('Kojootti', '/20/kuvavisat/elaimet/kojootti.webp', 'Yathin S Krishnappa / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Canis_latrans_(Yosemite,_2009).jpg'),
  ('Leijona', '/20/kuvavisat/elaimet/leijona.webp', 'Giles Laurent / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg'),
  ('Manaatti', '/20/kuvavisat/elaimet/manaatti.webp', 'Keith Ramos, USFWS / Wikimedia Commons, Public domain', 'Public domain, https://commons.wikimedia.org/wiki/File:Florida_Manatee_FWS_21.jpg'),
  ('Mäyrä', '/20/kuvavisat/elaimet/mayra.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:European_badger_(Meles_meles_taxus)_Drenthe.jpg'),
  ('Merihevonen', '/20/kuvavisat/elaimet/merihevonen.webp', 'Hans Hillewaert / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Hippocampus_hippocampus_(on_Ascophyllum_nodosum).jpg'),
  ('Metsäkauris', '/20/kuvavisat/elaimet/metsakauris.webp', 'Romzig / Wikimedia Commons, CC0', 'CC0, https://commons.wikimedia.org/wiki/File:Rehbock_(Mai_2025)_6.jpg'),
  ('Metsäpeura', '/20/kuvavisat/elaimet/metsapeura.webp', 'Jiel Beaumadier / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Jielbeaumadier_renne_forets_eurasiennes_2_zoo_praha_2010.jpeg'),
  ('Pahkasika', '/20/kuvavisat/elaimet/pahkasika.webp', 'Diego Delso / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Fac%C3%B3quero_com%C3%BAn_(Phacochoerus_africanus),_parque_nacional_del_Lago_Mburo,_Uganda,_2024-02-01,_DD_66.jpg'),
  ('Puuma', '/20/kuvavisat/elaimet/puuma.webp', 'Luis Miguel Bugallo Sánchez (Lmbuga) / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Puma_concolor_stanleyana_-_Texas_Park_-_Lanzarote_-PC06.jpg'),
  ('Rantakäärme', '/20/kuvavisat/elaimet/rantakaarme.webp', 'Andreas Eichler / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:2017.07.17.-21-Tiefer_See_oder_Grubensee-Storkow_(Mark)--Ringelnatter.jpg'),
  ('Rusakko', '/20/kuvavisat/elaimet/rusakko.webp', 'Stephan Sprinz / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Feldhase_(Spiekeroog).jpg'),
  ('Saimaannorppa', '/20/kuvavisat/elaimet/saimaannorppa.webp', 'Jan Ebr & Ivana Ebrová / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Pusa_hispida_saimensis_431602934.jpg'),
  ('Sisilisko', '/20/kuvavisat/elaimet/sisilisko.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Common_lizard_(Zootoca_vivipara).jpg'),
  ('Täpläkauris', '/20/kuvavisat/elaimet/taplakauris.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Spotted_deer_(Axis_axis)_male.jpg'),
  ('Tulisalamanteri', '/20/kuvavisat/elaimet/tulisalamanteri.webp', 'Holger Krisp / Wikimedia Commons, CC BY 3.0', 'CC BY 3.0, https://commons.wikimedia.org/wiki/File:Feuersalamander-salamandra-salamandra.jpg'),
  ('Valkohai', '/20/kuvavisat/elaimet/valkohai.webp', 'Terry Goss / Wikimedia Commons, CC BY 2.5', 'CC BY 2.5, https://commons.wikimedia.org/wiki/File:White_shark.jpg'),
  ('Vasarahai', '/20/kuvavisat/elaimet/vasarahai.webp', 'Barry Peters / Wikimedia Commons, CC BY 2.0', 'CC BY 2.0, https://commons.wikimedia.org/wiki/File:Hammerhead_shark,_Cocos_Island,_Costa_Rica.jpg'),
  ('Vaskitsa', '/20/kuvavisat/elaimet/vaskitsa.webp', 'Holger Krisp / Wikimedia Commons, CC BY 3.0', 'CC BY 3.0, https://commons.wikimedia.org/wiki/File:Blindschleiche_Anguis_fragilis.jpg'),
  ('Vihreä iguaani', '/20/kuvavisat/elaimet/vihrea-iguaani.webp', 'Cayambe / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Iguana_iguana_Portoviejo_04.jpg')
) as v(correct_option, image_url, source_credit, license_note)
where k.type = 'elaimet'
  and k.site_id = '62d75f45-a857-4fdd-9a45-b70ceeee98a8'
  and k.correct_option = v.correct_option
returning k.correct_option;

-- Osa 2: lasten visat. Vanha kuva-URL -> uusi kuva ja lähdemerkintä.
create temporary table elainkuva_vaihto (old_url text primary key, new_url text, credit text, license_note text) on commit drop;
insert into elainkuva_vaihto (old_url, new_url, credit, license_note) values
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788518937489-3neriq.jpg', '/20/kuvavisat/elaimet/kenguru.webp', 'PotMart186 / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Red_Kangaroos_at_Sturt_National_Park_NSW.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1785745338949-696bks.jpg', '/20/kuvavisat/elaimet/sarvikuono.webp', 'Giles Laurent / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:081_White_rhinoceros_(male)_in_the_Kalahari_Desert_of_Namibia_Photo_by_Giles_Laurent.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1777833113215-pwdqu7.jpg', '/20/kuvavisat/elaimet/liito-orava.webp', 'Andrew Bazdyrev / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Pteromys_volans_292232567.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777584151-6b6sqz.jpg', '/20/kuvavisat/elaimet/aasiannorsu.webp', 'Tisha Mukherjee / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Indian_elephant_in_Kaziranga_National_Park_March_2025_by_Tisha_Mukherjee_04.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778127315-li4dx2.jpg', '/20/kuvavisat/elaimet/afrikanvillikoira.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:African_wild_dog_(Lycaon_pictus_pictus).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778245133-o5y7h4.jpg', '/20/kuvavisat/elaimet/gnu.webp', 'Diego Delso / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:%C3%91u_com%C3%BAn_(Connochaetes_taurinus),_parque_nacional_de_Amboseli,_Kenia,_2024-05-23,_DD_16.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777816774-trytg5.jpg', '/20/kuvavisat/elaimet/isomuurahaiskarhu.webp', 'Fernando Flores / Wikimedia Commons, CC BY-SA 2.0', 'CC BY-SA 2.0, https://commons.wikimedia.org/wiki/File:Oso_hormiguero_(Myrmecophaga_tridactyla)_(8697865538).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778552586-w3y8a3.jpg', '/20/kuvavisat/elaimet/jakki.webp', 'Alexandr frolov / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Sarlyk_Yak2.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778051113-suk90f.jpg', '/20/kuvavisat/elaimet/kojootti.webp', 'Yathin S Krishnappa / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Canis_latrans_(Yosemite,_2009).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1785734278905-5ozlif.jpg', '/20/kuvavisat/elaimet/leijona.webp', 'Giles Laurent / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788780174708-2u7sxt.jpg', '/20/kuvavisat/elaimet/manaatti.webp', 'Keith Ramos, USFWS / Wikimedia Commons, Public domain', 'Public domain, https://commons.wikimedia.org/wiki/File:Florida_Manatee_FWS_21.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777035414-fo1ho3.jpg', '/20/kuvavisat/elaimet/mayra.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:European_badger_(Meles_meles_taxus)_Drenthe.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779979405-t3qw5o.jpg', '/20/kuvavisat/elaimet/merihevonen.webp', 'Hans Hillewaert / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Hippocampus_hippocampus_(on_Ascophyllum_nodosum).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777225368-qarohp.jpg', '/20/kuvavisat/elaimet/metsakauris.webp', 'Romzig / Wikimedia Commons, CC0', 'CC0, https://commons.wikimedia.org/wiki/File:Rehbock_(Mai_2025)_6.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777340135-nk0z2l.jpg', '/20/kuvavisat/elaimet/metsapeura.webp', 'Jiel Beaumadier / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Jielbeaumadier_renne_forets_eurasiennes_2_zoo_praha_2010.jpeg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777874980-n2e1se.jpg', '/20/kuvavisat/elaimet/pahkasika.webp', 'Diego Delso / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Fac%C3%B3quero_com%C3%BAn_(Phacochoerus_africanus),_parque_nacional_del_Lago_Mburo,_Uganda,_2024-02-01,_DD_66.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777994615-isuvdl.jpg', '/20/kuvavisat/elaimet/puuma.webp', 'Luis Miguel Bugallo Sánchez (Lmbuga) / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Puma_concolor_stanleyana_-_Texas_Park_-_Lanzarote_-PC06.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778889056-31y08a.jpg', '/20/kuvavisat/elaimet/rantakaarme.webp', 'Andreas Eichler / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:2017.07.17.-21-Tiefer_See_oder_Grubensee-Storkow_(Mark)--Ringelnatter.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777168115-7hodsv.jpg', '/20/kuvavisat/elaimet/rusakko.webp', 'Stephan Sprinz / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Feldhase_(Spiekeroog).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1785780911225-9zy0z4.jpg', '/20/kuvavisat/elaimet/saimaannorppa.webp', 'Jan Ebr & Ivana Ebrová / Wikimedia Commons, CC BY 4.0', 'CC BY 4.0, https://commons.wikimedia.org/wiki/File:Pusa_hispida_saimensis_431602934.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788778943952-3jlpra.jpg', '/20/kuvavisat/elaimet/sisilisko.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Common_lizard_(Zootoca_vivipara).jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788777282367-g9birz.jpg', '/20/kuvavisat/elaimet/taplakauris.webp', 'Charles J. Sharp / Wikimedia Commons, CC BY-SA 4.0', 'CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Spotted_deer_(Axis_axis)_male.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779411857-amrnoy.jpg', '/20/kuvavisat/elaimet/tulisalamanteri.webp', 'Holger Krisp / Wikimedia Commons, CC BY 3.0', 'CC BY 3.0, https://commons.wikimedia.org/wiki/File:Feuersalamander-salamandra-salamandra.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779816412-s9z5kd.jpg', '/20/kuvavisat/elaimet/valkohai.webp', 'Terry Goss / Wikimedia Commons, CC BY 2.5', 'CC BY 2.5, https://commons.wikimedia.org/wiki/File:White_shark.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779869987-qpe5pf.jpg', '/20/kuvavisat/elaimet/vasarahai.webp', 'Barry Peters / Wikimedia Commons, CC BY 2.0', 'CC BY 2.0, https://commons.wikimedia.org/wiki/File:Hammerhead_shark,_Cocos_Island,_Costa_Rica.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779005320-4m99no.jpg', '/20/kuvavisat/elaimet/vaskitsa.webp', 'Holger Krisp / Wikimedia Commons, CC BY 3.0', 'CC BY 3.0, https://commons.wikimedia.org/wiki/File:Blindschleiche_Anguis_fragilis.jpg'),
  ('https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka/elaimet/1788779165243-l8jnaz.jpg', '/20/kuvavisat/elaimet/vihrea-iguaani.webp', 'Cayambe / Wikimedia Commons, CC BY-SA 3.0', 'CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Iguana_iguana_Portoviejo_04.jpg');

-- 2a: kysymyksen oma kuva
update questions q
set image_url = m.new_url,
    image_credit = m.credit,
    image_license_note = m.license_note
from elainkuva_vaihto m, quizzes z
where q.quiz_id = z.id
  and z.target_age in ('4-7', '8-12')
  and q.image_url = m.old_url
returning q.id, q.image_url;

-- 2b: vastausvaihtoehtojen kuvat. Taulukko rakennetaan uudelleen samassa järjestyksessä;
-- vain ne alkiot muuttuvat, joiden image_url on vaihdettavien listalla.
update questions q
set answers = (
  select jsonb_agg(
           case when m.old_url is not null
                then a.elem || jsonb_build_object('image_url', m.new_url, 'image_credit', m.credit)
                else a.elem end
           order by a.ord)
  from jsonb_array_elements(q.answers) with ordinality as a(elem, ord)
  left join elainkuva_vaihto m on m.old_url = a.elem->>'image_url'
)
from quizzes z
where q.quiz_id = z.id
  and z.target_age in ('4-7', '8-12')
  and jsonb_typeof(q.answers) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(q.answers) e
    join elainkuva_vaihto m on m.old_url = e->>'image_url'
  )
returning q.id;

commit;
