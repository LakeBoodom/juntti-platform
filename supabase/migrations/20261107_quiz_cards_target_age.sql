-- LASTEN VISAT, vaihe 5 (TOTEUTUSBRIEF_LASTEN_VISAT.md §7 "Ikämerkki muualla"):
-- quiz_cards-näkymään target_age, jotta kokoelmalistat ja ristinostot voivat näyttää lasten
-- visoille ikämerkin (🧸 4–7 / 🚀 8–12). Sarake lisätään loppuun, muut sarakkeet ennallaan.

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
    target_age
   from quizzes q
  where status = 'published'::text;
