import { createClient } from "@supabase/supabase-js";
import type { Database } from "@juntti/db";

// Read-only public client for the juntti.com front-end. Uses the publishable
// (anon) key — RLS on the tables enforces access. No cookie handling needed
// because the public site has no auth.
let client: ReturnType<typeof createClient<Database>> | null = null;

export function getPublicSupabase() {
  if (!client) {
    client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
