// SEO-erä A2 (2.10.2026): jakokuvat (og:image) takaisin. 2.0-julkaisussa 1.0:n /peli/og-reitti
// poistui, ja koska lapsisivun openGraph korvaa juuren openGraphin, /visa/*- ja /kokoelma/*-
// sivuilta puuttui og:image kokonaan → WhatsApp/Facebook/X-esikatselu ilman kuvaa.
//
// Yksi reitti kaikille jakokuville (1200×630):
//   /og/visa/<slug>                visa: hero-kuva tai henkilön kuva 3:4-korttina
//   /og/visa/<slug>?tulos=8-10     postikortti (Tulosnäkymä ja jakaminen, vaihe D, 22.10.2026; CD-arkki 1a/1b/1d/1e)
//   /og/mega/<slug>                megavisa
//   /og/kuvavisa/<kortisto>        kuvavisa (liput, vaakunat, linnut …, viikko)
//   /og/kokoelma/<avain>           kokoelmahub
//   /og/sivu/<avain>               pelimuodot ja muut sivut (tupla-tai-kuitti, kuntaliitos …)
//   /og/henkilo/<slug>             henkilösivu (erä B3): nimi + rooli, henkilökuva 3:4-korttina
//   /og/jarjesta/<pakka>           Laita järjestykseen -pakka (lib/jarjesta/pakat.ts)
//   /og/visapaketti/<slug>         visapaketti (julkaistu; quiz_packs), sarjan pääsivulla uusin painos
//
// Satori (ImageResponse) ei osaa WebP:tä, joten kuvat muunnetaan sharpilla JPEG:ksi. Omat kuvat
// (/20/…) haetaan saman julkaisun osoitteesta HTTP:llä (Vercelin tilankäyttö 11.10.2026: aiemmin koko
// public/20 eli ~83 Mt kopioitiin funktiopakettiin jokaisessa julkaisussa). Projektissa ei ole
// deployment protectionia, joten myös preview-julkaisut vastaavat hakuun.

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { getSupabase } from "@/lib/supabase";
import { henkiloSlug } from "@/lib/henkiloSlug";
import { haePakka } from "@/lib/jarjesta/pakat";
import { getSiteId } from "@/lib/queries";
import { resolveCollection, COLLECTION_ACCENT, COLLECTION_BG, COLLECTION_LABEL } from "@/lib/visanKokoelma";
import { KATEGORIAT, kuvavisanKansi, haeKuvakysymys } from "@/lib/kuvavisat2026";
import { mahtuuKorttiin, korttiVaihtoehdot } from "@/lib/kysymyskortti";
import { krediittiPolulle, krediittiTekstista, krediittirivi } from "@/lib/kuvakrediitti";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { MEGA_FEATURED, MEGA_GRID } from "@/lib/megavisat";
import { NAV_COLLECTIONS } from "@/lib/nav";
import { korttinimi, tasonimiTuloksesta } from "@/lib/korttinimi";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { haeSivu, kierrosmaarat, metarivi, sarjaNimi } from "@/lib/visapaketit";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const TAUSTA = "#0f0d07";
const KULTA = "#E8A320";

/* ── Kuvat ─────────────────────────────────────────────────────────────── */

/** Pyynnön origin (asetetaan GET:ssä): sama julkaisu, joten preview-kuvat löytyvät previewstä. */
let origin = "https://tietoniekka.fi";

async function paikallinen(polku: string): Promise<Buffer | null> {
  if (!polku.startsWith("/")) return null;
  /* Ei readFile(public/…): tiedostojäljitys ottaisi silloin koko public/-kansion (~100 Mt) pakettiin. */
  try {
    const r = await fetch(new URL(polku, origin));
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
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
  sovita = false,
): Promise<string | null> {
  if (!lahde) return null;
  const raw = lahde.startsWith("http") ? await etakuva(lahde) : await paikallinen(lahde);
  if (!raw) return null;
  try {
    /* Grafiikka (liput, vaakunat, maalaukset) kokonaisena tummalla pohjalla — ei rajausta. */
    if (sovita) {
      const out = await sharp(raw).resize(w, h, { fit: "contain", background: "#1A170F" }).flatten({ background: "#1A170F" }).jpeg({ quality: 84 }).toBuffer();
      return `data:image/jpeg;base64,${out.toString("base64")}`;
    }
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

/** Postikortin fontit (vaihe D): Archivo 900 kavennettuna (wdth 72, staattinen TTF muunnettu
 *  @fontsource-variable/archivosta fontToolsilla — Satori ei tue WOFF2:ta eikä muuttuvia akseleita),
 *  Barlow 700/800 ja Barlow Condensed 800 (@fontsource, WOFF). */
let postiFontit: { name: string; data: Buffer; weight: 700 | 800 | 900; style: "normal" }[] | null = null;
async function haePostiFontit() {
  if (postiFontit) return postiFontit;
  const lue = (f: string) => readFile(join(process.cwd(), "assets/og", f));
  const [ac, as8, b7, b8, bc8] = await Promise.all([lue("archivo-condensed-900.ttf"), lue("archivo-semicondensed-800.ttf"), lue("barlow-700.woff"), lue("barlow-800.woff"), lue("barlow-condensed-800.woff")]);
  postiFontit = [
    { name: "Archivo Condensed", data: ac, weight: 900, style: "normal" },
    /* Kysymyskortin kysymys (vaihe E): Archivo 800, wdth 80. */
    { name: "Archivo SemiCondensed", data: as8, weight: 800, style: "normal" },
    { name: "Barlow", data: b7, weight: 700, style: "normal" },
    { name: "Barlow", data: b8, weight: 800, style: "normal" },
    { name: "Barlow Condensed", data: bc8, weight: 800, style: "normal" },
  ];
  return postiFontit;
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
              ? "radial-gradient(50% 100% at 50% 50%, rgba(15,13,7,0.88) 0%, rgba(15,13,7,0.74) 55%, rgba(15,13,7,0.12) 100%)"
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

/* ── Postikortti (vaihe D, CD-arkki 1a, mitat osiosta 4A) ─────────────────── */

type Postikortti = {
  nimi: string;
  kategoria: string;
  accent: string;
  kuva: string | null; // kehyksen kuva (data-URI, 462 × 344) tai null → teemaväri ja kuvio (1d)
  oikein: number;
  kysymyksia: number;
  tasonimi: string | null;
  /** "Kuva: tekijä / lisenssi" (lib/kuvakrediitti.ts), vain nimeämistä vaativille lisensseille. */
  krediitti: string | null;
};

const KERMA = "#F5F0E6";
const POHJA = "#131109";
const LEIMA = "#E8A320";

function rgba(hex: string, a: number) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* KORTTISÄÄNTÖ (arkki 4A): fs = min(112, 540 ÷ pisin sana, 3 × 540 ÷ (koko nimi × 1,15)); yhdysmerkki katkaisee sanan,
   enintään 3 riviä. Arkin kerroin 0,56 em/merkki oli CD:n muuttuvalle fontille; staattinen instanssi on keskimäärin
   0,576 em (mitattu fontToolsilla 22.10.2026: KUMMITUSTEN 554 px, JALKAPALLOMAAJOUKKUE 554 px > 540). Siksi leveys
   lasketaan fontin omista merkkileveyksistä (archivo-condensed-900.ttf, em-yksikköinä) ja 2 %:n marginaalilla.
   Leiman luku ≤ 0,82 × nimen koko → nimi on aina leimaa suurempi. */
const SARAKE = 540;
const AC_LEVEYS: Record<string, number> = {"A":0.595,"B":0.572,"C":0.583,"D":0.58,"E":0.53,"F":0.472,"G":0.619,"H":0.597,"I":0.291,"J":0.509,"K":0.595,"L":0.494,"M":0.775,"N":0.601,"O":0.627,"P":0.547,"Q":0.627,"R":0.58,"S":0.536,"T":0.54,"U":0.59,"V":0.566,"W":0.8,"X":0.573,"Y":0.559,"Z":0.54,"Ä":0.595,"Ö":0.627,"Å":0.595,"Ü":0.59,"É":0.53,"È":0.53,"Á":0.595,"À":0.595,"Í":0.291,"Ó":0.627,"Ú":0.59,"Ñ":0.601,"Ç":0.583,"0":0.503,"1":0.449,"2":0.49,"3":0.5,"4":0.496,"5":0.498,"6":0.503,"7":0.467,"8":0.494,"9":0.503," ":0.128,"-":0.264,"–":0.36,"—":0.72,":":0.251,".":0.251,",":0.251,"'":0.23,"’":0.223,"&":0.651,"!":0.284,"?":0.473,"/":0.285,"(":0.389,")":0.389,"+":0.563,"%":0.81,"#":0.541,"\"":0.423};
const emLeveys = (t: string) => [...t].reduce((s, c) => s + (AC_LEVEYS[c] ?? 0.8), 0);
function postiNimiKoko(nimi: string): number {
  const iso = nimi.toUpperCase();
  const pisin = Math.max(...iso.split(/\s+|(?<=-)/).map(emLeveys), 1.7);
  return Math.floor(Math.min(112, (SARAKE * 0.98) / pisin, (3 * SARAKE) / (emLeveys(iso) * 1.15)));
}

/* Kuvalähde (Heikki 23.10.2026): pieni himmeä rivi oikeaan alakulmaan, ei kilpaile brändirivin kanssa. */
function Krediitti({ teksti }: { teksti: string | null }) {
  if (!teksti) return null;
  const t = teksti.length > 64 ? teksti.slice(0, 63) + "…" : teksti;
  return <div style={{ position: "absolute", right: 36, bottom: 14, display: "flex", fontSize: 17, fontWeight: 700, color: "rgba(245,240,230,0.42)" }}>{t}</div>;
}

type VisaRivi = {
  id: string; slug: string; title: string; display_title: string | null; korttinimi: string | null; fanitasot: unknown;
  collection: string | null; category: string | null; genre: string | null;
  hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null; hero_alt: string | null;
};

async function haeVisa(slug: string): Promise<VisaRivi | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const siteId = await getSiteId();
  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, korttinimi, fanitasot, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, hero_alt" as never)
    .eq("slug", slug)
    .eq("status", "published");
  if (siteId) q = q.eq("site_id", siteId);
  const { data } = await q.maybeSingle();
  return data as unknown as VisaRivi | null;
}

/** Jakokortin kuva ja sen lähde: kokoelmasivun korttikuva (visanKorttikuva), henkilövisassa henkilön oma kopio. */
async function visanKorttikuvaJaLahde(quiz: VisaRivi, w: number, h: number): Promise<{ kuva: string | null; krediitti: string | null }> {
  const sb = getSupabase();
  if (quiz.collection === "tunnetut-henkilot" && sb) {
    const { data: c } = await sb.from("celebrities").select("image_url, image_credit, image_license").eq("trivia_quiz_id", quiz.id).maybeSingle();
    const cel = c as { image_url: string | null; image_credit: string | null; image_license: string | null } | null;
    const oma = henkiloKuva(cel?.image_url);
    return {
      kuva: await kuvaUri(oma ?? cel?.image_url ?? quiz.hero_image, w, h, { x: 0.5, y: 0.2 }),
      krediitti: krediittiPolulle(oma) ?? krediittirivi(cel?.image_credit, cel?.image_license),
    };
  }
  const kk = visanKorttikuva(quiz);
  const [px, py] = (kk.kuvaPos ?? "").split(/\s+/).map((v) => (v.endsWith("%") ? Number(v.slice(0, -1)) / 100 : NaN));
  const altLahde = quiz.hero_alt && /kuva:/i.test(quiz.hero_alt) ? quiz.hero_alt.slice(quiz.hero_alt.search(/kuva:/i) + 5).trim() : null;
  return {
    kuva: await kuvaUri(kk.kuva, w, h, { x: Number.isFinite(px) ? px : quiz.hero_focal_x, y: Number.isFinite(py) ? py : quiz.hero_focal_y }),
    krediitti: krediittiPolulle(kk.kuva) ?? (kk.kuva === quiz.hero_image ? krediittiPolulle(quiz.hero_image) ?? krediittiTekstista(altLahde) : null),
  };
}

async function piirraPostikortti(k: Postikortti) {
  const nimiKoko = postiNimiKoko(k.nimi);
  const tulosTeksti = `${k.oikein}/${k.kysymyksia}`;
  const leimaKoko = Math.min(tulosTeksti.length > 4 ? 46 : 54, Math.floor(nimiKoko * 0.82));
  const haaste = k.oikein === k.kysymyksia ? "Pystytkö samaan?" : "Pystytkö parempaan?";
  /* NAUHASÄÄNTÖ (1e): tasonimi ≤ 18 merkkiä → nauha leiman alle, muuten ei nauhaa (tasonimi on silti jakotekstissä). */
  const nauha = k.tasonimi && k.tasonimi.length <= 18 ? k.tasonimi : null;
  /* Suorat päät: Satorin clip-path katkaisi nauhan tekstin ensimmäiseen kirjaimeen (testattu 22.10.2026),
     joten käytetään arkin 4A varmuusratkaisua. */
  const img = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", overflow: "hidden", background: POHJA, color: KERMA, fontFamily: "Barlow" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", background: `radial-gradient(circle at 78% 45%, ${rgba(k.accent, 0.2)}, rgba(19,17,9,0) 55%)` }} />
        {/* Kuvakehys: 490 × 420, sisäväli 14/14/62, kierto 3°, varjo */}
        <div style={{ position: "absolute", left: 640, top: 62, width: 490, height: 420, display: "flex", padding: "14px 14px 62px", background: KERMA, transform: "rotate(3deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative", display: "flex", width: 462, height: 344, overflow: "hidden", background: "#1A170F" }}>
            {k.kuva ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={k.kuva} width={462} height={344} alt="" style={{ width: 462, height: 344 }} />
            ) : (
              /* Kuvaton visa (1d): teemavärin raidat tummalla pohjalla + kategoria teemavärillä */
              <div style={{ position: "absolute", left: 0, top: 0, width: 462, height: 344, display: "flex", background: `repeating-linear-gradient(135deg, ${rgba(k.accent, 0.3)} 0px, ${rgba(k.accent, 0.3)} 22px, ${rgba(k.accent, 0.12)} 22px, ${rgba(k.accent, 0.12)} 44px)` }} />
            )}
            {!k.kuva && (
              <div style={{ position: "absolute", right: 22, top: 16, display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 60, lineHeight: 0.9, textTransform: "uppercase", color: k.accent }}>{k.kategoria}</div>
            )}
          </div>
          <div style={{ position: "absolute", right: 22, bottom: 16, display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#3A3120" }}>{k.kategoria}</div>
        </div>
        {/* Leima: 176 px, left 600, top 384, kierto −8° */}
        <div style={{ position: "absolute", left: 600, top: 384, width: 176, height: 176, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 88, background: LEIMA, border: `7px solid ${POHJA}`, transform: "rotate(-8deg)" }}>
          <div style={{ display: "flex", fontSize: 16, fontWeight: 800, letterSpacing: 3.2, textTransform: "uppercase", color: POHJA }}>Tulos</div>
          <div style={{ display: "flex", marginTop: 10, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: leimaKoko, lineHeight: 1, letterSpacing: -0.03 * leimaKoko, color: POHJA }}>{tulosTeksti}</div>
        </div>
        {nauha && (
          /* Tasonauha: keskikohta x 688, top 524, kierto −4° */
          <div style={{ position: "absolute", left: 388, top: 524, width: 600, display: "flex", justifyContent: "center", transform: "rotate(-4deg)" }}>
            <div style={{ display: "flex", alignItems: "center", height: 62, padding: "0 40px", background: POHJA, borderTop: `3px solid ${LEIMA}`, borderBottom: `3px solid ${LEIMA}`, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 44, lineHeight: 1, letterSpacing: 1.76, textTransform: "uppercase", color: LEIMA, whiteSpace: "nowrap" }}>{nauha}</div>
          </div>
        )}
        {/* Sarake: left 64, top 56, bottom 52, leveys 540 */}
        <div style={{ position: "absolute", left: 64, top: 56, bottom: 52, width: SARAKE, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 40, lineHeight: 1 }}>
            <span style={{ color: LEIMA }}>TIETO</span>
            <span style={{ color: KERMA }}>NIEKKA</span>
          </div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#CFC7B6" }}>Pelaa Tietoniekassa:</div>
          <div style={{ display: "flex", marginTop: 10, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: nimiKoko, lineHeight: 0.92, textTransform: "uppercase" }}>{k.nimi}</div>
          <div style={{ display: "flex", marginTop: 24, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 48, lineHeight: 1, textTransform: "uppercase", color: "#B6FF3C" }}>{haaste}</div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: KERMA }}>tietoniekka.fi</div>
        </div>
        <Krediitti teksti={k.krediitti} />
      </div>
    ),
    { width: W, height: H, fonts: await haePostiFontit() },
  );
  const jpg = await sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}

async function postikortti(slug: string, tulos: { score: number; total: number }): Promise<Postikortti | null> {
  const quiz = await haeVisa(slug);
  if (!quiz) return null;
  const r = resolveCollection(quiz);
  const { kuva, krediitti } = await visanKorttikuvaJaLahde(quiz, 462, 344);
  return {
    nimi: korttinimi({ korttinimi: quiz.korttinimi, title: quiz.display_title ?? quiz.title }),
    kategoria: r.label,
    accent: r.accent,
    kuva,
    oikein: tulos.score,
    kysymyksia: tulos.total,
    tasonimi: tasonimiTuloksesta(quiz.fanitasot, tulos.score, tulos.total),
    krediitti,
  };
}

/** Kuvavisan postikortti (/h/<koodi>): kortiston esikatselukuva, nimi variaatiosta (?nimi=). */
async function kuvavisaPostikortti(kortisto: string, tulos: { score: number; total: number }, nimiParam: string | null): Promise<Postikortti | null> {
  const kat = KATEGORIAT.find((k) => k.type === kortisto || (kortisto === "vaakuna" && k.type === "vaakunat"));
  if (!kat) return null;
  const kansi = await kuvavisanKansi(kat.type, new Set());
  const nimi = nimiParam && nimiParam.length <= 40 && /^[\p{L}\d\s·–-]+$/u.test(nimiParam) ? nimiParam : kat.otsikko;
  return {
    nimi,
    kategoria: "Kuvavisa",
    accent: kat.accent,
    kuva: kansi ? await kuvaUri(kansi.src, 462, 344, {}, false, kansi.sovitus === "contain") : null,
    oikein: tulos.score,
    kysymyksia: tulos.total,
    tasonimi: null,
    krediitti: krediittiTekstista(kansi?.lahde),
  };
}

/* ── Kysymyskortti (vaihe E, CD-arkki 2a–2d, mitat osiosta 4A) ─────────────── */

type Kysymyskortti = {
  kysymys: string;
  vaihtoehdot: string[]; // aakkosjärjestyksessä (oikea ei erotu)
  visa: string;          // kehyksen kuvateksti = visan nimi
  kategoria: string;
  accent: string;
  kuva: string | null;   // data-URI
  kuvavisa: boolean;     // kuvakysymys: isompi kehys oikealla, sarake 600
  oikein: number;
  kysymyksia: number;
  tasonimi: string | null;
  krediitti: string | null;
};

async function piirraKysymyskortti(k: Kysymyskortti) {
  const pic = k.kuvavisa;
  const taydet = k.oikein === k.kysymyksia;
  const sarake = pic ? 600 : 680;
  /* KYSYMYSSÄÄNTÖ: ≤ 45 merkkiä 64 px, ≤ 90 merkkiä 52 px (pitkillä vaihtoehdoilla 42 px); yli 90 ei tule tänne. */
  const pitka = k.vaihtoehdot.some((o) => o.length > 16) || (pic && k.vaihtoehdot.some((o) => o.length > 15));
  const qKoko = k.kysymys.length <= 45 ? 64 : pitka ? 42 : 50;
  const optW = pitka ? sarake : Math.floor((sarake - 10) / 2);
  const optH = pitka ? 44 : 68;
  const chip = pitka ? 34 : 46;
  const tulosTeksti = `${k.oikein}/${k.kysymyksia}`;
  const nauha = k.tasonimi && k.tasonimi.length <= 18 ? k.tasonimi : null;
  const kehys = pic ? { x: 712, y: 56, w: 430, h: 500 } : { x: 826, y: 84, w: 320, h: 400 };
  const sisa = { w: kehys.w - 24, h: kehys.h - 12 - 56 };
  const img = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", overflow: "hidden", background: POHJA, color: KERMA, fontFamily: "Barlow" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", background: `radial-gradient(circle at 85% 40%, ${rgba(k.accent, 0.18)}, rgba(19,17,9,0) 50%)` }} />
        <div style={{ position: "absolute", left: kehys.x, top: kehys.y, width: kehys.w, height: kehys.h, display: "flex", padding: "12px 12px 56px", background: KERMA, transform: "rotate(3deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative", display: "flex", width: sisa.w, height: sisa.h, overflow: "hidden", background: "#1A170F" }}>
            {k.kuva ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={k.kuva} width={sisa.w} height={sisa.h} alt="" style={{ width: sisa.w, height: sisa.h }} />
            ) : (
              <div style={{ position: "absolute", left: 0, top: 0, width: sisa.w, height: sisa.h, display: "flex", background: `repeating-linear-gradient(135deg, ${rgba(k.accent, 0.3)} 0px, ${rgba(k.accent, 0.3)} 22px, ${rgba(k.accent, 0.12)} 22px, ${rgba(k.accent, 0.12)} 44px)` }} />
            )}
          </div>
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 12, display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: k.visa.length > 18 ? 22 : 26, lineHeight: 1.05, textTransform: "uppercase", color: "#3A3120", overflow: "hidden", whiteSpace: "nowrap" }}>{k.visa}</div>
        </div>
        {/* Tulosleima 164 px, kehyksen oikeassa yläkulmassa */}
        <div style={{ position: "absolute", left: pic ? 1040 : 1030, top: pic ? 24 : 40, width: 164, height: 164, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 82, background: LEIMA, border: `7px solid ${POHJA}`, transform: "rotate(-8deg)", boxShadow: "0 14px 30px rgba(0,0,0,0.45)", color: POHJA }}>
          <div style={{ display: "flex", fontSize: 17, fontWeight: 800, letterSpacing: 2.4, textTransform: "uppercase", lineHeight: 1 }}>Sain</div>
          <div style={{ display: "flex", marginTop: 2, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: tulosTeksti.length > 4 ? 46 : 56, lineHeight: 0.95 }}>{tulosTeksti}</div>
        </div>
        {nauha && (
          <div style={{ position: "absolute", right: 22, top: pic ? 178 : 194, display: "flex", transform: "rotate(-4deg)" }}>
            <div style={{ display: "flex", alignItems: "center", height: 56, padding: "0 34px", background: POHJA, borderTop: `3px solid ${LEIMA}`, borderBottom: `3px solid ${LEIMA}`, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: 1.6, textTransform: "uppercase", color: LEIMA, whiteSpace: "nowrap" }}>{nauha}</div>
          </div>
        )}
        <div style={{ position: "absolute", left: 64, top: 52, bottom: 48, width: sarake, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 34, lineHeight: 1 }}>
              <span style={{ color: LEIMA }}>TIETO</span>
              <span style={{ color: KERMA }}>NIEKKA</span>
            </div>
            <div style={{ display: "flex", width: 2, height: 26, background: "#3A3120", margin: "0 16px" }} />
            <div style={{ display: "flex", fontSize: 22, fontWeight: 800, letterSpacing: 3.5, textTransform: "uppercase", color: k.accent, whiteSpace: "nowrap" }}>{k.kategoria}</div>
          </div>
          <div style={{ display: "flex", flexGrow: 1, minHeight: 16 }} />
          <div style={{ display: "flex", marginBottom: 12, fontSize: pitka ? 24 : 28, fontWeight: 700, lineHeight: 1.1, color: "#CFC7B6" }}>{taydet ? "Tiedätkö tämän?" : "Tähän kompastuin:"}</div>
          <div style={{ display: "flex", fontFamily: "Archivo SemiCondensed", fontWeight: 800, fontSize: qKoko, lineHeight: 1.08, letterSpacing: -0.01 * qKoko }}>{k.kysymys}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: pitka ? 8 : 10, marginTop: pitka ? 18 : 24 }}>
            {k.vaihtoehdot.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", width: optW, height: optH, padding: "0 18px 0 10px", borderRadius: 999, background: "#1F1B14", border: "2px solid #3A3120" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: chip, height: chip, marginRight: 14, borderRadius: chip / 2, background: "#2C2517", fontSize: pitka ? 20 : 24, fontWeight: 800, color: k.accent }}>{"ABCD"[i]}</div>
                <div style={{ display: "flex", fontSize: pitka ? 25 : 30, fontWeight: 700, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden" }}>{o}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexGrow: 1, minHeight: 16 }} />
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ display: "flex", marginRight: 18, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, lineHeight: 1, textTransform: "uppercase", color: "#B6FF3C", whiteSpace: "nowrap" }}>{taydet ? "Pystytkö samaan?" : "Pystytkö parempaan?"}</div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: KERMA, whiteSpace: "nowrap" }}>tietoniekka.fi</div>
          </div>
        </div>
        <Krediitti teksti={k.krediitti} />
      </div>
    ),
    { width: W, height: H, fonts: await haePostiFontit() },
  );
  const jpg = await sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}

/** Tietovisan kysymyskortti: k hyväksytään vain, jos kysymys kuuluu visaan ja mahtuu korttiin. */
async function visanKysymyskortti(slug: string, tulos: { score: number; total: number }, kId: string): Promise<Kysymyskortti | null> {
  const sb = getSupabase();
  const quiz = await haeVisa(slug);
  if (!sb || !quiz || !/^[0-9a-f-]{20,}$/i.test(kId)) return null;
  const { data } = await sb.from("questions").select("question_text, answers, audio").eq("id", kId).eq("quiz_id", quiz.id).maybeSingle();
  const kq = data as { question_text: string; answers: unknown; audio: unknown } | null;
  const vaihtoehdot = Array.isArray(kq?.answers) ? (kq!.answers as Array<{ text: string }>).slice(0, 4).map((a) => a.text) : [];
  if (!kq || !mahtuuKorttiin({ question: kq.question_text, options: vaihtoehdot, audio: kq.audio != null })) return null;
  const r = resolveCollection(quiz);
  const { kuva, krediitti } = await visanKorttikuvaJaLahde(quiz, 296, 332);
  return {
    kysymys: kq.question_text.trim(),
    vaihtoehdot: korttiVaihtoehdot(vaihtoehdot),
    visa: korttinimi({ korttinimi: quiz.korttinimi, title: quiz.display_title ?? quiz.title }),
    kategoria: r.label,
    accent: r.accent,
    kuva,
    kuvavisa: false,
    oikein: tulos.score,
    kysymyksia: tulos.total,
    tasonimi: tasonimiTuloksesta(quiz.fanitasot, tulos.score, tulos.total),
    krediitti,
  };
}

/** Kuvavisan kysymyskortti (2c): kysymyksen kuva isossa kehyksessä, kuvateksti = visan nimi. */
async function kuvavisanKysymyskortti(kortisto: string, tulos: { score: number; total: number }, kId: string, nimiParam: string | null): Promise<Kysymyskortti | null> {
  const kq = await haeKuvakysymys(kId);
  const kat = KATEGORIAT.find((k) => k.type === kq?.type);
  if (!kq || !kat || !mahtuuKorttiin({ question: kq.question, options: kq.options })) return null;
  const nimi = nimiParam && nimiParam.length <= 40 && /^[\p{L}\d\s·–-]+$/u.test(nimiParam) ? nimiParam : kat.otsikko;
  return {
    kysymys: kq.question.trim(),
    vaihtoehdot: korttiVaihtoehdot(kq.options),
    visa: nimi,
    kategoria: "Kuvavisa",
    accent: kat.accent,
    kuva: await kuvaUri(kq.image, 406, 432, {}, false, kat.sovitus === "contain"),
    kuvavisa: true,
    oikein: tulos.score,
    kysymyksia: tulos.total,
    tasonimi: null,
    krediitti: krediittiTekstista(kq.lahde),
  };
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
  vaalipiiriketju: { eyebrow: "Päivän peli", otsikko: "Vaalipiiriketju", kuva: "/20/vaalit/hero.webp", accent: "#B4A5FF" },
  rajanaapurit: { eyebrow: "Pelimuoto", otsikko: "Rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", accent: "#4FD1F5" },
  ikajarjestys: { eyebrow: "Tietoketju", otsikko: "Ikäjärjestys", kuva: "/20/teema-tunnetut-henkilot.webp", accent: "#C9A96A" },
  megavisat: { eyebrow: "Pitkät visat", otsikko: "Megavisat", kuva: "/20/megavisa.webp", accent: KULTA },
  kokoelmat: { eyebrow: "Tietoniekka", otsikko: "Kaikki kokoelmat", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
  viikkovisa: { eyebrow: "Kuvavisa", otsikko: "Viikkovisa", kuva: "/20/kuvavisat/hero.webp", accent: "#22D3EE" },
  "kuvien-lahteet": { eyebrow: "Tietoniekka", otsikko: "Kuvien lähteet", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
  visapaketit: { eyebrow: "Tietoniekka", otsikko: "Visapaketit", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
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
  origin = url.origin;
  let kortti: Kortti | null = null;

  if (tyyppi === "visa" && avain) {
    const tulos = parseTulos(url.searchParams.get("tulos"));
    /* Vaihe D: tuloslinkki → postikortti; ilman tulosta (tai virheellisellä) nykyinen visakortti.
       Vaihe E: &k=<id> → kysymyskortti; kelpaamaton k → postikortti. */
    const kId = url.searchParams.get("k");
    const kk = tulos && kId ? await visanKysymyskortti(avain, tulos, kId) : null;
    if (kk) return piirraKysymyskortti(kk);
    const pk = tulos ? await postikortti(avain, tulos) : null;
    if (pk) return piirraPostikortti(pk);
    kortti = await visaKortti(avain, tulos);
  } else if (tyyppi === "mega" && avain) {
    const m = [MEGA_FEATURED, ...MEGA_GRID].find((x) => x.slug === avain);
    const sb = getSupabase();
    const { data } = sb
      ? await sb.from("quizzes").select("title, display_title" as never).eq("slug", avain).maybeSingle()
      : { data: null };
    const q = data as unknown as { title: string; display_title: string | null } | null;
    if (q || m) kortti = { eyebrow: "Megavisa", otsikko: q?.display_title ?? q?.title ?? m?.tag ?? avain, accent: KULTA, tausta: await kuvaUri(m?.img ?? "/20/megavisa.webp", W, H) };
  } else if (tyyppi === "kuvavisa" && avain && parseTulos(url.searchParams.get("tulos"))) {
    /* Kuvavisan haastetunnus (/h/<koodi>): postikortti, ?k=<kuvan id> → kysymyskortti (vaihe E). */
    const tulos = parseTulos(url.searchParams.get("tulos"))!;
    const kId = url.searchParams.get("k");
    const nimiParam = url.searchParams.get("nimi");
    const kk = kId ? await kuvavisanKysymyskortti(avain, tulos, kId, nimiParam) : null;
    if (kk) return piirraKysymyskortti(kk);
    const pk = await kuvavisaPostikortti(avain, tulos, nimiParam);
    if (pk) return piirraPostikortti(pk);
  } else if (tyyppi === "kuvavisa" && avain) {
    const kat = KATEGORIAT.find((k) => k.type === avain || (avain === "vaakuna" && k.type === "vaakunat"));
    const otsikko = avain === "viikko" ? "Viikkovisa" : avain === "kaupungit" ? "Suomen kaupungit" : kat?.otsikko;
    if (otsikko) kortti = { eyebrow: "Kuvavisa", otsikko, accent: kat?.accent ?? "#22D3EE", tausta: await kuvaUri(KUVAVISA_KUVA[avain], W, H), alarivi: "Tunnista kuvasta" };
  } else if (tyyppi === "kokoelma" && avain) {
    kortti = await kokoelmaKortti(avain);
  } else if (tyyppi === "henkilo" && avain) {
    const sb = getSupabase();
    // Henkilösivun osoite johdetaan nimestä (lib/henkiloSlug.ts), ei celebrities.slug-kentästä.
    const { data } = sb ? await sb.from("celebrities").select("name, role, image_url").limit(2000) : { data: null };
    const c = ((data ?? []) as Array<{ name: string; role: string | null; image_url: string | null }>).find((x) => henkiloSlug(x.name) === avain) ?? null;
    if (c)
      kortti = {
        eyebrow: "Tunnetut henkilöt",
        otsikko: c.name,
        accent: "#C9A96A",
        henkilo: await kuvaUri(c.image_url, 252, 336, { x: 0.5, y: 0.2 }),
        tausta: await kuvaUri(c.image_url, W, H, { x: 0.5, y: 0.3 }, true),
        alarivi: c.role ?? undefined,
      };
  } else if (tyyppi === "jarjesta" && haePakka(avain)) {
    const p = haePakka(avain)!;
    const otsikko = p.otsikko.charAt(0).toUpperCase() + p.otsikko.slice(1);
    kortti = { eyebrow: "Laita järjestykseen", otsikko, accent: "#E8A320", tausta: await kuvaUri(p.kuva, W, H) };
  } else if (tyyppi === "visapaketti" && avain) {
    const sivu = await haeSivu(avain, null);
    if (sivu) {
      const p = sivu.vp.paketti;
      kortti = {
        eyebrow: "Visapaketti", otsikko: sivu.painokset && p.sarja ? sarjaNimi(p.sarja) : p.otsikko, accent: p.aksentti ?? KULTA,
        tausta: await kuvaUri(p.hero_image ?? "/20/hero-mikko-laura.webp", W, H),
        alarivi: metarivi(p, kierrosmaarat(sivu.vp)).join(" · "),
      };
    }
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
