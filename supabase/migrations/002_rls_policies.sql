-- quizzes: published rows are public read
alter table quizzes enable row level security;
create policy "Public quizzes are readable" on quizzes
  for select using (status = 'published');

-- questions: readable if the parent quiz is published
alter table questions enable row level security;
create policy "Questions readable with published quiz" on questions
  for select using (
    exists (select 1 from quizzes where id = questions.quiz_id and status = 'published')
  );

-- celebrities: public read
alter table celebrities enable row level security;
create policy "Celebrities public" on celebrities for select using (true);

-- murresanat: public read
alter table murresanat enable row level security;
create policy "Murresanat public" on murresanat for select using (true);

-- countdowns: public read
alter table countdowns enable row level security;
create policy "Countdowns public" on countdowns for select using (true);

-- daily_schedule: public read (frontend fetches daily quiz by this)
alter table daily_schedule enable row level security;
create policy "Daily schedule public" on daily_schedule for select using (true);

-- quiz_plays: anyone can insert (anonymous play tracking), but no reading others' plays
alter table quiz_plays enable row level security;
create policy "Anyone can insert plays" on quiz_plays for insert with check (true);
