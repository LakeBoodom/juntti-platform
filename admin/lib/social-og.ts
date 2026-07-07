// Jaettu apu OG-kuvien rakentamiseen some-postauksille — käytetään sekä
// kalenteri- että yksittäisen visan koukkugeneraattorissa (quizzes/[id]).

const OG_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "http://localhost:3001";

/** Hakee aktiivisen pohjakuvan (social_templates) annetulle content_scope:lle, jos sellainen on. */
export async function findTemplateImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  siteId: string,
  scope: "quiz" | "celebrity" | "countdown" | "general",
): Promise<string | null> {
  const { data } = await sb
    .from("social_templates")
    .select("image_url, content_scope, sort_order")
    .eq("site_id", siteId)
    .eq("active", true)
    .in("content_scope", [scope, "all"])
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as { image_url: string; content_scope: string }[];
  if (rows.length === 0) return null;
  // Suosi tarkkaa scope-osumaa yleisen "all" sijaan
  const exact = rows.find((r) => r.content_scope === scope);
  return (exact ?? rows[0]).image_url ?? null;
}

export function buildOgUrl(path: string, params: Record<string, string | null | undefined>) {
  const url = new URL(path, OG_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  // Palautetaan suhteellinen polku + query, jotta se toimii ympäristöstä riippumatta
  return `${url.pathname}${url.search}`;
}
