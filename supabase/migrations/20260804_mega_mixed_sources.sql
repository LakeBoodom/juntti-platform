-- MEGA vaihe A (Heikki 4.8.2026): sekamuotoinen Mega — rivi viittaa joko
-- questions- TAI kuvavisas-riviin (XOR). Ajettu tuotantoon MCP:llä.
alter table mega_questions drop constraint if exists mega_questions_pkey;
alter table mega_questions add column if not exists kuvavisa_id uuid references kuvavisas(id) on delete cascade;
alter table mega_questions alter column question_id drop not null;
alter table mega_questions add column if not exists id uuid not null default gen_random_uuid();
alter table mega_questions add primary key (id);
alter table mega_questions add constraint mega_questions_xor
  check ((question_id is null) <> (kuvavisa_id is null));
create unique index if not exists mega_questions_q_uni
  on mega_questions (mega_quiz_id, question_id) where question_id is not null;
create unique index if not exists mega_questions_kv_uni
  on mega_questions (mega_quiz_id, kuvavisa_id) where kuvavisa_id is not null;
