// Singleton Supabase clients — never create inline clients anywhere else.
// Browser client uses the anon/publishable key (RLS enforced).
// Server client uses the service role key (bypasses RLS — server-only).

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { Database } from './types'

// ---- Browser singleton ----
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}

// ---- Server client factory (cookies come from Next's cookie store) ----
export function getSupabaseServer(cookieStore: {
  getAll: () => { name: string; value: string }[]
  set?: (name: string, value: string, options: any) => void
}) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          try {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set?.(name, value, options)
            )
          } catch {
            // Server Components can't set cookies; safe to ignore
          }
        },
      },
    }
  )
}

// ---- Service-role client (server-only, bypasses RLS — never import from client code) ----
import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must not be called from client code')
  }
  if (!adminClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')
    adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }
  return adminClient
}
