-- LASTEN VISAT (TOTEUTUSBRIEF_LASTEN_VISAT.md §1, Heikki 9.10.2026)
--
-- Lasten visa on tavallinen visa (quizzes + questions), jolla on lasten kohdeyleisö:
-- target_age in ('4-7', '8-12'). Ei erillistä lasten taulua.
--
-- quizzes:   lukija (juontaja, joka lukee kysymykset, reaktiot ja tuloksen), lasten_aihe (/lapset-sivun aihe).
-- questions: question_type, vihjeet molemmilta juontajilta, äänitiedostot (audio), eläinääni (animal_sound)
--            ja kysymyskuvan lähdemerkintä (image_credit, image_license_note; kuvavisas-kuvista kopioituna).
--            Vastausvaihtoehdon kuva: answers[i].image_url (+ image_credit), rakenne {text, is_correct} säilyy.
--
-- Välijuonnot (48 yleistä klippiä) ovat koodissa: apps/tietoniekka/lib/lapset/valijuonnot.ts.
-- Ei muuta olemassa olevaa dataa: kaikki uudet sarakkeet ovat valinnaisia tai oletusarvollisia.

alter table public.quizzes drop constraint if exists quizzes_target_age_check;
alter table public.quizzes add constraint quizzes_target_age_check
  check (target_age = any (array['30-50', '50-70', 'kaikki', '4-7', '8-12']));

alter table public.quizzes add column if not exists lukija text check (lukija in ('laura', 'mikko'));
alter table public.quizzes add column if not exists lasten_aihe text;

comment on column public.quizzes.lukija is 'Lasten visan juontaja, joka lukee kysymykset, reaktiot ja tuloksen.';
comment on column public.quizzes.lasten_aihe is 'Lasten visan aihe /lapset-sivulla (joulu, elaimet, linnut, kirjat …). collection pysyy aiheen kokoelmana.';

alter table public.questions add column if not exists question_type text not null default 'teksti'
  check (question_type in ('teksti', 'kuva', 'kuvavastaukset', 'aani', 'aani_kuvavastaukset'));
alter table public.questions add column if not exists vihje_laura text;
alter table public.questions add column if not exists vihje_mikko text;
alter table public.questions add column if not exists audio jsonb;
alter table public.questions add column if not exists animal_sound jsonb;
alter table public.questions add column if not exists image_credit text;
alter table public.questions add column if not exists image_license_note text;

comment on column public.questions.question_type is
  'teksti | kuva (kysymyskuva + tekstivastaukset) | kuvavastaukset (3 kuvaa vastauksina) | aani (eläinääni + tekstit) | aani_kuvavastaukset';
comment on column public.questions.audio is
  'Juontajaklipit: {"kysymys": url, "vihje_laura": url, "vihje_mikko": url, "tiesitko": url?} + klippien tekstit (teksti_*), joihin editori vertaa.';
comment on column public.questions.animal_sound is 'Eläinääni: {"url", "laji", "tieteellinen", "tekija", "lisenssi", "lahde", "lahde_url"}.';
comment on column public.questions.image_credit is 'Kysymyskuvan tekijä ja lisenssi (esim. kuvavisas.source_credit). Null = oma kuvitus.';
