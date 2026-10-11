-- LASTEN VISAT: luonnokset luettaviksi esikatselua varten (brief §3: "Previewssä niitä pitää voida
-- pelata suoralla linkillä"). Sama linja kuin "Mega preview readable" ja äänivisojen ei-aktiiviset rivit:
-- data ei ole salaista, mutta tuotantosivu näyttää vain julkaistut (lib/lapset/data.ts: esikatselu()).
-- Muut visojen haut suodattavat status = 'published' itse, joten luonnokset eivät näy listoissa.

create policy "Lasten visat luettavissa (esikatselu)" on public.quizzes
  for select using (target_age in ('4-7', '8-12'));

create policy "Lasten visojen kysymykset luettavissa (esikatselu)" on public.questions
  for select using (exists (
    select 1 from public.quizzes z where z.id = questions.quiz_id and z.target_age in ('4-7', '8-12')
  ));
