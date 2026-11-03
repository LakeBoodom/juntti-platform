-- LUONNOS, EI AJETTU. Vaatii Heikin hyväksynnän. (3.11.2026)
-- Pelikertojen ja visojen oikeudet, vaihe 1/2. Ei riko mitään: voidaan ajaa ennen koodimuutosta.
--
-- 1. quizzes: selain tarvitsee vain lukuoikeuden. Admin ja skriptit kirjoittavat service_rolella.
-- 2. quiz_plays: pois DELETE, TRUNCATE, REFERENCES, TRIGGER ja MAINTAIN. Nykyinen lisäys, id:n luku ja
--    merkintöjen päivitys säilyvät, kunnes vaihe 2 ajetaan.
-- 3. merkitse_jaetuksi: uusi reitti jakomerkinnälle. Pelin koodi siirtyy käyttämään tätä.
--
-- Revoke all + grant samassa transaktiossa, koska "all" kattaa version mukaan myös MAINTAIN-oikeuden.

revoke all on table public.quizzes from anon, authenticated;
grant select on table public.quizzes to anon, authenticated;

revoke all on table public.quiz_plays from anon, authenticated;
grant insert on table public.quiz_plays to anon, authenticated;
grant select (id) on table public.quiz_plays to anon, authenticated;
grant update (shared, feedback, share_channel) on table public.quiz_plays to anon, authenticated;

-- Pelikerran id on selaimen arpoma UUID, jota kukaan muu ei vaiheen 2 jälkeen näe. Id:n tietäminen on siis
-- lupa merkitä juuri se pelikerta. Vuorokauden raja suojaa vanhat rivit, koska id:t ovat olleet luettavissa
-- 5.7.2026 alkaen. Virheellinen kanava kaatuu share_channel-tarkistukseen; tuntematon id ei tee mitään.
create or replace function public.merkitse_jaetuksi(p_id uuid, p_kanava text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.quiz_plays
     set shared = true, share_channel = p_kanava
   where id = p_id
     and played_at > now() - interval '1 day';
$$;

revoke all on function public.merkitse_jaetuksi(uuid, text) from public, anon, authenticated;
grant execute on function public.merkitse_jaetuksi(uuid, text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
