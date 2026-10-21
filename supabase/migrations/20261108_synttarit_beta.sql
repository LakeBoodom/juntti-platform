-- SYNTTÄRIT.COM BETA, PR 1 (toimeksianto synttarit-claude-code-toimeksianto.md §6, 11.10.2026)
--
-- Vain lisäyksiä: kolme nullable-saraketta celebrities-tauluun ja kaksi uutta taulua.
-- Ei muuta eikä poista Tietoniekan käyttämiä sarakkeita, tauluja tai policyjä.
--
-- RLS: julkinen luku vain status = 'published'. Kirjoituspolicyjä ei ole, joten kirjoittaa voi
-- vain service role (admin), joka ohittaa RLS:n.

-- 1) celebrities: Tiesitkö-nosto ja kuvan lähde/lisenssi
alter table public.celebrities add column if not exists tiesitko text;
alter table public.celebrities add column if not exists image_credit text;
alter table public.celebrities add column if not exists image_license text;
comment on column public.celebrities.tiesitko is 'Synttärit: valinnainen Tiesitkö-nosto päivän sivulle. NULL = laatikko pois tai facts[0].';
comment on column public.celebrities.image_credit is 'Kuvan tekijä/lähde, näytetään kuvan päällä (esim. "Kuva: Matti Meikäläinen / Wikimedia Commons").';
comment on column public.celebrities.image_license is 'Kuvan lisenssi, esim. "CC BY-SA 4.0".';

-- 2) synttarit_pages: oppaat, merkkivuodet, onnittelusivut, lasten synttärit, juhlaoppaat, staattiset
create table if not exists public.synttarit_pages (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('opas', 'merkkivuosi', 'onnittelut', 'lapset', 'juhlaopas', 'staattinen')),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$'),
  age int check (age is null or age between 0 and 120),
  title text not null,
  seo_title text,
  meta_description text,
  eyebrow text,
  ingress text,
  hero_image_url text,
  hero_image_credit text,
  meta_chips text[] not null default '{}',
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  related_slugs text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.synttarit_pages is 'Synttärit.com sisältösivut. body = lohkolista [{type, ...}], lohkotyypit: heading, paragraph, tip, quote, checklist, table, tietoniekka, gift_idea, ad.';

create index if not exists synttarit_pages_type_status_idx on public.synttarit_pages (type, status);

drop trigger if exists synttarit_pages_set_updated_at on public.synttarit_pages;
create trigger synttarit_pages_set_updated_at
  before update on public.synttarit_pages
  for each row execute function public.set_updated_at();

alter table public.synttarit_pages enable row level security;
drop policy if exists "Synttarit pages published readable" on public.synttarit_pages;
create policy "Synttarit pages published readable" on public.synttarit_pages
  for select to anon, authenticated using (status = 'published');

-- 3) synttarit_greetings: onnittelupankki
create table if not exists public.synttarit_greetings (
  id uuid primary key default gen_random_uuid(),
  age int check (age is null or age between 0 and 120),
  tone text not null check (tone in ('lämmin', 'lyhyt', 'hauska', 'juhlava')),
  recipient text not null default 'kaikille' check (recipient in ('ystävä', 'työkaveri', 'sukulainen', 'puoliso', 'kaikille', 'isovanhempi')),
  text text not null check (length(btrim(text)) > 0),
  sort int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.synttarit_greetings is 'Synttärit.com onnittelupankki. age NULL = yleinen onnittelu.';

create index if not exists synttarit_greetings_age_idx on public.synttarit_greetings (age, status, sort);

drop trigger if exists synttarit_greetings_set_updated_at on public.synttarit_greetings;
create trigger synttarit_greetings_set_updated_at
  before update on public.synttarit_greetings
  for each row execute function public.set_updated_at();

alter table public.synttarit_greetings enable row level security;
drop policy if exists "Synttarit greetings published readable" on public.synttarit_greetings;
create policy "Synttarit greetings published readable" on public.synttarit_greetings
  for select to anon, authenticated using (status = 'published');
