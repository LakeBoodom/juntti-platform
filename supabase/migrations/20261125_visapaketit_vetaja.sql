-- Visapaketit V-F: juontajan näkymä (/visapaketti/<slug>/vetaja) kirjaa omat tapahtumansa.
alter table public.quiz_pack_events drop constraint quiz_pack_events_tapahtuma_check;
alter table public.quiz_pack_events add constraint quiz_pack_events_tapahtuma_check
  check (tapahtuma in ('nayta', 'ruutu_aloitus', 'ruutu_loppu', 'tulosta', 'vastaus_auki', 'pelaa', 'vetaja_aloitus', 'vetaja_loppu'));
