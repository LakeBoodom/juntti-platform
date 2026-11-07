// SEO-erä A2 (2.10.2026): jakokuvat (og:image) takaisin. 2.0-julkaisussa 1.0:n /peli/og-reitti
// poistui, ja koska lapsisivun openGraph korvaa juuren openGraphin, /visa/*- ja /kokoelma/*-
// sivuilta puuttui og:image kokonaan → WhatsApp/Facebook/X-esikatselu ilman kuvaa.
//
// Yksi reitti kaikille jakokuville (1200×630):
//   Esikatselukortit (Jakotekstit v4 §4, vaihe 2, 7.11.2026; ei tulosta, ei henkilökuvia):
//   /og/visa/<slug>                tietovisa: koukkukortti (visan kysymys, lib/koukku.ts) tai nimikortti
//   /og/mega/<slug>                megavisa: koukkukortti tai nimikortti
//   /og/kuvavisa/<kortisto>        kuvavisa (liput, vaakunat, linnut …, viikko); ?k=<kuvan id>&nimi= haastetunnukselle
//   /og/tupla/<teema>              Tupla tai kuitti -teema
//   /og/aanivisa/<ryhmä>           äänivisa
//   /og/kokoelma/<avain>           kokoelmahub
//   /og/sivu/<avain>               pelimuodot ja muut sivut (tupla-tai-kuitti, kuntaliitos …)
//   /og/henkilo/<slug>             henkilösivu (erä B3): nimi + rooli, henkilökuva 3:4-korttina
//   /og/jarjesta/<pakka>           järjestyspakka (lib/jarjesta/pakat.ts) tai ikäjärjestyspakka (lib/jarjesta/hub.ts)
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
import { KATEGORIAT, kuvavisanKansi, haeKuvakysymys, kuvavisanNimi, VIIKKOVISA_KUVIA } from "@/lib/kuvavisat2026";
import { mahtuuKorttiin, korttiVaihtoehdot } from "@/lib/kysymyskortti";
import { krediittiPolulle, krediittiTekstista, krediittirivi } from "@/lib/kuvakrediitti";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { MEGA_FEATURED, MEGA_GRID, megaMaarat } from "@/lib/megavisat";
import { NAV_COLLECTIONS } from "@/lib/nav";
import { korttinimi } from "@/lib/korttinimi";
import { kuvalause, megaJatko, pelityyppi, type Pelimuoto } from "@/lib/esikatselu";
import { visanKoukku, megaKoukku, haeKysymysKoukku, type KasinKoukku, type Koukku } from "@/lib/koukku";
import { haeIkaPakka } from "@/lib/jarjesta/hub";
import { teema as haeTuplaTeema } from "@/lib/tuplaTaiKuitti";
import { ryhmaPolusta, AANIVISA_KYSYMYKSIA } from "@/lib/aanivisat";
import { VPK_JAKONIMI, VPK_KOUKKU } from "@/lib/vaalipiiriketju";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { onHenkilokuva } from "@/lib/jakokuvat";
import { haeSivu, kierrosmaarat, kysymysmaarat, metarivi, sarjaNimi } from "@/lib/visapaketit";
import { maaKierros } from "@/lib/vihjepeli/data";
import { helsinginPaiva } from "@/lib/aika";

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
  const raja = henkilo ? 46 : 72;
  const koko = Math.min(otsikkoKoko(otsikko, tekstiLeveys), raja);

  const tekstit = (
    <div style={{ display: "flex", flexDirection: "column", width: tekstiLeveys }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: k.accent, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: k.accent, marginRight: 12 }} />
        {k.eyebrow}
      </div>
      <div style={{ display: "flex", fontSize: koko, fontWeight: 900, lineHeight: 0.98, textTransform: "uppercase", letterSpacing: -1 }}>
        {otsikko}
      </div>
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

/* ── Esikatselukortit (Jakotekstit ja esikatselut v4 §4, vaihe 2, 7.11.2026) ───────────────────────────────────────
   Kortti esittelee pelin: pieni tyyppimerkintä ("Tietovisa"), aihekuva ja koukkukysymys, tunnus pienenä. Ei tulosleimaa,
   tasonauhaa eikä "Pystytkö parempaan?" -kehotusta: tulos on viestissä. Ei henkilökuvia.
   Koukkukortti = vaiheen E kysymyskortin asettelu (CD-arkki 2a–2d) ilman leimaa; nimikortti = vaiheen D postikortin
   asettelu (arkki 1a/1d) ilman leimaa, kun koukkua ei ole. */

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
   lasketaan fontin omista merkkileveyksistä (archivo-condensed-900.ttf, em-yksikköinä) ja 2 %:n marginaalilla. */
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
  id: string; slug: string; title: string; display_title: string | null; korttinimi: string | null;
  collection: string | null; category: string | null; genre: string | null;
  hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null; hero_alt: string | null;
};

async function haeVisa(slug: string): Promise<VisaRivi | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const siteId = await getSiteId();
  let q = sb
    .from("quizzes")
    .select("id, slug, title, display_title, korttinimi, collection, category, genre, hero_image, hero_focal_x, hero_focal_y, hero_alt" as never)
    .eq("slug", slug)
    .eq("status", "published");
  if (siteId) q = q.eq("site_id", siteId);
  const { data } = await q.maybeSingle();
  return data as unknown as VisaRivi | null;
}

/** Jakokortin kuva ja sen lähde: kokoelmasivun korttikuva (visanKorttikuva); henkilövisassa ei kuvaa. */
async function visanKorttikuvaJaLahde(quiz: VisaRivi, w: number, h: number): Promise<{ kuva: string | null; krediitti: string | null }> {
  const sb = getSupabase();
  /* Jakokorteissa ei henkilökuvia (Jakotekstit v4 §4): henkilövisan kehys on teemavärin kuvio. */
  if (quiz.collection === "tunnetut-henkilot") return { kuva: null, krediitti: null };
  const kk = visanKorttikuva(quiz);
  if (onHenkilokuva(quiz.slug, kk.kuva)) return { kuva: null, krediitti: null };
  const [px, py] = (kk.kuvaPos ?? "").split(/\s+/).map((v) => (v.endsWith("%") ? Number(v.slice(0, -1)) / 100 : NaN));
  const altLahde = quiz.hero_alt && /kuva:/i.test(quiz.hero_alt) ? quiz.hero_alt.slice(quiz.hero_alt.search(/kuva:/i) + 5).trim() : null;
  return {
    kuva: await kuvaUri(kk.kuva, w, h, { x: Number.isFinite(px) ? px : quiz.hero_focal_x, y: Number.isFinite(py) ? py : quiz.hero_focal_y }),
    krediitti: krediittiPolulle(kk.kuva) ?? (kk.kuva === quiz.hero_image ? krediittiPolulle(quiz.hero_image) ?? krediittiTekstista(altLahde) : null),
  };
}

type Nimikortti = {
  nimi: string;
  /** Tyyppimerkintä isolla alkukirjaimella ("Tietovisa", "Karttapeli"). */
  tyyppi: string;
  /** Kehyksen kuvateksti (kokoelma) tai null. */
  kategoria: string | null;
  accent: string;
  kuva: string | null; // kehyksen kuva (data-URI, 462 × 344) tai null → teemaväri ja kuvio (1d)
  /** Alarivi: tehtävälauseen lyhyt muoto ("Kymmenen kysymystä"). */
  lause: string;
  /** Tekstikoukku (v4 §4, vaihe 4) alarivin paikalla: lauseenaloitus säilyy (ei versaalia). */
  koukku?: string | null;
  /** "Kuva: tekijä / lisenssi" (lib/kuvakrediitti.ts), vain nimeämistä vaativille lisensseille. */
  krediitti: string | null;
};

const JPEG_PITKA = "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400";

async function jpeg(img: ImageResponse) {
  const jpg = await sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": JPEG_PITKA } });
}

function Tunnus({ koko }: { koko: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: koko, lineHeight: 1 }}>
      <span style={{ color: LEIMA }}>TIETO</span>
      <span style={{ color: KERMA }}>NIEKKA</span>
    </div>
  );
}

/** Alarivin koko: lyhyt lause 44 px yhdelle riville, pitkä (järjestyspakan lause) 36 px enintään kahdelle. */
const lauseKoko = (t: string) => (t.length <= 24 ? 44 : t.length <= 34 ? 38 : 34);

async function piirraNimikortti(k: Nimikortti) {
  const nimiKoko = postiNimiKoko(k.nimi);
  return jpeg(new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", overflow: "hidden", background: POHJA, color: KERMA, fontFamily: "Barlow" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, display: "flex", background: `radial-gradient(circle at 78% 45%, ${rgba(k.accent, 0.2)}, rgba(19,17,9,0) 55%)` }} />
        {/* Kuvakehys: 490 × 420, sisäväli 14/14/62, kierto 3°, varjo */}
        <div style={{ position: "absolute", left: 640, top: 92, width: 490, height: 420, display: "flex", padding: "14px 14px 62px", background: KERMA, transform: "rotate(3deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative", display: "flex", width: 462, height: 344, overflow: "hidden", background: "#1A170F" }}>
            {k.kuva ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={k.kuva} width={462} height={344} alt="" style={{ width: 462, height: 344 }} />
            ) : (
              /* Kuvaton (1d): teemavärin raidat tummalla pohjalla */
              <div style={{ position: "absolute", left: 0, top: 0, width: 462, height: 344, display: "flex", background: `repeating-linear-gradient(135deg, ${rgba(k.accent, 0.3)} 0px, ${rgba(k.accent, 0.3)} 22px, ${rgba(k.accent, 0.12)} 22px, ${rgba(k.accent, 0.12)} 44px)` }} />
            )}
          </div>
          {k.kategoria && (
            <div style={{ position: "absolute", right: 22, bottom: 16, display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 28, textTransform: "uppercase", color: "#3A3120" }}>{k.kategoria}</div>
          )}
        </div>
        {/* Sarake: left 64, top 56, bottom 52, leveys 540 */}
        <div style={{ position: "absolute", left: 64, top: 56, bottom: 52, width: SARAKE, display: "flex", flexDirection: "column" }}>
          <Tunnus koko={34} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 800, letterSpacing: 3.6, textTransform: "uppercase", color: k.accent }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: k.accent, marginRight: 12 }} />
            {k.tyyppi}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: nimiKoko, lineHeight: 0.92, textTransform: "uppercase" }}>{k.nimi}</div>
          {k.koukku ? (
            /* Koukku ≤ 75 merkkiä: Barlow Condensed 800 40 px ≈ 17 px/merkki → enintään kolme riviä 540 px:n sarakkeessa. */
            <div style={{ display: "flex", marginTop: 24, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, lineHeight: 1.05, color: "#B6FF3C" }}>{k.koukku}</div>
          ) : (
            <div style={{ display: "flex", marginTop: 24, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: lauseKoko(k.lause), lineHeight: 1.02, textTransform: "uppercase", color: "#B6FF3C" }}>{k.lause}</div>
          )}
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: KERMA }}>tietoniekka.fi</div>
        </div>
        <Krediitti teksti={k.krediitti} />
      </div>
    ),
    { width: W, height: H, fonts: await haePostiFontit() },
  ));
}

type Koukkukortti = {
  kysymys: string;
  vaihtoehdot: string[]; // aakkosjärjestyksessä (oikea ei erotu)
  /** Kehyksen kuvateksti = korttinimi. */
  nimi: string;
  tyyppi: string;
  accent: string;
  kuva: string | null;   // data-URI
  kuvavisa: boolean;     // kuvakysymys: isompi kehys oikealla, sarake 600
  lause: string;
  krediitti: string | null;
};

/** Luku ja yksikkö samalle riville ("+37,2 °C?" katkesi ennen asteita 7.11.2026). */
const sitoYksikot = (t: string) => t.replace(/(\d) (°|%|km|m\b|kg|€)/g, "$1\u00a0$2");

async function piirraKoukkukortti(k: Koukkukortti) {
  const pic = k.kuvavisa;
  const sarake = pic ? 600 : 680;
  /* KYSYMYSSÄÄNTÖ: ≤ 45 merkkiä 64 px, muuten 52 px (pitkillä vaihtoehdoilla 44 px); koukku ≤ 75 merkkiä. */
  /* Kahden sarakkeen pillerissä tekstille jää (sarake − 10) ÷ 2 − 92 px; Barlow 700 30 px ≈ 16 px/merkki
     ("Bagan-temppeli" katkesi kuvavisan 600 px:n sarakkeessa 7.11.2026). Pidempi vaihtoehto → yksi sarake. */
  const tekstille = Math.floor((sarake - 10) / 2) - 92;
  const pitka = k.vaihtoehdot.some((o) => o.length * 16 > tekstille);
  const qKoko = k.kysymys.length <= 45 ? 64 : pitka ? 44 : 52;
  const optW = pitka ? sarake : Math.floor((sarake - 10) / 2);
  /* Kahden kohteen vertailussa (v4 kortti A) yksi sarake mahtuu isompana: 2 × 60 px. */
  const kaksi = pitka && k.vaihtoehdot.length === 2;
  const optH = kaksi ? 60 : pitka ? 44 : 68;
  const chip = kaksi ? 42 : pitka ? 34 : 46;
  const kehys = pic ? { x: 712, y: 56, w: 430, h: 500 } : { x: 826, y: 84, w: 320, h: 400 };
  const sisa = { w: kehys.w - 24, h: kehys.h - 12 - 56 };
  return jpeg(new ImageResponse(
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
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 12, display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: k.nimi.length > 18 ? 22 : 26, lineHeight: 1.05, textTransform: "uppercase", color: "#3A3120", overflow: "hidden", whiteSpace: "nowrap" }}>{k.nimi}</div>
        </div>
        <div style={{ position: "absolute", left: 64, top: 52, bottom: 48, width: sarake, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tunnus koko={34} />
            <div style={{ display: "flex", width: 2, height: 26, background: "#3A3120", margin: "0 16px" }} />
            <div style={{ display: "flex", fontSize: 22, fontWeight: 800, letterSpacing: 3.5, textTransform: "uppercase", color: k.accent, whiteSpace: "nowrap" }}>{k.tyyppi}</div>
          </div>
          <div style={{ display: "flex", flexGrow: 1, minHeight: 16 }} />
          <div style={{ display: "flex", fontFamily: "Archivo SemiCondensed", fontWeight: 800, fontSize: qKoko, lineHeight: 1.08, letterSpacing: -0.01 * qKoko }}>{sitoYksikot(k.kysymys)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: pitka ? 8 : 10, marginTop: pitka ? 18 : 24 }}>
            {k.vaihtoehdot.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", width: optW, height: optH, padding: "0 18px 0 10px", borderRadius: 999, background: "#1F1B14", border: "2px solid #3A3120" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: chip, height: chip, marginRight: 14, borderRadius: chip / 2, background: "#2C2517", fontSize: pitka && !kaksi ? 20 : 24, fontWeight: 800, color: k.accent }}>{"ABCD"[i]}</div>
                <div style={{ display: "flex", fontSize: pitka && !kaksi ? 25 : 30, fontWeight: 700, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden" }}>{o}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexGrow: 1, minHeight: 16 }} />
          <div style={{ display: "flex", alignItems: "baseline" }}>
            {/* Alarivi ja osoite samalla rivillä: tilaa (sarake − 200) px; Barlow Condensed 800 versaalina ≈ 0,47 em/merkki
                ("LAITA KAHDEKSAN IKÄJÄRJESTYKSEEN" meni osoitteen päälle 7.11.2026). */}
            <div style={{ display: "flex", marginRight: 18, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: Math.min(40, Math.floor((sarake - 200) / (k.lause.length * 0.47))), lineHeight: 1, textTransform: "uppercase", color: "#B6FF3C", whiteSpace: "nowrap" }}>{k.lause}</div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: KERMA, whiteSpace: "nowrap" }}>tietoniekka.fi</div>
          </div>
        </div>
        <Krediitti teksti={k.krediitti} />
      </div>
    ),
    { width: W, height: H, fonts: await haePostiFontit() },
  ));
}

const isoAlku = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Tietovisan kortti: koukkukortti, tai nimikortti jos korttiin mahtuvaa koukkua ei ole. */
async function visanEsikatselu(slug: string): Promise<Response | null> {
  const quiz = await haeVisa(slug);
  if (!quiz) return null;
  const r = resolveCollection(quiz);
  const nimi = korttinimi({ korttinimi: quiz.korttinimi, title: quiz.display_title ?? quiz.title });
  const { koukku, maara } = await visanKoukku(quiz.id);
  const lause = kuvalause("tietovisa", maara || undefined);
  if (koukku) {
    const { kuva, krediitti } = await visanKorttikuvaJaLahde(quiz, 296, 332);
    return piirraKoukkukortti({ kysymys: koukku.kysymys, vaihtoehdot: korttiVaihtoehdot(koukku.vaihtoehdot), nimi, tyyppi: "Tietovisa", accent: r.accent, kuva, kuvavisa: false, lause, krediitti });
  }
  const { kuva, krediitti } = await visanKorttikuvaJaLahde(quiz, 462, 344);
  return piirraNimikortti({ nimi, tyyppi: "Tietovisa", kategoria: r.label, accent: r.accent, kuva, lause, krediitti });
}

/** Megavisan kortti: koukku megan kysymyksistä, kuva megavisojen listasta. */
async function megaEsikatselu(slug: string): Promise<Response | null> {
  const sb = getSupabase();
  const m = [MEGA_FEATURED, ...MEGA_GRID].find((x) => x.slug === slug);
  const { data } = sb ? await sb.from("quizzes").select("id, title, display_title" as never).eq("slug", slug).maybeSingle() : { data: null };
  const q = data as unknown as { id: string; title: string; display_title: string | null } | null;
  if (!q) return null;
  const nimi = korttinimi({ korttinimi: null, title: q.display_title ?? q.title });
  const [koukku, maarat] = await Promise.all([megaKoukku(q.id), megaMaarat(sb!, [q.id])]);
  const n = maarat.get(q.id);
  const tyyppi = isoAlku(pelityyppi("megavisa", n));
  const kuvaPolku = m?.img ?? "/20/megavisa.webp";
  if (koukku) {
    /* Koukun alla "Ja 44 muuta kysymystä" (v4 §4). */
    const lause = n ? megaJatko(n).replace(/\.$/, "") : kuvalause("megavisa");
    return piirraKoukkukortti({ kysymys: koukku.kysymys, vaihtoehdot: korttiVaihtoehdot(koukku.vaihtoehdot), nimi, tyyppi, accent: KULTA, kuva: await kuvaUri(kuvaPolku, 296, 332), kuvavisa: false, lause, krediitti: krediittiPolulle(kuvaPolku) });
  }
  return piirraNimikortti({ nimi, tyyppi, kategoria: null, accent: KULTA, kuva: await kuvaUri(kuvaPolku, 462, 344), lause: kuvalause("megavisa", n), krediitti: krediittiPolulle(kuvaPolku) });
}

/** Kuvavisan kortti: ?k=<kuvan id> → kuvakysymys koukkuna (ei henkilökuvia), muuten nimikortti kortiston kannella. */
async function kuvavisanEsikatselu(kortisto: string, kId: string | null, nimiParam: string | null, n: number): Promise<Response | null> {
  const kat = KATEGORIAT.find((k) => k.type === kortisto || (kortisto === "vaakuna" && k.type === "vaakunat"));
  if (!kat && kortisto !== "viikko" && kortisto !== "kaupungit") return null;
  const nimi = nimiParam && nimiParam.length <= 40 && /^[\p{L}\d\s·–-]+$/u.test(nimiParam) ? nimiParam : kuvavisanNimi(kortisto);
  const accent = kat?.accent ?? "#22D3EE";
  const lause = kuvalause("kuvavisa", n);
  const kq = kId ? await haeKuvakysymys(kId) : null;
  const kqKat = kq ? KATEGORIAT.find((k) => k.type === kq.type) : null;
  if (kq && kqKat && kq.type !== "henkilot" && kq.question.trim().length <= 75 && mahtuuKorttiin({ question: kq.question, options: kq.options })) {
    return piirraKoukkukortti({
      kysymys: kq.question.trim(), vaihtoehdot: korttiVaihtoehdot(kq.options), nimi, tyyppi: "Kuvavisa", accent: kqKat.accent,
      kuva: await kuvaUri(kq.image, 406, 432, {}, false, kqKat.sovitus === "contain"), kuvavisa: true, lause, krediitti: krediittiTekstista(kq.lahde),
    });
  }
  /* Henkilökuvavisan kansi on kasvokuva → kuvio. */
  const kansi = kat && kat.type !== "henkilot" ? await kuvavisanKansi(kat.type, new Set()) : null;
  const kuva = kansi ? await kuvaUri(kansi.src, 462, 344, {}, false, kansi.sovitus === "contain")
    : kortisto === "viikko" || kortisto === "kaupungit" ? await kuvaUri(KUVAVISA_KUVA[kortisto], 462, 344) : null;
  return piirraNimikortti({ nimi, tyyppi: "Kuvavisa", kategoria: null, accent, kuva, lause, krediitti: kansi ? krediittiTekstista(kansi.lahde) : null });
}

const PITKA = "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400";

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
  karttapelit: { eyebrow: "Pelimuoto", otsikko: "Karttapelit", kuva: "/20/rajanaapurit/banneri-kartta.webp", accent: "#4ADE80" },
  rajanaapurit: { eyebrow: "Pelimuoto", otsikko: "Rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", accent: "#4FD1F5" },
  ikajarjestys: { eyebrow: "Tietoketju", otsikko: "Ikäjärjestys", kuva: "/20/teema-tunnetut-henkilot.webp", accent: "#C9A96A" },
  megavisat: { eyebrow: "Pitkät visat", otsikko: "Megavisat", kuva: "/20/megavisa.webp", accent: KULTA },
  kokoelmat: { eyebrow: "Tietoniekka", otsikko: "Kaikki kokoelmat", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
  viikkovisa: { eyebrow: "Kuvavisa", otsikko: "Viikkovisa", kuva: "/20/kuvavisat/hero.webp", accent: "#22D3EE" },
  "kuvien-lahteet": { eyebrow: "Tietoniekka", otsikko: "Kuvien lähteet", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
  visapaketit: { eyebrow: "Tietoniekka", otsikko: "Visapaketit", kuva: "/20/hero-mikko-laura.webp", accent: KULTA },
};

/* Pelimuotojen sivukortit (v4 §4): nimikortti. Muut /og/sivu/-avaimet (hubit) käyttävät yhä taustakuvakorttia. */
type Pelisivu = {
  nimi: string; muoto: Pelimuoto; kuva: string | null; accent: string; sovita?: boolean; lause?: string;
  /** v4 §4, vaihe 4: vertailu tai kysymys (vaihtoehdot) → koukkukortti; pelkkä teksti → nimikortin alarivi. */
  koukku?: KasinKoukku | Koukku | string | null;
};
const PELISIVUT: Record<string, Pelisivu> = {
  /* Tuplan banneri on studiokuva ihmisistä → teeman palkintoikoni kokonaisena. */
  "tupla-tai-kuitti": { nimi: "Tupla tai kuitti", muoto: "tupla", kuva: "/20/tupla/ikoni-kolikko.webp", accent: "#B6FF3C", sovita: true },
  kuntaliitos: { nimi: "Kuntaliitos", muoto: "kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", accent: "#E8A320" },
  rajanaapurit: { nimi: "Rajanaapurit", muoto: "rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", accent: "#4FD1F5" },
  vaalipiiriketju: { nimi: VPK_JAKONIMI, muoto: "vaalipiiriketju", kuva: "/20/vaalit/hero.webp", accent: "#B4A5FF", koukku: VPK_KOUKKU },
  /* Ikäjärjestyksen vanha kasvokooste on henkilökuva → kuvio. */
  ikajarjestys: { nimi: "Laita järjestykseen", muoto: "ikajarjestys", kuva: null, accent: "#C9A96A" },
};

async function pelisivunEsikatselu(o: Pelisivu) {
  const k = o.koukku;
  if (k && typeof k !== "string" && k.vaihtoehdot?.length) {
    /* Vertailussa kaksi kohdetta aakkosjärjestyksessä (pakat.ts), kysymyksessä korttiVaihtoehdot järjestää. */
    return piirraKoukkukortti({
      kysymys: k.kysymys, vaihtoehdot: "id" in k ? korttiVaihtoehdot(k.vaihtoehdot) : [...k.vaihtoehdot], nimi: o.nimi,
      tyyppi: isoAlku(pelityyppi(o.muoto)), accent: o.accent, kuva: o.kuva ? await kuvaUri(o.kuva, 296, 332, {}, false, o.sovita) : null,
      kuvavisa: false, lause: o.lause ?? kuvalause(o.muoto), krediitti: o.kuva ? krediittiPolulle(o.kuva) : null,
    });
  }
  return piirraNimikortti({
    koukku: typeof k === "string" ? k : null,
    nimi: o.nimi, tyyppi: isoAlku(pelityyppi(o.muoto)), kategoria: null, accent: o.accent,
    kuva: o.kuva ? await kuvaUri(o.kuva, 462, 344, {}, false, o.sovita) : null, lause: o.lause ?? kuvalause(o.muoto), krediitti: o.kuva ? krediittiPolulle(o.kuva) : null,
  });
}

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
  let vastaus: Response | null = null;

  /* Vanhojen jakolinkkien ?tulos= ja &k= (tietovisa) ohitetaan: sama esikatselukortti kaikille (v4 §4). */
  if (tyyppi === "visa" && avain) {
    vastaus = await visanEsikatselu(avain);
  } else if (tyyppi === "mega" && avain) {
    vastaus = await megaEsikatselu(avain);
  } else if (tyyppi === "kuvavisa" && avain) {
    /* Haastetunnuksen (/h/) kortti: ?k=<kuvan id> koukuksi ja ?nimi= variaation nimeksi. */
    const n = avain === "viikko" ? VIIKKOVISA_KUVIA : 10;
    vastaus = await kuvavisanEsikatselu(avain, url.searchParams.get("k"), url.searchParams.get("nimi"), n);
  } else if (tyyppi === "tupla" && haeTuplaTeema(avain)) {
    const t = haeTuplaTeema(avain)!;
    vastaus = await pelisivunEsikatselu({ nimi: t.nimi, muoto: "tupla", kuva: `/20/tupla/ikoni-${t.palkinto.ikoni}.webp`, accent: t.accent, sovita: true, koukku: await haeKysymysKoukku(t.koukku) });
  } else if (tyyppi === "aanivisa" && ryhmaPolusta(avain)) {
    const r = ryhmaPolusta(avain)!;
    vastaus = await pelisivunEsikatselu({ nimi: r.otsikko, muoto: "aanivisa", kuva: r.hero?.levea.pieni ?? "/20/teema-luonto.webp", accent: "#4ADE80", lause: kuvalause("aanivisa", AANIVISA_KYSYMYKSIA), koukku: r.koukku });
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
    /* Järjestyspakka: pakan nimi (pakan oma lause on og:descriptionissa); henkilöpakoissa ei kuvaa (ei henkilökuvia). */
    const p = haePakka(avain)!;
    vastaus = await pelisivunEsikatselu({ nimi: p.kortti.otsikko, muoto: "jarjesta", kuva: p.kind === "person" || onHenkilokuva(p.slug, p.kuva) ? null : p.kuva, accent: "#E8A320", koukku: p.koukku });
  } else if (tyyppi === "jarjesta" && haeIkaPakka(avain)) {
    const p = haeIkaPakka(avain)!;
    vastaus = await pelisivunEsikatselu({ nimi: p.nimi, muoto: "ikajarjestys", kuva: null, accent: "#C9A96A", koukku: p.koukku });
  } else if (tyyppi === "visapaketti" && avain) {
    const sivu = await haeSivu(avain, null);
    if (sivu) {
      const p = sivu.vp.paketti;
      kortti = {
        eyebrow: "Valmis visailta", otsikko: sivu.painokset && p.sarja ? sarjaNimi(p.sarja) : p.otsikko, accent: p.aksentti ?? KULTA,
        tausta: await kuvaUri(p.hero_image ?? "/20/hero-mikko-laura.webp", W, H),
        alarivi: metarivi(p, kierrosmaarat(sivu.vp), kysymysmaarat(sivu.vp)).join(" · "),
      };
    }
  } else if (tyyppi === "sivu" && avain === "mika-maa") {
    /* Mikä maa? (CD-paketti 7.11. §5): sama kortti pelille ja tulokselle; lause on päivän vihje 1, joten kortti vaihtuu
       päivittäin (?p=YYYY-MM-DD välimuistin avaimena). Ei maata, lippua eikä tulosta. */
    const p = url.searchParams.get("p");
    const k = await maaKierros(p && /^\d{4}-\d{2}-\d{2}$/.test(p) ? p : helsinginPaiva().iso, null);
    vastaus = await pelisivunEsikatselu({ nimi: "Mikä maa?", muoto: "vihjepeli", kuva: "/20/mika-maa/tunnus.webp", accent: "#B4532A", lause: k?.vihjeet[0] });
  } else if (tyyppi === "sivu" && PELISIVUT[avain]) {
    vastaus = await pelisivunEsikatselu(PELISIVUT[avain]);
  } else if (tyyppi === "sivu" && SIVUT[avain]) {
    const s = SIVUT[avain];
    kortti = { eyebrow: s.eyebrow, otsikko: s.otsikko, accent: s.accent, tausta: await kuvaUri(s.kuva, W, H) };
  }
  if (vastaus) return vastaus;

  if (!kortti) {
    const oletus = await paikallinen("/og-image.png");
    return new Response(oletus ? new Uint8Array(oletus) : null, {
      status: oletus ? 200 : 404,
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=600" },
    });
  }
  return piirra(kortti, PITKA);
}
