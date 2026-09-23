-- Instagram-pohjat, Claude Design kierros 4 (28.9.2026) + visojen fanitasot.
--
-- 1. Uudet pohjatunnukset 4a–4r (motiivipohjat, kysymyskortit, juontajat,
--    syntymäpäivät). Vanhat V-A…S-D jäävät sallituiksi vain julkaistujen rivien
--    historiaa varten; niiden julkaisemattomat rivit poistetaan, jolloin
--    suunnittelija luo päiville uudet kierroksen 4 julkaisut.
-- 2. ig_juontajakuvat: Lauran ja Mikon kuvakirjasto asennoittain. Pohjat valitsevat
--    kuvan asennon mukaan; uudet kuvat (eri ympäristöt) lisätään administa ilman
--    koodimuutosta.
-- 3. quizzes.fanitasot: viisi aihekohtaista tasonimeä heikoimmasta parhaaseen
--    (tulosruudun rajat 0 / 40 / 60 / 80 / 100 %). Designin 4a-kortti lupaa
--    "Visa kertoo, mille tasolle yllät" — tulosruutu näyttää tason nimen.
--    Admin luo tasot tekoälyllä (ajastin täyttää puuttuvat vähitellen).

alter table public.ig_julkaisut drop constraint if exists ig_julkaisut_pohja_check;
alter table public.ig_julkaisut add constraint ig_julkaisut_pohja_check check (pohja in (
  'V-A','V-B','V-C','V-D','V-E','S-A','S-B','S-C','S-D',
  '4a','4b','4c','4d','4e','4f','4g','4h','4i','4j','4l','4m','4n','4o','4p','4q','4r'
));

delete from public.ig_julkaisut
where tila <> 'julkaistu'
  and pohja in ('V-A','V-B','V-C','V-D','V-E','S-A','S-B','S-C','S-D');

create table if not exists public.ig_juontajakuvat (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  kuka        text not null check (kuka in ('laura', 'mikko', 'molemmat')),
  asento      text not null check (asento in ('haastaa', 'yllattyy', 'miettii', 'eri_mielta', 'onnittelee', 'innostunut', 'neutraali')),
  -- rajattu = läpinäkyvä tausta (väripohjan päälle), ymparisto = kuva taustoineen
  tausta      text not null default 'rajattu' check (tausta in ('rajattu', 'ymparisto')),
  kuvaus      text,
  leveys      integer,
  korkeus     integer,
  aktiivinen  boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.ig_juontajakuvat enable row level security;
revoke all on public.ig_juontajakuvat from anon, authenticated;

alter table public.quizzes add column if not exists fanitasot jsonb;
comment on column public.quizzes.fanitasot is
  'Viisi aihekohtaista tulostasoa heikoimmasta parhaaseen (0/40/60/80/100 %), esim. ["Penkkiurheilija", …, "Jokeri-ekspertti"]. Instagram-kierros 4.';
