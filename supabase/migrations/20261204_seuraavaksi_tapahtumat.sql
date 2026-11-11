-- "PELAA SEURAAVAKSI" -MITTAUS (toteutusbrief 8.11.2026 §3, pilotti 9.11.2026). Jokaisen ehdotuskortin näyttö (rivi ≥ 50 %
-- näkyvissä, kerran sivulatausta kohden) ja klikkaus. Selain kirjoittaa (lib/seuraavaksi/mittaus.ts), ei lue.
-- Ei henkilötietoja eikä istuntotunnistetta. pilotti = null: pilotin ulkopuolinen nykyinen rivi (lähtötaso).
create table if not exists public.seuraavaksi_tapahtumat (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tapahtuma text not null check (tapahtuma in ('naytto', 'klikkaus')),
  pilotti text check (pilotti in ('urheilu')),
  nakyma text not null check (nakyma in ('aloitus', 'tulos')),
  lahde text not null check (length(lahde) between 1 and 160),
  paikka smallint not null check (paikka between 1 and 6),
  tyyppi text not null check (tyyppi in ('visa', 'peli')),
  kohde text not null check (length(kohde) between 1 and 200),
  porras text check (length(porras) <= 60)
);
create index if not exists seuraavaksi_tapahtumat_created_at on public.seuraavaksi_tapahtumat (created_at);

alter table public.seuraavaksi_tapahtumat enable row level security;
drop policy if exists seuraavaksi_tapahtumat_insert on public.seuraavaksi_tapahtumat;
create policy seuraavaksi_tapahtumat_insert on public.seuraavaksi_tapahtumat for insert to anon, authenticated
  with check (created_at > now() - interval '1 minute' and created_at < now() + interval '1 minute');
revoke all on public.seuraavaksi_tapahtumat from anon, authenticated;
grant insert (tapahtuma, pilotti, nakyma, lahde, paikka, tyyppi, kohde, porras) on public.seuraavaksi_tapahtumat to anon, authenticated;

-- Klikkausosuus paikoittain (vain palvelin/SQL): näytöt, klikkaukset ja osuus pilotin/lähtötason, näkymän ja paikan mukaan.
create or replace view public.seuraavaksi_mittarit with (security_invoker = true) as
select coalesce(pilotti, 'lahtotaso') as ryhma, nakyma, paikka,
  count(*) filter (where tapahtuma = 'naytto') as naytot,
  count(*) filter (where tapahtuma = 'klikkaus') as klikkaukset,
  round(100.0 * count(*) filter (where tapahtuma = 'klikkaus') / nullif(count(*) filter (where tapahtuma = 'naytto'), 0), 1) as klikkaus_pct,
  min(created_at) as alkaen
from public.seuraavaksi_tapahtumat group by 1, 2, 3;
revoke all on public.seuraavaksi_mittarit from anon, authenticated;

-- "Jotain muuta" -paikka (Heikki 11.11.2026): sivuston pelatuimmat visat 7 päivän ajalta. quiz_plays ei ole luettavissa
-- anonyymisti, joten vain koonti (visa + pelimäärä) security definer -funktiolla; ei istuntoja eikä yksittäisiä rivejä.
create or replace function public.suosituimmat_visat_7pv(p_n int default 15)
returns table (quiz_id uuid, pelit bigint)
language sql stable security definer set search_path = public as $$
  select qp.quiz_id, count(*) as pelit
  from public.quiz_plays qp
  where qp.played_at > now() - interval '7 days' and qp.quiz_id is not null
  group by qp.quiz_id
  order by count(*) desc, qp.quiz_id
  limit least(greatest(coalesce(p_n, 15), 1), 50);
$$;
revoke all on function public.suosituimmat_visat_7pv(int) from public;
grant execute on function public.suosituimmat_visat_7pv(int) to anon, authenticated;

-- Paikka 1 henkilövisan jälkeen (Heikki 11.11.2026, kierros 3): saman lajin henkilöt syntymävuoden mukaan, tasatilanteessa
-- pelatuin 30 päivän ajalta. Vain annettujen visojen pelimäärät (enintään 800 tunnistetta), ei istuntoja eikä rivejä.
create or replace function public.visojen_pelit_30pv(p_ids uuid[])
returns table (quiz_id uuid, pelit bigint)
language sql stable security definer set search_path = public as $$
  select qp.quiz_id, count(*) as pelit
  from public.quiz_plays qp
  where qp.played_at > now() - interval '30 days'
    and qp.quiz_id = any (p_ids[1:800])
  group by qp.quiz_id;
$$;
revoke all on function public.visojen_pelit_30pv(uuid[]) from public;
grant execute on function public.visojen_pelit_30pv(uuid[]) to anon, authenticated;
