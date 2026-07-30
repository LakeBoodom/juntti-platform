-- Tietoniekka 2.0 Vaihe 1: korttiskeema (TOTEUTUSSUUNNITELMA_2.0.md §3.3A)
-- Ajettu tuotantoon Supabase-MCP:llä 2026-07-30; tiedosto kirjanpitoa varten.

create table if not exists genres (
  collection  text not null,
  genre_key   text not null,
  label       text not null,
  sort_order  integer default 0,
  primary key (collection, genre_key)
);

alter table genres enable row level security;
create policy "Genres public" on genres for select using (true);

alter table quizzes
  add column if not exists collection    text,
  add column if not exists genre         text,
  add column if not exists subcollection text,
  add column if not exists display_title text,
  add column if not exists teaser        text,
  add column if not exists game_mode     text default 'klassinen',
  add column if not exists tags          text[] default '{}';

create index if not exists quizzes_collection_idx on quizzes (collection, status);

insert into genres (collection, genre_key, label, sort_order) values
  ('tv', 'komedia',     'Komedia',     1),
  ('tv', 'draama',      'Draama',      2),
  ('tv', 'rikosdraama', 'Rikosdraama', 3),
  ('tv', 'scifi',       'Scifi',       4),
  ('tv', 'kauhu',       'Kauhu',       5),
  ('tv', 'tosi-tv',     'Tosi-tv',     6),
  ('tv', 'dokumentti',  'Dokumentti',  7),
  ('tv', 'animaatio',   'Animaatio',   8)
on conflict (collection, genre_key) do nothing;
