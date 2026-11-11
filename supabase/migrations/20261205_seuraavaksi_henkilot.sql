-- "PELAA SEURAAVAKSI" kaikkiin henkilövisoihin (Heikki 11.11.2026): mittaukseen toinen ryhmä 'henkilot'
-- (urheilijat pysyvät ryhmässä 'urheilu'). Ilman tätä henkilövisojen näytöt ja klikkaukset hylätään.
alter table public.seuraavaksi_tapahtumat drop constraint if exists seuraavaksi_tapahtumat_pilotti_check;
alter table public.seuraavaksi_tapahtumat add constraint seuraavaksi_tapahtumat_pilotti_check
  check (pilotti in ('urheilu', 'henkilot'));
