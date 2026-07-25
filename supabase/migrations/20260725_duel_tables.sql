-- Kaksintaistelu ("Kumpi on...?") -pelimuodon datamalli.
-- Additiivinen: ei koske olemassa oleviin tauluihin.
-- Sovellettu tuotantoon 2026-07-25 Supabase MCP:n kautta; tämä tiedosto on kirjanpitoa varten.

create table if not exists duel_entities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  kind         text not null,
  role_label   text,
  show_role    boolean not null default true,
  wiki_url     text,
  image_url    text,
  image_credit text,
  celebrity_id uuid references celebrities(id) on delete set null,
  status       text not null default 'published' check (status in ('draft','published','hidden')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (name, kind)
);

create table if not exists duel_attributes (
  entity_id     uuid references duel_entities(id) on delete cascade,
  attr_key      text not null,
  num_value     numeric not null,
  display_value text,
  source        text,
  verified_at   date,
  primary key (entity_id, attr_key)
);

create table if not exists duel_attribute_defs (
  attr_key      text primary key,
  kind          text not null,
  theme         text not null default 'sekoitus',
  subject_label text not null default 'KUMPI',
  question_text text not null,
  winner        text not null check (winner in ('low','high')),
  easy_gap      numeric not null,
  mid_gap       numeric not null,
  unit_label    text,
  enabled       boolean not null default true
);

create index if not exists duel_attributes_key_idx on duel_attributes(attr_key);
create index if not exists duel_entities_kind_idx on duel_entities(kind, status);

alter table duel_entities enable row level security;
alter table duel_attributes enable row level security;
alter table duel_attribute_defs enable row level security;

create policy "duel_entities public read" on duel_entities
  for select using (status = 'published');
create policy "duel_attributes public read" on duel_attributes
  for select using (exists (select 1 from duel_entities e where e.id = entity_id and e.status = 'published'));
create policy "duel_attribute_defs public read" on duel_attribute_defs
  for select using (enabled);
