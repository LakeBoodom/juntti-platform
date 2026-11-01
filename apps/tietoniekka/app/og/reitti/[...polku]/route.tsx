// REITTIPELIEN KUVAT (CD-handoff "Rajanaapurit: Yhdysvallat" 1.11.2026, mallit 6c, 7a, 7b, 7d):
//
//   /og/reitti/<peli>?reitti=<siemen>&tulos=7-7   jakokortti 1200 × 630 (7b): tumma vasen puoli, vaalea kartta oikealla
//   /og/reitti/<peli>                             sivun jakokuva: sama kortti viikon reitillä ilman tulosta
//   /og/reitti/<peli>/kortti?reitti=<siemen>      Seuraava peli -kortin kuva (7d; nykyisen pelikortin 120 px:n kuvaan 640 × 225)
//   /og/reitti/<peli>/puolikas?reitti=<siemen>    Maantieto-kortin puolikas (7a): pystyrajaus, päätepisteissä vain tunnus
//
// <peli> = rajanaapurit | osavaltiot | kuntaliitos (lib/reittipeli/kuvat.ts). Kartta piirretään pelin omasta
// aineistosta (SVG → sharp), merkit ja tekstit Satorilla. Kuvissa näkyvät vain lähtö ja maali sekä katkoviivakaari
// niiden välillä: jaettu kuva ei paljasta kaverille haasteen ratkaisua (poikkeama 7b:n designista, jossa koko reitti).

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { helsinginPaiva } from "@/lib/aika";
import { maanantai, viikonSiemen } from "@/lib/reittipeli/viikonReitit";
import { REITTIPELIT, onReittipeli, reittiSiemenesta, type ReittipeliAvain } from "@/lib/reittipeli/kuvat";

export const runtime = "nodejs";

const V = { maa: "#DCE6E8", ulko: "#EDF2F3", tausta: "#F3EFE6", taustaReuna: "#D8CFBD", paate: "#1B7F7F", navy: "#0E3657", kerma: "#FAF7F0", reuna: "#F5F0E6" };
const POHJA = "#131109", KERMA = "#F5F0E6", KULTA = "#E8A320", TURKOOSI = "#2DD4BF", LIME = "#B6FF3C", HAALEA = "#CFC7B6";

let origin = "https://tietoniekka.fi";

let fontit: { name: string; data: Buffer; weight: 700 | 800 | 900; style: "normal" }[] | null = null;
async function haeFontit() {
  if (fontit) return fontit;
  const lue = (f: string) => readFile(join(process.cwd(), "assets/og", f));
  const [ac, b7, b8, bc8] = await Promise.all([lue("archivo-condensed-900.ttf"), lue("barlow-700.woff"), lue("barlow-800.woff"), lue("barlow-condensed-800.woff")]);
  fontit = [
    { name: "Archivo Condensed", data: ac, weight: 900, style: "normal" },
    { name: "Barlow", data: b7, weight: 700, style: "normal" },
    { name: "Barlow", data: b8, weight: 800, style: "normal" },
    { name: "Barlow Condensed", data: bc8, weight: 800, style: "normal" },
  ];
  return fontit;
}

/** Lippu tai vaakuna (omat kopiot /20/…) PNG:ksi: lippu cover-rajattuna, vaakuna kokonaisena läpinäkyvällä pohjalla. */
async function tunnus(polku: string | null, w: number, h: number, kilpi: boolean): Promise<string | null> {
  if (!polku) return null;
  try {
    const r = await fetch(new URL(polku, origin));
    if (!r.ok) return null;
    const out = await sharp(Buffer.from(await r.arrayBuffer()))
      .resize(w * 2, h * 2, { fit: kilpi ? "contain" : "cover", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

type Muoto = { w: number; h: number; viiva: number; piste: number; fontti: number; pilleri: number; lippu: [number, number]; vainTunnus?: boolean };
const MUODOT = {
  // 7b: kuvapaneeli 640 × 630; designin mitat 1200 px:n kuvalle (pilleri 40, fontti 20, lippu 64 × 42)
  paneeli: { w: 640, h: 630, viiva: 4, piste: 11, fontti: 17, pilleri: 36, lippu: [56, 37] },
  kortti: { w: 640, h: 225, viiva: 3, piste: 7, fontti: 12, pilleri: 24, lippu: [30, 20] },
  puolikas: { w: 388, h: 438, viiva: 3, piste: 8, fontti: 0, pilleri: 0, lippu: [44, 29], vainTunnus: true },
} satisfies Record<string, Muoto>;

/** Kartta + päätepisteiden merkit yhdeksi kuvaksi (data-URI). */
async function kartta(peli: ReittipeliAvain, ids: string[], ryhma: string | null, m: Muoto): Promise<string> {
  const g = REITTIPELIT[peli];
  const kk = g.kuvakartta(ids, ryhma, { suhde: m.w / m.h, minLeveys: g.minLeveys });
  const [vx, vy, vw, vh] = kk.viewBox;
  const u = vw / m.w;
  const a = kk.pisteet[0], b = kk.pisteet[kk.pisteet.length - 1];
  const paat = new Set([a.k, b.k]);
  const P = (p: { x: number; y: number }) => [vx + (p.x / 100) * vw, vy + (p.y / 100) * vh];
  const [ax, ay] = P(a), [bx, by] = P(b);
  const [cx, cy] = [(ax + bx) / 2 - (by - ay) * 0.16, (ay + by) / 2 + (bx - ax) * 0.16];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${m.w * 2}" height="${m.h * 2}" viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid slice">`
    + `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>`
    + kk.alueet.map((r) => `<path d="${r.d}" fill="${r.t ? V.tausta : paat.has(r.k) ? V.paate : r.u ? V.ulko : V.maa}" stroke="${r.t ? V.taustaReuna : "#fff"}" stroke-width="${(r.t ? 0.6 : 1.2) * u}" stroke-linejoin="round"/>`).join("")
    + `<path d="M${ax} ${ay}Q${cx} ${cy} ${bx} ${by}" fill="none" stroke="${V.navy}" stroke-width="${m.viiva * u}" stroke-dasharray="${0.1 * u} ${m.viiva * 3 * u}" stroke-linecap="round" opacity=".85"/>`
    + [a, b].map((p) => { const [x, y] = P(p); return `<circle cx="${x}" cy="${y}" r="${m.piste * u}" fill="${V.navy}" stroke="#fff" stroke-width="${m.piste * 0.3 * u}"/>`; }).join("")
    + `</svg>`;
  const pohja = `data:image/png;base64,${(await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64")}`;

  const kilpi = g.tunnus === "kilpi";
  const [lw, lh] = kilpi ? [Math.round(m.lippu[1] * 0.85), Math.round(m.lippu[1] * 1.05)] : m.lippu;
  const liput = await Promise.all([a, b].map((p) => tunnus(p.v, lw, lh, kilpi)));
  const merkit = [a, b].map((p, i) => {
    const toinen = i ? a : b;
    const X = (p.x / 100) * m.w, Y = (p.y / 100) * m.h;
    const teksti = `${i ? "Maali" : "Lähtö"} · ${p.n}`.toUpperCase();
    const leveys = m.vainTunnus ? lw : Math.min(m.w - 16, Math.round(teksti.length * m.fontti * 0.74 + m.fontti * 1.6));
    const korkeus = m.vainTunnus ? lh : lh + 6 + m.pilleri;
    const pysty = !m.vainTunnus && Math.abs(toinen.y - p.y) > Math.abs(toinen.x - p.x) * 1.3 && (p.x < 45 || p.x > 55);
    const vali = m.piste + 6;
    let left: number, top: number, suunta: "column" | "column-reverse" | "row" | "row-reverse" = "column";
    if (pysty) {
      suunta = p.x < 45 ? "row" : "row-reverse";
      const kokoLeveys = Math.min(m.w - 16, lw + 8 + leveys);
      left = p.x < 45 ? X + vali : X - vali - kokoLeveys;
      top = Y - Math.max(lh, m.pilleri) / 2;
      left = Math.max(8, Math.min(m.w - kokoLeveys - 8, left));
      return { p, i, left, top, suunta, leveys, kokoLeveys };
    }
    const ala = (p.y < 26 || (p.y <= 74 && toinen.y < p.y)) && Y + vali + korkeus < m.h - 4 || Y - vali - korkeus < 4;
    if (ala) suunta = "column-reverse";
    top = ala ? Y + vali : Y - vali - korkeus;
    left = Math.max(8, Math.min(m.w - leveys - 8, X - leveys / 2));
    return { p, i, left, top, suunta, leveys, kokoLeveys: leveys };
  });

  const img = new ImageResponse(
    (
      <div style={{ width: m.w, height: m.h, display: "flex", position: "relative", background: "#fff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pohja} width={m.w} height={m.h} alt="" style={{ position: "absolute", left: 0, top: 0, width: m.w, height: m.h }} />
        {merkit.map((k) => (
          <div key={k.i} style={{ position: "absolute", left: k.left, top: k.top, width: k.kokoLeveys, display: "flex", flexDirection: k.suunta, alignItems: "center", gap: 6 }}>
            {liput[k.i] && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={liput[k.i]!} width={lw} height={lh} alt=""
                style={kilpi ? { width: lw, height: lh } : { width: lw, height: lh, borderRadius: 4, border: `2px solid ${V.reuna}`, boxShadow: "0 2px 6px rgba(14,54,87,0.3)" }} />
            )}
            {!m.vainTunnus && (
              <div style={{ display: "flex", alignItems: "center", height: m.pilleri, padding: `0 ${Math.round(m.fontti * 0.8)}px`, borderRadius: 999, background: V.navy, color: V.kerma, fontFamily: "Barlow", fontWeight: 800, fontSize: m.fontti, letterSpacing: m.fontti * 0.1, whiteSpace: "nowrap" }}>
                {`${k.i ? "Maali" : "Lähtö"} · ${k.p.n}`.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    { width: m.w, height: m.h, fonts: await haeFontit() },
  );
  return `data:image/png;base64,${Buffer.from(await img.arrayBuffer()).toString("base64")}`;
}

function tulosParam(raw: string | null): { n: number; m: number } | null {
  const t = raw?.match(/^(\d{1,2})-(\d{1,2})$/);
  if (!t) return null;
  const n = +t[1], m = +t[2];
  return m > 0 && m <= 20 && n <= m ? { n, m } : null;
}

async function jakokortti(peli: ReittipeliAvain, r: NonNullable<ReturnType<typeof reittiSiemenesta>>, tulos: { n: number; m: number } | null) {
  const g = REITTIPELIT[peli];
  const paneeli = await kartta(peli, r.ids, r.ryhma, MUODOT.paneeli);
  const img = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: POHJA, color: KERMA, fontFamily: "Barlow" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={paneeli} width={640} height={630} alt="" style={{ position: "absolute", left: 560, top: 0, width: 640, height: 630 }} />
        <div style={{ position: "absolute", left: 64, top: 56, bottom: 52, width: 470, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 30, lineHeight: 1 }}>
              <span style={{ color: KULTA }}>TIETO</span>
              <span style={{ color: KERMA }}>NIEKKA</span>
            </div>
            <div style={{ display: "flex", width: 2, height: 26, background: "#3A3120", margin: "0 16px" }} />
            <div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 3.8, color: TURKOOSI }}>{g.laji.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", marginTop: 44, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 84, lineHeight: 0.94, textTransform: "uppercase" }}>{g.kartta}</div>
          {r.otsikko && <div style={{ display: "flex", marginTop: 12, fontSize: 30, fontWeight: 700, lineHeight: 1.15, color: HAALEA }}>{r.otsikko}</div>}
          <div style={{ display: "flex", flexGrow: 1 }} />
          {tulos && (
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 150, lineHeight: 0.9 }}>
                <span>{tulos.n}</span>
                <span style={{ color: TURKOOSI }}>{`/${tulos.m}`}</span>
              </div>
              <div style={{ display: "flex", marginLeft: 18, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 48, lineHeight: 1 }}>YHTEYTTÄ</div>
            </div>
          )}
          {tulos && (
            <div style={{ display: "flex", marginTop: 14, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 48, lineHeight: 1, color: LIME }}>
              {tulos.n === tulos.m ? "PYSTYTKÖ SAMAAN?" : "PYSTYTKÖ PAREMPAAN?"}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await haeFontit() },
  );
  /* PNG → JPEG kuten muissa jakokuvissa (WhatsApp jättää yli ~300 kt:n esikatselun näyttämättä). */
  return sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

export async function GET(req: Request, ctx: { params: Promise<{ polku: string[] }> }) {
  const { polku } = await ctx.params;
  const [peli, muoto] = polku;
  const url = new URL(req.url);
  origin = url.origin;
  if (!peli || !onReittipeli(peli) || (muoto && muoto !== "kortti" && muoto !== "puolikas")) return new Response(null, { status: 404 });
  const g = REITTIPELIT[peli];
  const pyydetty = url.searchParams.get("reitti");
  const siemen = pyydetty && /^[a-z0-9-]{3,40}$/.test(pyydetty) ? pyydetty : viikonSiemen(maanantai(helsinginPaiva().iso));
  const r = reittiSiemenesta(peli, siemen, g.param ? url.searchParams.get(g.param) : null);
  if (!r) return new Response(null, { status: 404 });
  /* Kiinteä siemen → sama kuva aina; ilman siementä (sivun kuva) viikon reitti vaihtuu maanantaisin. */
  const valimuisti = pyydetty ? "public, max-age=86400, s-maxage=2592000" : "public, max-age=3600, s-maxage=21600";

  if (muoto) {
    const kuva = await kartta(peli, r.ids, r.ryhma, MUODOT[muoto as "kortti" | "puolikas"]);
    const jpg = await sharp(Buffer.from(kuva.split(",")[1], "base64")).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": valimuisti } });
  }
  const jpg = await jakokortti(peli, r, tulosParam(url.searchParams.get("tulos")));
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": valimuisti } });
}
