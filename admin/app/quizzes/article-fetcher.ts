"use server";

/**
 * Hae artikkeliteksti URL:sta AI:n lähdemateriaaliksi.
 * - Wikipedia-URL → käyttää Wikipedia API:a (puhtain teksti)
 * - Muu URL → fetch HTML + cheerio + älykäs <article>/<main>-erottelu
 *
 * Palauttaa { label, text } tai virheen.
 */

import * as cheerio from "cheerio";
import { fetchWikipediaArticle } from "@/app/celebrities/wikipedia-actions";

const MAX_TEXT_LEN = 30_000; // per source — yhteensä max 50k Claude-promptissa

export type ArticleResult =
  | { ok: true; label: string; text: string }
  | { ok: false; url: string; error: string };

function isWikipedia(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    return u.hostname.endsWith("wikipedia.org");
  } catch {
    return false;
  }
}

/** Trimmaa tekstistä whitespace, säilyttää kappaleet. */
function cleanText(s: string): string {
  return s
    .replace(/[\t\r\f\v]+/g, " ")
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Hae artikkeliteksti yleisellä web-fetcherillä (cheerio). */
async function fetchGenericArticle(rawUrl: string): Promise<ArticleResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, url: rawUrl, error: "Virheellinen URL" };
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false, url: rawUrl, error: "Vain http(s)-URL:t sallittu" };
  }

  let html: string;
  try {
    const r = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; juntti-platform-admin/0.1; +https://tietoniekka.fi)",
        Accept: "text/html,application/xhtml+xml",
      },
      // 12s timeout — Vercel function rajoissa
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) {
      return { ok: false, url: rawUrl, error: `HTTP ${r.status}` };
    }
    html = await r.text();
  } catch (e: any) {
    return {
      ok: false,
      url: rawUrl,
      error: `Lataus epäonnistui: ${e?.message ?? "tuntematon virhe"}`,
    };
  }

  const $ = cheerio.load(html);

  // Poista skripti, tyylit, navigation, footer, ad-blokit
  $("script, style, noscript, nav, header, footer, aside, form, iframe, .ad, .ads, .advertisement, [aria-hidden='true']").remove();

  // Yritä löytää artikkelin pääelementti tärkeysjärjestyksessä
  const candidates = [
    "article",
    "main",
    "[role='main']",
    ".article-body",
    ".article-content",
    ".entry-content",
    ".post-content",
    ".content-main",
    "#content",
    ".story-body",
  ];
  let articleEl: cheerio.Cheerio<any> | null = null;
  for (const sel of candidates) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 200) {
      articleEl = el;
      break;
    }
  }
  // Fallback: koko body
  const targetEl = articleEl ?? $("body");
  const rawText = targetEl.text();
  const text = cleanText(rawText);

  if (text.length < 200) {
    return {
      ok: false,
      url: rawUrl,
      error: "Sivulla ei näytä olevan artikkelisisältöä (alle 200 merkkiä). Kokeile toista URL:ää.",
    };
  }

  // Käytä page title:a label:nä, fallback hostname
  const title = $("title").first().text().trim() || url.hostname;
  return {
    ok: true,
    label: title.slice(0, 120),
    text: text.slice(0, MAX_TEXT_LEN),
  };
}

/** Hae artikkeli — reitittää Wikipedia API:lle tai yleiselle fetcherille. */
export async function fetchArticle(rawUrl: string): Promise<ArticleResult> {
  const url = rawUrl.trim();
  if (!url) return { ok: false, url, error: "URL puuttuu" };

  if (isWikipedia(url)) {
    const text = await fetchWikipediaArticle(url);
    if (!text) {
      return {
        ok: false,
        url,
        error: "Wikipedia-artikkelia ei löytynyt — tarkista URL.",
      };
    }
    let label = "Wikipedia";
    try {
      const u = new URL(url);
      const slug = decodeURIComponent(u.pathname.replace(/^\/wiki\//, ""));
      label = `Wikipedia: ${slug.replace(/_/g, " ")}`;
    } catch {/* ignore */}
    return { ok: true, label, text: text.slice(0, MAX_TEXT_LEN) };
  }

  return fetchGenericArticle(url);
}

/** Hae monta lähdettä rinnakkain. Yhdistää tulokset yhdeksi tekstiksi. */
export async function fetchArticles(rawUrls: string[]): Promise<{
  combinedText: string;
  combinedLabel: string;
  errors: Array<{ url: string; error: string }>;
}> {
  const urls = rawUrls.map((s) => s.trim()).filter(Boolean);
  if (urls.length === 0) {
    return { combinedText: "", combinedLabel: "", errors: [] };
  }

  const results = await Promise.all(urls.map((u) => fetchArticle(u)));
  const ok = results.filter((r): r is Extract<ArticleResult, { ok: true }> => r.ok);
  const errors = results
    .filter((r): r is Extract<ArticleResult, { ok: false }> => !r.ok)
    .map((r) => ({ url: r.url, error: r.error }));

  if (ok.length === 0) {
    return { combinedText: "", combinedLabel: "", errors };
  }

  const combinedText = ok
    .map((r, i) => `--- LÄHDE ${i + 1}: ${r.label} ---\n${r.text}`)
    .join("\n\n");
  const combinedLabel =
    ok.length === 1
      ? ok[0].label
      : `${ok.length} lähdettä (${ok.map((r) => r.label).join(", ").slice(0, 200)})`;
  return { combinedText, combinedLabel, errors };
}
