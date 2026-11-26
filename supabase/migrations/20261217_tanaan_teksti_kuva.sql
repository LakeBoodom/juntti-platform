-- Tänään vaihe 3 (Heikki 26.11.2026): pitkän uutistekstin kuva vaatii alt-tekstin ja on sivuston oma tiedosto.
-- Jutun otsikon pisin sana enintään 22 merkkiä (KORTTISÄÄNTÖ-mittaus 26.11.: 320 px:n näkymässä otsikko ≥ 26 px;
-- pisin todellinen sana siemenessä "saamelaisvaltuuskunnan" = 22).
create or replace function public.tanaan_jutun_virheet(j public.tanaan_jutut, taysi boolean)
returns text[] language plpgsql stable set search_path = public, pg_temp as $$
declare
  v text[] := '{}';
  k text;
  i int;
  p text := format('Sivu %s: ', j.sivu);
begin
  v := v || tanaan_pituus(j.osasto, p || 'osasto', 24, taysi)
         || tanaan_pituus(j.juttu, p || 'juttu', 80, taysi)
         || tanaan_pituus(j.kysymys, p || 'kysymys', 140, taysi)
         || tanaan_pituus(j.selitys, p || 'selitys', 400, taysi)
         || tanaan_pituus(j.lahde, p || 'lähde', 40)
         || tanaan_pituus(j.kuva_alt, p || 'kuvan alt', 120);
  if j.juttu is not null and tanaan_pisin_sana(j.juttu) > 22 then
    v := v || format('%sjutun otsikon pisin sana on %s merkkiä (enintään 22)', p, tanaan_pisin_sana(j.juttu));
  end if;
  if j.vaihtoehdot is not null then
    if coalesce(array_length(j.vaihtoehdot, 1), 0) <> 4 then
      v := v || (p || 'vaihtoehtoja pitää olla tasan 4');
    else
      for i in 1..4 loop
        v := v || tanaan_pituus(j.vaihtoehdot[i], p || format('vaihtoehto %s', i), 60, true);
      end loop;
      if (select count(distinct lower(btrim(x))) from unnest(j.vaihtoehdot) x) <> 4 then
        v := v || (p || 'vaihtoehdoissa on sama teksti kahdesti');
      end if;
    end if;
  elsif taysi then
    v := v || (p || 'vaihtoehdot puuttuvat');
  end if;
  if taysi and j.oikea is null then v := v || (p || 'oikea puuttuu'); end if;
  if j.kuva is not null and j.kuva_alt is null then v := v || (p || 'kuvalta puuttuu alt-teksti'); end if;
  if j.teksti is not null then
    if jsonb_typeof(j.teksti) <> 'object' then
      v := v || (p || 'teksti ei ole objekti');
    else
      v := v || tanaan_pituus(j.teksti->>'ingressi', p || 'ingressi', 140, true);
      if jsonb_typeof(j.teksti->'kappaleet') <> 'array' or jsonb_array_length(j.teksti->'kappaleet') not between 2 and 3 then
        v := v || (p || 'kappaleita pitää olla 2–3');
      else
        i := 0;
        for k in select jsonb_array_elements_text(j.teksti->'kappaleet') loop
          i := i + 1;
          v := v || tanaan_pituus(k, p || format('kappale %s', i), 220, true);
        end loop;
      end if;
      if j.teksti ? 'kuva_muoto' and j.teksti->>'kuva_muoto' not in ('vaaka', 'pysty') then
        v := v || (p || 'kuva_muoto on vaaka tai pysty');
      end if;
      -- Vaihe 3: tekstin kuva on sivuston oma kopio (ei hotlinkkiä) ja sillä on alt-teksti.
      if coalesce(j.teksti->>'kuva', '') <> '' then
        if j.teksti->>'kuva' !~ '^/[^/]' then v := v || (p || 'tekstin kuva on sivuston oma tiedosto (alkaa /-merkillä)'); end if;
        v := v || tanaan_pituus(j.teksti->>'kuva_alt', p || 'tekstin kuvan alt', 120, true);
      end if;
    end if;
  end if;
  if j.jatko is not null then
    v := v || tanaan_pituus(j.jatko->>'teksti', p || 'jatkokortin teksti', 40, true);
    if coalesce(j.jatko->>'url', '') !~ '^/[^/]' then v := v || (p || 'jatkokortin url alkaa /-merkillä (sivuston oma sivu)'); end if;
  end if;
  return v;
end;
$$;
