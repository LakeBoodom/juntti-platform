-- Laadulliset järjestyspakat (4.10.2026): henkilösivu ja /peli/jarjesta/oma lukevat mittarien
-- otsikon, yksikön ja suunnan fact_attribute_defs-taulusta anon-avaimella. Nykyinen policy sallii
-- luvun vain enabled=true -riveille, mutta enabled koskee vain Kumpi?-peliä (lib/duel.ts suodattaa
-- enabled=true itse). Taulussa ei ole mitään salaista (kysymystekstit, yksiköt, rajat).
-- Ajettu kantaan 4.10.2026 Heikin hyväksynnällä.
drop policy if exists "fact_attribute_defs public read" on fact_attribute_defs;
create policy "fact_attribute_defs public read" on fact_attribute_defs for select using (true);
