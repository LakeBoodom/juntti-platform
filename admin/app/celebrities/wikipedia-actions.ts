"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";

// The REST API now returns thumbnails as thumb.wikimedia.org/…?utm_… — the
// public sites expect the canonical upload.wikimedia.org form (same path).
function normalizeWikimediaImage(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    if (url.hostname === "thumb.wikimedia.org") url.hostname = "upload.wikimedia.org";
    if (url.hostname.endsWith("wikimedia.org")) url.search = "";
    return url.toString();
  } catch {
    return u;
  }
}

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
      image_url: normalizeWikimediaImage(
        data.thumbnail?.source ?? data.originalimage?.source,
      ),
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message ?? "URL:n käsittely epäonnistui",
    };
  }
}

export type BackfillImagesResult = {
  updated: { name: string; image_url: string }[];
  missing: { name: string; reason: string }[];
  remaining: number; // rows left unprocessed because the time budget ran out
};

// Fills celebrities.image_url from each person's own Wikipedia page for rows
// that have a wikipedia_url but no image. Touches ONLY image_url — never the
// name, bio, quizzes or any other field. Sequential with a short pause so we
// stay polite towards the Wikimedia REST API.
export async function backfillCelebrityImages(): Promise<
  { ok: true; result: BackfillImagesResult } | { ok: false; error: string }
> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("celebrities")
    .select("id, name, wikipedia_url, image_url")
    .not("wikipedia_url", "is", null)
    .or("image_url.is.null,image_url.eq.")
    .order("birth_date", { ascending: true });
  if (error) return { ok: false, error: error.message };

  const rows = (data ?? []).filter((r) => r.wikipedia_url?.trim());
  const result: BackfillImagesResult = { updated: [], missing: [], remaining: 0 };
  // Server actions share the page's maxDuration (60 s) — stop well before it.
  const deadline = Date.now() + 45_000;

  for (let i = 0; i < rows.length; i++) {
    if (Date.now() > deadline) {
      result.remaining = rows.length - i;
      break;
    }
    const row = rows[i];
    if (i > 0) await new Promise((res) => setTimeout(res, 200));

    const parsed = parseWikipediaUrl(row.wikipedia_url!);
    if (!parsed) {
      result.missing.push({ name: row.name, reason: "Wikipedia-URL ei kelpaa" });
      continue;
    }
    try {
      const r = await fetch(
        `https://${parsed.lang}.wikipedia.org/api/rest_v1/page/summary/${parsed.slug}`,
        { headers: { "User-Agent": "juntti-platform-admin/0.1 (+https://juntti.com)" } },
      );
      if (!r.ok) {
        result.missing.push({
          name: row.name,
          reason: r.status === 404 ? "sivua ei löydy (404)" : `Wikipedia-haku epäonnistui: ${r.status}`,
        });
        continue;
      }
      const d: any = await r.json();
      const img = normalizeWikimediaImage(d.thumbnail?.source ?? d.originalimage?.source);
      if (!img) {
        result.missing.push({ name: row.name, reason: "sivulla ei pääkuvaa" });
        continue;
      }
      const { error: upErr } = await admin
        .from("celebrities")
        .update({ image_url: img })
        .eq("id", row.id);
      if (upErr) {
        result.missing.push({ name: row.name, reason: `tallennus epäonnistui: ${upErr.message}` });
        continue;
      }
      result.updated.push({ name: row.name, image_url: img });
    } catch (err: any) {
      result.missing.push({ name: row.name, reason: err?.message ?? "haku epäonnistui" });
    }
  }

  revalidatePath("/celebrities");
  return { ok: true, result };
}
