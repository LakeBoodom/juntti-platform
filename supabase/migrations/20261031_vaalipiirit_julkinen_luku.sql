-- Vaalit ja politiikka -hub (5.10.2026): vaalipiirit-taulussa on RLS päällä (automaattisesti uusille
-- tauluille), mutta ei yhtään policya → sivuston anon-avain ei näe 13 vaalipiiriä eikä paikkamääriä.
-- Taulu on julkista viitedataa (nimet, maakunnat, paikat 2023).
-- EI AJETTU — odottaa Heikin hyväksyntää.
create policy "vaalipiirit public read" on vaalipiirit for select using (true);
