// Juontajakuvat (Laura ja Mikko) Instagram-pohjiin 4n–4r. Kuvat ovat
// ig_juontajakuvat-taulussa asennoittain; pohja pyytää asentoa ("haastaa",
// "yllattyy" …) ja saa aktiivisen kuvan. Jos samaan asentoon on useita kuvia
// (esim. eri ympäristöt), valinta vaihtelee päivän mukaan.
//
// Kuvat ovat läpinäkyvätaustaisia (WebP/PNG). Satori ei tue WebP:tä
// luotettavasti, joten kuva muunnetaan PNG:ksi ja pienennetään tarvittavaan
// korkeuteen ennen piirtoa.

import sharp from "sharp";
import { getSupabaseAdmin } from "@juntti/db";

export type Asento = "haastaa" | "yllattyy" | "miettii" | "eri_mielta" | "onnittelee" | "innostunut" | "neutraali";
export type Kuka = "laura" | "mikko" | "molemmat";

export const ASENNOT: Record<Asento, string> = {
  haastaa: "Haastaa / osoittaa",
  yllattyy: "Yllättyy",
  miettii: "Miettii",
  eri_mielta: "Eri mieltä (molemmat)",
  onnittelee: "Onnittelee / taputtaa",
  innostunut: "Innostunut",
  neutraali: "Neutraali",
};

export type Juontajakuva = {
  id: string;
  url: string;
  kuka: Kuka;
  asento: Asento;
  tausta: "rajattu" | "ymparisto";
  kuvaus: string | null;
  leveys: number | null;
  korkeus: number | null;
  aktiivinen: boolean;
};

let kirjasto: { aika: number; kuvat: Promise<Juontajakuva[]> } | null = null;

/** Kirjasto välimuistissa minuutin: 14 päivän suunnitelma kysyy samaa monta kertaa. */
export function haeJuontajakuvat(tuore = false): Promise<Juontajakuva[]> {
  if (!tuore && kirjasto && Date.now() - kirjasto.aika < 60_000) return kirjasto.kuvat;
  const kuvat = (async () => {
    const { data } = await getSupabaseAdmin()
      .from("ig_juontajakuvat" as never)
      .select("id, url, kuka, asento, tausta, kuvaus, leveys, korkeus, aktiivinen")
      .order("created_at");
    return (data ?? []) as unknown as Juontajakuva[];
  })();
  kirjasto = { aika: Date.now(), kuvat };
  return kuvat;
}

function hajautus(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Aktiivinen rajattu kuva asentoon ja henkilöille; siemen (esim. päivä) vaihtelee
    useamman välillä. Pohja kertoo, kuka kuvassa saa olla (4n Mikko, 4o/4r molemmat …). */
export async function valitseJuontaja(asento: Asento, siemen: string, kuka?: Kuka[]): Promise<Juontajakuva | null> {
  const ehdokkaat = (await haeJuontajakuvat()).filter(
    (k) => k.aktiivinen && k.tausta === "rajattu" && k.asento === asento && (!kuka || kuka.includes(k.kuka)),
  );
  if (ehdokkaat.length === 0) return null;
  return ehdokkaat[hajautus(siemen) % ehdokkaat.length];
}

const pngVälimuisti = new Map<string, Promise<{ data: string; leveys: number; korkeus: number } | null>>();

/** Kuva PNG-data-URL:nä annettuun korkeuteen (leveys suhteessa). */
export function juontajaPng(k: Juontajakuva, korkeus: number): Promise<{ data: string; leveys: number; korkeus: number } | null> {
  const avain = `${k.url}|${korkeus}`;
  let p = pngVälimuisti.get(avain);
  if (!p) {
    p = (async () => {
      try {
        const r = await fetch(k.url, { signal: AbortSignal.timeout(15000) });
        if (!r.ok) return null;
        const buf = await sharp(Buffer.from(await r.arrayBuffer())).resize({ height: korkeus }).png({ compressionLevel: 6 }).toBuffer({ resolveWithObject: true });
        return { data: `data:image/png;base64,${buf.data.toString("base64")}`, leveys: buf.info.width, korkeus: buf.info.height };
      } catch {
        return null;
      }
    })();
    pngVälimuisti.set(avain, p);
    setTimeout(() => pngVälimuisti.delete(avain), 10 * 60 * 1000).unref?.();
  }
  return p;
}
