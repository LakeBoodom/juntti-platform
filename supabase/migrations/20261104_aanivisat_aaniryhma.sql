-- ÄÄNIVISAT: viikkosetin sääntö "vähintään 5 erottuvaa, enintään 5 pikkulintua" (Heikki 9.10.2026).
--
-- Viikon 41 setissä oli liikaa samankaltaisia pikkulintuja. Uusi sääntö menee vaikeusjakauman
-- 3 helppoa + 5 keskivaikeaa + 2 vaikeaa edelle (jakauma pysyy tavoitteena):
--   * aanivisat.aaniryhma = 'erottuva' | 'pikkulintu'. Luokittelematon (null) lasketaan pikkulinnuksi,
--     jottei uusi ääni voi rikkoa sääntöä.
--   * 1. ääni on aina helppo erottuva.
--   * Järjestys lomittaa erottuvat ja pikkulinnut (E P E P …), jotta samankaltaisia ei tule peräkkäin;
--     kummankin ryhmän sisällä helpoista vaikeisiin.
--
-- Arvonta on omassa funktiossaan aanivisa_arvo_setti(), joka ei kirjoita mitään: viikkofunktio
-- tallentaa tuloksen, ja samalla funktiolla voi muodostaa koesetit tuleville viikoille.
-- Jo tallennettuja viikkosettejä (viikko 41) ei muuteta.

alter table public.aanivisat add column if not exists aaniryhma text
  check (aaniryhma in ('erottuva', 'pikkulintu'));

comment on column public.aanivisat.aaniryhma is
  'erottuva = selvästi erottuva ääni, pikkulintu = samankaltaisten pikkulintujen laulu. Viikkosetissä enintään 5 pikkulintua (null = pikkulintu).';

update public.aanivisat set aaniryhma = 'pikkulintu'
 where ryhma = 'suomen_linnut'
   and laji in ('Peippo', 'Mustarastas', 'Tiltaltti', 'Peukaloinen', 'Keltasirkku', 'Talitiainen', 'Laulurastas', 'Punarinta');
update public.aanivisat set aaniryhma = 'erottuva'
 where ryhma = 'suomen_linnut'
   and laji in ('Korppi', 'Varis', 'Harakka', 'Sinisorsa', 'Ruisrääkkä', 'Kehrääjä', 'Taivaanvuohi', 'Töyhtöhyyppä',
                'Laulujoutsen', 'Käki', 'Kurki', 'Huuhkaja', 'Käpytikka', 'Palokärki');

create or replace function public.aanivisa_arvo_setti(
  p_site_id uuid, p_ryhma text, p_siemen text, p_edelliset uuid[], p_vain_aktiiviset boolean default true
)
returns uuid[]
language plpgsql
stable
set search_path = public
as $$
declare
  c_pikku_max constant int := 5;
  v_valitut uuid[] := '{}';
  v_id uuid;
  v_vaikeus text;
  v_ryhma text;
  v_pikku int := 0;
  -- Vaikeustasojen jäljellä oleva kiintiö (tavoite 3 + 5 + 2).
  v_h int := 3;
  v_k int := 5;
  v_v int := 2;
  v_e uuid[];
  v_p uuid[];
  v_tulos uuid[];
  i int;
begin
  -- 1. Avaus: helppo erottuva (varalla mikä tahansa erottuva, sitten mikä tahansa helppo).
  select a.id, a.vaikeus, coalesce(a.aaniryhma, 'pikkulintu') into v_id, v_vaikeus, v_ryhma
    from aanivisat a
   where a.site_id = p_site_id and a.ryhma = p_ryhma and (a.active or not p_vain_aktiiviset)
   order by (coalesce(a.aaniryhma, 'pikkulintu') = 'erottuva') desc, (a.vaikeus = 'helppo') desc,
            md5(a.id::text || p_siemen)
   limit 1;
  if v_id is null then
    return '{}';
  end if;

  -- 2. Täyttö yksi kerrallaan: (a) pikkulintukatto, (b) vaikeustasolla tilaa, muuten lähin taso jolla
  --    tilaa, (c) ei edellisten 2 viikon ääni (helpot saavat toistua), (d) siemenen tiiviste.
  for i in 1..10 loop
    exit when v_id is null;
    v_valitut := v_valitut || v_id;
    if v_ryhma = 'pikkulintu' then v_pikku := v_pikku + 1; end if;
    case v_vaikeus when 'helppo' then v_h := v_h - 1; when 'keski' then v_k := v_k - 1; else v_v := v_v - 1; end case;
    exit when cardinality(v_valitut) >= 10;

    v_id := null;
    select a.id, a.vaikeus, coalesce(a.aaniryhma, 'pikkulintu') into v_id, v_vaikeus, v_ryhma
      from aanivisat a
     where a.site_id = p_site_id and a.ryhma = p_ryhma and (a.active or not p_vain_aktiiviset)
       and a.id <> all (v_valitut)
     order by
       case when coalesce(a.aaniryhma, 'pikkulintu') = 'pikkulintu' and v_pikku >= c_pikku_max then 1 else 0 end,
       case a.vaikeus
         when 'helppo' then case when v_h > 0 then 0 when v_k > 0 then 1 else 2 end
         when 'keski'  then case when v_k > 0 then 0 when v_h > 0 or v_v > 0 then 1 else 2 end
         else               case when v_v > 0 then 0 when v_k > 0 then 1 else 2 end
       end,
       case when a.vaikeus <> 'helppo' and a.id = any (p_edelliset) then 1 else 0 end,
       md5(a.id::text || p_siemen)
     limit 1;
  end loop;

  -- 3. Järjestys: avaus ensin, sitten pikkulinnut ja erottuvat vuorotellen (P E P E …),
  --    kummankin ryhmän sisällä helpoista vaikeisiin.
  select coalesce(array_agg(a.id order by array_position(array['helppo', 'keski', 'vaikea'], a.vaikeus), md5(a.id::text || p_siemen)), '{}')
    into v_e
    from aanivisat a
   where a.id = any (v_valitut[2:]) and coalesce(a.aaniryhma, 'pikkulintu') = 'erottuva';
  select coalesce(array_agg(a.id order by array_position(array['helppo', 'keski', 'vaikea'], a.vaikeus), md5(a.id::text || p_siemen)), '{}')
    into v_p
    from aanivisat a
   where a.id = any (v_valitut[2:]) and coalesce(a.aaniryhma, 'pikkulintu') = 'pikkulintu';

  v_tulos := array[v_valitut[1]];
  for i in 1..greatest(cardinality(v_e), cardinality(v_p)) loop
    if i <= cardinality(v_p) then v_tulos := v_tulos || v_p[i]; end if;
    if i <= cardinality(v_e) then v_tulos := v_tulos || v_e[i]; end if;
  end loop;
  return v_tulos;
end;
$$;

comment on function public.aanivisa_arvo_setti(uuid, text, text, uuid[], boolean) is
  'Äänivisan viikkosetin arvonta (ei kirjoita): avaus helppo erottuva, enintään 5 pikkulintua, tavoite 3+5+2, lomitus E/P.';

grant execute on function public.aanivisa_arvo_setti(uuid, text, text, uuid[], boolean) to anon, authenticated;

create or replace function public.aanivisa_viikon_aanet(p_site_id uuid, p_ryhma text, p_vain_aktiiviset boolean default true)
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

  v_idt := aanivisa_arvo_setti(p_site_id, p_ryhma, v_siemen, v_edelliset, p_vain_aktiiviset);

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
  'Kuluvan ISO-viikon äänivisa (10 ääntä; arvonta aanivisa_arvo_setti). p_vain_aktiiviset=false = esikatselu: ei tallenneta.';
