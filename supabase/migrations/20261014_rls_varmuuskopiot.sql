-- 30.9.2026: Supabase-neuvojan kriittinen hälytys (rls_disabled_in_public 60 kpl, sensitive_columns_exposed).
-- Syy: istuntojen varmuuskopiot (create table … as select) syntyivät ilman RLS:ää, jolloin anon-avaimella
-- saattoi lukea, muokata ja poistaa niitä (mm. _jp_plays_backup_20260926: session_id).

-- 1) RLS päälle kaikille public-skeeman varmuuskopioille (ilman politiikkoja = vain service role / postgres).
do $$
declare r record;
begin
  for r in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
      and c.relname ~ '^_.*backup'
  loop
    execute format('alter table public.%I enable row level security', r.relname);
  end loop;
end $$;

-- 2) Jatkossa jokainen uusi public-skeeman taulu saa RLS:n automaattisesti (event trigger).
create or replace function public.rls_uusille_tauluille()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare obj record;
begin
  for obj in select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type = 'table' and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', obj.object_identity);
  end loop;
end $$;
revoke execute on function public.rls_uusille_tauluille() from public, anon, authenticated;
drop event trigger if exists rls_uusille_tauluille;
create event trigger rls_uusille_tauluille on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_uusille_tauluille();

-- 3) spatial_ref_sys (PostGIS, supabase_adminin omistama): RLS:ää ei voi kytkeä eikä postgres voi
--    perua supabase_adminin antamia oikeuksia — revoke ajettiin, mutta se ei tehonnut. Vaatii Supabasen tuen.
revoke insert, update, delete, truncate, trigger, references on public.spatial_ref_sys from anon, authenticated;
