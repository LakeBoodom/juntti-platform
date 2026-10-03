-- Erä B1 (TOTEUTUSBRIEF_SEO_ERA_A_JA_HENKILOSIVU.md): henkilösivun kentät celebrities-tauluun.
-- Vain sarakkeiden lisäys. Rooli- ja ryhmäarvojen UPDATE:t sekä facts-data ajaa Cowork
-- (HENKILOT_ROOLIT_JA_RYHMAT_EHDOTUS_2026_10_02.md); koodi lukee siirtymän ajan sekä vanhoja
-- (artistit, muut) että uusia ryhmäarvoja (lib/henkiloRyhmat.ts).
alter table celebrities add column if not exists birth_place text;
alter table celebrities add column if not exists death_place text;
alter table celebrities add column if not exists nickname text;
alter table celebrities add column if not exists facts jsonb;
alter table celebrities add column if not exists facts_reviewed_at timestamptz;

comment on column celebrities.facts is 'Lyhyesti-rivit [{label, value}], 0–3 kpl, ryhmäkaavan mukaan (lib/henkiloKaava.ts). Näytetään vain kun facts_reviewed_at ei ole null.';
comment on column celebrities.facts_reviewed_at is 'Heikin hyväksyntä: intro_text ja facts näkyvät sivulla vasta kun tämä on asetettu.';
comment on column celebrities.nickname is 'Lempinimi ilman lainausmerkkejä (esim. Iceman); näytetään roolin perässä.';
