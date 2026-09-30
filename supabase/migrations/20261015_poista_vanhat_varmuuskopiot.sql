-- 30.9.2026 (Heikin lupa): poistettu 107 yli kaksi viikkoa vanhaa varmuuskopiotaulua (nimen päiväys
-- 23.8.–15.9.2026) public- ja backups-skeemoista, yhteensä noin 4 MB. Tarkistettu ennen poistoa: ei riippuvia
-- näkymiä, funktioita eikä viittauksia koodissa. Jäljelle 93 varmuuskopiota (16.–30.9.), kaikilla RLS.
do $$
declare r record;
begin
  for r in
    select n.nspname sch, c.relname nimi
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'backups') and c.relkind = 'r' and c.relname ~ 'backup'
      and to_date(coalesce(substring(c.relname from '(20[0-9]{6})'),
                           replace(substring(c.relname from '(20[0-9]{2}_[0-9]{2}_[0-9]{2})'), '_', '')), 'YYYYMMDD') < date '2026-09-16'
  loop
    execute format('drop table %I.%I', r.sch, r.nimi);
  end loop;
end $$;
