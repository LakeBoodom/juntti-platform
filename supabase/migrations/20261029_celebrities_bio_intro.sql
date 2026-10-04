-- Erä B (4.10.2026): henkilösivun esittely omaan sarakkeeseensa. intro_text on Päivän sankari -rivin
-- poikkeusteksti (max 240) eikä sovi henkilösivulle; bio_intro on 3–4 lausetta (max 600).
-- Sarake ja rajoite luotiin kantaan Coworkin erä 1:n yhteydessä — tämä tiedosto on kirjanpitoa ja idempotentti.
alter table celebrities add column if not exists bio_intro text;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'celebrities_bio_intro_len' and conrelid = 'celebrities'::regclass) then
    alter table celebrities add constraint celebrities_bio_intro_len check (bio_intro is null or char_length(bio_intro) <= 600);
  end if;
end $$;
comment on column celebrities.bio_intro is 'Henkilösivun esittely (3–4 lausetta, max 600). Näkyy vasta kun facts_reviewed_at on asetettu.';
