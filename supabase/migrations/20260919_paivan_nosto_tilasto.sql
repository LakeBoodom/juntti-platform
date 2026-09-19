-- Päivän visa + Päivän sankari: mittaus (toteutusohje 19.9.2026, luku 9).
-- Päiväkohtaiset laskurit, ei henkilötietoja eikä istuntotunnisteita.
-- Kirjoitus vain funktion kautta (RLS päällä, ei policyjä anonille).
create table if not exists public.paivan_nosto_tilasto (
  paiva        date   not null,
  slotti       text   not null check (slotti in ('paivan_visa', 'paivan_sankari')),
  quiz_id      uuid   not null references public.quizzes(id) on delete cascade,
  intro_tila   text   check (intro_tila in ('A', 'B', 'C')),
  kategoria    text,
  naytot       integer not null default 0,
  klikkaukset  integer not null default 0,
  primary key (paiva, slotti, quiz_id)
);
alter table public.paivan_nosto_tilasto enable row level security;
comment on table public.paivan_nosto_tilasto is
  'Etusivun Päivän visa / Päivän sankari: näytöt ja klikkaukset päivittäin (Suomen aika). intro_tila vain Päivän visalle.';

create or replace function public.kirjaa_nosto(
  p_slotti text, p_tapahtuma text, p_quiz uuid, p_intro text default null, p_kategoria text default null
) returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if p_slotti not in ('paivan_visa', 'paivan_sankari') or p_tapahtuma not in ('naytto', 'klikkaus') then
    return;
  end if;
  if not exists (select 1 from public.quizzes where id = p_quiz and status = 'published') then
    return;
  end if;
  insert into public.paivan_nosto_tilasto as t (paiva, slotti, quiz_id, intro_tila, kategoria, naytot, klikkaukset)
  values (
    public.helsinki_tanaan(), p_slotti, p_quiz,
    case when p_slotti = 'paivan_visa' and p_intro in ('A', 'B', 'C') then p_intro end,
    left(p_kategoria, 60),
    (p_tapahtuma = 'naytto')::int, (p_tapahtuma = 'klikkaus')::int
  )
  on conflict (paiva, slotti, quiz_id) do update set
    naytot      = t.naytot + excluded.naytot,
    klikkaukset = t.klikkaukset + excluded.klikkaukset,
    intro_tila  = coalesce(excluded.intro_tila, t.intro_tila),
    kategoria   = coalesce(excluded.kategoria, t.kategoria);
end
$$;
revoke all on function public.kirjaa_nosto(text, text, uuid, text, text) from public;
grant execute on function public.kirjaa_nosto(text, text, uuid, text, text) to anon, authenticated;
