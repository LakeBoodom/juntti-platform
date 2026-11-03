-- Visojen suosio quiz_plays-taulusta (3.11.2026). quizzes.play_count on ollut aina 0, koska mikään ei kirjoita sitä.
-- Ei laskuria quizzes-tauluun: jokainen UPDATE nostaisi updated_at-arvon (sitemap, dateModified), eikä laskuri
-- huomaisi poistettuja testirivejä. Suosio = eri selainten määrä 90 päivältä; yksi selain ei voi nostaa visaa.
-- Yhteenveto omassa taulussaan, koska quiz_cards on security_invoker eikä anon saa lukea quiz_plays-rivejä.
-- suosio_90pv on näkymän uusi sarake: play_count säilyy, jotta tuotantokoodi ei muutu ennen julkaisua.

create table if not exists public.quiz_suosio (
  quiz_id uuid primary key references public.quizzes(id) on delete cascade,
  selaimia_90pv integer not null,
  paivitetty timestamptz not null default now()
);
comment on table public.quiz_suosio is 'Eri selaimet per visa 90 päivältä (quiz_plays). Päivittyy yöllä: paivita_quiz_suosio().';

alter table public.quiz_suosio enable row level security;
drop policy if exists "Suosio luettavissa" on public.quiz_suosio;
create policy "Suosio luettavissa" on public.quiz_suosio for select using (true);
revoke all on public.quiz_suosio from anon, authenticated;
grant select on public.quiz_suosio to anon, authenticated;

create or replace function public.paivita_quiz_suosio()
returns void
language plpgsql
set search_path to 'public'
as $function$
begin
  insert into public.quiz_suosio (quiz_id, selaimia_90pv, paivitetty)
  select p.quiz_id, count(distinct p.session_id)::integer, now()
  from public.quiz_plays p
  where p.platform = 'tietoniekka'
    and p.quiz_id is not null
    and p.session_id not ilike 'testi%'
    and p.played_at > now() - interval '90 days'
  group by p.quiz_id
  on conflict (quiz_id) do update
    set selaimia_90pv = excluded.selaimia_90pv, paivitetty = excluded.paivitetty;

  -- Visa, jota ei ole pelattu 90 päivään, putoaa pois.
  delete from public.quiz_suosio s
  where not exists (
    select 1 from public.quiz_plays p
    where p.quiz_id = s.quiz_id
      and p.platform = 'tietoniekka'
      and p.session_id not ilike 'testi%'
      and p.played_at > now() - interval '90 days'
  );
end
$function$;
revoke all on function public.paivita_quiz_suosio() from public, anon, authenticated;

select public.paivita_quiz_suosio();

create or replace view public.quiz_cards with (security_invoker = true) as
 select id,
    slug,
    custom_slug,
    title,
    display_title,
    teaser,
    description,
    collection,
    genre,
    subcollection,
    category,
    difficulty,
    game_mode,
    tags,
    play_count,
    published_at,
    site_id,
    ( select count(*)::integer as count
           from questions qu
          where qu.quiz_id = q.id) as question_count,
        case
            when published_at > (now() - '7 days'::interval) then 'uusi'::text
            when play_count >= 25 then 'suosittu'::text
            else null::text
        end as badge,
    target_age,
    section_tags,
    hero_image,
    hero_focal_x,
    hero_focal_y,
    coalesce(( select s.selaimia_90pv
           from quiz_suosio s
          where s.quiz_id = q.id), 0) as suosio_90pv
   from quizzes q
  where status = 'published'::text;

-- Yöllä Suomen aikaa, ei muiden ajastusten kanssa päällekkäin.
select cron.schedule('quiz-suosio-paivitys', '20 1 * * *', 'select public.paivita_quiz_suosio()');
