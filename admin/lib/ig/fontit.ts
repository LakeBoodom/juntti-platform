// Instagram-kuvien fontit (Satori / next/og) ja tekstin mittaus samoista tiedostoista.
//
// Tuotannon Archivo on STAATTINEN (@fontsource, ei wdth-akselia) — sama kuin
// sivustolla. Fontit ovat tämän kansion fontit/-alikansiossa, jotta ne tulevat
// varmasti mukaan Vercelin funktioon (next.config.mjs: outputFileTracingIncludes).
// Satori ei lue woff2:ta, joten tiedostot ovat woff-muodossa.
//
// Kaksi osajoukkoa per paino: latin (ä, ö, å, é, ó …) ja latin-ext (ć, č, š …,
// esim. "Ibrahimović"). Satori valitsee merkkikohtaisesti ensimmäisen fontin,
// jossa merkki on — mittaus tekee saman.

import { readFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";

export type Perhe = "Archivo" | "Instrument Sans";
export type Paino = 400 | 600 | 700 | 900;

const TIEDOSTOT: Array<{ perhe: Perhe; paino: Paino; tiedostot: string[] }> = [
  { perhe: "Archivo", paino: 700, tiedostot: ["archivo-latin-700-normal.woff", "archivo-latin-ext-700-normal.woff"] },
  { perhe: "Archivo", paino: 900, tiedostot: ["archivo-latin-900-normal.woff", "archivo-latin-ext-900-normal.woff"] },
  { perhe: "Instrument Sans", paino: 400, tiedostot: ["instrument-sans-latin-400-normal.woff", "instrument-sans-latin-ext-400-normal.woff"] },
  { perhe: "Instrument Sans", paino: 600, tiedostot: ["instrument-sans-latin-600-normal.woff", "instrument-sans-latin-ext-600-normal.woff"] },
  { perhe: "Instrument Sans", paino: 700, tiedostot: ["instrument-sans-latin-700-normal.woff", "instrument-sans-latin-ext-700-normal.woff"] },
];

const KANSIO = path.join(process.cwd(), "lib", "ig", "fontit");

type Ladattu = {
  satori: Array<{ name: Perhe; data: ArrayBuffer; weight: Paino; style: "normal" }>;
  mitat: Map<string, opentype.Font[]>;
};

let lataus: Promise<Ladattu> | null = null;

export function lataaFontit(): Promise<Ladattu> {
  lataus ??= (async () => {
    const satori: Ladattu["satori"] = [];
    const mitat: Ladattu["mitat"] = new Map();
    for (const f of TIEDOSTOT) {
      const fontit: opentype.Font[] = [];
      for (const t of f.tiedostot) {
        const buf = await readFile(path.join(KANSIO, t));
        const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        satori.push({ name: f.perhe, data: ab, weight: f.paino, style: "normal" });
        fontit.push(opentype.parse(ab));
      }
      mitat.set(`${f.perhe}-${f.paino}`, fontit);
    }
    return { satori, mitat };
  })();
  return lataus;
}

/** Tekstin leveys pikseleinä: glyyfien etenemät + välistys (letter-spacing em:nä).
    Merkki haetaan ensimmäisestä osajoukosta, jossa se on (kuten Satori). */
export function leveys(
  mitat: Ladattu["mitat"],
  teksti: string,
  perhe: Perhe,
  paino: Paino,
  koko: number,
  valistysEm = 0,
): number {
  const fontit = mitat.get(`${perhe}-${paino}`);
  if (!fontit) throw new Error(`Fonttia ei ladattu: ${perhe} ${paino}`);
  let summa = 0;
  let merkkeja = 0;
  for (const ch of teksti) {
    let fontti = fontit[0];
    let glyyfi = fontti.charToGlyph(ch);
    if (glyyfi.index === 0 && fontit[1]) {
      const g2 = fontit[1].charToGlyph(ch);
      if (g2.index !== 0) { fontti = fontit[1]; glyyfi = g2; }
    }
    summa += ((glyyfi.advanceWidth ?? 0) / fontti.unitsPerEm) * koko;
    merkkeja++;
  }
  return summa + valistysEm * koko * merkkeja;
}

export type Sovitus = { koko: number; rivit: string[] };

/** Tavutuskohta: toimitus merkitsee pitkän yhdyssanan rajan pystyviivalla
    ("Jokeri|fani") tai pehmeällä tavuviivalla (U+00AD, kuten designissa). */
export const TAVU = "\u00AD";
export const tavutus = (s: string) => s.replace(/\|/g, TAVU);
/** Teksti ilman tavutusmerkkejä (kuvateksti, esikatselun tekstit). */
export const ilmanTavutusta = (s: string) => s.replace(/[|\u00AD]/g, "");

/**
 * Rivittää sanat ahneesti. KORTTISÄÄNTÖ (CLAUDE.md): sana ei katkea keskeltä —
 * paitsi merkitystä tavutuskohdasta, ja silloinkin vain, jos sana ei mahdu
 * tyhjällekään riville (kuten designin "OLETKO OIKEA JOKERI-/FANI?").
 * Palauttaa null, jos jokin sana tai tavu ei mahdu millään.
 */
function rivita(sanat: string[], w: (s: string) => number, raja: number): string[] | null {
  const rivit: string[] = [];
  let rivi = "";
  for (const sana of sanat) {
    const kokonainen = sana.split(TAVU).join("");
    const koe = rivi ? `${rivi} ${kokonainen}` : kokonainen;
    if (w(koe) <= raja) { rivi = koe; continue; }
    if (rivi && w(kokonainen) <= raja) { rivit.push(rivi); rivi = kokonainen; continue; }
    // Sana ei mahdu tyhjällekään riville: tavutetaan merkityistä kohdista.
    let osat = sana.split(TAVU);
    if (osat.length === 1) return null;
    if (rivi) { rivit.push(rivi); rivi = ""; }
    while (osat.length) {
      const loput = osat.join("");
      if (w(loput) <= raja) { rivi = loput; break; }
      let k = osat.length - 1;
      while (k >= 1 && w(`${osat.slice(0, k).join("")}-`) > raja) k--;
      if (k < 1) return null;
      rivit.push(`${osat.slice(0, k).join("")}-`);
      osat = osat.slice(k);
    }
  }
  if (rivi) rivit.push(rivi);
  return rivit;
}

/**
 * Valitsee portaista suurimman koon, jolla teksti mahtuu leveyteen ja rivimäärään.
 * Jos mikään porras ei riitä, palautetaan pienin porras — kutsuja päättää
 * (esim. estää julkaisun tai käyttää toista pohjaa).
 */
export function sovita(
  mitat: Ladattu["mitat"],
  o: {
    teksti: string;
    perhe: Perhe;
    paino: Paino;
    koot: number[];
    leveys: number;
    maxRivit: number;
    valistysEm?: number;
    isot?: boolean;
    /** marginaali, koska Satorin ja mittauksen pyöristys voi erota hieman */
    varaPx?: number;
  },
): Sovitus & { mahtuu: boolean } {
  const perus = tavutus(o.teksti);
  const teksti = o.isot ? perus.toLocaleUpperCase("fi-FI") : perus;
  // Ajatusviiva ei saa aloittaa riviä ("– HALLITSIJAT"): liimataan se edelliseen
  // sanaan sitovalla välilyönnillä. Rivitys katkaisee vain tavallisesta välilyönnistä.
  const sanat = teksti
    .replace(/\s+([–—])(?=\s)/g, "\u00A0$1")
    .split(/[ \t\n]+/)
    .filter(Boolean);
  const vara = o.varaPx ?? 6;
  const raja = o.leveys - vara;
  const ls = o.valistysEm ?? 0;
  // Kaksi kierrosta: ilman tavutusta ja tavutuksen kanssa. Tavutettu versio valitaan
  // vain, jos se on selvästi (≥ 20 %) isompi — muuten sana pysyy ehjänä.
  const koeta = (tavuta: boolean) => {
    const osat = tavuta ? sanat : sanat.map((x) => x.split(TAVU).join(""));
    for (const koko of o.koot) {
      const w = (s: string) => leveys(mitat, s, o.perhe, o.paino, koko, ls);
      const rivit = rivita(osat, w, raja);
      if (rivit && rivit.length <= o.maxRivit) return { koko, rivit, mahtuu: true };
    }
    return null;
  };
  const ehja = koeta(false);
  const tavutettu = sanat.some((x) => x.includes(TAVU)) ? koeta(true) : null;
  if (tavutettu && (!ehja || tavutettu.koko >= ehja.koko * 1.2)) return tavutettu;
  if (ehja) return ehja;
  // Ei mahdu: palautetaan pienin koko rivitettynä (ylipitkä sana omalle rivilleen),
  // jotta esikatselu näyttää ongelman; julkaisu estetään mahtuu=false:n perusteella.
  const pienin = o.koot[o.koot.length - 1];
  const w = (s: string) => leveys(mitat, s, o.perhe, o.paino, pienin, ls);
  const rivit: string[] = [];
  let rivi = "";
  for (const s of sanat.map((x) => x.split(TAVU).join(""))) {
    const koe = rivi ? `${rivi} ${s}` : s;
    if (w(koe) <= raja || !rivi) rivi = koe;
    else { rivit.push(rivi); rivi = s; }
  }
  if (rivi) rivit.push(rivi);
  return { koko: pienin, rivit, mahtuu: false };
}
