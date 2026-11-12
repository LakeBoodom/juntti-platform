-- 11.11.2026 (Heikki): kaupunkisivun tekstihaun varahaku poistettu; henkilöosio lukee vain born_in-suhteista
-- (H5, 20261206_kaupungit_entity_id). Lakkautettujen kuntien tieto on suhteiden detail-kentässä ("Nastola (nyk. Lahti)").
-- Ajetaan vasta, kun koodi ilman vanhat_kunnat-saraketta on tuotannossa (vanha koodi valitsee sarakkeen).
-- Poistettu sisältö: jyvaskyla {Jyväskylän maalaiskunnassa}, kouvola {Valkealassa, Jaalassa}, lahti {Nastolassa},
-- lohja {Sammatissa}, mikkeli {Mikkelin maalaiskunnassa}, oulu {Haukiputaalla}, rauma {Rauman maalaiskunnassa},
-- seinajoki {Nurmossa, Peräseinäjoella}, vantaa {Helsingin maalaiskunnassa}.

alter table public.kaupungit drop column if exists vanhat_kunnat;
