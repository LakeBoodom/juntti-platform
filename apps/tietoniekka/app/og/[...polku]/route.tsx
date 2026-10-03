// SEO-erä A2 (2.10.2026): jakokuvat (og:image) takaisin. 2.0-julkaisussa 1.0:n /peli/og-reitti
// poistui, ja koska lapsisivun openGraph korvaa juuren openGraphin, /visa/*- ja /kokoelma/*-
// sivuilta puuttui og:image kokonaan → WhatsApp/Facebook/X-esikatselu ilman kuvaa.
//
// Yksi reitti kaikille jakokuville (1200×630):
//   /og/visa/<slug>[?tulos=8-10]   visa: hero-kuva tai henkilön kuva 3:4-korttina; tulosvariantti
//   /og/mega/<slug>                megavisa
//   /og/kuvavisa/<kortisto>        kuvavisa (liput, vaakunat, linnut …, viikko)
//   /og/kokoelma/<avain>           kokoelmahub
//   /og/sivu/<avain>               pelimuodot ja muut sivut (tupla-tai-kuitti, kuntaliitos …)
//
// Satori (ImageResponse) ei osaa WebP:tä, joten kuvat muunnetaan sharpilla JPEG:ksi. Kuvat luetaan
// tiedostojärjestelmästä (next.config.mjs: outputFileTracingIncludes), jolloin myös preview-
// julkaisun uudet kuvat toimivat eikä Vercelin deployment protection estä hakua.

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { resolveCollection, COLLECTION_ACCENT, COLLECTION_BG, COLLECTION_LABEL } from "@/lib/visanKokoelma";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { MEGA_FEATURED, MEGA_GRID } from "@/lib/megavisat";
import { NAV_COLLECTIONS } from "@/lib/nav";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const TAUSTA = "#0f0d07";
const KULTA = "#E8A320";

/* ── Kuvat ─────────────────────────────────────────────────────────────── */

async function paikallinen(polku: string): Promise<Buffer | null> {
  if (!polku.startsWith("/")) return null;
  try {
    return await readFile(join(process.cwd(), "public", decodeURIComponent(polku)));
  } catch {
    return null;
  }
}

/** Wikimedian täysikokoinen tiedosto → 600 px pikkukuva (vähemmän siirrettävää). */
function wikimediaThumb(url: string): string {
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/);
  if (!m) return url;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/600px-${m[3]}`;
}

async function etakuva(url: string): Promise<Buffer | null> {
  for (const u of [wikimediaThumb(url), url]) {
    try {
      const r = await fetch(u, { headers: { "User-Agent": "Tietoniekka-og/1.0 (https://tietoniekka.fi)" } });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch {
      /* seuraava */
    }
  }
  return null;
}

/** Kuva data-URI:ksi annettuun kokoon rajattuna (cover + focal). */
async function kuvaUri(
  lahde: string | null | undefined,
  w: number,
  h: number,
  focal: { x?: number | null; y?: number | null } = {},
  sumea = false,
): Promise<string | null> {
  if (!lahde) return null;
  const raw = lahde.startsWith("http") ? await etakuva(lahde) : await paikallinen(lahde);
  if (!raw) return null;
  try {
    const img = sharp(raw);
    const meta = await img.metadata();
    const sw = meta.width ?? w, sh = meta.height ?? h;
    const s = Math.max(w / sw, h / sh);
    const rw = Math.round(sw * s), rh = Math.round(sh * s);
    const fx = Math.min(1, Math.max(0, Number(focal.x ?? 0.5)));
    const fy = Math.min(1, Math.max(0, Number(focal.y ?? 0.4)));
    const left = Math.round((rw - w) * fx), top = Math.round((rh - h) * fy);
    let kuva = sharp(raw).resize(rw, rh).extract({ left, top, width: w, height: h });
    if (sumea) kuva = kuva.blur(28).modulate({ brightness: 0.6 });
    const out = await kuva.jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

let fontit: { name: string; data: Buffer; weight: 700 | 900; style: "normal" }[] | null = null;
async function haeFontit() {
  if (fontit) return fontit;
  const [b, k] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/archivo-900.woff")),
    readFile(join(process.cwd(), "assets/og/archivo-700.woff")),
  ]);
  fontit = [
    { name: "Archivo", data: b, weight: 900, style: "normal" },
    { name: "Archivo", data: k, weight: 700, style: "normal" },
  ];
  return fontit;
}

/* ── Asettelu ──────────────────────────────────────────────────────────── */

type Kortti = {
  eyebrow: string;
  otsikko: string;
  accent: string;
  tausta?: string | null; // koko kuvan tausta (data-URI)
  henkilo?: string | null; // 3:4-kortti oikealla (data-URI)
  tulos?: { score: number; total: number } | null;
  alarivi?: string;
};

function otsikkoKoko(t: string, leveys: number): number {
  const pisin = Math.max(...t.split(/\s+/).map((w) => w.length), 1);
  // Archivo 900 versaali ≈ 0,72 em / merkki → pisin sana mahtuu riville
  const sanaRaja = leveys / (pisin * 0.72);
  const pituusRaja = t.length > 48 ? 54 : t.length > 32 ? 64 : t.length > 18 ? 78 : 92;
  return Math.floor(Math.min(sanaRaja, pituusRaja));
}

/* Turva-alue (Heikki 3.10.2026): WhatsApp näyttää linkin esikatselun neliönä, joka rajataan kuvan
   keskeltä (x 285–915). Kaikki olennainen — pisteet, nimi, henkilökuva, logo — on tällä alueella;
   reunoilla on vain taustakuva (henkilövisoissa saman kuvan sumennettu versio), jolloin leveä
   esikatselu (Facebook, X, lähetetty WhatsApp-viesti) näyttää silti täydeltä. */
const TURVA_X = (W - H) / 2; // 285
const TURVA_PAD = 26;
const SISA = H - 2 * TURVA_PAD; // 578

async function piirra(k: Kortti, cache: string) {
  const henkilo = !!k.henkilo;
  const tekstiLeveys = henkilo ? 300 : SISA;
  const otsikko = k.otsikko.length > 80 ? k.otsikko.slice(0, 77) + "…" : k.otsikko;
  const raja = henkilo ? 46 : k.tulos ? 50 : 72;
  const koko = Math.min(otsikkoKoko(otsikko, tekstiLeveys), raja);
  const pisteKoko = henkilo ? 130 : 150;

  const tekstit = (
    <div style={{ display: "flex", flexDirection: "column", width: tekstiLeveys }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: k.accent, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: k.accent, marginRight: 12 }} />
        {k.eyebrow}
      </div>
      {k.tulos && (
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ display: "flex", fontSize: pisteKoko, fontWeight: 900, lineHeight: 1, color: KULTA }}>{String(k.tulos.score)}</div>
          <div style={{ display: "flex", fontSize: pisteKoko / 2, fontWeight: 900, lineHeight: 1, color: "rgba(255,251,242,0.6)", marginLeft: 6 }}>{`/${k.tulos.total}`}</div>
        </div>
      )}
      <div style={{ display: "flex", fontSize: koko, fontWeight: 900, lineHeight: 0.98, textTransform: "uppercase", letterSpacing: -1 }}>
        {otsikko}
      </div>
      {k.tulos && (
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, marginTop: 20, color: "#fffbf2" }}>Voitatko kaverisi?</div>
      )}
    </div>
  );

  const img = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", background: TAUSTA, fontFamily: "Archivo", color: "#fffbf2" }}>
        {k.tausta && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={k.tausta} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, objectFit: "cover" }} alt="" />
        )}
        <div
          style={{
            position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex",
            background: k.tausta
              ? "radial-gradient(60% 95% at 50% 50%, rgba(15,13,7,0.9) 0%, rgba(15,13,7,0.8) 55%, rgba(15,13,7,0.35) 100%)"
              : `radial-gradient(120% 90% at 50% 20%, ${k.accent}33, rgba(15,13,7,0) 60%)`,
          }}
        />
        <div style={{ position: "absolute", left: TURVA_X + TURVA_PAD, top: TURVA_PAD, width: SISA, height: SISA, display: "flex", alignItems: "center", justifyContent: henkilo ? "space-between" : "flex-start" }}>
          {tekstit}
          {k.henkilo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={k.henkilo} width={252} height={336} alt=""
              style={{ width: 252, height: 336, borderRadius: 18, border: "2px solid rgba(255,251,242,0.2)" }} />
          )}
        </div>
        <div style={{ position: "absolute", left: TURVA_X + TURVA_PAD, bottom: 34, display: "flex", fontSize: 24, fontWeight: 900, letterSpacing: 1 }}>
          <span style={{ color: KULTA }}>TIETO</span>
          <span>NIEKKA</span>
          {k.alarivi && <span style={{ marginLeft: 18, fontSize: 19, fontWeight: 700, color: "rgba(255,251,242,0.6)", alignSelf: "center" }}>{k.alarivi}</span>}
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await haeFontit() },
  );
  /* PNG → JPEG: ImageResponse tuottaa PNG:n (~800 kt valokuvalla); WhatsApp jättää usein
     yli ~300 kt:n esikatselukuvan näyttämättä. */
  const jpg = await sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": cache } });
}

/* ── Sisältö ───────────────────────────────────────────────────────────── */

function parseTulos(raw: string | null): { score: number; total: number } | null {
  const m = raw ? /^(\d{1,2})-(\d{1,2})$/.exec(raw) : null;
  if (!m) return null;
  const score = Number(m[1]), total = Number(m[2]);
  return total >= 1 && total <= 60 && score >= 0 && score <= total ? { score, total } : null;
}

const PITKA = "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400";

async function visaKortti(slug: string, tulos: ReturnType<typeof parseTulos>): Promise<Kortti | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const siteId = await getSiteId();
  let q = sb
    .from("quizzes")
    .select("id, title, display_title, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, game_mode" as never)
    .eq("slug", slug)
    .eq("status", "published");
  if (siteId) q = q.eq("site_id", siteId);
  const { data } = await q.maybeSingle();
  const quiz = data as unknown as {
    id: string; title: string; display_title: string | null; collection: string | null; category: string | null;
    genre: string | null; hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null;
  } | null;
  if (!quiz) return null;
  const r = resolveCollection(quiz);
  const otsikko = quiz.display_title ?? quiz.title;
  if (quiz.collection === "tunnetut-henkilot") {
    const { data: c } = await sb.from("celebrities").select("name, image_url").eq("trivia_quiz_id", quiz.id).maybeSingle();
    const cel = c as { name: string; image_url: string | null } | null;
    return {
      eyebrow: r.label,
      otsikko: cel?.name ?? otsikko,
      accent: r.accent,
      henkilo: await kuvaUri(cel?.image_url, 252, 336, { x: 0.5, y: 0.2 }),
      tausta: await kuvaUri(cel?.image_url, W, H, { x: 0.5, y: 0.3 }, true),
      tulos,
      alarivi: tulos ? undefined : "Tietovisa",
    };
  }
  return {
    eyebrow: r.label,
    otsikko,
    accent: r.accent,
    tausta: await kuvaUri(quiz.hero_image ?? r.bg, W, H, { x: quiz.hero_focal_x, y: quiz.hero_focal_y }),
    tulos,
  };
}

const KUVAVISA_KUVA: Record<string, string> = {
  liput: "/20/etusivu/banneri-kuvavisat-liput.webp",
  vaakunat: "/20/teema-liput.webp",
  vaakuna: "/20/teema-liput.webp",
  linnut: "/20/etusivu/banneri-kuvavisat-elaimet.webp",
  elaimet: "/20/etusivu/banneri-kuvavisat-elaimet.webp",
  kasvit: "/20/teema-luonto.webp",
  maalaukset: "/20/etusivu/banneri-kuvavisat-maalaukset.webp",
  rakennukset: "/20/etusivu/banneri-kuvavisat-rakennus.webp",
  henkilot: "/20/teema-tunnetut-henkilot.webp",
  kaupungit: "/20/etusivu/coll-kaupungit.webp",
  viikko: "/20/kuvavisat/hero.webp",
};

const SIVUT: Record<string, { eyebrow: string; otsikko: string; kuva: string; accent: string }> = {
  "tupla-tai-kuitti": { eyebrow: "Pelimuoto", otsikko: "Tupla tai kuitti", kuva: "/20/tupla/banneri-desk.webp", accent: "#B6FF3C" },
  kuntaliitos: { eyebrow: "Pelimuoto", otsikko: "Kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", accent: "#E8A320" },
  rajanaapurit: { eyebrow: "Pelimuoto", otsikko: "Rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", accent: "#4FD1F5" },
  ikajarjestys: { eyebrow: "Tietoketju", otsikko: "Ikäjärjestys", kuva: "/20/teema-tunnetut-henkilot.webp", accent: "#C9A96A" },
  megavisat: { eyebrow: "Pitkät visat", otsikko: "Megavisat", kuva: "/20/megavisa.webp", accent: KULTA },
  kokoelmat: { eyebrow: "Tietoniekka", otsikko: "Kaikki kokoelmat", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
  viikkovisa: { eyebrow: "Kuvavisa", otsikko: "Viikkovisa", kuva: "/20/kuvavisat/hero.webp", accent: "#22D3EE" },
  "kuvien-lahteet": { eyebrow: "Tietoniekka", otsikko: "Kuvien lähteet", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
};

async function kokoelmaKortti(avain: string): Promise<Kortti | null> {
  const nav = NAV_COLLECTIONS.find((c) => c.slug === avain);
  const r = resolveCollection({ collection: avain, category: avain === "tiede" ? "tiede-teknologia" : avain === "kaupungit" ? "kaupungit" : null, genre: avain === "jaakiekko" || avain === "jalkapallo" ? avain : null });
  const kuva = avain === "kuvavisat" ? "/20/kuvavisat/hero.webp" : COLLECTION_BG[avain] ?? r.bg;
  if (!nav && !COLLECTION_LABEL[avain] && avain !== "kuvavisat") return null;
  return {
    eyebrow: "Kokoelma",
    otsikko: nav?.label ?? COLLECTION_LABEL[avain] ?? (avain === "kuvavisat" ? "Kuvavisat" : avain),
    accent: nav?.color ?? COLLECTION_ACCENT[avain] ?? r.accent,
    tausta: await kuvaUri(kuva, W, H),
    alarivi: "Tietovisat",
  };
}

export async function GET(req: Request, ctx: { params: Promise<{ polku: string[] }> }) {
  const { polku } = await ctx.params;
  const [tyyppi, avainRaw] = polku;
  const avain = decodeURIComponent(avainRaw ?? "");
  const url = new URL(req.url);
  let kortti: Kortti | null = null;

  if (tyyppi === "visa" && avain) {
    kortti = await visaKortti(avain, parseTulos(url.searchParams.get("tulos")));
  } else if (tyyppi === "mega" && avain) {
    const m = [MEGA_FEATURED, ...MEGA_GRID].find((x) => x.slug === avain);
    const sb = getSupabase();
    const { data } = sb
      ? await sb.from("quizzes").select("title, display_title" as never).eq("slug", avain).maybeSingle()
      : { data: null };
    const q = data as unknown as { title: string; display_title: string | null } | null;
    if (q || m) kortti = { eyebrow: "Megavisa", otsikko: q?.display_title ?? q?.title ?? m?.tag ?? avain, accent: KULTA, tausta: await kuvaUri(m?.img ?? "/20/megavisa.webp", W, H) };
  } else if (tyyppi === "kuvavisa" && avain) {
    const kat = KATEGORIAT.find((k) => k.type === avain || (avain === "vaakuna" && k.type === "vaakunat"));
    const otsikko = avain === "viikko" ? "Viikkovisa" : avain === "kaupungit" ? "Suomen kaupungit" : kat?.otsikko;
    if (otsikko) kortti = { eyebrow: "Kuvavisa", otsikko, accent: kat?.accent ?? "#22D3EE", tausta: await kuvaUri(KUVAVISA_KUVA[avain], W, H), alarivi: "Tunnista kuvasta" };
  } else if (tyyppi === "kokoelma" && avain) {
    kortti = await kokoelmaKortti(avain);
  } else if (tyyppi === "sivu" && SIVUT[avain]) {
    const s = SIVUT[avain];
    kortti = { eyebrow: s.eyebrow, otsikko: s.otsikko, accent: s.accent, tausta: await kuvaUri(s.kuva, W, H) };
  }

  if (!kortti) {
    const oletus = await paikallinen("/og-image.png");
    return new Response(oletus ? new Uint8Array(oletus) : null, {
      status: oletus ? 200 : 404,
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=600" },
    });
  }
  return piirra(kortti, kortti.tulos ? "public, max-age=86400, s-maxage=604800" : PITKA);
}
