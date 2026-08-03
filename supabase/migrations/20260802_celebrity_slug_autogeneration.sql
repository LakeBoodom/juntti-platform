-- SEO_STRATEGIA.md §5.4 (2026-08-02, ajettu tuotantokantaan MCP:llä)
-- Henkilön osoite (slug) syntyy automaattisesti nimestä, jotta uusi henkilö
-- saa oman sivunsa ilman käsityötä — riippumatta siitä lisätäänkö hänet
-- administa, skriptillä vai suoraan kannasta.

create or replace function slugify_name(src text)
returns text language sql immutable as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(translate(src,
          'àáâãäåāăąçćčďèéêëēėęěìíîïīįłñńňòóôõöøōőŕřśšşťùúûüūůűųýÿžźżÀÁÂÃÄÅĀĂĄÇĆČĎÈÉÊËĒĖĘĚÌÍÎÏĪĮŁÑŃŇÒÓÔÕÖØŌŐŔŘŚŠŞŤÙÚÛÜŪŮŰŲÝŸŽŹŻ',
          'aaaaaaaaacccdeeeeeeeeiiiiiilnnooooooorrssstuuuuuuuuyyzzzAAAAAAAAACCCDEEEEEEEEIIIIIILNNOOOOOOOORRSSSTUUUUUUUUYYZZZ')),
        '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'))
$$;

create or replace function unique_celebrity_slug(src text, self_id uuid)
returns text language plpgsql as $$
declare base text; candidate text; n int := 1;
begin
  base := nullif(slugify_name(src), '');
  if base is null then base := 'henkilo'; end if;
  candidate := base;
  while exists (select 1 from celebrities c where c.slug = candidate and (self_id is null or c.id <> self_id)) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end $$;

-- Täytetään vain kun slug puuttuu: käsin asetettua osoitetta ei ylikirjoiteta,
-- eikä olemassa oleva osoite muutu nimen muuttuessa (vanha linkki säilyy).
create or replace function celebrities_set_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := unique_celebrity_slug(new.name, new.id);
  end if;
  return new;
end $$;

drop trigger if exists trg_celebrities_slug on celebrities;
create trigger trg_celebrities_slug
  before insert or update on celebrities
  for each row execute function celebrities_set_slug();

-- Kertaluontoinen täyttö olemassa oleville (151 kpl 2026-08-02):
-- update celebrities set slug = null where slug is null or trim(slug) = '';
