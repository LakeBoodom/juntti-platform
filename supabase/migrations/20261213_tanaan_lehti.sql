-- TÄNÄÄN · PÄIVÄN VISA 7+1 (toteutusbrief 22.11.2026, vaihe 1; Heikin päätökset 24.11.2026).
--
-- Yksi lehti per päivä (tanaan_lehdet) ja seitsemän juttupaikkaa (tanaan_jutut, sivu 1–7). Paikat ovat omia rivejään,
-- jotta tuleva admin-näkymä (7+1 paikkaa) ja agentit voivat täyttää niitä erikseen ja hyvissä ajoin: synttärit ja
-- tiedossa olevat tapahtumat viikkoja etukäteen, 1–3 ajankohtaista uutista edellisenä iltana (uutisagentti).
-- Julkaisu ei vaadi Heikin katselmointia: tila 'julkaistu' kelpaa vasta, kun lehti on rakenteellisesti valmis
-- (7 valmista juttua, pähkinä, kansi, lööppi). Merkkirajat tarkistetaan aina tallennettaessa (layout ei jousta).
--
-- Näkyvyys: julkinen avain (anon) näkee vain julkaistut lehdet, joiden päivä on tänään tai aiemmin Suomen aikaa.
-- Huomisen vastauksia ei siis voi lukea etukäteen. Luonnokset luetaan palvelimella service rolella (esikatselu).
-- Kirjoitus vain service rolella (Cowork, agentit, admin).

create table if not exists public.tanaan_lehdet (
  pvm date primary key,
  tila text not null default 'luonnos' check (tila in ('luonnos', 'julkaistu')),
  juhla text,
  kansi jsonb,
  pahkina jsonb,
  loppi text[] not null default '{}',
  julkaistu_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tanaan_jutut (
  pvm date not null references public.tanaan_lehdet (pvm) on delete cascade,
  sivu smallint not null check (sivu between 1 and 7),
  osasto text,
  juttu text,
  teksti jsonb,
  kuva text,
  kuva_alt text,
  kysymys text,
  vaihtoehdot text[],
  oikea smallint check (oikea between 0 and 3),
  selitys text,
  lahde text,
  jatko jsonb,
  -- Kuka täytti paikan: 'cowork', 'uutisagentti', 'heikki' … (admin-näkymää varten).
  tekija text,
  -- Paikka on valmis julkaistavaksi (kaikki pakolliset kentät). Luonnospaikka saa olla vajaa.
  valmis boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (pvm, sivu)
);

comment on table public.tanaan_lehdet is 'Tänään · Päivän visa 7+1: yksi lehti per päivä. Kirjoitus service rolella, julkinen luku vain julkaistu + pvm <= helsinki_tanaan().';
comment on table public.tanaan_jutut is 'Tänään-lehden seitsemän juttupaikkaa (sivu 1–7), täytetään erikseen. Merkkirajat: juttu 80, kysymys 140, vaihtoehto 60, ingressi 140, kappale 220.';

-- ── Tarkistukset ────────────────────────────────────────────────────────────────────────────────────────────
-- Palauttavat virhelistan (tyhjä = kunnossa). Virheteksti nimeää kentän ja rajan, jotta tuottaja voi korjata.

create or replace function public.tanaan_pituus(arvo text, kentta text, maks int, pakollinen boolean default false)
returns text[] language sql immutable set search_path = public, pg_temp as $$
  select case
    when arvo is null or btrim(arvo) = '' then case when pakollinen then array[kentta || ' puuttuu'] else '{}'::text[] end
    when char_length(arvo) > maks then array[format('%s on %s merkkiä (enintään %s)', kentta, char_length(arvo), maks)]
    else '{}'::text[]
  end;
$$;

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
    end if;
  end if;
  if j.jatko is not null then
    v := v || tanaan_pituus(j.jatko->>'teksti', p || 'jatkokortin teksti', 40, true);
    if coalesce(j.jatko->>'url', '') !~ '^/[^/]' then v := v || (p || 'jatkokortin url alkaa /-merkillä (sivuston oma sivu)'); end if;
  end if;
  return v;
end;
$$;

create or replace function public.tanaan_pahkinan_virheet(n jsonb)
returns text[] language plpgsql stable set search_path = public, pg_temp as $$
declare
  v text[] := '{}';
  m text := n->>'muoto';
  e jsonb;
  i int := 0;
begin
  if n is null then return array['Pähkinä puuttuu']; end if;
  if m = 'jarjesta' then
    v := v || tanaan_pituus(n->>'saanto', 'Pähkinä: sääntö', 60, true)
           || tanaan_pituus(n->>'ylin', 'Pähkinä: yläpään merkki', 24, true)
           || tanaan_pituus(n->>'alin', 'Pähkinä: alapään merkki', 24, true);
    if jsonb_typeof(n->'kohteet') <> 'array' or jsonb_array_length(n->'kohteet') <> 4 then
      return v || 'Pähkinä: kohteita pitää olla tasan 4'::text;
    end if;
    for e in select jsonb_array_elements(n->'kohteet') loop
      i := i + 1;
      v := v || tanaan_pituus(e->>'teksti', format('Pähkinä: kohde %s', i), 30, true)
             || tanaan_pituus(e->>'arvo', format('Pähkinä: kohteen %s arvo', i), 20, true);
    end loop;
    if (select array_agg(x order by x) from (select (k->>'sija')::int x from jsonb_array_elements(n->'kohteet') k) s)
       is distinct from array[1, 2, 3, 4] then
      v := v || 'Pähkinä: sijat pitää olla 1, 2, 3 ja 4'::text;
    end if;
    if (select bool_and((k->>'sija')::int = o) from jsonb_array_elements(n->'kohteet') with ordinality t(k, o)) then
      v := v || 'Pähkinä: kohteet ovat valmiiksi oikeassa järjestyksessä (sekoita ne)'::text;
    end if;
  elsif m = 'kumpi' then
    v := v || tanaan_pituus(n->>'kysymys', 'Pähkinä: kysymys', 60, true)
           || tanaan_pituus(n->'a'->>'teksti', 'Pähkinä: a', 30, true)
           || tanaan_pituus(n->'a'->>'arvo', 'Pähkinä: a:n arvo', 20, true)
           || tanaan_pituus(n->'b'->>'teksti', 'Pähkinä: b', 30, true)
           || tanaan_pituus(n->'b'->>'arvo', 'Pähkinä: b:n arvo', 20, true);
    if coalesce(n->>'oikea', '') not in ('0', '1') then v := v || 'Pähkinä: oikea on 0 tai 1'::text; end if;
  elsif m = 'peli' then
    -- Pähkinä vuorottelee: olemassa oleva päiväpeli pähkinänä (Heikki 24.11.2026). Lisää pelit tähän sitä mukaa,
    -- kun lehti osaa lukea niiden päivän tuloksen.
    if coalesce(n->>'peli', '') not in ('mika-maa') then v := v || 'Pähkinä: tuntematon peli (sallitut: mika-maa)'::text; end if;
  else
    v := v || 'Pähkinä: muoto on jarjesta, kumpi tai peli'::text;
  end if;
  return v;
end;
$$;

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

-- ── Triggerit ───────────────────────────────────────────────────────────────────────────────────────────────

create or replace function public.tanaan_jutut_tarkista()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  julkaistu boolean;
  v text[];
begin
  if tg_op = 'DELETE' then
    select tila = 'julkaistu' into julkaistu from tanaan_lehdet where pvm = old.pvm;
    if julkaistu then raise exception 'Tänään %: julkaistusta lehdestä ei voi poistaa juttua', old.pvm; end if;
    return old;
  end if;
  select tila = 'julkaistu' into julkaistu from tanaan_lehdet where pvm = new.pvm;
  v := tanaan_jutun_virheet(new, new.valmis or coalesce(julkaistu, false));
  if coalesce(julkaistu, false) and not new.valmis then v := v || format('Sivu %s: julkaistun lehden jutun pitää olla valmis', new.sivu); end if;
  if array_length(v, 1) > 0 then
    raise exception 'Tänään % sivu %: %', new.pvm, new.sivu, array_to_string(v, '; ') using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tanaan_jutut_tarkista on public.tanaan_jutut;
create trigger tanaan_jutut_tarkista before insert or update or delete on public.tanaan_jutut
  for each row execute function public.tanaan_jutut_tarkista();

create or replace function public.tanaan_lehdet_tarkista()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  v text[] := '{}';
  t text;
  i int := 0;
  j public.tanaan_jutut;
  n int := 0;
begin
  v := v || tanaan_pituus(new.juhla, 'Juhla', 40);
  foreach t in array coalesce(new.loppi, '{}') loop
    i := i + 1;
    v := v || tanaan_pituus(t, format('Lööpin rivi %s', i), 48, true);
  end loop;
  if new.pahkina is not null then v := v || tanaan_pahkinan_virheet(new.pahkina); end if;
  if new.kansi is not null then v := v || tanaan_kannen_virheet(new.kansi); end if;
  if new.tila = 'julkaistu' then
    if new.pahkina is null then v := v || 'Pähkinä puuttuu'::text; end if;
    if new.kansi is null then v := v || 'Kansi puuttuu'::text; end if;
    if coalesce(array_length(new.loppi, 1), 0) not between 4 and 7 then v := v || 'Lööpissä pitää olla 4–7 riviä'::text; end if;
    for j in select * from tanaan_jutut where pvm = new.pvm order by sivu loop
      n := n + 1;
      if not j.valmis then v := v || format('Sivu %s ei ole valmis', j.sivu); end if;
      v := v || tanaan_jutun_virheet(j, true);
    end loop;
    if n <> 7 then v := v || format('Juttuja on %s, pitää olla 7', n); end if;
    if tg_op = 'INSERT' or old.tila <> 'julkaistu' then new.julkaistu_at := coalesce(new.julkaistu_at, now()); end if;
  end if;
  if array_length(v, 1) > 0 then
    raise exception 'Tänään %: %', new.pvm, array_to_string(v, '; ') using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tanaan_lehdet_tarkista on public.tanaan_lehdet;
create trigger tanaan_lehdet_tarkista before insert or update on public.tanaan_lehdet
  for each row execute function public.tanaan_lehdet_tarkista();

-- ── Näkyvyys ── (anon ei saa kutsua helsinki_tanaan()-funktiota, joten Suomen päivä lasketaan suoraan)
-- ────────────────────────────────────────────────────────────────────────────────────────────────

alter table public.tanaan_lehdet enable row level security;
alter table public.tanaan_jutut enable row level security;

drop policy if exists tanaan_lehdet_julkinen on public.tanaan_lehdet;
create policy tanaan_lehdet_julkinen on public.tanaan_lehdet for select to anon, authenticated
  using (tila = 'julkaistu' and pvm <= (now() at time zone 'Europe/Helsinki')::date);

drop policy if exists tanaan_jutut_julkinen on public.tanaan_jutut;
create policy tanaan_jutut_julkinen on public.tanaan_jutut for select to anon, authenticated
  using (exists (select 1 from public.tanaan_lehdet l where l.pvm = tanaan_jutut.pvm and l.tila = 'julkaistu' and l.pvm <= (now() at time zone 'Europe/Helsinki')::date));

revoke insert, update, delete on public.tanaan_lehdet, public.tanaan_jutut from anon, authenticated;
grant select on public.tanaan_lehdet, public.tanaan_jutut to anon, authenticated;

-- Pelikerrat yhteiseen pelimuoto_pelit-tauluun (avain = lehden päivä, taso = pähkinän tila ok/fail/skip).
alter table public.pelimuoto_pelit drop constraint pelimuoto_pelit_pelimuoto_check;
alter table public.pelimuoto_pelit add constraint pelimuoto_pelit_pelimuoto_check
  check (pelimuoto = any (array['kuvavisa', 'aanivisa', 'jarjesta', 'jarjesta_oma', 'ikajarjestys', 'tanaan']));
