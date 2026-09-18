-- KUVAVISAT 2.0 — HAASTELINKIT (K3, 17.9.2026)
--
-- Lyhyt haastetunnus kannassa: /h/abc123 aiemman ~370 merkin
-- /peli?kuvavisa=liput&ids=<10 × uuid> tilalle. Rivi kantaa myös haastajan
-- tuloksen, jotta vastaanottaja näkee aloitusnäkymässä "Kaverisi sai 8/10"
-- ja tulosnäkymässä vertailun.
--
-- Tunnus on 6 merkkiä aakkostosta 0-9 a-z ilman i, l ja o (sekoittuvat
-- ykköseen ja nollaan): 32^6 ≈ 1,07 miljardia yhdistelmää. Rivin luo vain
-- security definer -funktio, joten haastetta ei voi väärentää suoraan
-- taulua kirjoittamalla.
--
-- Tämä migraatio EI muuta olemassa olevaa dataa: uusi taulu, indeksi,
-- RLS-käytäntö ja funktio.

create table if not exists public.kuvavisa_haasteet (
  koodi text primary key check (koodi ~ '^[0-9a-hjkmnp-z]{6}$'),
  site_id uuid not null references public.sites (id) on delete cascade,
  /* Kortiston URL-slug ("liput", "vaakuna") — sama arvo kuin /peli?kuvavisa= */
  kuvavisa text not null,
  /* Variaatio, jotta haastettu näkee saman nimen kuin haastaja pelasi */
  taso text,
  maanosa text,
  kuva_idt uuid[] not null check (cardinality(kuva_idt) between 1 and 50),
  kysymyksia smallint not null check (kysymyksia between 1 and 50),
  haastajan_oikein smallint not null check (haastajan_oikein >= 0),
  haastajan_pisteet integer not null default 0 check (haastajan_pisteet >= 0),
  created_at timestamptz not null default now(),
  constraint kuvavisa_haasteet_oikein_jarkeva check (haastajan_oikein <= kysymyksia)
);

comment on table public.kuvavisa_haasteet is
  'Kuvavisan haastelinkit: lyhyt tunnus, pelattu kuvasarja ja haastajan tulos. Rivit luodaan vain kuvavisa_haaste_luo()-funktiolla.';

create index if not exists kuvavisa_haasteet_site_idx
  on public.kuvavisa_haasteet (site_id, created_at desc);

alter table public.kuvavisa_haasteet enable row level security;

-- Julkinen luku: linkin tietäminen riittää, mitään henkilötietoa ei tallenneta.
drop policy if exists "kuvavisa_haasteet public read" on public.kuvavisa_haasteet;
create policy "kuvavisa_haasteet public read" on public.kuvavisa_haasteet
  for select using (true);

create or replace function public.kuvavisa_haaste_luo(
  p_site_id uuid,
  p_kuvavisa text,
  p_kuva_idt uuid[],
  p_kysymyksia smallint,
  p_oikein smallint,
  p_pisteet integer,
  p_taso text default null,
  p_maanosa text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_aakkoset constant text := '0123456789abcdefghjkmnpqrstuvwxyz';
  v_koodi text;
  v_yritys int := 0;
begin
  if p_kuva_idt is null or cardinality(p_kuva_idt) = 0 then
    raise exception 'kuva_idt puuttuu';
  end if;

  -- Enintään kahdeksan yritystä: 32^6 avaruudessa törmäys on käytännössä
  -- mahdoton, mutta silmukka pitää funktion päättyvänä myös täydessä taulussa.
  loop
    v_yritys := v_yritys + 1;
    select string_agg(substr(v_aakkoset, 1 + floor(random() * 32)::int, 1), '')
      into v_koodi
      from generate_series(1, 6);
    begin
      insert into kuvavisa_haasteet
        (koodi, site_id, kuvavisa, taso, maanosa, kuva_idt, kysymyksia, haastajan_oikein, haastajan_pisteet)
      values
        (v_koodi, p_site_id, p_kuvavisa, p_taso, p_maanosa, p_kuva_idt, p_kysymyksia, p_oikein, greatest(p_pisteet, 0));
      return v_koodi;
    exception when unique_violation then
      if v_yritys >= 8 then
        raise exception 'haastetunnusta ei saatu luotua';
      end if;
    end;
  end loop;
end;
$$;

comment on function public.kuvavisa_haaste_luo(uuid, text, uuid[], smallint, smallint, integer, text, text) is
  'Luo lyhyen haastetunnuksen kuvavisan pelatulle sarjalle ja palauttaa sen. Ainoa tapa kirjoittaa kuvavisa_haasteet-tauluun.';

grant execute on function public.kuvavisa_haaste_luo(uuid, text, uuid[], smallint, smallint, integer, text, text) to anon, authenticated;
