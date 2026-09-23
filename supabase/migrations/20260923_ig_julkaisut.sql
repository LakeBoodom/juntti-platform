-- Instagram-julkaisut: suunnitelma, hyväksyntä ja A/B-testin loki (23.9.2026).
--
-- Yksi rivi per päivä ja slotti (Päivän visa / Päivän synttärit). Rivi luodaan
-- suunnitelmaksi etukäteen (tila 'luonnos'), toimitus voi vaihtaa pohjan ja
-- muokata tekstejä, ja julkaisun jälkeen rivi on testin loki: designin
-- "julkaisuloki" = päivä · pohjatunnus · kokoelma · muoto · onko kuva · visa.
--
-- Pohjatunnukset (Claude Design, kierros 2):
--   Päivän visa   V-A tapahtuma · V-B haaste · V-C kuva · V-D typografia · V-E karuselli
--   Synttärit     S-A kuva · S-B nimi · S-C ikä · S-D visayhteys
--
-- Vanha social_posts-taulu (Juntti-aika, 6 luonnosta 7/2026) jätetään ennalleen.
-- Vain service_role (admin) käsittelee tätä taulua.

create table if not exists public.ig_julkaisut (
  id                  uuid primary key default gen_random_uuid(),
  site_id             uuid not null references public.sites(id),
  paiva               date not null,
  slotti              text not null check (slotti in ('paivan_visa', 'synttarit')),
  pohja               text not null check (pohja in ('V-A','V-B','V-C','V-D','V-E','S-A','S-B','S-C','S-D')),
  -- V-D:n pohjaväri (lime / valkoinen / mintti); muilla pohjilla aksentti tulee kokoelmasta
  pohja_vari          text,
  pohja_valittu_kasin boolean not null default false,
  muoto               text not null default 'kuva' check (muoto in ('kuva', 'karuselli')),
  -- Lähde suunnitteluhetkellä. Jos Päivän visa vaihtuu, rivi päivitetään.
  quiz_id             uuid references public.quizzes(id) on delete set null,
  celebrity_id        uuid references public.celebrities(id) on delete set null,
  kokoelma            text,
  on_kuva             boolean not null default false,
  -- Toimitetut tekstit, joita kannassa ei valmiiksi ole: V-B:n haaste,
  -- V-E:n karusellin koukku ja sisältökentät, S-D:n kysymysrivi.
  kentat              jsonb not null default '{}'::jsonb,
  kuvateksti          text,
  tila                text not null default 'luonnos'
                      check (tila in ('luonnos', 'hyvaksytty', 'julkaistu', 'epaonnistui', 'ohitettu')),
  ig_media_id         text,
  julkaistu_at        timestamptz,
  virhe               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (site_id, paiva, slotti)
);

create index if not exists ig_julkaisut_site_paiva_idx on public.ig_julkaisut (site_id, paiva);

alter table public.ig_julkaisut enable row level security;
-- Ei politiikkoja: anon ja authenticated eivät näe taulua lainkaan.
revoke all on public.ig_julkaisut from anon, authenticated;
