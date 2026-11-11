-- KORTTIKOKEILUT (Heikki 11.11.2026): henkilösivun visakortti – kumpi versio näytettiin (visan kysymys vai
-- "Kuinka hyvin tunnet …?") ja klikattiinko. Selain kirjoittaa (lib/korttiKokeilu.ts), ei lue. Ei henkilötietoja
-- eikä istuntotunnistetta. Pelikerrat samasta kortista: quiz_plays.entry = 'henkilosivu:kysymys' / 'henkilosivu:otsikko'.
create table if not exists public.kortti_kokeilut (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kokeilu text not null check (length(kokeilu) between 1 and 40),
  versio text not null check (length(versio) between 1 and 40),
  tapahtuma text not null check (tapahtuma in ('naytto', 'klikkaus')),
  sivu text not null check (length(sivu) between 1 and 160)
);
create index if not exists kortti_kokeilut_created_at on public.kortti_kokeilut (created_at);

alter table public.kortti_kokeilut enable row level security;
drop policy if exists kortti_kokeilut_insert on public.kortti_kokeilut;
create policy kortti_kokeilut_insert on public.kortti_kokeilut for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute' and created_at < now() + interval '1 minute');
revoke all on public.kortti_kokeilut from anon, authenticated;
grant insert (kokeilu, versio, tapahtuma, sivu) on public.kortti_kokeilut to anon, authenticated;

-- Klikkausosuus versioittain (vain palvelin/SQL).
create or replace view public.kortti_kokeilu_mittarit with (security_invoker = true) as
select kokeilu, versio,
  count(*) filter (where tapahtuma = 'naytto') as naytot,
  count(*) filter (where tapahtuma = 'klikkaus') as klikkaukset,
  round(100.0 * count(*) filter (where tapahtuma = 'klikkaus') / nullif(count(*) filter (where tapahtuma = 'naytto'), 0), 1) as klikkaus_pct,
  min(created_at) as alkaen
from public.kortti_kokeilut group by 1, 2;
revoke all on public.kortti_kokeilu_mittarit from anon, authenticated;
