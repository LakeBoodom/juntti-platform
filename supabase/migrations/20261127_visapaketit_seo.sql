-- Visapakettien SEO-korjaukset (brief 1.11.2026).
-- 1) Näkyvä johdanto H1:n alle (johdanto) ja 'molemmat'-pakettien lastenversion oma sivu
--    /visapaketti/<slug>/lapset (lasten_*-kentät). Teksteissä saa käyttää paikkamerkkejä, jotka sivu täyttää
--    kannan kysymysmääristä: {n} = 40, {kysymykset} = "40 kysymystä", {kierroksissa} = "neljässä kierroksessa".
-- 2) dateModified: kierrosten ja kysymysviittausten muutokset päivittävät paketin updated_at-kentän.

alter table public.quiz_packs
  add column if not exists johdanto text,
  add column if not exists lasten_otsikko text,
  add column if not exists lasten_seo_title text,
  add column if not exists lasten_seo_description text,
  add column if not exists lasten_johdanto text;

comment on column public.quiz_packs.johdanto is
  'Näkyvä 2–3 lauseen johdanto H1:n alla. Paikkamerkit {n}, {kysymykset}, {kierroksissa}.';
comment on column public.quiz_packs.lasten_otsikko is
  'molemmat-paketin lastenversion H1 (/visapaketti/<slug>/lapset), esim. "Joulun tietovisa lapsille".';

create or replace function public.quiz_pack_kosketa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pack uuid;
begin
  if tg_table_name = 'quiz_pack_rounds' then
    v_pack := coalesce(new.pack_id, old.pack_id);
  else
    select r.pack_id into v_pack from quiz_pack_rounds r where r.id = coalesce(new.round_id, old.round_id);
  end if;
  if v_pack is not null then
    update quiz_packs set updated_at = now() where id = v_pack;
  end if;
  return null;
end;
$$;

revoke execute on function public.quiz_pack_kosketa() from public, anon, authenticated;

drop trigger if exists quiz_pack_rounds_kosketa on public.quiz_pack_rounds;
create trigger quiz_pack_rounds_kosketa after insert or update or delete on public.quiz_pack_rounds
  for each row execute function public.quiz_pack_kosketa();

drop trigger if exists quiz_pack_items_kosketa on public.quiz_pack_items;
create trigger quiz_pack_items_kosketa after insert or update or delete on public.quiz_pack_items
  for each row execute function public.quiz_pack_kosketa();
