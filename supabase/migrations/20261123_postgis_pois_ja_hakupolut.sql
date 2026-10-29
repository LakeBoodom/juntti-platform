-- Supabase-tietoturva 27.10.2026 (ajettu tuotantoon MCP:llä, migraatio "postgis_pois_ja_hakupolut"):
-- rls_disabled_in_public (spatial_ref_sys) + extension_in_public (postgis).
-- PostGIS oli käytössä vain kunnat.geom-sarakkeelle (Kuntaliitos-aineiston teko); sivusto ei lue sitä.
-- Kuntien rajat säilytetään GeoJSONina (SRID 4326), sitten sarake ja laajennus poistetaan.
-- Jos paikkatietolaskentaa tarvitaan myöhemmin: create extension postgis with schema extensions;
-- ja geometria takaisin: ST_SetSRID(ST_GeomFromGeoJSON(geom_geojson::text), 4326).
alter table public.kunnat add column if not exists geom_geojson jsonb;
update public.kunnat set geom_geojson = ST_AsGeoJSON(geom)::jsonb where geom is not null;
comment on column public.kunnat.geom_geojson is 'Kunnan raja GeoJSONina (EPSG:4326). PostGIS-sarake geom poistettiin 27.10.2026 (Supabase-tietoturva).';
do $$
begin
  if (select count(*) from public.kunnat where geom is not null and geom_geojson is null) > 0 then
    raise exception 'GeoJSON-varmistus epäonnistui, PostGISia ei poistettu';
  end if;
end $$;
alter table public.kunnat drop column geom;
drop extension postgis;

-- function_search_path_mutable: kiinteä hakupolku
alter function public.helsinki_tanaan() set search_path = public, pg_temp;
alter function public.areyoou_md_in(text, text, date) set search_path = public, pg_temp;
