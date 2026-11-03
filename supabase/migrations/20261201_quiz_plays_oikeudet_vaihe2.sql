-- LUONNOS, EI AJETTU. Vaatii Heikin hyväksynnän. (3.11.2026)
-- Pelikertojen oikeudet, vaihe 2/2. Aja vasta, kun vaihe 1 on ajettu JA markShared-koodimuutos on tuotannossa.
--
-- Selaimelle jää vain uuden pelikerran lisäys ja merkitse_jaetuksi-funktio. Id:itä ei voi enää listata eikä
-- olemassa olevia rivejä päivittää. Vanhassa välilehdessä auki oleva peli kirjaa pelikerran yhä, mutta sen
-- jakomerkintä jää tallentumatta (virhe on jo nyt koodissa ohitettu).
--
-- shared säilyy lisättävissä, koska nykyinen koodi lähettää shared: false. Policy estää arvon true.
-- Ei lisättävissä: played_at (tulee oletusarvosta), feedback ja share_channel.
-- Peukku: nykyisessä koodissa ei ole peukkukäyttöliittymää (viimeisin peukku 9.7.2026). Vanhat peukut ja
-- admin_visa_tilastot säilyvät. Jos peukku palaa, sille tehdään merkitse_jaetuksi-tyyppinen funktio.

drop policy "Anyone can update play flags" on public.quiz_plays;
drop policy "Plays selectable by id for flag updates" on public.quiz_plays;

revoke all on table public.quiz_plays from anon, authenticated;
grant insert (id, quiz_id, platform, score, total, session_id, shared, entry, referrer_host, landing_path)
  on table public.quiz_plays to anon, authenticated;

alter policy "Anyone can insert plays" on public.quiz_plays with check (shared is not true);

notify pgrst, 'reload schema';

-- PERUUTUS (palauttaa vaiheen 1 tilan):
--   create policy "Anyone can update play flags" on public.quiz_plays for update using (true) with check (true);
--   create policy "Plays selectable by id for flag updates" on public.quiz_plays for select using (true);
--   alter policy "Anyone can insert plays" on public.quiz_plays with check (true);
--   revoke all on table public.quiz_plays from anon, authenticated;
--   grant insert on table public.quiz_plays to anon, authenticated;
--   grant select (id) on table public.quiz_plays to anon, authenticated;
--   grant update (shared, feedback, share_channel) on table public.quiz_plays to anon, authenticated;
--   notify pgrst, 'reload schema';
