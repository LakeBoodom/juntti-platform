-- Tiede & teknologia: aihepiirijako koodista kantaan (20.9.2026).
--
-- Ennen: lib/tiede.ts luetteli jokaisen visan aihepiireittäin ja sisälsi
-- kortin lyhyen nimen + koukun. Uusi tiedevisa vaati koodimuutoksen.
--
-- Nyt:
--   quizzes.subcollection = aihepiiri (jäsenyys), kuten Historialla,
--                           Luonnolla ja Kulttuurilla.
--   Kortin lyhyt nimi ja koukku luetaan visan omasta otsikosta, joka on
--   tässä kokoelmassa aina muotoa "Nimi – koukku". Siksi display_title ja
--   teaser jätetään tyhjiksi: teaser on hakutulosten kuvaus, eikä kahden
--   sanan koukku kelpaa siksi (ks. claude/SEO_PIKATARKISTUS_2026_09_01.md).
--
-- Aihepiirin otsikko, numero ja kuvaus jäävät koodiin (TIEDE_SECTIONS).
--
-- Järjestys aihepiirin sisällä: sivu lukee visat published_at nousevasti
-- (sama kuin Historialla). Kaikki 20 julkaistiin samalla sekunnilla, joten
-- järjestys oli määrittelemätön → porrastetaan sekunnin välein designin
-- järjestykseen. Julkaisuhetki pysyy samassa minuutissa.
--
-- EI KOSKETA quizzes.genre-sarakkeeseen — se ohjaa kokoelman tunnistusta ja
-- liittyvien visojen hakua (ks. lib/visanKokoelma.ts).
--
-- Idempotentti: voi ajaa uudelleen, kirjoittaa samat arvot.

do $$
declare
  v_site uuid := '62d75f45-a857-4fdd-9a45-b70ceeee98a8';
  v_base timestamptz;
  r record;
begin
  select min(published_at) into v_base
  from quizzes
  where site_id = v_site and category = 'tiede-teknologia';

  if v_base is null then
    raise exception 'Tiedevisoja ei löytynyt sivustolta % — migraatio keskeytetty', v_site;
  end if;
  -- Ajo uudelleen ei saa liu'uttaa aikaleimoja eteenpäin.
  v_base := date_trunc('minute', v_base);

  for r in
    select * from (values
      -- slug, aihepiiri, järjestys
      ('kehosi-katketyt-kummallisuudet','elama-ja-ihminen',1),
      ('paan-sisalla-tapahtuu-enemman-kuin-huomaat','elama-ja-ihminen',2),
      ('mista-olet-tehty-oikeasti-genetiikka','elama-ja-ihminen',3),
      ('evoluutio-ja-biodiversiteetti-visa','elama-ja-ihminen',4),
      ('mikroskooppinen-maailma-nakymaton-elama','elama-ja-ihminen',5),
      ('laaketieteen-lapimurrot-visa','elama-ja-ihminen',6),
      ('kasvit-ja-sienet-ansoja-kauppoja-jattilaisia','elama-ja-ihminen',7),
      ('elainten-supervoimat-aistit-ja-ennatykset','elama-ja-ihminen',8),

      ('matka-planeetoilta-kuun-kraattereihin','maa-ja-avaruus',9),
      ('elava-planeetta-liikkuu-jalkojesi-alla','maa-ja-avaruus',10),
      ('saa-ja-ilmakeha-taivaan-pikkuprintti','maa-ja-avaruus',11),
      ('meret-ja-merentutkimus-visa','maa-ja-avaruus',12),
      ('kadonneen-ajan-jattilaiset','maa-ja-avaruus',13),

      ('arjen-fysiikka-salamoista-sireeneihin','fysiikka-kemia-matematiikka',14),
      ('kemia-ja-alkuaineet-visa','fysiikka-kemia-matematiikka',15),
      ('arkijarki-vastaan-matematiikka','fysiikka-kemia-matematiikka',16),

      ('nerokkaita-oivalluksia-ja-onnekkaita-sattumia','keksinnot-ja-tiedehistoria',17),
      ('teknologian-ensimmaiset-hetket-visa','keksinnot-ja-tiedehistoria',18),
      ('neroja-omenoita-ja-yllattavia-kaanteita','keksinnot-ja-tiedehistoria',19),
      ('tiedemyyttien-tarkastus-visa','keksinnot-ja-tiedehistoria',20)
    ) as t(slug, aihepiiri, jarjestys)
  loop
    update quizzes
       set subcollection = r.aihepiiri,
           published_at  = v_base + (r.jarjestys || ' seconds')::interval,
           -- Kortin teksti tulee otsikosta, ei näistä. Tyhjennetään, jotta
           -- hakutulosten kuvaus ei kutistu koukuksi.
           display_title = null,
           teaser        = null,
           updated_at    = now()
     where site_id = v_site
       and category = 'tiede-teknologia'
       and slug = r.slug;

    if not found then
      raise warning 'Tiedevisaa ei löytynyt: %', r.slug;
    end if;
  end loop;
end $$;

-- Kortin nimi ja koukku luetaan otsikosta, joten otsikon on oltava muotoa
-- "Nimi – koukku". Yksi visa oli ilman koukkua; täydennetään designin copyyn.
update quizzes
   set title = 'Arkijärki vastaan matematiikka – kun intuitio on väärässä',
       updated_at = now()
 where site_id = '62d75f45-a857-4fdd-9a45-b70ceeee98a8'
   and category = 'tiede-teknologia'
   and slug = 'arkijarki-vastaan-matematiikka'
   and title not like '%–%';

-- Tarkistukset.
do $$
declare
  ilman_aihepiiria int;
  ilman_viivaa int;
begin
  select count(*) into ilman_aihepiiria
  from quizzes
  where site_id = '62d75f45-a857-4fdd-9a45-b70ceeee98a8'
    and category = 'tiede-teknologia' and subcollection is null;

  select count(*) into ilman_viivaa
  from quizzes
  where site_id = '62d75f45-a857-4fdd-9a45-b70ceeee98a8'
    and category = 'tiede-teknologia' and title not like '%–%';

  if ilman_aihepiiria > 0 then
    raise exception 'Tiedevisoja ilman aihepiiriä: %', ilman_aihepiiria;
  end if;
  if ilman_viivaa > 0 then
    raise exception 'Tiedevisojen otsikoita ilman "Nimi – koukku" -muotoa: %', ilman_viivaa;
  end if;
end $$;
