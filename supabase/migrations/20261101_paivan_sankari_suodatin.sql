-- Päivän sankari ei saa nostaa henkilöä, jolla celebrities.paivan_sankari = false
-- (ulkomaiset, puolisot ym. — toteutusbrief vaalit 5.10.2026 §1). null = sallittu.
-- Muuten identtinen edellisen määritelmän kanssa.
create or replace function public.paivan_sankari(p_site uuid, p_date date)
returns table(celebrity_id uuid, name text, role text, birth_date date, death_date date, image_url text, slug text,
              intro_text text, image_focal_x numeric, image_focal_y numeric, quiz_id uuid, quiz_title text,
              quiz_slug text, custom_slug text, ika integer)
language sql
stable
set search_path to 'public'
as $function$
  select c.id, c.name, c.role, c.birth_date, c.death_date, c.image_url, c.slug,
         c.intro_text, c.image_focal_x, c.image_focal_y,
         q.id, coalesce(q.display_title, q.title), q.slug, q.custom_slug,
         (extract(year from p_date) - extract(year from c.birth_date))::integer
  from public.celebrities c
  join public.quizzes q on q.id = c.trivia_quiz_id and q.status = 'published'
  where c.site_id = p_site
    and coalesce(c.paivan_sankari, true)
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
$function$;
