// Next.js App Router Supabase helpers — read cookies from next/headers.
import { cookies } from "next/headers";
import { getSupabaseServer, getSupabaseAdmin } from "@juntti/db";

export async function supabaseFromCookies() {
  const store = await cookies();
  return getSupabaseServer({
    getAll: () => store.getAll().map((c) => ({ name: c.name, value: c.value })),
    set: (name, value, options) => {
      try {
        store.set(name, value, options);
      } catch {
        // Ignored in Server Components
      }
    },
  });
}

export { getSupabaseAdmin };
