-- Instagram-pohjat kierros 5 (Claude Design v0.4, Heikin valinta 24.9.2026):
-- 5a/5b korvaavat 4c:n, 5d korvaa 4e:n, henkilökortit 5f/5h/5i/5m korvaavat
-- synttäreiden 4h/4r:n (jotka jäävät kuvattomille henkilöille), 5n = juontajat ympäristössä.

alter table ig_julkaisut drop constraint ig_julkaisut_pohja_check;
alter table ig_julkaisut add constraint ig_julkaisut_pohja_check check (pohja = any (array[
  'V-A','V-B','V-C','V-D','V-E','S-A','S-B','S-C','S-D',
  '4a','4b','4c','4d','4e','4f','4g','4h','4i','4j','4l','4m','4n','4o','4p','4q','4r',
  '5a','5b','5d','5n','5f','5h','5i','5m'
]));

-- Synttäreiden automaattiset luonnokset suunnitellaan uudelleen: pohja määräytyy nyt
-- henkilön kuvasta. Käsin valitut, hyväksytyt ja julkaistut jäävät ennalleen.
delete from ig_julkaisut
where slotti = 'synttarit'
  and tila = 'luonnos'
  and not pohja_valittu_kasin
  and pohja in ('4h', '4r');
