-- MEGA (3.8.2026, MEGA_SPEC.md §1): Mega on viittauskooste, ei kopio.
-- Ajettu tuotantoon MCP:llä. Ensimmäinen Mega: 'suuri-mega-50' (draft,
-- 50 kysymystä 7 kokoelmasta, max 2/lähdevisa, teemat sekoitettu).
create table if not exists mega_questions (
  mega_quiz_id  uuid references quizzes(id) on delete cascade,
  question_id   uuid references questions(id) on delete cascade,
  sort_order    integer not null default 0,
  primary key (mega_quiz_id, question_id)
);
alter table mega_questions enable row level security;
create policy "Mega links are readable" on mega_questions for select using (true);
-- Draft-Megat luettavissa previewssä; tuotantolistat suodattavat status=published
create policy "Mega preview readable" on quizzes for select using (game_mode = 'mega');
