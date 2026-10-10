-- Lasten visat: kysymyskuvan rajauskohta (CSS object-position), esim. 'center 20%'.
-- Isompien kysymyskuva näytetään 16:9- ja matalilla näytöillä 358×150-rajauksessa (object-fit: cover),
-- ja monessa eläinkuvassa pää jää yläreunan ulkopuolelle keskitetyllä rajauksella (Heikin havainto 10.10.2026).
-- NULL = oletus (CSS: center 30 %).
alter table public.questions add column if not exists image_position text;
comment on column public.questions.image_position is 'CSS object-position kysymyskuvalle (lasten visat), esim. ''center 20%''. NULL = oletus.';
