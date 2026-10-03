-- Briefin nimi oli 20261021_fact_attributes_scope.sql, mutta 20261021 on jo käytössä
-- (karpat_lukko_kalpa_fokus). Kannassa versio 20261002162750 'fact_attributes_scope'.
-- Idempotentti: voi ajaa uudelleen.
-- Ajettu tuotantoon Supabase MCP:llä 2.10.2026 (Cowork). Lisätään repoon vain kirjanpidoksi.
-- Seurakohtaiset (tai muut rajatut) attribuuttiarvot: scope '' = koko ura / oletus.
alter table fact_attributes add column if not exists scope text not null default '';
alter table fact_attributes drop constraint if exists duel_attributes_pkey;
alter table fact_attributes add constraint duel_attributes_pkey primary key (entity_id, attr_key, scope);
comment on column fact_attributes.scope is 'Rajaus, esim. seura (Tappara/HIFK/TPS). Tyhjä = koko ura. Kumpi?-peli lukee vain scope = ''''.';
