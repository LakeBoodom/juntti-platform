-- Tänään vaihe 2 (mitattu 26.11.2026): laatan koukun pisin sana ≤ 11 merkkiä (kapea laatta, 12 px:n alaraja).
create or replace function public.tanaan_kannen_virheet(k jsonb)
returns text[] language plpgsql stable set search_path = public, pg_temp as $$
declare
  v text[] := '{}';
  e jsonb;
  t text;
  i int := 0;
begin
  if k is null then return array['Kansi puuttuu']; end if;
  if coalesce(k->>'malli', '') not in ('taysi', 'kaksi', 'yksi') then v := v || 'Kansi: malli on taysi, kaksi tai yksi'::text; end if;
  v := v || tanaan_pituus(k->'paajuttu'->>'karki', 'Kansi: kärkirivi', 48, true)
         || tanaan_pituus(k->'paajuttu'->>'tarra', 'Kansi: tarra', 24)
         || tanaan_pituus(k->>'pahkina', 'Kansi: pähkinärivi', 40, true);
  if tanaan_pisin_sana(k->'paajuttu'->>'tarra') > 14 then
    v := v || 'Kansi: tarran pisin sana on yli 14 merkkiä (ei mahdu tarraan)'::text;
  end if;
  if jsonb_typeof(k->'paajuttu'->'rivit') <> 'array' or jsonb_array_length(k->'paajuttu'->'rivit') not between 2 and 3 then
    v := v || 'Kansi: pääotsikossa pitää olla 2–3 riviä'::text;
  else
    for t in select jsonb_array_elements_text(k->'paajuttu'->'rivit') loop
      i := i + 1;
      v := v || tanaan_pituus(t, format('Kansi: pääotsikon rivi %s', i), 12, true);
    end loop;
  end if;
  if k->'paajuttu' ? 'kuva' and k->'paajuttu'->>'kuva' is not null and coalesce(k->'paajuttu'->>'kuva_alt', '') = '' then
    v := v || 'Kansi: pääkuvalta puuttuu alt-teksti'::text;
  end if;
  if k->'nauha' is not null and jsonb_typeof(k->'nauha') = 'object' then
    v := v || tanaan_pituus(k->'nauha'->>'a', 'Kansi: nauhan lihava osa', 32, true)
           || tanaan_pituus(k->'nauha'->>'b', 'Kansi: nauhan jatko', 48, true);
  end if;
  if k->'laatat' is not null and jsonb_typeof(k->'laatat') = 'array' then
    if jsonb_array_length(k->'laatat') > 2 then v := v || 'Kansi: laattoja enintään 2'::text; end if;
    i := 0;
    for e in select jsonb_array_elements(k->'laatat') loop
      i := i + 1;
      v := v || tanaan_pituus(e->>'otsikko', format('Kansi: laatan %s otsikko', i), 28, true)
             || tanaan_pituus(e->>'alarivi', format('Kansi: laatan %s alarivi', i), 56, true)
             || tanaan_pituus(e->>'koukku', format('Kansi: laatan %s koukku', i), 20);
      if tanaan_pisin_sana(e->>'koukku') > 11 then
        v := v || format('Kansi: laatan %s koukun pisin sana on yli 11 merkkiä', i);
      end if;
      if tanaan_pisin_sana(e->>'otsikko') > 12 then
        v := v || format('Kansi: laatan %s otsikon pisin sana on yli 12 merkkiä (ei mahdu laattaan)', i);
      end if;
      if e->>'kuva' is not null and coalesce(e->>'kuva_alt', '') = '' then
        v := v || format('Kansi: laatan %s kuvalta puuttuu alt-teksti', i);
      end if;
    end loop;
  end if;
  if k->'myos' is not null and jsonb_typeof(k->'myos') = 'array' then
    if jsonb_array_length(k->'myos') not between 3 and 5 then v := v || 'Kansi: Myös tänään -rivejä 3–5'::text; end if;
    i := 0;
    for t in select jsonb_array_elements_text(k->'myos') loop
      i := i + 1;
      v := v || tanaan_pituus(t, format('Kansi: Myös tänään -rivi %s', i), 32, true);
    end loop;
  end if;
  return v;
end;
$$;
