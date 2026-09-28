-- JUHLAT, kuvat 2 (28.9.2026): seitsemän juhlavisaa sai kuvan → julkaistaan.
-- Vappu-visa oli merkitty Juntin visaksi (platform='juntti'); Heikki: Tietoniekan visa.
-- Luonnoksena jää vain juhlia-maailman-ympari-visa (ei vielä kuvaa).

update public.quizzes set platform = 'tietoniekka' where slug = 'vappu-perinteet-historia-suomi' and collection = 'juhlat';

update public.quizzes q set
  hero_image = v.kuva,
  status = 'published',
  published_at = coalesce(q.published_at, now())
from (values
  ('adventista-jouluaattoon-visa', '/20/juhlat/adventti.webp'),
  ('joulun-historia-ja-perinteet-visa', '/20/juhlat/joulun-historia.webp'),
  ('loppiainen-ja-nuutinpaiva-visa', '/20/juhlat/loppiainen.webp'),
  ('laskiainen-perinteet-ja-herkut-visa', '/20/juhlat/laskiainen.webp'),
  ('ystavanpaiva-suomessa-ja-maailmalla-visa', '/20/juhlat/ystavanpaiva.webp'),
  ('paasiainen-perinteet-ja-herkut-visa', '/20/juhlat/paasiainen.webp'),
  ('vappu-perinteet-historia-suomi', '/20/juhlat/vappu.webp')
) as v(slug, kuva)
where q.slug = v.slug and q.collection = 'juhlat';
