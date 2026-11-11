-- H5 "Täältä kotoisin" (11.11.2026): kaupunkisivu kytketään tietomallin kaupunkientiteettiin.
-- Henkilöosio luetaan born_in-suhteista (fact_relationships.to_entity = kaupungit.entity_id),
-- joten kaupungin nimeä ei enää verrata tekstinä koodissa.

alter table public.kaupungit
  add column if not exists entity_id uuid references public.fact_entities(id);

comment on column public.kaupungit.entity_id is
  'Tietomallin kaupunkientiteetti (fact_entities.kind = city). Kaupunkisivun henkilöosio: born_in-suhteet tähän entiteettiin.';

-- Kirkkonummi ja Tuusula puuttuvat tietomallista. Luodaan kuten H2:n kunnat (Nurmijärvi):
-- luonnos (ei näy kaupunkipeleissä eikä anonille), prominence 3, role_label 'Kunta'.
insert into public.fact_entities (name, kind, domain, role_label, show_role, status, prominence)
select v.nimi, 'city', 'city', 'Kunta', false, 'draft', 3
from (values ('Kirkkonummi'), ('Tuusula')) as v(nimi)
where not exists (
  select 1 from public.fact_entities e where e.kind = 'city' and lower(e.name) = lower(v.nimi)
);

-- Kytkentä nimellä (kertaluonteinen täyttö; jatkossa vain entity_id).
update public.kaupungit k
set entity_id = e.id
from public.fact_entities e
where k.entity_id is null
  and e.kind = 'city'
  and lower(e.name) = lower(k.nimi)
  and (select count(*) from public.fact_entities x where x.kind = 'city' and lower(x.name) = lower(k.nimi)) = 1;
