// KAUPUNKISIVUN JAKOKUVA /og/kaupunki/<slug> (CD "Tietoniekka_Kaupunkisivu" 3a/3b, 1.11.2026): 1200 × 630.
// Kuva 760 px oikealla, liukuväri vasemmalta (täysi tummuus 39 %:iin asti, jotta kuvan reuna 440 px:ssä ei näy saumana); tunnus vasen yläkulma 64/56, vaakuna oikea yläkulma 84 × 100.
// Vasemmassa alakulmassa KAUPUNKI, nimi yhdellä rivillä ja koukku (hook_og tai "Mitä tiedät {elatiivi}?") + Pelaa.
// Ei visamäärää (Heikki 1.11.). Vaihtuvat vain nimi, koukku, kuva ja vaakuna.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { heroFokus } from "@/lib/herotila";
import { haeNaytettavaKaupunki, kaupunginKoukkuOg } from "@/lib/kaupunkisivu";

export const runtime = "nodejs";

const POHJA = "#131109", KERMA = "#F5F0E6", KULTA = "#E8A320", LIME = "#B6FF3C";

let fontit: { name: string; data: Buffer; weight: 800 | 900; style: "normal" }[] | null = null;
async function haeFontit() {
  if (fontit) return fontit;
  const lue = (f: string) => readFile(join(process.cwd(), "assets/og", f));
  const [ac, bc8] = await Promise.all([lue("archivo-condensed-900.ttf"), lue("barlow-condensed-800.woff")]);
  fontit = [
    { name: "Archivo Condensed", data: ac, weight: 900, style: "normal" },
    { name: "Barlow Condensed", data: bc8, weight: 800, style: "normal" },
  ];
  return fontit;
}

/** Oma kuvatiedosto (webp) → JPEG/PNG data-URI annettuun kokoon (Satori ei lue webp:tä). */
async function kuva(origin: string, polku: string | null, w: number, h: number, fit: "cover" | "contain", pos?: string): Promise<string | null> {
  if (!polku) return null;
  try {
    const r = await fetch(new URL(polku, origin));
    if (!r.ok) return null;
    const s = sharp(Buffer.from(await r.arrayBuffer()));
    if (fit === "cover") {
      const m = await s.metadata();
      const sw = m.width ?? w, sh = m.height ?? h;
      const skaala = Math.max(w / sw, h / sh);
      const [fx, fy] = (pos ?? "50% 50%").split(" ").map((p) => Number.parseFloat(p) / 100);
      const rw = Math.round(sw * skaala), rh = Math.round(sh * skaala);
      const left = Math.max(0, Math.min(rw - w, Math.round(rw * fx - w / 2)));
      const top = Math.max(0, Math.min(rh - h, Math.round(rh * fy - h / 2)));
      const out = await s.resize(rw, rh).extract({ left, top, width: w, height: h }).jpeg({ quality: 86 }).toBuffer();
      return `data:image/jpeg;base64,${out.toString("base64")}`;
    }
    const out = await s.resize(w * 2, h * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const k = /^[a-z]+$/.test(slug) ? await haeNaytettavaKaupunki(slug) : null;
  if (!k) return new Response(null, { status: 404 });
  const origin = new URL(req.url).origin;
  const f = heroFokus(k.hero_kuva, null, null, 0.35);
  const [tausta, vaakuna] = await Promise.all([
    kuva(origin, k.hero_kuva, 760, 630, "cover", `${f.x * 100}% ${f.y * 100}%`),
    kuva(origin, k.vaakuna_url, 84, 100, "contain"),
  ]);
  /* Nimi yhdellä rivillä: CD min(184, 1072 / (merkit × 0,58)) wdth 68:lla; Archivo Condensed ≈ 0,62 em/merkki. */
  const nimiKoko = Math.floor(Math.min(184, 1072 / (k.nimi.length * 0.64)));
  const koukku = kaupunginKoukkuOg(k);
  const koukkuKoko = Math.min(44, Math.floor((1072 - 190) / (koukku.length * 0.46)));

  const img = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: POHJA, color: KERMA }}>
        {tausta && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tausta} width={760} height={630} alt="" style={{ position: "absolute", right: 0, top: 0, width: 760, height: 630 }} />
        )}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(to right, #131109 0%, #131109 39%, rgba(19,17,9,0.7) 54%, rgba(19,17,9,0.12) 79%, rgba(19,17,9,0) 100%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", background: "linear-gradient(to top, rgba(19,17,9,0.95) 0%, rgba(19,17,9,0) 46%)" }} />
        <div style={{ position: "absolute", left: 64, top: 56, display: "flex", fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 34, lineHeight: 1 }}>
          <span style={{ color: KULTA }}>TIETO</span>
          <span style={{ color: KERMA }}>NIEKKA</span>
        </div>
        {vaakuna && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vaakuna} width={84} height={100} alt="" style={{ position: "absolute", right: 56, top: 48, width: 84, height: 100 }} />
        )}
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 26, letterSpacing: 5.7, color: KULTA }}>KAUPUNKI</div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: nimiKoko, lineHeight: 0.9, letterSpacing: -nimiKoko * 0.02, whiteSpace: "nowrap" }}>
            {k.nimi.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
            <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: koukkuKoko, lineHeight: 1, color: KERMA, whiteSpace: "nowrap" }}>
              {koukku.toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "center", height: 48, marginLeft: 18, padding: "0 22px", borderRadius: 12, background: LIME, color: POHJA, fontFamily: "Archivo Condensed", fontWeight: 900, fontSize: 22 }}>
              PELAA
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await haeFontit() },
  );
  /* PNG → JPEG kuten muissa jakokuvissa (WhatsApp jättää yli ~300 kt:n esikatselun näyttämättä). */
  const jpg = await sharp(Buffer.from(await img.arrayBuffer())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
