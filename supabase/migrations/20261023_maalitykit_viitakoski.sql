-- 2.10.2026: Maalitykit-visalle Vesa Viitakoski (Heikin ehdotus; Esa Peltonen -kuva hylättiin epävarman lisenssin takia).
update quizzes set hero_image = '/20/jaakiekko/jk-liiga-maalitykit-kuva.webp', hero_focal_x = 0.4, hero_focal_y = 0.08,
  hero_alt = 'Kärppien Vesa Viitakoski 2009. Kuva: Javatyk / Wikimedia Commons, CC BY 3.0'
where slug = 'sm-liiga-ikonisimmat-maalitykit';
