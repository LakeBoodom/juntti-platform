-- Instagram-bio-sivu tietoniekka.fi/ig ja mittaus (26.9.2026).
--
-- ig_bio(site): julkaistut Instagram-postaukset (21 pv) visoineen bio-sivulle.
--   Jos tänään ei ole vielä julkaistu mitään, mukaan tulee tämän päivän Päivän
--   visa (julkaisu_id null), jotta bio-linkki vie aina johonkin tuoreeseen.
--   security definer: ig_julkaisut ei näy anonille, tämä palauttaa vain
--   julkiset tiedot (julkaistut postaukset).
-- ig_mittaus + kirjaa_ig(): päiväkohtaiset laskurit ilman henkilötietoja, kuten
--   Päivän nostojen mittaus (kirjaa_nosto). Tapahtumat:
--     bio_naytto  bio-sivu avattiin
--     klikkaus    bio-sivulta painettiin visaa
--     avaus       visa avautui Instagramista tulleelle (?lahde=ig)
--     valmis      Instagramista tullut pelaaja pelasi visan loppuun
--   julkaisu = ig_julkaisut.id tekstinä, '-' kun postausta ei tunneta.
--   Designin A/B-testin kolmas mittari = avaus/valmis per pohja.

create table if not exists public.ig_mittaus (
  paiva      date not null,
  julkaisu   text not null,
  tapahtuma  text not null check (tapahtuma in ('bio_naytto', 'klikkaus', 'avaus', 'valmis')),
  maara      integer not null default 0,
  primary key (paiva, julkaisu, tapahtuma)
);
alter table public.ig_mittaus enable row level security;
revoke all on public.ig_mittaus from anon, authenticated;

create or replace function public.kirjaa_ig(p_tapahtuma text, p_julkaisu text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_julkaisu text := '-';
begin
  if p_tapahtuma not in ('bio_naytto', 'klikkaus', 'avaus', 'valmis') then
    return;
  end if;
  if p_julkaisu ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     and exists (select 1 from ig_julkaisut where id = p_julkaisu::uuid and tila = 'julkaistu') then
    v_julkaisu := p_julkaisu;
  end if;
  insert into ig_mittaus (paiva, julkaisu, tapahtuma, maara)
  values (public.helsinki_tanaan(), v_julkaisu, p_tapahtuma, 1)
  on conflict (paiva, julkaisu, tapahtuma) do update set maara = ig_mittaus.maara + 1;
end;
$$;
revoke all on function public.kirjaa_ig(text, text) from public;
grant execute on function public.kirjaa_ig(text, text) to anon, authenticated;

create or replace function public.ig_bio(p_site uuid)
returns table (
  julkaisu_id  uuid,
  paiva        date,
  slotti       text,
  julkaistu_at timestamptz,
  quiz_id      uuid,
  otsikko      text,
  kuva         text,
  kokoelma     text,
  kampanja     text
)
language sql
stable
security definer
set search_path = public
as $$
  with julkaistut as (
    select j.id, j.paiva, j.slotti, j.julkaistu_at, q.id as quiz_id,
           coalesce(q.display_title, q.title) as otsikko,
           coalesce(j.kuva_urls[1], q.hero_image) as kuva,
           j.kokoelma, j.kampanja
    from ig_julkaisut j
    join quizzes q on q.id = j.quiz_id and q.status = 'published'
    where j.site_id = p_site
      and j.tila = 'julkaistu'
      and j.julkaistu_at > now() - interval '21 days'
  ),
  tanaan as (
    select null::uuid as id, public.helsinki_tanaan() as paiva, 'paivan_visa'::text as slotti,
           null::timestamptz as julkaistu_at, q.id as quiz_id,
           coalesce(q.display_title, q.title) as otsikko, q.hero_image as kuva,
           null::text as kokoelma, null::text as kampanja
    from schedule_rules s
    join quizzes q on q.id = s.content_id and q.status = 'published'
    where s.site_id = p_site
      and s.content_type = 'quiz'
      and s.active
      and s.scheduled_date = public.helsinki_tanaan()
      and not exists (select 1 from julkaistut jt where jt.paiva = public.helsinki_tanaan())
    limit 1
  )
  select * from (
    select * from tanaan
    union all
    select * from (select * from julkaistut order by julkaistu_at desc limit 12) x
  ) kaikki
  order by kaikki.paiva desc, kaikki.julkaistu_at desc nulls first;
$$;
revoke all on function public.ig_bio(uuid) from public;
grant execute on function public.ig_bio(uuid) to anon, authenticated;
