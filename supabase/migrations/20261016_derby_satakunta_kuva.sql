-- 1.10.2026: Satakunnan derbyn (Ässät–Lukko, Päivän visa 2.10.) visakuva. Yksi rajattu
-- CC BY-SA 4.0 -kuva (kallerna / Wikimedia Commons, Lukko–Ässät 30.11.2019), jossa näkyvät
-- molemmat joukkueet. Lähde kirjattu lib/kuvalahteet.ts:ään. Kohde vasemmalla → teksti oikealle.
update quizzes
set hero_image = '/20/jaakiekko/jk-derby-satakunta-2019c.webp',
    hero_focal_x = 0.3,
    hero_focal_y = 0.45,
    hero_alt = 'Ässät kiittää yleisöä Lukko–Ässät-ottelun jälkeen Äijänsuolla 30.11.2019, Lukon pelaajat taustalla. Kuva: kallerna / Wikimedia Commons, CC BY-SA 4.0'
where slug = 'sm-liiga-satakunnan-derby-assat-lukko';
