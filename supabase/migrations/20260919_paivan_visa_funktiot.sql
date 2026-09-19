-- TIETONIEKKA — Päivän visa + Päivän sankari: valintalogiikka (toteutusohje
-- 19.9.2026, luvut 4–5). Kaikki päivälogiikka Suomen ajassa.
--
--   paivan_sankari(site, päivä)      päivän sankari tai ei riviä (luku 4)
--   paivan_visa_ehdokas(site, päivä) automaattitäytön valinta, ei kirjoita
--   paivan_visa_varmista(site, päivä) idempotentti täyttö schedule_rulesiin
--   paivan_visa_tanaan(site)         etusivun ainoa kutsu (anon): täyttää
--                                    tarvittaessa tämän päivän ja palauttaa sen
--
-- Vain paivan_sankari ja paivan_visa_tanaan ovat anonin kutsuttavissa;
-- päivämääräparametrilliset kirjoittajat vain palvelulle (admin, pg_cron).

create or replace function public.helsinki_tanaan()
returns date language sql stable
as $$ select (now() at time zone 'Europe/Helsinki')::date $$;

-- ── Päivän sankari ──────────────────────────────────────────────────────
-- Syntymäpäivä = päivä (MM-DD). 29.2. syntyneet näytetään ei-karkausvuosina
-- 28.2. Edesmenneet kuuluvat slottiin (death_date ratkaisee tekstivariantin),
-- paitsi alle 12 kk sitten kuolleet (suruaika). Järjestys is_hero → priority
-- → nimi.
create or replace function public.paivan_sankari(p_site uuid, p_date date)
returns table (
  celebrity_id uuid, name text, role text, birth_date date, death_date date,
  image_url text, slug text, intro_text text,
  image_focal_x numeric, image_focal_y numeric,
  quiz_id uuid, quiz_title text, quiz_slug text, custom_slug text, ika integer
)
language sql stable security invoker set search_path = public
as $$
  select c.id, c.name, c.role, c.birth_date, c.death_date, c.image_url, c.slug,
         c.intro_text, c.image_focal_x, c.image_focal_y,
         q.id, coalesce(q.display_title, q.title), q.slug, q.custom_slug,
         (extract(year from p_date) - extract(year from c.birth_date))::integer
  from public.celebrities c
  join public.quizzes q on q.id = c.trivia_quiz_id and q.status = 'published'
  where c.site_id = p_site
    and c.birth_date <= p_date
    and (
      to_char(c.birth_date, 'MM-DD') = to_char(p_date, 'MM-DD')
      or (
        to_char(p_date, 'MM-DD') = '02-28'
        and to_char(c.birth_date, 'MM-DD') = '02-29'
        and extract(day from (date_trunc('year', p_date) + interval '1 month 28 days')) <> 29
      )
    )
    and (c.death_date is null or c.death_date <= (p_date - interval '12 months')::date)
  order by c.is_hero desc nulls last, c.priority desc nulls last, c.name
  limit 1
$$;

-- ── Automaattitäytön ehdokas ────────────────────────────────────────────
-- Ehdokkaat: julkaistu, oma kuva (hero_image) ja kuvaava teksti (teaser tai
-- description), ei megavisa, ei päivän sankarin visa.
--   1. ei Päivän visana ±90 päivän sisällä (myös jo ajastettu tulevaisuuteen)
--   2. ei samaa kokoelmaa kuin eilen tai toissapäivänä
--   3. vähiten 30 päivässä näytetty kokoelma ensin; tasatilanteessa
--      päiväkohtainen hajautus (md5), joten sama päivä → sama valinta
-- Viimeinen oljenkorsi: 90 → 30 päivää, suosituin (play_count). Sitten mikä
-- tahansa julkaistu visa. Palauttaa null vain jos sivustolla ei ole visoja.
create or replace function public.paivan_visa_ehdokas(p_site uuid, p_date date)
returns uuid
language plpgsql stable security definer set search_path = public
as $$
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

  -- Oljenkorsi 1: sama joukko, 30 päivän toistoraja, suosituin.
  select q.id into v_pick
  from public.quizzes q
  where q.site_id = p_site and q.status = 'published'
    and q.hero_image is not null
    and coalesce(q.game_mode, 'klassinen') <> 'mega'
    and q.id is distinct from v_sankari
    and not exists (
      select 1 from public.schedule_rules r
      where r.site_id = p_site and r.content_type = 'quiz' and r.content_id = q.id
        and r.scheduled_date between p_date - 30 and p_date + 30
        and r.scheduled_date <> p_date)
  order by q.play_count desc nulls last, q.id
  limit 1;
  if v_pick is not null then return v_pick; end if;

  -- Oljenkorsi 2: mikä tahansa julkaistu klassinen visa.
  select q.id into v_pick
  from public.quizzes q
  where q.site_id = p_site and q.status = 'published'
    and coalesce(q.game_mode, 'klassinen') <> 'mega'
    and q.id is distinct from v_sankari
  order by q.play_count desc nulls last, q.id
  limit 1;
  return v_pick;
end
$$;

-- ── Idempotentti täyttö ─────────────────────────────────────────────────
-- Jos päivälle on aktiivinen rivi, palauttaa sen. Muuten kirjoittaa
-- ehdokkaan (auto_filled = true). Rinnakkaiset kutsut: unique-indeksi +
-- on conflict do nothing → korkeintaan yksi rivi, kaikki saavat saman.
create or replace function public.paivan_visa_varmista(p_site uuid, p_date date)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_id   uuid;
  v_quiz uuid;
begin
  select r.id into v_id from public.schedule_rules r
  where r.site_id = p_site and r.content_type = 'quiz'
    and r.scheduled_date = p_date and r.active;
  if v_id is not null then return v_id; end if;

  v_quiz := public.paivan_visa_ehdokas(p_site, p_date);
  if v_quiz is null then return null; end if;

  insert into public.schedule_rules
    (site_id, content_type, content_id, strategy, scheduled_date, weight, active, auto_filled)
  values (p_site, 'quiz', v_quiz, 'date', p_date, 1, true, true)
  on conflict (site_id, content_type, scheduled_date) where active and scheduled_date is not null
  do nothing
  returning id into v_id;

  if v_id is null then
    select r.id into v_id from public.schedule_rules r
    where r.site_id = p_site and r.content_type = 'quiz'
      and r.scheduled_date = p_date and r.active;
  end if;
  return v_id;
end
$$;

-- ── Etusivun kutsu ──────────────────────────────────────────────────────
-- Tämä päivä Suomen aikaan. Jos toimituksen rivi osuu päivän sankarin
-- visaan, Päivän visaksi vaihdetaan ehdokas (ei kirjoiteta — ihmisen riviä
-- ei muuteta automaattisesti; admin varoittaa). Intro kuuluu rivin visalle,
-- joten vaihdetulla visalla introa ei näytetä.
create or replace function public.paivan_visa_tanaan(p_site uuid)
returns table (
  rule_id uuid, quiz_id uuid, paiva date,
  intro_headline text, intro_text text, auto_filled boolean, vaihdettu boolean
)
language plpgsql volatile security definer set search_path = public
as $$
declare
  v_date    date := public.helsinki_tanaan();
  v_rule    uuid;
  v_sankari uuid;
  r         public.schedule_rules%rowtype;
begin
  v_rule := public.paivan_visa_varmista(p_site, v_date);
  if v_rule is null then return; end if;
  select * into r from public.schedule_rules where id = v_rule;
  select s.quiz_id into v_sankari from public.paivan_sankari(p_site, v_date) s;

  if r.content_id = v_sankari then
    return query select r.id, public.paivan_visa_ehdokas(p_site, v_date), v_date,
      null::text, null::text, r.auto_filled, true;
  else
    return query select r.id, r.content_id, v_date,
      r.intro_headline, r.intro_text, r.auto_filled, false;
  end if;
end
$$;

revoke all on function public.paivan_visa_ehdokas(uuid, date)  from public, anon, authenticated;
revoke all on function public.paivan_visa_varmista(uuid, date) from public, anon, authenticated;
grant execute on function public.paivan_sankari(uuid, date)  to anon, authenticated;
grant execute on function public.paivan_visa_tanaan(uuid)     to anon, authenticated;
grant execute on function public.helsinki_tanaan()            to anon, authenticated;
