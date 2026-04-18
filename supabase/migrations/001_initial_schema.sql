-- QUIZZES
create table quizzes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  title         text not null,
  description   text,
  slug          text unique not null,
  platform      text not null check (platform in ('juntti', 'tietovisa', 'both')),
  category      text not null,
  difficulty    text not null check (difficulty in ('helppo', 'keski', 'vaikea')),
  target_age    text default 'kaikki' check (target_age in ('30-50', '50-70', 'kaikki')),
  tone          text default 'rento' check (tone in ('rento', 'humoristinen', 'asiallinen', 'nostalginen')),
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at  timestamptz,
  scheduled_for date,
  is_daily      boolean default false,
  created_by    text default 'ai',
  play_count    integer default 0,
  image_url     text,
  emoji_hint    text
);
create index quizzes_platform_status_category_idx on quizzes(platform, status, category);
create index quizzes_daily_idx on quizzes(scheduled_for) where is_daily = true;

-- QUESTIONS
create table questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid references quizzes(id) on delete cascade,
  sort_order      integer not null default 0,
  question_text   text not null,
  explanation     text,
  answers         jsonb not null,
  created_at      timestamptz default now()
);
create index questions_quiz_order_idx on questions(quiz_id, sort_order);

-- CELEBRITIES
create table celebrities (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  birth_date      date not null,
  death_date      date,
  role            text not null,
  bio_short       text,
  image_url       text,
  platform        text default 'both' check (platform in ('juntti', 'tietovisa', 'both')),
  trivia_quiz_id  uuid references quizzes(id),
  created_at      timestamptz default now()
);
create index celebrities_birth_date_idx on celebrities(birth_date);

-- MURRESANAT
create table murresanat (
  id            uuid primary key default gen_random_uuid(),
  word          text not null,
  region        text not null,
  definition    text not null,
  example       text,
  display_date  date unique,
  platform      text default 'juntti',
  created_at    timestamptz default now()
);

-- COUNTDOWNS
create table countdowns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  month         integer not null check (month between 1 and 12),
  day           integer not null check (day between 1 and 31),
  object_type   text not null,
  trivia_quiz_id uuid references quizzes(id),
  platform      text default 'juntti'
);

-- DAILY SCHEDULE
create table daily_schedule (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null check (platform in ('juntti', 'tietovisa')),
  date        date not null,
  quiz_id     uuid references quizzes(id),
  unique(platform, date)
);
create index daily_schedule_platform_date_idx on daily_schedule(platform, date);

-- QUIZ PLAYS (anonymous analytics)
create table quiz_plays (
  id            uuid primary key default gen_random_uuid(),
  played_at     timestamptz default now(),
  quiz_id       uuid references quizzes(id),
  platform      text not null,
  score         integer,
  total         integer,
  session_id    text,
  shared        boolean default false
);
create index quiz_plays_quiz_idx on quiz_plays(quiz_id);
create index quiz_plays_played_at_idx on quiz_plays(played_at);

-- UPDATED_AT TRIGGER
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger quizzes_set_updated_at
before update on quizzes
for each row execute function set_updated_at();
