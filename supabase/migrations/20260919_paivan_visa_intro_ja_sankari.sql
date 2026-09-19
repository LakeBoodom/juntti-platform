-- TIETONIEKKA — Päivän visa + Päivän sankari (toteutusohje 19.9.2026, luku 3)
--
-- Kaikki additiivista: nykyinen rakenne (content_type='quiz', strategy='date',
-- weight=1, active=true) ei muutu.

-- Päivän visan intro tallennetaan aikatauluriville, ei visaan: teksti on
-- määritelmällisesti voimassa vain sinä yhtenä päivänä.
alter table public.schedule_rules
  add column if not exists intro_headline   text,
  add column if not exists intro_text       text,
  add column if not exists intro_source_url text,
  add column if not exists editorial_note   text,
  add column if not exists auto_filled      boolean not null default false;

alter table public.schedule_rules
  add constraint schedule_rules_intro_headline_len
    check (intro_headline is null or char_length(intro_headline) <= 80),
  add constraint schedule_rules_intro_text_len
    check (intro_text is null or char_length(intro_text) <= 240);

comment on column public.schedule_rules.intro_headline   is 'Päivän visan koukkurivi. Kova raja 80, adminin pehmeä raja 60.';
comment on column public.schedule_rules.intro_text       is 'Päivän visan selittävä virke (1–2). Kova raja 240, adminin pehmeä raja 160. Pelkkä teksti.';
comment on column public.schedule_rules.intro_source_url is 'Faktantarkistuksen lähde. Ei näy käyttäjälle.';
comment on column public.schedule_rules.editorial_note   is 'Toimituksen sisäinen muistiinpano. Ei näy käyttäjälle.';
comment on column public.schedule_rules.auto_filled      is 'true = rivin loi automaattitäyttö. Ihmisen muokkaus asettaa false.';

-- Yksi aktiivinen Päivän visa per sivusto per päivä (automaattitäytön
-- idempotentti upsert nojaa tähän).
create unique index if not exists schedule_rules_one_active_per_day
  on public.schedule_rules (site_id, content_type, scheduled_date)
  where active and scheduled_date is not null;

-- Sankarin käsin kirjoitettu poikkeusteksti ja muotokuvan fokuspiste.
alter table public.celebrities
  add column if not exists intro_text    text,
  add column if not exists image_focal_x numeric,
  add column if not exists image_focal_y numeric;

alter table public.celebrities
  add constraint celebrities_intro_text_len
    check (intro_text is null or char_length(intro_text) <= 240);

comment on column public.celebrities.intro_text    is 'Päivän sankari -rivin poikkeusteksti; ohittaa mallipohjan. Tyhjä = mallipohja.';
comment on column public.celebrities.image_focal_x is 'Muotokuvan rajauspiste 0–1 (pyöreä kehys). Tyhjä = 0.5.';
comment on column public.celebrities.image_focal_y is 'Muotokuvan rajauspiste 0–1 (pyöreä kehys). Tyhjä = 0.3.';
