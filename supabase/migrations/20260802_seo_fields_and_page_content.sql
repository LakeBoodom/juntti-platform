-- SEO_STRATEGIA.md §6.3 + §5.2 (2026-08-02, ajettu tuotantokantaan MCP:llä)
-- 1) Hakuotsikko ja hakukuvaus visoille. Erillään markkinointiotsikosta
--    (title / display_title), jotta hauska otsikko saa pysyä hauskana.
alter table quizzes add column if not exists seo_title text;
alter table quizzes add column if not exists seo_description text;

comment on column quizzes.seo_title is
  'Hakutuloksessa näkyvä otsikko (<title>). Enintään ~60 merkkiä. Jos tyhjä, johdetaan display_title/title-kentästä.';
comment on column quizzes.seo_description is
  'Hakutuloksessa näkyvä kuvaus (meta description). 140-160 merkkiä. Jos tyhjä, johdetaan learn.intro- tai description-kentästä.';

-- 2) Sivutason sisältö kokoelmille ja pelimuodoille. Sama learn-rakenne
--    kuin quizzes.learn, yhtä tasoa ylempänä.
create table if not exists page_content (
  slug            text primary key,
  kind            text not null check (kind in ('collection','mode')),
  name            text not null,
  seo_title       text,
  seo_description text,
  learn           jsonb,
  updated_at      timestamptz not null default now()
);

comment on table page_content is
  'Kokoelmahubien ja pelimuotosivujen oma sisältö: hakuotsikko, hakukuvaus ja learn-artikkeli (sama muoto kuin quizzes.learn).';

alter table page_content enable row level security;

drop policy if exists "page_content public read" on page_content;
create policy "page_content public read" on page_content for select using (true);
