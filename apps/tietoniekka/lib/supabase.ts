// Server-side Supabase client Tietoniekka-frontille.
// Käyttää anon-keytä → respektoi RLS:ää (vain active=true riveihin pääsee).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@juntti/db";

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Build-aikana tai env puuttuu — palauta null jotta query-funktiot pystyvät
    // hyppäämään yli ilman crashia. Runtime-kutsuilla Vercelillä env on aina paikalla.
    return null;
  }
  _client = createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
  return _client;
}

export const SITE_SLUG = "tietoniekka";
