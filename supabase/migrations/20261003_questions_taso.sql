-- Kysymyskohtainen vaikeustaso 1–5 (25.9.2026) Tupla tai kuitti -pelimuotoa varten:
-- peli etenee helposta vaikeaan (askeleet 1,1,2,2,3,3,4,4,5,5). 1 = satunnainenkin
-- katsoja tietää, 5 = syvää nippelitietoa. Null = ei luokiteltu (ei käytetä pelissä).
alter table questions add column if not exists taso smallint check (taso between 1 and 5);
