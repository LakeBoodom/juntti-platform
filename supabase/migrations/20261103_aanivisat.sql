-- ÄÄNIVISAT (toteutusbrief TOTEUTUSBRIEF_LUONTO_JA_AANIVISAT.md §2.1–2.2, 8.10.2026)
--
-- Malli: kuvavisas + kuvavisa_viikot (20260917_kuvavisa_viikkovisa.sql). Yksi rivi = yksi ääni.
-- Viikkosetti 10 ääntä per ryhmä per ISO-viikko (Europe/Helsinki), luodaan laiskasti ensimmäisellä
-- pyynnöllä funktiossa aanivisa_viikon_aanet(), deterministinen siemen → sama kaikille.
--
-- Julkaisu: rivit tuodaan active=false. Julkinen luku koskee kaikkia rivejä (data ei ole salaista),
-- mutta tuotantosivu näyttää vain aktiiviset; Vercelin preview näyttää myös ei-aktiiviset, jotta
-- Heikki voi hyväksyä äänivisan ennen aktivointia. Esikatselun setti lasketaan samalla arvonnalla
-- mutta EI tallenneta (p_vain_aktiiviset = false), joten se ei lukitse tuotannon viikkosettiä.
--
-- Ei muuta olemassa olevaa dataa: uudet taulut, RLS ja funktio.

create table if not exists public.aanivisat (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  tunniste text not null,
  ryhma text not null check (ryhma in ('suomen_linnut', 'suomen_elaimet', 'meren_aanet', 'maailman_linnut', 'maailman_elaimet')),
  laji text not null,
  tieteellinen text,
  aanityyppi text,
  vaikeus text not null check (vaikeus in ('helppo', 'keski', 'vaikea')),
  similarity_group text,
  distractor_pool jsonb not null default '[]'::jsonb,
  alt_answers text[] not null default '{}',
  fakta text,
  audio_url text not null,
  jakso_s numeric not null,
  tauko_s numeric not null default 0,
  kesto_s numeric,
  sono_url text not null,
  sono_ticks jsonb not null default '[]'::jsonb,
  aani_tekija text not null,
  aani_lisenssi text not null,
  aani_lahde_url text not null,
  aani_havainto_url text,
  aani_maa text,
  kuva_url text,
  kuva_tekija text,
  kuva_lisenssi text,
  kuva_lahde_url text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aanivisat_uniq unique (site_id, ryhma, tunniste)
);

comment on table public.aanivisat is
  'Äänivisan äänet (yksi rivi = yksi ääni). Viikkosetti: aanivisa_viikot / aanivisa_viikon_aanet(). active=false = ei näy tuotannossa.';

create index if not exists aanivisat_ryhma_idx on public.aanivisat (site_id, ryhma, active);

alter table public.aanivisat enable row level security;
drop policy if exists "aanivisat public read" on public.aanivisat;
create policy "aanivisat public read" on public.aanivisat for select using (true);

create table if not exists public.aanivisa_viikot (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  ryhma text not null,
  iso_vuosi smallint not null,
  iso_viikko smallint not null check (iso_viikko between 1 and 53),
  aani_idt uuid[] not null check (cardinality(aani_idt) > 0),
  created_at timestamptz not null default now(),
  constraint aanivisa_viikot_uniq unique (site_id, ryhma, iso_vuosi, iso_viikko)
);

comment on table public.aanivisa_viikot is
  'Äänivisan lukittu viikkosetti: yksi rivi per sivusto, ryhmä ja ISO-viikko. Rivit syntyvät laiskasti aanivisa_viikon_aanet()-funktiossa.';

create index if not exists aanivisa_viikot_idx on public.aanivisa_viikot (site_id, ryhma, iso_vuosi desc, iso_viikko desc);

alter table public.aanivisa_viikot enable row level security;
drop policy if exists "aanivisa_viikot public read" on public.aanivisa_viikot;
create policy "aanivisa_viikot public read" on public.aanivisa_viikot for select using (true);

-- Kirjoitusoikeutta ei anneta: rivit luo vain security definer -funktio.

drop function if exists public.aanivisa_viikon_aanet(uuid, text, boolean);

-- Ulostulosarakkeet vuosi/viikko/idt (ei iso_*), ks. kuvavisa_viikon_kuvat: PL/pgSQL-muuttujat
-- törmäisivät INSERTin sarakenimiin.
create function public.aanivisa_viikon_aanet(p_site_id uuid, p_ryhma text, p_vain_aktiiviset boolean default true)
returns table (vuosi smallint, viikko smallint, idt uuid[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paiva date := (now() at time zone 'Europe/Helsinki')::date;
  v_vuosi smallint := extract(isoyear from v_paiva)::smallint;
  v_viikko smallint := extract(week from v_paiva)::smallint;
  v_siemen text := p_site_id::text || ':' || p_ryhma || ':' || v_vuosi::text || ':' || v_viikko::text;
  v_edelliset uuid[];
  v_idt uuid[];
begin
  if p_vain_aktiiviset then
    select k.aani_idt into v_idt
      from aanivisa_viikot k
     where k.site_id = p_site_id and k.ryhma = p_ryhma and k.iso_vuosi = v_vuosi and k.iso_viikko = v_viikko;
    if v_idt is not null then
      return query select v_vuosi, v_viikko, v_idt;
      return;
    end if;
  end if;

  -- Edellisen 2 viikon äänet (ISO-viikot laskettuna päivämääristä, joten vuodenvaihde toimii).
  select coalesce(array_agg(distinct x), '{}') into v_edelliset
    from aanivisa_viikot k, unnest(k.aani_idt) x
   where k.site_id = p_site_id and k.ryhma = p_ryhma
     and (k.iso_vuosi, k.iso_viikko) in (
       (extract(isoyear from v_paiva - 7)::smallint, extract(week from v_paiva - 7)::smallint),
       (extract(isoyear from v_paiva - 14)::smallint, extract(week from v_paiva - 14)::smallint)
     );

  -- Jakauma 3 helppoa + 5 keskivaikeaa + 2 vaikeaa. Ehdokkaat järjestetään tasoittain:
  -- 1) ei edellisten 2 viikon ääni (helpot saavat toistua: niille rangaistus vain edelliseltä viikolta
  --    ei koske — ne ovat yhtä hyviä kuin tuoreet), 2) siemenen tiiviste. Vajaa taso täytetään
  -- viereiseltä tasolta: vaikea ← keski, keski ← helppo/vaikea, helppo ← keski.
  with pooli as (
    select a.id, a.vaikeus,
           case when a.vaikeus <> 'helppo' and a.id = any(v_edelliset) then 1 else 0 end as toistunut,
           md5(a.id::text || v_siemen) as h
      from aanivisat a
     where a.site_id = p_site_id and a.ryhma = p_ryhma and (a.active or not p_vain_aktiiviset)
  ), tasot(taso, tarve, jarj) as (
    values ('helppo', 3, 1), ('keski', 5, 2), ('vaikea', 2, 3)
  ), ensisijaiset as (
    select p.id, p.vaikeus, t.jarj,
           row_number() over (partition by p.vaikeus order by p.toistunut, p.h) as rn, t.tarve
      from pooli p join tasot t on t.taso = p.vaikeus
  ), valitut1 as (
    select id, vaikeus, jarj from ensisijaiset where rn <= tarve
  ), vaje as (
    select t.taso, t.jarj, t.tarve - coalesce((select count(*) from valitut1 v where v.vaikeus = t.taso), 0) as puuttuu
      from tasot t
  ), taytto as (
    -- Täyttö viereiseltä tasolta: etäisyys jarj-erona, sitten toisto ja tiiviste.
    select p.id, p.vaikeus, va.jarj,
           row_number() over (partition by va.taso order by abs((select t2.jarj from tasot t2 where t2.taso = p.vaikeus) - va.jarj), p.toistunut, p.h) as rn,
           va.puuttuu
      from vaje va
      join pooli p on p.vaikeus <> va.taso and p.id not in (select id from valitut1)
     where va.puuttuu > 0
  ), valitut2 as (
    select id, vaikeus, jarj from taytto where rn <= puuttuu
  ), kaikki as (
    select distinct on (id) id, jarj from (select id, jarj from valitut1 union all select id, jarj from valitut2) u
  )
  -- Järjestys helpoista vaikeisiin; tason sisällä tiivisteen mukaan. Ensimmäinen ääni on aina helppo,
  -- koska helppo-taso (jarj 1) on ensin ja täytetään tarvittaessa ennen muita.
  select array_agg(k.id order by k.jarj, md5(k.id::text || v_siemen)) into v_idt
    from (select * from kaikki limit 10) k;

  if v_idt is null or cardinality(v_idt) = 0 then
    return;
  end if;

  if p_vain_aktiiviset then
    insert into aanivisa_viikot (site_id, ryhma, iso_vuosi, iso_viikko, aani_idt)
    values (p_site_id, p_ryhma, v_vuosi, v_viikko, v_idt)
    on conflict (site_id, ryhma, iso_vuosi, iso_viikko) do nothing;
    select k.aani_idt into v_idt
      from aanivisa_viikot k
     where k.site_id = p_site_id and k.ryhma = p_ryhma and k.iso_vuosi = v_vuosi and k.iso_viikko = v_viikko;
  end if;

  return query select v_vuosi, v_viikko, v_idt;
end;
$$;

comment on function public.aanivisa_viikon_aanet(uuid, text, boolean) is
  'Kuluvan ISO-viikon äänivisa (10 ääntä, 3+5+2). p_vain_aktiiviset=false = esikatselu: sama arvonta myös ei-aktiivisista, ei tallenneta.';

grant execute on function public.aanivisa_viikon_aanet(uuid, text, boolean) to anon, authenticated;
