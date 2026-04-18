"use server";

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
