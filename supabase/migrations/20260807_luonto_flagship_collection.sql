-- SUOMEN LUONTO — flagship-teemakokoelma (Heikki 7.8.2026)
-- Siirtää nykyiset 24 category='luonto' -visaa omaan collection='luonto'
-- -arvoon (olivat aiemmin osa 'matkakohteet'-kokoelmaa). Näin uusi
-- staattinen /2-0/kokoelma/luonto voi hakea samalla tavalla kuin Kulttuuri
-- (collection='luonto'), Matkakohteet-kokoelmaan jäävät vain varsinaiset
-- matkakohdevisat. Lisää myös 4 alakokoelmaa (subcollection) CD-mallin
-- mukaisesti filttereitä varten (sama malli kuin Kulttuurin 4 chippiä).

update quizzes
set collection = 'luonto'
where category = 'luonto' and status = 'published';

-- Alakokoelmat: Eläimet, Kasvit & sienet, Maastot & vedet, Ilmiöt
update quizzes set subcollection = 'elaimet'
where collection = 'luonto' and slug in (
  'karhu-suomen-metsien-kuningas', 'kuikka-visa', 'merikotka-visa',
  'naali-tunturien-salaperainen-kettu', 'suomen-elaimet-visa',
  'tiedatko-metsosta-kaiken', 'saimaan-norppa',
  'suomen-suurpedot-visa-tunnetko-huippupedot', 'suomen-linnut-visa',
  'suomen-pollot-yon-aanettomat-mestarit', 'suomen-kalat-visa',
  'suomen-matelijat-ja-sammakot-selviytyjien-salaisuudet',
  'suomen-hyonteiset-pienen-vaen-suuret-temput'
);

update quizzes set subcollection = 'kasvit-sienet'
where collection = 'luonto' and slug in (
  'suomen-kasvit-myrkkyja-taikaa-ja-pelastavia-jauhoja',
  'suomen-sienet-visa', 'suomen-marjat-visa'
);

update quizzes set subcollection = 'maastot-vedet'
where collection = 'luonto' and slug in (
  'suomen-suot-visa', 'suomen-metsat-visa', 'suomen-kansallispuistot-visa',
  'jarvien-katketyt-ihmeet-visa', 'jokien-salainen-elama-visa',
  'itameri-visa', 'tunturin-salainen-elama-lappi-visa'
);

update quizzes set subcollection = 'ilmiot'
where collection = 'luonto' and slug in ('revontulet-tiedatko-mista-ne-tulevat');
