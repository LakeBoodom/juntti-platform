-- Päivän visa: yöajo täyttää seuraavat 7 päivää (toteutusohje 19.9.2026,
-- ehdotus 2). pg_cron ajaa UTC:ssä; Suomen keskiyö on 21:00 (kesä) tai
-- 22:00 (talvi) UTC → ajetaan molempina, 5 min yli. Täyttö on idempotentti,
-- joten toinen ajo ei muuta mitään. Päivät järjestyksessä, jotta kunkin
-- päivän "ei samaa kokoelmaa kuin eilen" näkee edellisen päivän valinnan.
select cron.schedule(
  'paivan-visa-taytto',
  '5 21,22 * * *',
  $$ do $d$
     declare i int;
     begin
       for i in 0..6 loop
         perform public.paivan_visa_varmista('62d75f45-a857-4fdd-9a45-b70ceeee98a8'::uuid, public.helsinki_tanaan() + i);
       end loop;
     end $d$; $$
);
