-- KUVAVISAT 2.0 — VIIKKOVISA (17.9.2026, Heikin pyyntö: "tee viikkovisa taulupohjaisena")
--
-- Yksi rivi per sivusto ja ISO-viikko, 15 kuvan lukittu sarja. Sama visa
-- kaikille koko viikon, vaihtuu maanantaina Suomen aikaa (ISO-viikko alkaa
-- maanantaista; aikavyöhyke Europe/Helsinki, jotta vaihto tapahtuu Suomen
-- eikä UTC:n keskiyöllä).
--
-- Rivi luodaan LAISKASTI funktiossa kuvavisa_viikon_kuvat() ensimmäisellä
-- pyynnöllä — ei cronia, koska alustalla ei vielä ole ajastimia. Arvonta on
-- deterministinen (siemen = sivusto + ISO-vuosi + ISO-viikko), joten kaksi
-- rinnakkaista ensimmäistä pyyntöä tuottavat saman sarjan eikä kilpa-ajo voi
-- antaa kahdelle pelaajalle eri visaa.
--
-- Tämä migraatio EI muuta olemassa olevaa dataa: pelkkä uusi taulu, indeksi,
-- RLS-käytäntö ja funktio. Varmuuskopiota ei siksi tarvita (kuvavisas-taulua
-- luetaan vain).

create table if not exists public.kuvavisa_viikot (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  iso_vuosi smallint not null,
  iso_viikko smallint not null check (iso_viikko between 1 and 53),
  kuva_idt uuid[] not null check (cardinality(kuva_idt) > 0),
  created_at timestamptz not null default now(),
  constraint kuvavisa_viikot_uniq unique (site_id, iso_vuosi, iso_viikko)
);

comment on table public.kuvavisa_viikot is
  'Viikkovisan lukittu kuvasarja: yksi rivi per sivusto ja ISO-viikko. Rivit syntyvät laiskasti kuvavisa_viikon_kuvat()-funktiossa.';

create index if not exists kuvavisa_viikot_site_idx
  on public.kuvavisa_viikot (site_id, iso_vuosi desc, iso_viikko desc);

alter table public.kuvavisa_viikot enable row level security;

-- Julkinen luku: sarja ei ole salaisuus, se on tarkoituksella sama kaikille.
drop policy if exists "kuvavisa_viikot public read" on public.kuvavisa_viikot;
create policy "kuvavisa_viikot public read" on public.kuvavisa_viikot
  for select using (true);

-- Kirjoitusoikeutta ei anneta anonille: rivin luo vain alla oleva
-- security definer -funktio, joten sarjaa ei voi ulkopuolelta vaihtaa.

-- Ulostulosarakkeet EIVÄT saa olla iso_vuosi/iso_viikko/kuva_idt: PL/pgSQL tekee
-- niistä muuttujia, jotka törmäävät INSERTin sarakenimiin ("column reference
-- is ambiguous"). Siksi vuosi/viikko/idt.
drop function if exists public.kuvavisa_viikon_kuvat(uuid);

create function public.kuvavisa_viikon_kuvat(p_site_id uuid)
returns table (vuosi smallint, viikko smallint, idt uuid[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nyt timestamptz := now();
  v_vuosi smallint := extract(isoyear from (v_nyt at time zone 'Europe/Helsinki'))::smallint;
  v_viikko smallint := extract(week from (v_nyt at time zone 'Europe/Helsinki'))::smallint;
  v_siemen text := p_site_id::text || ':' || v_vuosi::text || ':' || v_viikko::text;
  v_idt uuid[];
begin
  select k.kuva_idt into v_idt
    from kuvavisa_viikot k
   where k.site_id = p_site_id and k.iso_vuosi = v_vuosi and k.iso_viikko = v_viikko;

  if v_idt is null then
    -- Enintään 2 kuvaa per kortisto: rn = 1 antaa kaikki kahdeksan kortistoa
    -- (8 kuvaa), rn = 2 täyttää loput seitsemän (15 yhteensä). Se kortisto,
    -- joka jää yhteen kuvaan, vaihtuu viikoittain siemenen mukana.
    -- Loppujärjestys sekoitetaan samalla tiivisteellä, jotta visa ei etene
    -- kortistoittain ryhmiteltynä.
    with jarjestetty as (
      select q.id,
             md5(q.id::text || v_siemen) as h,
             row_number() over (partition by q.type order by md5(q.id::text || v_siemen)) as rn
        from kuvavisas q
       where q.site_id = p_site_id and q.active = true
    ), valitut as (
      select j.id, j.h
        from jarjestetty j
       where j.rn <= 2
       order by j.rn, j.h
       limit 15
    )
    select array_agg(v.id order by v.h) into v_idt from valitut v;

    if v_idt is null or cardinality(v_idt) = 0 then
      return; -- ei aktiivisia kuvia → ei viikkovisaa, kutsuja päättää mitä näyttää
    end if;

    insert into kuvavisa_viikot (site_id, iso_vuosi, iso_viikko, kuva_idt)
    values (p_site_id, v_vuosi, v_viikko, v_idt)
    on conflict (site_id, iso_vuosi, iso_viikko) do nothing;

    -- Luetaan aina kannassa oleva rivi: rinnakkainen pyyntö voi ehtiä ensin.
    select k.kuva_idt into v_idt
      from kuvavisa_viikot k
     where k.site_id = p_site_id and k.iso_vuosi = v_vuosi and k.iso_viikko = v_viikko;
  end if;

  return query select v_vuosi, v_viikko, v_idt;
end;
$$;

comment on function public.kuvavisa_viikon_kuvat(uuid) is
  'Palauttaa kuluvan ISO-viikon viikkovisan kuvat ja luo rivin jos sitä ei vielä ole. Deterministinen arvonta: sama sarja kaikille koko viikon.';

grant execute on function public.kuvavisa_viikon_kuvat(uuid) to anon, authenticated;
