-- JUHLAT (28.9.2026): Maailma juhlii -visa sai kuvan → julkaistaan. Kaikki 21 juhlavisaa julki.
update public.quizzes set
  hero_image = '/20/juhlat/maailma-juhlii.webp',
  status = 'published',
  published_at = coalesce(published_at, now())
where slug = 'juhlia-maailman-ympari-visa' and collection = 'juhlat';
