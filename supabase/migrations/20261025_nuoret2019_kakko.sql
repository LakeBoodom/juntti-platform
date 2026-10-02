-- 2.10.2026: nuorten MM-kulta 2019 -visalle Kaapo Kakko (Heikki hyväksyi; turnauksen joukkuekuvalla ei vapaata lisenssiä).
update quizzes set hero_image = '/20/jaakiekko/jk-leijonat-nuoret2019-kuva.webp', hero_focal_x = 0.4, hero_focal_y = 0.08,
  hero_alt = 'Vuoden 2019 nuorten MM-finaalin ratkaisija Kaapo Kakko NHL-ottelussa 2025. Kuva: Jenn G / Wikimedia Commons, CC BY-SA 2.0'
where slug = 'nuoret-leijonat-mm-2019-kulta';
