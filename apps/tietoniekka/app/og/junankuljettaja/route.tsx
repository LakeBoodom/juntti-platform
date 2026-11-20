// JUNANKULJETTAJA — jakokuva 1200 × 630 (CD "Junankuljettaja, kierros 1", kohta 5).
//   /og/junankuljettaja?reitti=<siemen>   jaettu vuoro
//   /og/junankuljettaja                   päivän vuoro keskitasolla (sivun oma jakokuva)
// Kuvassa vain lähtö, määränpää, katkoviiva ja juna: ei karttaa, ei väliasemia eikä niiden määrää. Vuoro on kaikille
// sama, joten ratkaistu reitti jaetussa kuvassa pilaisi pelin kaverilta. Pohja toimii jokaiselle reitille nimien vaihdolla.

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { helsinginPaiva } from "@/lib/aika";
import { JK_OLETUSTASO } from "@/lib/junankuljettaja";
import { paivanValinta, valintaSiemenesta, vuoronNimet } from "@/lib/junankuljettaja/vuoro";

export const runtime = "nodejs";

const POHJA = "#131109", KERMA = "#F5F0E6", HEIKKO = "#CFC7B6", KULTA = "#E8A320";

/* CD:n junamerkki: kulta pohja, tumma kuvio (sama kuin pelin kartalla). */
const JUNA = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -15 30 30"><circle r="15" fill="${KULTA}"/>`
  + `<path d="M-6 -4.5a3.5 3.5 0 0 1 3.5-3.5h5a3.5 3.5 0 0 1 3.5 3.5V3a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1-6 3Z" fill="${POHJA}"/>`
  + `<rect x="-4" y="-6.2" width="8" height="4.6" rx="1.2" fill="${KULTA}"/><circle cx="-3" cy="2.3" r="1.1" fill="${KULTA}"/><circle cx="3" cy="2.3" r="1.1" fill="${KULTA}"/>`
  + `<path d="M-3.6 6l-1.9 2.8M3.6 6l1.9 2.8" stroke="${POHJA}" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>`,
).toString("base64")}`;

let fontit: { name: string; data: Buffer; weight: 800 | 900; style: "normal" }[] | null = null;
async function haeFontit() {
  if (fontit) return fontit;
  const lue = (f: string) => readFile(join(process.cwd(), "assets/og", f));
  const [ac, b8, bc8] = await Promise.all([lue("archivo-condensed-900.ttf"), lue("barlow-800.woff"), lue("barlow-condensed-800.woff")]);
  fontit = [
    { name: "Archivo Condensed", data: ac, weight: 900, style: "normal" },
    { name: "Barlow", data: b8, weight: 800, style: "normal" },
    { name: "Barlow Condensed", data: bc8, weight: 800, style: "normal" },
  ];
  return fontit;
}

export async function GET(req: Request) {
  const siemen = new URL(req.url).searchParams.get("reitti");
  const v = siemen && /^[a-z0-9-]{3,40}$/.test(siemen) ? valintaSiemenesta(siemen, JK_OLETUSTASO) : paivanValinta(helsinginPaiva().iso, JK_OLETUSTASO);
  const n = vuoronNimet(v);
  // "Seinäjoelta Ouluun" → kaksi riviä; taivutettu otsikko on aina "lähtö määränpää".
  const vali = n.otsikko.indexOf(" ");
  const [yla, ala] = vali > 0 ? [n.otsikko.slice(0, vali), n.otsikko.slice(vali + 1)] : [n.otsikko, ""];
  const pisin = Math.max(yla.length, ala.length);
  const koko = pisin > 13 ? Math.floor(120 * 13 / pisin) : 120;
  const pilleri = (nimi: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 76, padding: "0 30px 0 24px", border: `3px solid ${KERMA}`, borderRadius: 999,
      fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 44, letterSpacing: 1, color: KERMA, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      <div style={{ width: 22, height: 22, borderRadius: 999, background: KULTA }} />
      {nimi}
    </div>
  );
  const katko = <div style={{ flex: 1, minWidth: 40, height: 6, backgroundImage: `linear-gradient(90deg, ${KULTA} 0 22px, transparent 22px 42px)`, backgroundSize: "42px 6px", backgroundRepeat: "repeat-x" }} />;
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", padding: "56px 72px 64px", background: POHJA, color: KERMA }}>
        <div style={{ display: "flex", fontFamily: "Barlow", fontWeight: 800, fontSize: 30, letterSpacing: 0.5 }}>
          <span style={{ color: KULTA }}>TIETO</span><span>NIEKKA</span>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 40, letterSpacing: 10, color: HEIKKO }}>JUNANKULJETTAJA</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 14, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: koko, lineHeight: 0.9, textTransform: "uppercase" }}>
          <span>{yla}</span>
          <span style={{ color: KULTA }}>{ala}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: "auto" }}>
          {pilleri(n.lahto)}
          {katko}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={JUNA} width={88} height={88} alt="" />
          {katko}
          {pilleri(n.maaranpaa)}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await haeFontit(), headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } },
  );
}
