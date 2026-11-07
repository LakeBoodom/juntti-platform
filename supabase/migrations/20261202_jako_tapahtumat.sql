-- JAKOJEN SEURANTA (Jakotekstit v4 §6, vaihe 4, 7.11.2026): jaettujen linkkien jako → avaus → aloitus → valmis.
-- Selain kirjoittaa (lib/jakoseuranta.ts), ei lue. Mittarit näkymästä jako_mittarit (vain palvelin/SQL).
create table if not exists public.jako_tapahtumat (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tapahtuma text not null check (tapahtuma in ('jako', 'avaus', 'aloitus', 'valmis')),
  jako_id text not null check (jako_id ~ '^[0-9a-z]{8}$'),
  polku text not null check (length(polku) between 1 and 200),
  kanava text check (kanava in ('whatsapp', 'facebook', 'kopioi', 'jaa')),
  -- A/B-testin variantti (share_variant), kun testi kytketään päälle; nyt null.
  variantti text check (variantti in ('a', 'b')),
  session_id text check (length(session_id) <= 64)
);
create index if not exists jako_tapahtumat_jako_id on public.jako_tapahtumat (jako_id);
create index if not exists jako_tapahtumat_created_at on public.jako_tapahtumat (created_at);

alter table public.jako_tapahtumat enable row level security;
drop policy if exists jako_tapahtumat_insert on public.jako_tapahtumat;
create policy jako_tapahtumat_insert on public.jako_tapahtumat for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute' and created_at < now() + interval '1 minute');
revoke all on public.jako_tapahtumat from anon, authenticated;
grant insert (tapahtuma, jako_id, polku, kanava, variantti, session_id) on public.jako_tapahtumat to anon, authenticated;

-- Mittarit pelimuodoittain: jaetut linkit, avaukset, aloitukset ja valmiit kierrokset (istunnoittain yksilöitynä).
create or replace view public.jako_mittarit with (security_invoker = true) as
with t as (
  select *, case
    when polku like '/h/%' or polku like '/kuvavisa/%' then 'kuvavisa'
    when polku like '/visa/%' then 'tietovisa'
    when polku like '/aanivisa/%' then 'aanivisa'
    when polku like '/peli/tupla-tai-kuitti%' then 'tupla'
    when polku like '/peli/rajanaapurit%' then 'rajanaapurit'
    when polku like '/peli/kuntaliitos%' then 'kuntaliitos'
    when polku like '/peli/vaalipiiriketju%' then 'vaalipiiriketju'
    when polku like '/peli/jarjesta%' then 'jarjesta'
    when polku like '/peli/lapset%' then 'lapset'
    when polku like '/peli%' then 'peli'
    else 'muu' end as pelimuoto
  from public.jako_tapahtumat
)
select pelimuoto, coalesce(variantti, '-') as variantti,
  count(distinct jako_id) filter (where tapahtuma = 'jako') as jaetut_linkit,
  count(distinct jako_id || session_id) filter (where tapahtuma = 'avaus') as avaukset,
  count(distinct jako_id || session_id) filter (where tapahtuma = 'aloitus') as aloitukset,
  count(*) filter (where tapahtuma = 'valmis') as valmiit_kierrokset,
  min(created_at) as alkaen
from t group by 1, 2;
revoke all on public.jako_mittarit from anon, authenticated;
