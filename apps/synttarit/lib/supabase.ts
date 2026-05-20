// Server-side Supabase client Synttärit-frontille.
// Käyttää anon-keytä → respektoi RLS:ää.
import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  _client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return _client;
}

export const SITE_SLUG = "synttarit";
