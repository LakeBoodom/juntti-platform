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

/**
 * Valitsee portaista suurimman koon, jolla teksti mahtuu leveyteen ja rivimäärään.
 *
 * KORTTISÄÄNTÖ (CLAUDE.md): suomen sanat eivät saa katketa, joten jokaisen sanan
 * on mahduttava riville kokonaan. Rivitys on ahne sanarivitys kuten selaimessa.
 * Jos mikään porras ei riitä, palautetaan pienin porras — kutsuja päättää
 * (esim. pudottaa rivin pois tai käyttää toista pohjaa).
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
  const teksti = o.isot ? o.teksti.toLocaleUpperCase("fi-FI") : o.teksti;
  // Ajatusviiva ei saa aloittaa riviä ("– HALLITSIJAT"): liimataan se edelliseen
  // sanaan sitovalla välilyönnillä. Rivitys katkaisee vain tavallisesta välilyönnistä.
  const sanat = teksti
    .replace(/\s+([–—])(?=\s)/g, "\u00A0$1")
    .split(/[ \t\n]+/)
    .filter(Boolean);
  const vara = o.varaPx ?? 6;
  const raja = o.leveys - vara;
  for (const koko of o.koot) {
    const ls = o.valistysEm ?? 0;
    const w = (s: string) => leveys(mitat, s, o.perhe, o.paino, koko, ls);
    if (sanat.some((s) => w(s) > raja)) continue;
    const rivit: string[] = [];
    let rivi = "";
    for (const s of sanat) {
      const koe = rivi ? `${rivi} ${s}` : s;
      if (w(koe) <= raja) rivi = koe;
      else { rivit.push(rivi); rivi = s; }
    }
    if (rivi) rivit.push(rivi);
    if (rivit.length <= o.maxRivit) return { koko, rivit, mahtuu: true };
  }
  // Ei mahdu: palautetaan pienin koko rivitettynä, jotta esikatselu näyttää
  // ongelman (julkaisu estetään kutsujassa mahtuu=false:n perusteella).
  const pienin = o.koot[o.koot.length - 1];
  const w = (s: string) => leveys(mitat, s, o.perhe, o.paino, pienin, o.valistysEm ?? 0);
  const rivit: string[] = [];
  let rivi = "";
  for (const s of sanat) {
    const koe = rivi ? `${rivi} ${s}` : s;
    if (w(koe) <= raja || !rivi) rivi = koe;
    else { rivit.push(rivi); rivi = s; }
  }
  if (rivi) rivit.push(rivi);
  return { koko: pienin, rivit, mahtuu: false };
}
