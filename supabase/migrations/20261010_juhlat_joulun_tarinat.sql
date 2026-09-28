-- JUHLAT (28.9.2026): toimittaja-agentin uusi jouluvisa "Joulun yllättävimmät tarinat" kuvan kanssa
-- julki; siitä myös joulun bannerikoukku (lib/juhlat.ts).
update public.quizzes set
  hero_image = '/20/juhlat/joulun-tarinat.webp',
  status = 'published',
  published_at = coalesce(published_at, now())
where slug = 'joulun-oudoimmat-tarinat-visa' and collection = 'juhlat';
