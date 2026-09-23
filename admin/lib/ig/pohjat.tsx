/* eslint-disable @next/next/no-img-element */
// Instagram-pohjat — Claude Design "TN Instagram-pohjat v0.3", kierros 4:
// "Kortti puhuu katsojalle, ei tietokannasta". Metatiedot (visan virallinen nimi,
// päivämäärä, kokoelma, tapahtuma) eivät piirry kuvaan; tapahtuma kulkee
// kuvatekstissä. Jokaisessa kortissa enintään kolme viestitasoa — koukku,
// palkinto, CTA — ja pieni Tietoniekka-merkki.
//
// Mitat, värit ja fonttikoot ovat designin kortteja 4a–4r. Poikkeamat on
// merkitty "POIKKEAMA" ja syy kerrottu. Mockupin katkoviivakentät (quiz_question,
// question_count …) ovat sisältökenttiä: tuotannossa ne täyttyvät visan datasta
// ilman katkoviivaa ja kenttänimeä.
//
// Piirto: next/og (Satori) — vain flexbox, kiinteät pikselit. Isot tekstit
// sovitetaan mittaamalla (fontit.ts: sovita) ja piirretään valmiiksi rivitettyinä
// (KORTTISÄÄNTÖ). Tavutuskohta "Jokeri|fani" katkeaa vain, jos sana ei muuten mahdu.

import type { ReactElement } from "react";
import { ilmanTavutusta, leveys, sovita, type lataaFontit } from "./fontit";
import { kelpaa, rajaa, type Kuva, type Kysymys, type SynttariData, type VisaData } from "./data";
import { juontajaPng, valitseJuontaja, type Asento, type Kuka } from "./juontajat";

export const W = 1080;
export const H = 1350;

type Mitat = Awaited<ReturnType<typeof lataaFontit>>["mitat"];

import {
  KOMMENTTIPOHJAT,
  SYNT_POHJAT,
  VISA_POHJAT,
  kysymyksiaPohjalle,
  type Pohja,
} from "./pohjatiedot";
export * from "./pohjatiedot";

/* ── Toimitetut kentät ───────────────────────────────────────────────── */

/** Designin kenttämalli (4k). Kaikki muokattavia hyväksyntänäkymässä. */
export type Kentat = {
  /** social_topic: toimituksellinen lyhenne ("JOKERIT", "SALKKARIT") — ei katkaistu visan nimi */
  aihe?: string;
  /** social_hook: pakollinen, aina kortin suurin asia. "|" = tavutuskohta ("Jokeri|fani") */
  koukku?: string;
  /** social_reward: valinnainen — pois, jos koukku jo lupaa palkinnon */
  palkinto?: string;
  /** social_cta: 2–4 sanaa, myy palkintoa */
  cta?: string;
  /** route_instruction näkyy (oletus: kyllä, paitsi kommenttikorteissa) */
  reitti?: boolean;
  /** quiz_question: visan kysymysten id:t (4f, 4m, 4o, 4p, 4q: yksi; 4l: kolme) */
  kysymykset?: string[];
  /** event_context: vain kuvatekstiin (esim. "Jokerit kohtaa TPS:n tänään") */
  tapahtuma?: string;
  /** Korvaava kuva tai uusi rajaus */
  kuva?: { url: string; fx: number; fy: number };
  /** Henkilökuvan kuvaaja ja lisenssi (4i, CC BY-SA → kuvatekstiin) */
  kuvaaja?: string;
  /** Pohja, jolle tekstit on luonnosteltu (pohjan vaihto → uusi luonnos) */
  luonnosPohjalle?: string;
};

export type Piirros = {
  ruudut: ReactElement[];
  esteet: string[];
  huomiot: string[];
  onKuva: boolean;
};

/* ── Piirtokonteksti ─────────────────────────────────────────────────── */

type Kuvaksi = (k: Kuva, w: number, h: number, o?: { seepia?: number }) => Promise<string>;
type Juontaja = (asento: Asento, korkeus: number, kuka: Kuka[]) => Promise<{ data: string; leveys: number; korkeus: number; kuka: Kuka } | null>;

type Ktx = { m: Mitat; kuvaksi: Kuvaksi; juontaja: Juontaja; siemen: string };

const TYHJA = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

function konteksti(m: Mitat, siemen: string, piirra: boolean): Ktx {
  return {
    m,
    siemen,
    kuvaksi: piirra ? (k, w, h, o) => rajaa(k, w, h, o) : async () => TYHJA,
    juontaja: async (asento, korkeus, kuka) => {
      const k = await valitseJuontaja(asento, siemen, kuka);
      if (!k) return null;
      if (piirra) {
        const png = await juontajaPng(k, korkeus);
        return png ? { ...png, kuka: k.kuka } : null;
      }
      const suhde = k.leveys && k.korkeus ? k.leveys / k.korkeus : 0.8;
      return { data: TYHJA, leveys: Math.round(korkeus * suhde), korkeus, kuka: k.kuka };
    },
  };
}

/* ── Apurit ──────────────────────────────────────────────────────────── */

const isot = (s: string) => s.toLocaleUpperCase("fi-FI");
const t = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const REITTI = "tietoniekka.fi · linkki biossa";

/** POIKKEAMA: designin rivivälit .84–.88 ovat liian tiukkoja isoille kirjaimille —
    Ä:n ja Ö:n pisteet ulottuvat Archivo 900:ssa 0,885 em:n korkeuteen ja osuvat
    edellisen rivin kirjaimiin. Isoilla kirjaimilla vähintään 0,95 (kuten kierros 2). */
const ISOT_LH = 0.95;

function Rivit(p: { rivit: string[]; koko: number; lh: number; style: Record<string, unknown> }) {
  const isoilla = p.rivit.every((r) => r === r.toLocaleUpperCase("fi-FI"));
  const lh = isoilla ? Math.max(p.lh, ISOT_LH) : p.lh;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {p.rivit.map((r, i) => (
        <div key={i} style={{ display: "flex", whiteSpace: "nowrap", fontSize: p.koko, lineHeight: `${Math.round(p.koko * lh)}px`, ...p.style }}>
          {r}
        </div>
      ))}
    </div>
  );
}

/** Iso otsikko (koukku, kysymys) Archivo 900 isoilla kirjaimilla. */
function otsikko(c: Ktx, teksti: string, o: { koot: number[]; leveys: number; maxRivit: number; valistys: number }) {
  return sovita(c.m, { teksti, perhe: "Archivo", paino: 900, isot: true, valistysEm: o.valistys, koot: o.koot, leveys: o.leveys, maxRivit: o.maxRivit });
}

function Iso(p: { s: ReturnType<typeof sovita>; valistys: number; vari: string; lh?: number }) {
  return <Rivit rivit={p.s.rivit} koko={p.s.koko} lh={p.lh ?? 0.86} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: p.valistys * p.s.koko, color: p.vari }} />;
}

/** Leipäteksti (palkinto, vaihtoehdot) — ei isoja kirjaimia. */
function leipa(c: Ktx, teksti: string, o: { koot: number[]; leveys: number; maxRivit: number; paino?: 600 | 700 }) {
  return sovita(c.m, { teksti, perhe: "Instrument Sans", paino: o.paino ?? 600, koot: o.koot, leveys: o.leveys, maxRivit: o.maxRivit });
}

function Leipa(p: { s: ReturnType<typeof sovita>; vari: string; paino?: number; lh?: number }) {
  return <Rivit rivit={p.s.rivit} koko={p.s.koko} lh={p.lh ?? 1.3} style={{ fontWeight: p.paino ?? 600, color: p.vari }} />;
}

function Nuoli({ koko, vari }: { koko: number; vari: string }) {
  const w = Math.round(koko * 0.95);
  return (
    <svg width={w} height={Math.round(koko * 0.7)} viewBox="0 0 24 18">
      <path d="M1 9h19M13 2l8 7-8 7" stroke={vari} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Merkki({ vari, koko = 26 }: { vari: string; koko?: number }) {
  return <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: koko, letterSpacing: koko * 0.08, color: vari }}>TIETONIEKKA</div>;
}
const merkinLeveys = (c: Ktx) => leveys(c.m, "TIETONIEKKA", "Archivo", 900, 26, 0.08);

function Etiketti({ teksti, vari, valistys = 0.26, koko = 30 }: { teksti: string; vari: string; valistys?: number; koko?: number }) {
  return <div style={{ display: "flex", fontSize: koko, fontWeight: 700, letterSpacing: koko * valistys, color: vari, whiteSpace: "nowrap" }}>{isot(teksti)}</div>;
}

/** Yhden rivin CTA: pienennetään portaittain; jos ei mahdu, este. */
function ctaKoko(c: Ktx, teksti: string, koot: number[], maxLeveys: number, lisa: (k: number) => number, esteet: string[]) {
  for (const k of koot) if (leveys(c.m, isot(teksti), "Archivo", 900, k) + lisa(k) <= maxLeveys) return k;
  esteet.push(`CTA "${teksti}" on liian pitkä — lyhennä (2–4 sanaa).`);
  return koot[koot.length - 1];
}

/** CTA typografiana: iso teksti + nuoli + alleviivaus (4a, 4d, 4e, 4g, 4l, 4i). */
function CtaViiva(p: { c: Ktx; teksti: string; vari: string; viiva: string; koko: number; paksuus: number; nuoli?: boolean; nuoliVari?: string; maxLeveys: number; esteet: string[] }) {
  const nuoli = p.nuoli !== false;
  const k = ctaKoko(p.c, p.teksti, [p.koko, Math.round(p.koko * 0.88), Math.round(p.koko * 0.76)], p.maxLeveys, (x) => (nuoli ? x * 0.95 + 16 : 0), p.esteet);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Archivo", fontWeight: 900, fontSize: k, color: p.vari, borderBottom: `${p.paksuus}px solid ${p.viiva}`, paddingBottom: p.paksuus, alignSelf: "flex-start" }}>
      <span>{isot(p.teksti)}</span>
      {nuoli && <Nuoli koko={k} vari={p.nuoliVari ?? p.vari} />}
    </div>
  );
}

/** CTA painikkeena: 92 px korkea, pilleri tai suorakulmio (4b, 4c, 4f, 4h, 4j, 4m, 4n–4r). */
function CtaNappi(p: { c: Ktx; teksti: string; bg: string; ink: string; pyorea?: boolean; kierto?: number; nuoli?: boolean; maxLeveys: number; esteet: string[] }) {
  const k = ctaKoko(p.c, p.teksti, [40, 36, 32], p.maxLeveys, (x) => 80 + (p.nuoli ? x * 0.95 + 18 : 0), p.esteet);
  return (
    <div style={{ height: 92, display: "flex", alignItems: "center", gap: 18, padding: "0 40px", borderRadius: p.pyorea ? 999 : 0, background: p.bg, color: p.ink, fontFamily: "Archivo", fontWeight: 900, fontSize: k, alignSelf: "flex-start", whiteSpace: "nowrap", ...(p.kierto ? { transform: `rotate(${p.kierto}deg)` } : {}) }}>
      <span>{isot(p.teksti)}</span>
      {p.nuoli && <Nuoli koko={k} vari={p.ink} />}
    </div>
  );
}

function Reitti({ teksti, vari, sisennys = 0, paino = 600 }: { teksti: string; vari: string; sisennys?: number; paino?: number }) {
  return <div style={{ display: "flex", fontSize: 26, fontWeight: paino, color: vari, paddingLeft: sisennys }}>{teksti}</div>;
}

/** Alarivi: CTA + reittiohje vasemmalla, merkki oikealla. */
function Alarivi(p: { cta: ReactElement; reitti: string | null; reittiVari: string; merkki: string | null; sisennys?: number; gap?: number; reittiPaino?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: p.gap ?? 12 }}>
        {p.cta}
        {p.reitti ? <Reitti teksti={p.reitti} vari={p.reittiVari} sisennys={p.sisennys} paino={p.reittiPaino} /> : null}
      </div>
      {p.merkki ? <Merkki vari={p.merkki} /> : null}
    </div>
  );
}

function Kortti(p: { bg: string; padding?: number | string; children: React.ReactNode; vari?: string }) {
  return (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: p.padding ?? 72, background: p.bg, fontFamily: "Instrument Sans", ...(p.vari ? { color: p.vari } : {}) }}>
      {p.children}
    </div>
  );
}

function Absoluuttinen(p: { bg: string; children: React.ReactNode }) {
  return <div style={{ position: "relative", width: W, height: H, display: "flex", overflow: "hidden", background: p.bg, fontFamily: "Instrument Sans" }}>{p.children}</div>;
}

/** Pakollinen koukku: tyhjä → este. */
function vaadiKoukku(k: Kentat, oletus: string | null, esteet: string[]) {
  const x = t(k.koukku) || oletus || "";
  if (!x) esteet.push("Koukku puuttuu (social_hook, pakollinen) — kirjoita tai pyydä tekoälyltä.");
  return x || "Koukku puuttuu";
}

function tarkistaMahtuu(s: { mahtuu: boolean }, mika: string, esteet: string[]) {
  if (!s.mahtuu) esteet.push(`${mika} ei mahdu — lyhennä tai merkitse tavutuskohta (esim. Jokeri|fani).`);
}

const reittiNakyy = (k: Kentat, pohja: Pohja) => (k.reitti ?? !KOMMENTTIPOHJAT.includes(pohja)) !== false;

/* ── Kysymysten valinta ──────────────────────────────────────────────── */

function hajautus(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Viittaa vaihtoehtoihin — ei toimi ilman niitä (4l, 4m, 4p). */
const VIITTAA_VAIHTOEHTOIHIN = /seuraavista|alla olevista|näistä|oheisista|mikä seuraava|kuka seuraava/i;

/** Sopiiko kysymys pohjaan: kuvakysymykset pois, pituusrajat pohjan tilan mukaan. */
export function sopiiKysymykseksi(q: Kysymys, pohja: Pohja): boolean {
  if (q.kuva || !q.teksti) return false;
  const vaihtoehdoilla = pohja === "4f" || pohja === "4q" || pohja === "4o";
  if (vaihtoehdoilla) {
    if (q.vaihtoehdot.length < 2 || !q.oikea) return false;
    const maxV = pohja === "4q" ? 24 : 34;
    if (q.vaihtoehdot.some((v) => v.length > maxV)) return false;
  } else {
    if (VIITTAA_VAIHTOEHTOIHIN.test(q.teksti)) return false;
    if ((pohja === "4m" || pohja === "4p") && !q.oikea) return false;
  }
  const max: Partial<Record<Pohja, number>> = { "4f": 100, "4q": 80, "4o": 90, "4m": 110, "4p": 90, "4l": 90 };
  return q.teksti.length <= (max[pohja] ?? 100);
}


/** Kortin kysymykset: toimituksen valitsemat, tai automaattisesti sopivista siemenen mukaan. */
export function kortinKysymykset(v: VisaData, k: Kentat, pohja: Pohja, siemen: string): Kysymys[] {
  const n = kysymyksiaPohjalle(pohja);
  if (n === 0) return [];
  const valitut = (k.kysymykset ?? []).map((id) => v.kysymykset.find((q) => q.id === id)).filter((q): q is Kysymys => !!q);
  if (valitut.length >= n) return valitut.slice(0, n);
  const sopivat = v.kysymykset
    .filter((q) => sopiiKysymykseksi(q, pohja) && !valitut.includes(q))
    .sort((a, b) => hajautus(siemen + a.id) - hajautus(siemen + b.id));
  return [...valitut, ...sopivat].slice(0, n);
}

/* ── Visapohjat ──────────────────────────────────────────────────────── */

const SISA = W - 2 * 72; // 936

/** 4a Identiteetti · kuva koko pinnalla, teksti alhaalla liukuvärin päällä. */
async function p4a(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  if (!v.kuva) esteet.push("4a vaatii kuvan — ilman kuvaa käytä 4b:tä.");
  else if (!kelpaa(v.kuva, W, H)) esteet.push(`Kuva liian pieni koko pinnalle (${v.kuva.leveys}×${v.kuva.korkeus}, tarvitaan väh. 720×900) — vaihda kuva tai käytä 4b:tä.`);
  const koukku = vaadiKoukku(k, null, esteet);
  const sis = W - 128;
  const ots = otsikko(c, koukku, { koot: [168, 150, 132, 116, 100, 88], leveys: sis, maxRivit: 4, valistys: -0.045 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const palkinto = t(k.palkinto);
  const pal = palkinto ? leipa(c, palkinto, { koot: [40, 36], leveys: 560, maxRivit: 2 }) : null;
  if (pal) tarkistaMahtuu(pal, "Palkintorivi", esteet);
  const kuva = v.kuva ? await c.kuvaksi(v.kuva, W, H) : null;
  const cta = t(k.cta) || "Testaa fanitasosi";
  return {
    ruudut: [
      <Absoluuttinen key="4a" bg="#07101E">
        {kuva && <img src={kuva} width={W} height={H} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} />}
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(7,16,30,0) 30%, rgba(7,16,30,.78) 62%, #07101E 88%)" }} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 64, display: "flex", flexDirection: "column", gap: 34 }}>
          <Iso s={ots} valistys={-0.045} vari="#FFFFFF" lh={0.84} />
          {pal && <Leipa s={pal} vari="#5CF2B0" />}
          <Alarivi
            cta={<CtaViiva c={c} teksti={cta} vari="#FFFFFF" viiva="#5CF2B0" nuoliVari="#5CF2B0" koko={52} paksuus={6} maxLeveys={sis - merkinLeveys(c) - 24} esteet={esteet} />}
            reitti={reittiNakyy(k, "4a") ? REITTI : null}
            reittiVari="#8FA0B8"
            merkki="#FFFFFF"
            gap={10}
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: !!kuva,
  };
}

/** 4g Identiteetti · kuva kehyksessä ylhäällä, koukku alla. */
async function p4g(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const kw = W - 80;
  const kh = H - 40 - 460;
  if (!v.kuva) esteet.push("4g vaatii kuvan — ilman kuvaa käytä 4b:tä.");
  else if (!kelpaa(v.kuva, kw, kh)) esteet.push(`Kuva liian pieni (${v.kuva.leveys}×${v.kuva.korkeus}, tarvitaan väh. ${Math.ceil(kw / 1.5)}×${Math.ceil(kh / 1.5)}).`);
  const koukku = vaadiKoukku(k, null, esteet);
  // POIKKEAMA: design 150 px kahdella rivillä rivivälillä .84. Rivivälillä .95
  // kaksi riviä + CTA mahtuvat kuvan alle vasta 128 px:llä; kolme riviä 84 px:llä.
  const kaksi = otsikko(c, koukku, { koot: [128, 112, 100, 88], leveys: W - 144, maxRivit: 2, valistys: -0.045 });
  const ots = kaksi.mahtuu ? kaksi : otsikko(c, koukku, { koot: [84, 76], leveys: W - 144, maxRivit: 3, valistys: -0.045 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const kuva = v.kuva ? await c.kuvaksi(v.kuva, kw, kh) : null;
  const cta = t(k.cta) || "Näytä mitä osaat";
  return {
    ruudut: [
      <Absoluuttinen key="4g" bg="#0D0820">
        {kuva ? (
          <img src={kuva} width={kw} height={kh} alt="" style={{ position: "absolute", top: 40, left: 40, width: kw, height: kh, borderRadius: 20 }} />
        ) : (
          <div style={{ position: "absolute", top: 40, left: 40, width: kw, height: kh, borderRadius: 20, background: "#1A1236", display: "flex" }} />
        )}
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 72, display: "flex", flexDirection: "column", gap: 30 }}>
          <Iso s={ots} valistys={-0.045} vari="#FFFFFF" lh={0.84} />
          <Alarivi
            cta={<CtaViiva c={c} teksti={cta} vari="#C9A6FF" viiva="#C9A6FF" koko={52} paksuus={6} maxLeveys={SISA - merkinLeveys(c) - 24} esteet={esteet} />}
            reitti={reittiNakyy(k, "4g") ? REITTI : null}
            reittiVari="#8B82A0"
            merkki="#FFFFFF"
            gap={10}
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: !!kuva,
  };
}

/** 4b Uteliaisuus · kokonaan ilman kuvaa. */
async function p4b(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const koukku = vaadiKoukku(k, null, esteet);
  const ots = otsikko(c, koukku, { koot: [176, 156, 136, 120, 104, 92], leveys: SISA, maxRivit: 4, valistys: -0.05 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const palkinto = t(k.palkinto);
  const pal = palkinto ? leipa(c, palkinto, { koot: [42, 38], leveys: 560, maxRivit: 3 }) : null;
  if (pal) tarkistaMahtuu(pal, "Palkintorivi", esteet);
  const cta = t(k.cta) || "Testaa tietosi";
  const aihe = t(k.aihe);
  return {
    ruudut: [
      <Kortti key="4b" bg="#062A22">
        {aihe ? <Etiketti teksti={aihe} vari="#5CF2B0" /> : <div style={{ display: "flex", height: 36 }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          <Iso s={ots} valistys={-0.05} vari="#EFFFF7" lh={0.84} />
          {pal && <Leipa s={pal} vari="#9FE8C8" />}
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg="#5CF2B0" ink="#062A22" pyorea kierto={-2} nuoli maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4b") ? REITTI : null}
          reittiVari="#6FB89A"
          merkki="#EFFFF7"
          sisennys={8}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4c Pistemäärähaaste: kysymysmäärä kortin suurin luku. */
async function p4c(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const n = v.kysymykset.length;
  // Design: ilman question_countia jättiluku poistuu, pohja ei koskaan arvaa asteikkoa.
  if (!n) huomiot.push("Kysymysmäärä puuttuu — jättiluku jätetty pois.");
  const koukku = vaadiKoukku(k, "Saatko täydet?", esteet);
  const ots = otsikko(c, koukku, { koot: [120, 104, 92, 80], leveys: SISA, maxRivit: 2, valistys: -0.04 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const luku = `${n}/${n}`;
  let lukuKoko = 300;
  while (lukuKoko > 180 && leveys(c.m, luku, "Archivo", 900, lukuKoko, -0.06) > SISA - 40) lukuKoko -= 20;
  const pal = leipa(c, t(k.palkinto) || "Montako saat oikein ilman apua?", { koot: [40, 36], leveys: 600, maxRivit: 2 });
  tarkistaMahtuu(pal, "Palkintorivi", esteet);
  const cta = t(k.cta) || "Tavoittele täysiä";
  const aihe = t(k.aihe);
  return {
    ruudut: [
      <Kortti key="4c" bg="#F2B634" vari="#1A1200">
        {aihe ? <Etiketti teksti={aihe} vari="#1A1200" /> : <div style={{ display: "flex", height: 36 }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Iso s={ots} valistys={-0.04} vari="#1A1200" />
          {n > 0 && (
            <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: lukuKoko, lineHeight: `${Math.round(lukuKoko * 0.86)}px`, letterSpacing: -0.06 * lukuKoko, paddingLeft: 30 }}>{luku}</div>
          )}
          <Leipa s={pal} vari="#1A1200" />
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg="#1A1200" ink="#F2B634" maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4c") ? REITTI : null}
          reittiVari="#6B4E00"
          merkki="#1A1200"
        />
      </Kortti>,
    ],
    esteet,
    huomiot,
    onKuva: false,
  };
}

/** 4d Nostalgia · lämmin kuva ylhäällä + paperipohja. */
async function p4d(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  if (!v.kuva) esteet.push("4d vaatii kuvan.");
  else if (!kelpaa(v.kuva, W, 700)) esteet.push(`Kuva liian pieni (${v.kuva.leveys}×${v.kuva.korkeus}, tarvitaan väh. 720×467).`);
  const koukku = vaadiKoukku(k, null, esteet);
  const ots = otsikko(c, koukku, { koot: [104, 92, 80, 72], leveys: W - 144, maxRivit: 4, valistys: -0.035 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const kuva = v.kuva ? await c.kuvaksi(v.kuva, W, 700, { seepia: 0.25 }) : null;
  const cta = t(k.cta) || "Testaa muistisi";
  return {
    ruudut: [
      <div key="4d" style={{ width: W, height: H, display: "flex", flexDirection: "column", background: "#F3E7D3", fontFamily: "Instrument Sans" }}>
        {kuva ? <img src={kuva} width={W} height={700} alt="" style={{ width: W, height: 700 }} /> : <div style={{ display: "flex", width: W, height: 700, background: "#D8C7A8" }} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px 64px", color: "#2A1A10" }}>
          <Iso s={ots} valistys={-0.035} vari="#2A1A10" lh={0.88} />
          <Alarivi
            cta={<CtaViiva c={c} teksti={cta} vari="#B0331F" viiva="#B0331F" koko={48} paksuus={5} maxLeveys={SISA - merkinLeveys(c) - 24} esteet={esteet} />}
            reitti={reittiNakyy(k, "4d") ? REITTI : null}
            reittiVari="#7A6552"
            merkki="#2A1A10"
            gap={10}
          />
        </div>
      </div>,
    ],
    esteet,
    huomiot: [],
    onKuva: !!kuva,
  };
}

/** 4e Sosiaalinen kilpailu · kuva taustalla, tarra ohjaa merkitsemään kaverin. */
async function p4e(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const kuvaOk = !!v.kuva && kelpaa(v.kuva, W, H);
  // POIKKEAMA: toimii myös ilman kuvaa (tumma pohja) — sosiaalinen koukku ei
  // riipu kuvasta, ja isoja kuvia on vähän.
  if (v.kuva && !kuvaOk) huomiot.push("Kuva liian pieni koko pinnalle — kortti piirtyy ilman kuvaa.");
  const koukku = vaadiKoukku(k, "Kumpi teistä tietää enemmän?", esteet);
  const ots = otsikko(c, koukku, { koot: [128, 112, 96, 84], leveys: SISA, maxRivit: 4, valistys: -0.04 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const aihe = t(k.aihe);
  const tarra = otsikko(c, t(k.palkinto) || "Merkitse se kaveri.", { koot: [56, 50, 44], leveys: SISA - 68 - 40, maxRivit: 2, valistys: 0 });
  tarkistaMahtuu(tarra, "Tarran teksti", esteet);
  const kuva = kuvaOk && v.kuva ? await c.kuvaksi(v.kuva, W, H) : null;
  const cta = t(k.cta) || "Haasta kaveri";
  return {
    ruudut: [
      <Absoluuttinen key="4e" bg="#081226">
        {kuva && <img src={kuva} width={W} height={H} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} />}
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: "linear-gradient(180deg, #081226 0%, rgba(8,18,38,.55) 30%, rgba(8,18,38,0) 50%, rgba(8,18,38,.4) 72%, #081226 96%)" }} />
        <div style={{ position: "absolute", top: 72, left: 72, right: 72, display: "flex" }}>
          <Iso s={ots} valistys={-0.04} vari="#FFFFFF" />
        </div>
        <div style={{ position: "absolute", left: 72, right: 72, bottom: 72, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 14, padding: "26px 34px", background: "#FFFFFF", color: "#081226", transform: "rotate(-3deg)" }}>
            {aihe ? <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 26 * 0.2, color: "#2A5BD7" }}>{isot(aihe)}</div> : null}
            <Iso s={tarra} valistys={0} vari="#081226" lh={1.05} />
          </div>
          <Alarivi
            cta={<CtaViiva c={c} teksti={cta} vari="#FFFFFF" viiva="#7FB8FF" koko={52} paksuus={6} maxLeveys={SISA - merkinLeveys(c) - 24} esteet={esteet} />}
            reitti={reittiNakyy(k, "4e") ? REITTI : null}
            reittiVari="#8FA0B8"
            merkki="#FFFFFF"
            gap={10}
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot,
    onKuva: !!kuva,
  };
}

const KIRJAIMET = ["A", "B", "C", "D"];

function kysymysEste(q: Kysymys | undefined, esteet: string[], pohja: Pohja) {
  if (!q) esteet.push(`${pohja} vaatii visasta sopivan kysymyksen (ei kuvakysymys, riittävän lyhyt${pohja === "4f" || pohja === "4q" || pohja === "4o" ? ", lyhyet vaihtoehdot" : ""}) — valitse kysymys tai toinen pohja.`);
}

/** 4f Oikea visakysymys vaihtoehtoineen · paperipohja. Vastaus kommentteihin. */
async function p4f(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const [q] = kortinKysymykset(v, k, "4f", c.siemen);
  kysymysEste(q, esteet, "4f");
  const kys = otsikko(c, q?.teksti ?? "Kysymys puuttuu", { koot: [86, 76, 66, 58, 50, 44], leveys: SISA, maxRivit: 5, valistys: -0.03 });
  tarkistaMahtuu(kys, "Kysymys", esteet);
  const lw = (SISA - 18) / 2;
  const vaihtoehdot = (q?.vaihtoehdot ?? []).map((x) => leipa(c, x, { koot: [30, 27, 24], leveys: lw - 60 - 30 - 22, maxRivit: 2 }));
  vaihtoehdot.forEach((s) => tarkistaMahtuu(s, "Vaihtoehto", esteet));
  const koukku = leipa(c, t(k.koukku) || "Tiedätkö ilman apua?", { koot: [40, 36], leveys: SISA, maxRivit: 2, paino: 700 });
  const cta = t(k.cta) || "Vastaa kommenttiin";
  const aihe = t(k.aihe);
  return {
    ruudut: [
      <Kortti key="4f" bg="#F5F0E6" vari="#131109">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          {aihe ? <Etiketti teksti={aihe} vari="#131109" /> : <div style={{ display: "flex" }} />}
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 26 * 0.14, color: "#8A7F6A" }}>KYSYMYS VISASTA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <Iso s={kys} valistys={-0.03} vari="#131109" lh={0.95} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {vaihtoehdot.map((s, i) => (
              <div key={i} style={{ width: lw, height: 120, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", border: "3px solid #131109", borderRadius: 16 }}>
                <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: 44 }}>{KIRJAIMET[i]}</div>
                <Leipa s={s} vari="#131109" lh={1.15} />
              </div>
            ))}
          </div>
          <Leipa s={koukku} vari="#131109" paino={700} />
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg="#131109" ink="#F5F0E6" pyorea maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4f") ? `Lisää visoja: ${REITTI}` : null}
          reittiVari="#8A7F6A"
          merkki="#131109"
          sisennys={8}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4l Useampi kysymys ilman vaihtoehtoja. */
async function p4l(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const qs = kortinKysymykset(v, k, "4l", c.siemen);
  if (qs.length < 3) esteet.push("4l vaatii visasta kolme sopivaa kysymystä (ei kuvakysymyksiä, enintään 90 merkkiä, ei viittausta vaihtoehtoihin).");
  // Design: koukun luku seuraa näytettyjen kysymysten määrää.
  const koukku = vaadiKoukku(k, qs.length === 1 ? "Tiedätkö tämän?" : "Montako näistä tiedät?", esteet);
  const aihe = t(k.aihe);
  const ots = otsikko(c, koukku, { koot: [132, 116, 100, 88], leveys: SISA, maxRivit: 2, valistys: -0.04 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const rivit = qs.map((q) => leipa(c, q.teksti, { koot: [40, 36, 32], leveys: SISA - 64 - 26 - 50, maxRivit: 3, paino: 700 }));
  rivit.forEach((s) => tarkistaMahtuu(s, "Kysymys", esteet));
  const cta = t(k.cta) || "Pelaa koko visa";
  return {
    ruudut: [
      <Kortti key="4l" bg="#07101E">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {aihe ? <Etiketti teksti={aihe} vari="#5CF2B0" /> : null}
          <Iso s={ots} valistys={-0.04} vari="#FFFFFF" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {rivit.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: "28px 32px", border: "3px solid #23385A", borderRadius: 18 }}>
              <div style={{ display: "flex", width: 50, fontFamily: "Archivo", fontWeight: 900, fontSize: 72, lineHeight: "65px", color: "#5CF2B0" }}>{String(i + 1)}</div>
              <Leipa s={s} vari="#E6EDF7" paino={700} lh={1.2} />
            </div>
          ))}
        </div>
        <Alarivi
          cta={<CtaViiva c={c} teksti={cta} vari="#FFFFFF" viiva="#5CF2B0" koko={52} paksuus={6} maxLeveys={SISA - merkinLeveys(c) - 24} esteet={esteet} />}
          reitti={reittiNakyy(k, "4l") ? REITTI : null}
          reittiVari="#8FA0B8"
          merkki="#FFFFFF"
          gap={10}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** Peitetty vastaus. POIKKEAMA: designissa oikea vastaus on sumennettuna palkin alla.
    Vastausta ei piirretä lainkaan (sumennetusta tekstistä voi arvata), vain
    vaaleat palkit tekstin merkiksi. */
function Peitetty(p: { korkeus: number; tausta: string; teippi: string; muste: string; koko: number }) {
  const k = p.korkeus;
  return (
    <div style={{ position: "relative", display: "flex", height: k, borderRadius: 18, background: p.tausta, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 40, top: Math.round(k * 0.24), width: 330, height: Math.round(k * 0.2), borderRadius: 10, background: "rgba(255,255,255,.14)", display: "flex" }} />
      <div style={{ position: "absolute", left: 390, top: Math.round(k * 0.24), width: 160, height: Math.round(k * 0.2), borderRadius: 10, background: "rgba(255,255,255,.1)", display: "flex" }} />
      <div style={{ position: "absolute", left: -20, right: -20, top: Math.round(k * 0.3), height: Math.round(k * 0.43), background: p.teippi, transform: "rotate(-2.5deg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Archivo", fontWeight: 900, fontSize: p.koko, letterSpacing: p.koko * 0.2, color: p.muste }}>
        PEITETTY
      </div>
    </div>
  );
}

/** 4m Kysymys + peitetty vastaus. */
async function p4m(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const [q] = kortinKysymykset(v, k, "4m", c.siemen);
  kysymysEste(q, esteet, "4m");
  const kys = otsikko(c, q?.teksti ?? "Kysymys puuttuu", { koot: [84, 74, 64, 56, 50], leveys: SISA, maxRivit: 5, valistys: -0.03 });
  tarkistaMahtuu(kys, "Kysymys", esteet);
  const pal = leipa(c, t(k.palkinto) || "Tämä kysymys on mukana visassa.", { koot: [40, 36], leveys: 600, maxRivit: 2 });
  const cta = t(k.cta) || "Pelaa ja selvitä";
  const aihe = t(k.aihe);
  return {
    ruudut: [
      <Kortti key="4m" bg="#1B1446">
        {aihe ? <Etiketti teksti={aihe} vari="#C9A6FF" /> : <div style={{ display: "flex", height: 36 }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          <Iso s={kys} valistys={-0.03} vari="#FFFFFF" lh={0.95} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 28 * 0.2, color: "#C9A6FF" }}>OIKEA VASTAUS</div>
            <Peitetty korkeus={150} tausta="#2A2266" teippi="#FFD84A" muste="#1A1400" koko={34} />
          </div>
          <Leipa s={pal} vari="#E4DCFF" />
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg="#FFD84A" ink="#1A1400" pyorea maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4m") ? REITTI : null}
          reittiVari="#A89CE0"
          merkki="#FFFFFF"
          sisennys={8}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** Juontajakuva: asettelu designin mukaan (korkeus, oikea/vasen reuna tai keskitys).
    Palauttaa myös, kuka kuvassa on — kortin tekstit mukautuvat (Auta Mikkoa / Lauraa). */
async function juontajaKuva(c: Ktx, asento: Asento, kuka: Kuka[], korkeus: number, esteet: string[], sijainti: { right?: number; left?: number; keski?: boolean; bottom?: number }) {
  const j = await c.juontaja(asento, korkeus, kuka);
  if (!j) {
    esteet.push(`Juontajakuvaa (${asento}, ${kuka.join(" tai ")}) ei ole — lisää kuva Juontajakuvat-osiosta.`);
    return { el: null, kuka: kuka[0] };
  }
  const bottom = sijainti.bottom ?? 0;
  const vaaka = sijainti.keski ? { left: Math.round((W - j.leveys) / 2) } : sijainti.right !== undefined ? { right: sijainti.right } : { left: sijainti.left ?? 0 };
  return { el: <img src={j.data} width={j.leveys} height={j.korkeus} alt="" style={{ position: "absolute", bottom, width: j.leveys, height: j.korkeus, ...vaaka }} />, kuka: j.kuka };
}

/** 4n Mikko haastaa · identiteetti. */
async function p4n(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const koukku = vaadiKoukku(k, null, esteet);
  const ots = otsikko(c, koukku, { koot: [112, 100, 88, 76], leveys: 560, maxRivit: 5, valistys: -0.04 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const { el: kuva } = await juontajaKuva(c, "haastaa", ["mikko"], 1120, esteet, { right: -200 });
  const cta = t(k.cta) || "Todista toisin";
  return {
    ruudut: [
      <Absoluuttinen key="4n" bg="#F2B634">
        {kuva}
        <div style={{ position: "absolute", top: 72, right: 72, display: "flex" }}>
          <Merkki vari="#1A1200" />
        </div>
        <div style={{ position: "absolute", top: 72, left: 72, width: 560, display: "flex", flexDirection: "column", gap: 18 }}>
          <Etiketti teksti="Mikko haastaa" vari="#6B1A0F" valistys={0.2} />
          <Iso s={ots} valistys={-0.04} vari="#1A1200" />
        </div>
        <div style={{ position: "absolute", left: 72, bottom: 72, right: 72, display: "flex", flexDirection: "column" }}>
          <Alarivi
            cta={<CtaNappi c={c} teksti={cta} bg="#1A1200" ink="#F2B634" maxLeveys={560} esteet={esteet} />}
            reitti={reittiNakyy(k, "4n") ? REITTI : null}
            reittiVari="#6B1A0F"
            reittiPaino={700}
            merkki={null}
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4o Juontajat eri mieltä · kumpi on oikeassa? Vastaukset visan vaihtoehdoista,
    enintään yksi oikein (design). Kortti ohjaa kommentteihin. */
async function p4o(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const [q] = kortinKysymykset(v, k, "4o", c.siemen);
  kysymysEste(q, esteet, "4o");
  const vaarat = (q?.vaihtoehdot ?? []).filter((x) => x !== q?.oikea);
  if (q && vaarat.length === 0) esteet.push("4o vaatii kysymyksen, jossa on myös väärä vaihtoehto.");
  const h = hajautus(c.siemen + (q?.id ?? ""));
  const vaara = vaarat[h % Math.max(1, vaarat.length)] ?? "";
  const lauraOikein = h % 2 === 0;
  const laura = lauraOikein ? (q?.oikea ?? "") : vaara;
  const mikko = lauraOikein ? vaara : (q?.oikea ?? "");
  const kys = otsikko(c, q?.teksti ?? "Kysymys puuttuu", { koot: [60, 52, 46, 40], leveys: W - 128 - 60, maxRivit: 3, valistys: -0.02 });
  tarkistaMahtuu(kys, "Kysymys", esteet);
  const koukku = otsikko(c, vaadiKoukku(k, "Kumpi on oikeassa?", esteet), { koot: [112, 96, 84], leveys: W - 128, maxRivit: 2, valistys: -0.04 });
  tarkistaMahtuu(koukku, "Koukku", esteet);
  const lappu = (x: string) => sovita(c.m, { teksti: x, perhe: "Archivo", paino: 900, koot: [44, 38, 32], leveys: 380, maxRivit: 2 });
  const lL = lappu(laura);
  const lM = lappu(mikko);
  tarkistaMahtuu(lL, "Lauran vastaus", esteet);
  tarkistaMahtuu(lM, "Mikon vastaus", esteet);
  const { el: kuva } = await juontajaKuva(c, "eri_mielta", ["molemmat"], 900, esteet, { keski: true });
  const cta = t(k.cta) || "Laura vai Mikko?";
  return {
    ruudut: [
      <Absoluuttinen key="4o" bg="#F5F0E6">
        {kuva}
        <div style={{ position: "absolute", top: 64, left: 64, right: 64, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", padding: "26px 30px", borderRadius: 18, background: "#EAE2D2" }}>
            <Iso s={kys} valistys={-0.02} vari="#131109" lh={0.95} />
          </div>
          <Iso s={koukku} valistys={-0.04} vari="#131109" />
        </div>
        <div style={{ position: "absolute", left: 48, top: 720, display: "flex", flexDirection: "column", gap: 4, padding: "20px 26px", background: "#1F3FD1", color: "#FFFFFF", transform: "rotate(-3deg)" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 22 * 0.16 }}>LAURA</div>
          <Rivit rivit={lL.rivit} koko={lL.koko} lh={1} style={{ fontFamily: "Archivo", fontWeight: 900, color: "#FFFFFF" }} />
        </div>
        <div style={{ position: "absolute", right: 48, top: 690, display: "flex", flexDirection: "column", gap: 4, padding: "20px 26px", background: "#C8231A", color: "#FFFFFF", transform: "rotate(3deg)" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 22 * 0.16 }}>MIKKO</div>
          <Rivit rivit={lM.rivit} koko={lM.koko} lh={1} style={{ fontFamily: "Archivo", fontWeight: 900, color: "#FFFFFF" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(245,240,230,0) 0%, #F5F0E6 55%)" }} />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" }}>
          <Alarivi
            cta={<CtaNappi c={c} teksti={cta} bg="#131109" ink="#F5F0E6" maxLeveys={W - 128 - merkinLeveys(c) - 40} esteet={esteet} />}
            reitti={reittiNakyy(k, "4o") ? REITTI : "Vastaa kommenttiin"}
            reittiVari="#6E6757"
            reittiPaino={700}
            merkki="#131109"
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4p Laura yllättyy · kysymys + peitetty vastaus. */
async function p4p(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const [q] = kortinKysymykset(v, k, "4p", c.siemen);
  kysymysEste(q, esteet, "4p");
  const { el: kuva, kuka } = await juontajaKuva(c, "yllattyy", ["laura", "molemmat"], 1040, esteet, { right: -170 });
  const koukku = otsikko(c, vaadiKoukku(k, kuka === "molemmat" ? "Tämä yllätti juontajat." : "Tämä yllätti Lauran.", esteet), { koot: [124, 108, 96, 84], leveys: 600, maxRivit: 3, valistys: -0.045 });
  tarkistaMahtuu(koukku, "Koukku", esteet);
  const kys = otsikko(c, q?.teksti ?? "Kysymys puuttuu", { koot: [60, 52, 46, 40], leveys: 600 - 60, maxRivit: 4, valistys: -0.02 });
  tarkistaMahtuu(kys, "Kysymys", esteet);
  const cta = t(k.cta) || "Pelaa ja selvitä";
  return {
    ruudut: [
      <Absoluuttinen key="4p" bg="#FF8A5C">
        {kuva}
        <div style={{ position: "absolute", top: 72, right: 72, display: "flex" }}>
          <Merkki vari="#1C0A03" />
        </div>
        <div style={{ position: "absolute", top: 72, left: 72, width: 600, display: "flex", flexDirection: "column", gap: 30 }}>
          <Iso s={koukku} valistys={-0.045} vari="#1C0A03" lh={0.84} />
          <div style={{ display: "flex", padding: "26px 30px", borderRadius: 18, background: "rgba(255,138,92,.92)", border: "3px solid rgba(28,10,3,.18)" }}>
            <Iso s={kys} valistys={-0.02} vari="#1C0A03" lh={0.95} />
          </div>
          <Peitetty korkeus={110} tausta="#1C0A03" teippi="#FFD84A" muste="#1C0A03" koko={28} />
        </div>
        <div style={{ position: "absolute", left: 72, bottom: 72, right: 72, display: "flex", flexDirection: "column" }}>
          <Alarivi
            cta={<CtaNappi c={c} teksti={cta} bg="#1C0A03" ink="#FF8A5C" maxLeveys={600} esteet={esteet} />}
            reitti={reittiNakyy(k, "4p") ? REITTI : null}
            reittiVari="#1C0A03"
            reittiPaino={700}
            merkki={null}
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4q Mikko miettii · oikea visakysymys vaihtoehtoineen, katsoja auttaa. */
async function p4q(c: Ktx, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const [q] = kortinKysymykset(v, k, "4q", c.siemen);
  kysymysEste(q, esteet, "4q");
  const koukku = otsikko(c, vaadiKoukku(k, "Tiedätkö sinä?", esteet), { koot: [132, 116, 100], leveys: SISA, maxRivit: 2, valistys: -0.045 });
  tarkistaMahtuu(koukku, "Koukku", esteet);
  const kys = otsikko(c, q?.teksti ?? "Kysymys puuttuu", { koot: [60, 52, 46, 40, 36], leveys: 520 - 60, maxRivit: 4, valistys: -0.02 });
  tarkistaMahtuu(kys, "Kysymys", esteet);
  const lw = (520 - 12) / 2;
  const vaihtoehdot = (q?.vaihtoehdot ?? []).map((x) => leipa(c, x, { koot: [24, 22, 20], leveys: lw - 40 - 36 - 14, maxRivit: 2 }));
  vaihtoehdot.forEach((s) => tarkistaMahtuu(s, "Vaihtoehto", esteet));
  const { el: kuva, kuka } = await juontajaKuva(c, "miettii", ["mikko", "laura"], 1000, esteet, { left: -150 });
  const nimi = kuka === "laura" ? "Laura" : "Mikko";
  const cta = t(k.cta) || (kuka === "laura" ? "Auta Lauraa" : "Auta Mikkoa");
  return {
    ruudut: [
      <Absoluuttinen key="4q" bg="#241046">
        {kuva}
        <div style={{ position: "absolute", top: 72, left: 72, right: 72, display: "flex", flexDirection: "column", gap: 26 }}>
          <Etiketti teksti={`${nimi} miettii vielä`} vari="#C9A6FF" valistys={0.2} />
          <Iso s={koukku} valistys={-0.045} vari="#FFFFFF" lh={0.84} />
        </div>
        <div style={{ position: "absolute", top: 440, right: 64, width: 520, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", padding: "26px 30px", borderRadius: 18, background: "#2E1758", border: "3px solid #4A3080" }}>
            <Iso s={kys} valistys={-0.02} vari="#FFFFFF" lh={0.95} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {vaihtoehdot.map((s, i) => (
              <div key={i} style={{ width: lw, height: 84, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", border: "3px solid #C9A6FF", borderRadius: 14, background: "#241046", color: "#FFFFFF" }}>
                <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: 36 }}>{KIRJAIMET[i]}</div>
                <Leipa s={s} vari="#E4DCFF" lh={1.1} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", right: 72, bottom: 72, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 26 }}>
          <CtaNappi c={c} teksti={cta} bg="#C9A6FF" ink="#140A24" maxLeveys={520} esteet={esteet} />
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#C9A6FF" }}>{reittiNakyy(k, "4q") ? REITTI : "Vastaa kommenttiin"}</div>
          <Merkki vari="#FFFFFF" />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/* ── Synttäripohjat ──────────────────────────────────────────────────── */

/** Muistopäivänä (henkilö on kuollut) ei onnitella eikä taputeta. */
function synttariLabel(s: SynttariData, huuto = false) {
  return s.muisto ? `${s.nimi} olisi täyttänyt ${s.ika}` : `Onnea, ${s.nimi}${huuto ? "!" : ""}`;
}

/** 4h Syntymäpäivä siltana visaan (typografia). */
async function p4h(c: Ktx, s: SynttariData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  if (!s.quizId) esteet.push("4h vaatii henkilön visan — ilman visaa käytä 4r:ää (kommentti) tai 4i:tä.");
  const koukku = vaadiKoukku(k, "Kuinka hyvin tunnet hänet?", esteet);
  const ots = otsikko(c, koukku, { koot: [150, 132, 116, 100, 88], leveys: SISA, maxRivit: 4, valistys: -0.045 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const palkinto = t(k.palkinto);
  const pal = palkinto ? leipa(c, palkinto, { koot: [42, 38], leveys: 560, maxRivit: 2 }) : null;
  const label = leipa(c, isot(synttariLabel(s)), { koot: [30, 26, 22], leveys: SISA, maxRivit: 1, paino: 700 });
  tarkistaMahtuu(label, "Nimirivi", esteet);
  // POIKKEAMA: muistopäivänä hillitty tumma pohja (kierroksen 2 muistosääntö).
  const pv = s.muisto
    ? { bg: "#101820", ink: "#EEF3F7", ak: "#7FB2D9", heikko: "#9FB6C8", reitti: "#8FA3B3" }
    : { bg: "#DDE4EC", ink: "#0A1A33", ak: "#2A5BD7", heikko: "#3A4C66", reitti: "#5A6B84" };
  const cta = t(k.cta) || "Näytä mitä osaat";
  return {
    ruudut: [
      <Kortti key="4h" bg={pv.bg} vari={pv.ink}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Rivit rivit={label.rivit} koko={label.koko} lh={1.2} style={{ fontWeight: 700, letterSpacing: label.koko * 0.2, color: pv.ak }} />
          <div style={{ display: "flex", width: 120, height: 6, background: pv.ak }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <Iso s={ots} valistys={-0.045} vari={pv.ink} lh={0.84} />
          {pal && <Leipa s={pal} vari={pv.heikko} />}
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg={pv.ink} ink={pv.bg} pyorea maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4h") ? REITTI : null}
          reittiVari={pv.reitti}
          merkki={pv.ink}
          sisennys={8}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4r Juontajat onnittelevat. Ratkaisee julkkisten kuvaoikeudet: ei henkilökuvaa. */
async function p4r(c: Ktx, s: SynttariData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  if (s.muisto) esteet.push("4r ei sovi muistopäivään (juontajat taputtavat) — käytä 4h:ta tai 4i:tä.");
  // Ilman visaa kortti ohjaa kommentteihin (design 4i:n periaate).
  const eiVisaa = !s.quizId;
  const koukku = vaadiKoukku(k, eiVisaa ? "Mikä on ensimmäinen muistosi hänestä?" : "Kuinka hyvin tunnet hänet?", esteet);
  // Kolme riviä designin koossa; pitkälle koukulle neljäs rivi pienempänä
  // (juontajien pää alkaa noin 530 px:n korkeudelta, neljä riviä 88 px:llä päättyy ~480).
  const kolme = otsikko(c, koukku, { koot: [118, 104, 92, 80], leveys: SISA, maxRivit: 3, valistys: -0.04 });
  const ots = kolme.mahtuu ? kolme : otsikko(c, koukku, { koot: [88, 80], leveys: SISA, maxRivit: 4, valistys: -0.04 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const label = leipa(c, isot(synttariLabel(s, true)), { koot: [32, 28, 24], leveys: SISA, maxRivit: 1, paino: 700 });
  tarkistaMahtuu(label, "Nimirivi", esteet);
  const { el: kuva } = await juontajaKuva(c, "onnittelee", ["molemmat"], 860, esteet, { keski: true, bottom: -40 });
  const cta = t(k.cta) || (eiVisaa ? "Kerro kommentissa" : "Näytä mitä osaat");
  const reitti = !eiVisaa && k.reitti !== false;
  return {
    ruudut: [
      <Absoluuttinen key="4r" bg="#FFD84A">
        {kuva}
        <div style={{ position: "absolute", top: 72, left: 72, right: 72, display: "flex", flexDirection: "column", gap: 22 }}>
          <Rivit rivit={label.rivit} koko={label.koko} lh={1.2} style={{ fontWeight: 700, letterSpacing: label.koko * 0.2, color: "#B0331F" }} />
          <Iso s={ots} valistys={-0.04} vari="#1A1400" />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(255,216,74,0) 0%, #FFD84A 60%)" }} />
        <div style={{ position: "absolute", left: 72, bottom: 72, right: 72, display: "flex", flexDirection: "column" }}>
          <Alarivi
            cta={<CtaNappi c={c} teksti={cta} bg="#1A1400" ink="#FFD84A" maxLeveys={SISA - merkinLeveys(c) - 40} esteet={esteet} />}
            reitti={reitti ? REITTI : null}
            reittiVari="#6B5200"
            reittiPaino={700}
            merkki="#1A1400"
          />
        </div>
      </Absoluuttinen>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** 4i Muisto kommenttiin · henkilökuva, ei visaa eikä linkkiä. */
async function p4i(c: Ktx, s: SynttariData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const kw = W - 80;
  const kh = 640;
  if (!s.kuva) esteet.push("4i vaatii henkilökuvan.");
  else if (!kelpaa(s.kuva, kw, kh)) esteet.push(`Henkilökuva liian pieni (${s.kuva.leveys}×${s.kuva.korkeus}, tarvitaan väh. ${Math.ceil(kw / 1.5)}×${Math.ceil(kh / 1.5)}) — vaihda kuva.`);
  if (!t(k.kuvaaja)) esteet.push("4i vaatii kuvaajan nimen ja lisenssin (CC BY-SA edellyttää sitä kuvatekstiin).");
  const koukku = vaadiKoukku(k, "Mikä on ensimmäinen muistosi hänestä?", esteet);
  const ots = otsikko(c, koukku, { koot: [104, 92, 80, 72], leveys: W - 144, maxRivit: 3, valistys: -0.035 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const rivi = s.muisto ? `${s.nimi} olisi täyttänyt tänään ${s.ika}.` : `${s.nimi} täyttää ${s.ika}.`;
  const kuva = s.kuva ? await c.kuvaksi(s.kuva, kw, kh) : null;
  const cta = t(k.cta) || "Kerro kommentissa";
  return {
    ruudut: [
      <div key="4i" style={{ width: W, height: H, display: "flex", flexDirection: "column", background: "#2A0E22", fontFamily: "Instrument Sans" }}>
        <div style={{ display: "flex", padding: "40px 40px 0" }}>
          {kuva ? <img src={kuva} width={kw} height={kh} alt="" style={{ width: kw, height: kh, borderRadius: 20 }} /> : <div style={{ display: "flex", width: kw, height: kh, borderRadius: 20, background: "#3A1830" }} />}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 72px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#F2A6DA" }}>{rivi}</div>
            <Iso s={ots} valistys={-0.035} vari="#FFFFFF" lh={0.88} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
            <CtaViiva c={c} teksti={cta} vari="#F2A6DA" viiva="#F2A6DA" koko={48} paksuus={5} nuoli={false} maxLeveys={SISA - merkinLeveys(c) - 24} esteet={esteet} />
            <Merkki vari="#FFFFFF" />
          </div>
        </div>
      </div>,
    ],
    esteet,
    huomiot: [],
    onKuva: !!kuva,
  };
}

/** 4j Tuotanto on koukku · pelkkä typografia. */
async function p4j(c: Ktx, s: SynttariData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  if (!s.quizId) esteet.push("4j vaatii henkilön tuotannosta visan.");
  const koukku = vaadiKoukku(k, null, esteet);
  const ots = otsikko(c, koukku, { koot: [140, 124, 108, 96], leveys: W - 160, maxRivit: 4, valistys: -0.045 });
  tarkistaMahtuu(ots, "Koukku", esteet);
  const palkinto = t(k.palkinto);
  const pal = palkinto ? leipa(c, palkinto, { koot: [42, 38], leveys: 560, maxRivit: 2 }) : null;
  const label = leipa(c, isot(synttariLabel(s)), { koot: [30, 26, 22], leveys: W - 160, maxRivit: 1, paino: 700 });
  const pv = s.muisto ? { bg: "#101820", ink: "#EEF3F7", heikko: "#9FB6C8" } : { bg: "#B0331F", ink: "#FFF4E6", heikko: "#FFD2BF" };
  const cta = t(k.cta) || "Selvitä tuloksesi";
  return {
    ruudut: [
      <Kortti key="4j" bg={pv.bg} padding={80} vari={pv.ink}>
        <Rivit rivit={label.rivit} koko={label.koko} lh={1.2} style={{ fontWeight: 700, letterSpacing: label.koko * 0.2, color: pv.ink }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <Iso s={ots} valistys={-0.045} vari={pv.ink} />
          {pal && <Leipa s={pal} vari={pv.heikko} />}
        </div>
        <Alarivi
          cta={<CtaNappi c={c} teksti={cta} bg={pv.ink} ink={pv.bg} maxLeveys={W - 160 - merkinLeveys(c) - 40} esteet={esteet} />}
          reitti={reittiNakyy(k, "4j") ? REITTI : null}
          reittiVari={pv.heikko}
          merkki={pv.ink}
        />
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/* ── Julkinen rajapinta ──────────────────────────────────────────────── */

type Mitattava = { m: Mitat; siemen: string };

async function valitseVisa(c: Ktx, pohja: Pohja, v: VisaData, k: Kentat): Promise<Piirros> {
  switch (pohja) {
    case "4a": return p4a(c, v, k);
    case "4g": return p4g(c, v, k);
    case "4b": return p4b(c, v, k);
    case "4c": return p4c(c, v, k);
    case "4d": return p4d(c, v, k);
    case "4e": return p4e(c, v, k);
    case "4f": return p4f(c, v, k);
    case "4l": return p4l(c, v, k);
    case "4m": return p4m(c, v, k);
    case "4n": return p4n(c, v, k);
    case "4o": return p4o(c, v, k);
    case "4p": return p4p(c, v, k);
    case "4q": return p4q(c, v, k);
    default: throw new Error(`Ei visapohja: ${pohja}`);
  }
}

async function valitseSynttarit(c: Ktx, pohja: Pohja, s: SynttariData, k: Kentat): Promise<Piirros> {
  switch (pohja) {
    case "4h": return p4h(c, s, k);
    case "4r": return p4r(c, s, k);
    case "4i": return p4i(c, s, k);
    case "4j": return p4j(c, s, k);
    default: throw new Error(`Ei synttäripohja: ${pohja}`);
  }
}

/** Tarkistus ilman kuvien latausta (esteet ja huomiot 14 päivälle kerralla). */
export function tarkistaVisa(o: Mitattava, pohja: Pohja, v: VisaData, k: Kentat): Promise<Piirros> {
  return valitseVisa(konteksti(o.m, o.siemen, false), pohja, v, k);
}
export function tarkistaSynttarit(o: Mitattava, pohja: Pohja, s: SynttariData, k: Kentat): Promise<Piirros> {
  return valitseSynttarit(konteksti(o.m, o.siemen, false), pohja, s, k);
}
export function piirraVisa(o: Mitattava, pohja: Pohja, v: VisaData, k: Kentat): Promise<Piirros> {
  return valitseVisa(konteksti(o.m, o.siemen, true), pohja, v, k);
}
export function piirraSynttarit(o: Mitattava, pohja: Pohja, s: SynttariData, k: Kentat): Promise<Piirros> {
  return valitseSynttarit(konteksti(o.m, o.siemen, true), pohja, s, k);
}

export const onVisapohja = (p: string): p is Pohja => (VISA_POHJAT as string[]).includes(p);
export const onSynttaripohja = (p: string): p is Pohja => (SYNT_POHJAT as string[]).includes(p);
export { ilmanTavutusta };
