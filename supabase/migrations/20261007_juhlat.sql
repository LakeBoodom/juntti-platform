-- JUHLAT-KOKOELMA (28.9.2026). Heikki: visa julkaistaan, kun sillä on kuva.
-- 1) Kuvalliset juhlavisat julkaistaan ja niille asetetaan hero_image (public/20/juhlat/).
--    Halloween-visan kuva on kauhuklassikot (kurpitsakuva on kokoelman nosto ja etusivun banneri).
--    Kuvattomat jäävät luonnoksiksi: adventista, joulun historia, loppiainen, laskiainen,
--    ystävänpäivä, pääsiäinen, vappu, juhlia maailman ympäri.
-- 2) Juhlavisat pois Päivän visan automaattivalinnasta: ne ovat sesonkisidonnaisia (joulu
--    lokakuussa olisi outo). Toimitus voi ajastaa juhlavisan Päivän visaksi käsin.

update public.quizzes q set
  hero_image = v.kuva,
  status = 'published',
  published_at = coalesce(q.published_at, now())
from (values
  ('halloween-historia-ja-symbolit', '/20/juhlat/kauhuklassikot.webp'),
  ('kekrista-pyhainpaivaan-visa', '/20/juhlat/pyhainpaiva.webp'),
  ('isanpaiva-ja-aitienpaiva-visa', '/20/juhlat/isanpaiva.webp'),
  ('kiitospaiva-thanksgiving-visa', '/20/juhlat/kiitospaiva.webp'),
  ('itsenaisyyspaivan-vietto-visa', '/20/juhlat/itsenaisyyspaiva.webp'),
  ('lucian-paiva-visa', '/20/juhlat/lucia.webp'),
  ('joulupukki-visa', '/20/juhlat/joulupukki.webp'),
  ('joulupoydan-antimet-visa', '/20/juhlat/joulupoyta.webp'),
  ('joulu-maailmalla-visa', '/20/juhlat/joulu-maailmalla.webp'),
  ('joulun-kulttuuri-ikonit-visa', '/20/juhlat/joulun-klassikot.webp'),
  ('suomalaisen-joulun-hiljaiset-tavat', '/20/juhlat/hiljaiset-tavat.webp'),
  ('uudenvuoden-taiat-ja-lupaukset-visa', '/20/juhlat/uusivuosi.webp'),
  ('suomalainen-juhlakahvipoyta-visa', '/20/juhlat/juhlakahvipoyta.webp')
) as v(slug, kuva)
where q.slug = v.slug and q.collection = 'juhlat';

CREATE OR REPLACE FUNCTION public.paivan_visa_ehdokas(p_site uuid, p_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_sankari uuid;
  v_recent  text[];
  v_pick    uuid;
begin
  select s.quiz_id into v_sankari from public.paivan_sankari(p_site, p_date) s;

  select array_agg(distinct coalesce(q.collection, q.category)) into v_recent
  from public.schedule_rules r
  join public.quizzes q on q.id = r.content_id
  where r.site_id = p_site and r.content_type = 'quiz' and r.active
    and r.scheduled_date in (p_date - 1, p_date - 2);

  with pool as (
    select q.id, coalesce(q.collection, q.category) as coll
    from public.quizzes q
    where q.site_id = p_site and q.status = 'published'
      and q.hero_image is not null
      and coalesce(nullif(btrim(q.teaser), ''), nullif(btrim(q.description), '')) is not null
      and coalesce(q.game_mode, 'klassinen') <> 'mega'
      and coalesce(q.collection, '') <> 'juhlat'
      and q.id is distinct from v_sankari
  ), shown30 as (
    select coalesce(q.collection, q.category) as coll, count(*) as n
    from public.schedule_rules r
    join public.quizzes q on q.id = r.content_id
    where r.site_id = p_site and r.content_type = 'quiz' and r.active
      and r.scheduled_date between p_date - 30 and p_date - 1
    group by 1
  )
  select p.id into v_pick
  from pool p
  left join shown30 s on s.coll = p.coll
  where not exists (
      select 1 from public.schedule_rules r
      where r.site_id = p_site and r.content_type = 'quiz' and r.content_id = p.id
        and r.scheduled_date between p_date - 90 and p_date + 90
        and r.scheduled_date <> p_date)
    and (v_recent is null or p.coll is null or not (p.coll = any (v_recent)))
  order by coalesce(s.n, 0), md5(p.id::text || p_date::text)
  limit 1;
  if v_pick is not null then return v_pick; end if;

  select q.id into v_pick
  from public.quizzes q
  where q.site_id = p_site and q.status = 'published'
    and q.hero_image is not null
    and coalesce(q.game_mode, 'klassinen') <> 'mega'
    and coalesce(q.collection, '') <> 'juhlat'
    and q.id is distinct from v_sankari
    and not exists (
      select 1 from public.schedule_rules r
      where r.site_id = p_site and r.content_type = 'quiz' and r.content_id = q.id
        and r.scheduled_date between p_date - 30 and p_date + 30
        and r.scheduled_date <> p_date)
  order by q.play_count desc nulls last, q.id
  limit 1;
  if v_pick is not null then return v_pick; end if;

  select q.id into v_pick
  from public.quizzes q
  where q.site_id = p_site and q.status = 'published'
    and coalesce(q.game_mode, 'klassinen') <> 'mega'
    and coalesce(q.collection, '') <> 'juhlat'
    and q.id is distinct from v_sankari
  order by q.play_count desc nulls last, q.id
  limit 1;
  return v_pick;
end
$function$;
