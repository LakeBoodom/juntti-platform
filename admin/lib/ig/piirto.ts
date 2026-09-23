// Julkaisurivin kuvien piirto: sama koodi esikatselulle (/api/ig/kuva) ja
// julkaisulle (JPEG:t ig-kuvat-varastoon, josta Instagram ne hakee).

import sharp from "sharp";
import { ImageResponse } from "next/og";
import { lataaFontit } from "./fontit";
import { rivinSisalto, type RivinLahde, type Sisalto } from "./sisalto";
import { H, W, piirraSynttarit, piirraVisa, type Kentat, type Piirros, type Pohja, type VdVari } from "./pohjat";

export type PiirrettavaRivi = RivinLahde & { pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat };

export async function piirraRivi(
  rivi: PiirrettavaRivi,
  o: { pohja?: Pohja; vari?: VdVari; kentat?: Kentat } = {},
): Promise<{ piirros: Piirros; sisalto: Sisalto; fontit: Awaited<ReturnType<typeof lataaFontit>> } | null> {
  const kentat = o.kentat ?? rivi.kentat ?? {};
  const pohja = o.pohja ?? rivi.pohja;
  const [fontit, sisalto] = await Promise.all([lataaFontit(), rivinSisalto(rivi, kentat)]);
  if (!sisalto) return null;
  const piirros =
    sisalto.tyyppi === "visa"
      ? await piirraVisa(fontit.mitat, pohja, sisalto.v, kentat, o.vari ?? rivi.pohja_vari ?? "lime")
      : await piirraSynttarit(fontit.mitat, pohja, sisalto.s, kentat);
  return { piirros, sisalto, fontit };
}

export function pngVastaus(el: Piirros["ruudut"][number], fontit: Awaited<ReturnType<typeof lataaFontit>>, headers?: Record<string, string>) {
  return new ImageResponse(el, { width: W, height: H, fonts: fontit.satori, headers });
}

/** Ruudut JPEG:inä (Instagram hyväksyy vain JPEG:n). 4:4:4 pitää värillisen tekstin terävänä. */
export async function jpegit(p: Piirros, fontit: Awaited<ReturnType<typeof lataaFontit>>): Promise<Buffer[]> {
  const tulos: Buffer[] = [];
  for (const el of p.ruudut) {
    const png = Buffer.from(await pngVastaus(el, fontit).arrayBuffer());
    tulos.push(await sharp(png).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer());
  }
  return tulos;
}
