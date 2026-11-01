-- Rajanaapurit: Yhdysvallat (CD-handoff 1.11.2026): sama pelitaulu, aihe erottaa datapaketin.
-- Olemassa olevat rivit ja vanha koodi (ei aihe-kenttää) → 'maat'. RLS ennallaan: anon INSERT, ei SELECT.
alter table public.rajanaapurit_pelit
  add column if not exists aihe text not null default 'maat'
  check (aihe in ('maat', 'osavaltiot'));
