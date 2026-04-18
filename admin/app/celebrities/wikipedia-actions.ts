"use server";

function parseWikipediaUrl(
  rawUrl: string,
): { lang: string; slug: string } | null {
  try {
    const url = new URL(rawUrl.trim());
    if (!url.hostname.endsWith("wikipedia.org")) return null;
    const lang = url.hostname.split(".")[0];
    const m = url.pathname.match(/^\/wiki\/(.+)$/);
    if (!m) return null;
    return { lang, slug: m[1] };
  } catch {
    return null;
  }
}

// Full article plain text for AI grounding. Returns null on any failure.
export async function fetchWikipediaArticle(
  rawUrl: string,
): Promise<string | null> {
  const parsed = parseWikipediaUrl(rawUrl);
  if (!parsed) return null;
  const api = new URL(`https://${parsed.lang}.wikipedia.org/w/api.php`);
  api.searchParams.set("action", "query");
  api.searchParams.set("format", "json");
  api.searchParams.set("prop", "extracts");
  api.searchParams.set("explaintext", "1");
  api.searchParams.set("redirects", "1");
  api.searchParams.set("titles", decodeURIComponent(parsed.slug));
  try {
    const r = await fetch(api.toString(), {
      headers: { "User-Agent": "juntti-platform-admin/0.1 (+https://juntti.com)" },
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    const pages = j?.query?.pages;
    if (!pages) return null;
    const first = pages[Object.keys(pages)[0]];
    const extract: unknown = first?.extract;
    return typeof extract === "string" && extract.trim() ? extract : null;
  } catch {
    return null;
  }
}

// Pulls name, bio, and image from a Wikipedia article.
// Supports fi.wikipedia.org and en.wikipedia.org (or any language prefix).
export async function fetchFromWikipedia(rawUrl: string): Promise<
  | { ok: true; name: string; bio_short: string; image_url: string | null }
  | { ok: false; error: string }
> {
  try {
    const url = new URL(rawUrl.trim());
    if (!url.hostname.endsWith("wikipedia.org")) {
      return { ok: false, error: "Anna Wikipedia-URL (esim. fi.wikipedia.org/wiki/…)" };
    }
    const lang = url.hostname.split(".")[0]; // "fi", "en", …
    const pathMatch = url.pathname.match(/^\/wiki\/(.+)$/);
    if (!pathMatch) {
      return { ok: false, error: "URL ei näytä Wikipedia-sivulta" };
    }
    const slug = pathMatch[1];
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slug}`;

    const r = await fetch(apiUrl, {
      headers: {
        "User-Agent": "juntti-platform-admin/0.1 (+https://juntti.com)",
      },
    });
    if (!r.ok) {
      return {
        ok: false,
        error: `Wikipedia-haku epäonnistui: ${r.status}`,
      };
    }
    const data: any = await r.json();
    const bio = typeof data.extract === "string" ? data.extract : "";
    // Keep bio short: first sentence plus second if room.
    const trimmed = bio.length > 220 ? bio.slice(0, 217).replace(/\s+\S*$/, "") + "…" : bio;
    return {
      ok: true,
      name: typeof data.title === "string" ? data.title : "",
      bio_short: trimmed,
      image_url:
        data.thumbnail?.source ?? data.originalimage?.source ?? null,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message ?? "URL:n käsittely epäonnistui",
    };
  }
}
