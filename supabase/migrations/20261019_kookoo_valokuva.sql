-- 1.10.2026: KooKoon visalle oikea valokuva (Heikki valitsi Kärpät–KooKoo-kuvan). KooKoo oikealla → teksti vasemmalle.
update quizzes set hero_image = '/20/jaakiekko/jk-kookoo-kuva.webp', hero_focal_x = 0.7, hero_focal_y = 0.5,
  hero_alt = 'KooKoon pelaajat vierasottelussa Kärppiä vastaan Oulun jäähallissa helmikuussa 2023. Kuva: Estormiz / Wikimedia Commons, CC0'
where slug = 'kookoo-kiekko-kimpassa-tietovisa';
