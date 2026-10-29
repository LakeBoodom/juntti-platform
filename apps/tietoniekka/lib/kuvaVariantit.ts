// Kuvan kokoversiot srcsetiksi (etusivu v5, Lighthouse 29.10.2026: kuvat 1,3 Mt). Omat kopiot public/20:ssä on usein
// tallennettu myös pienempänä samalla rajauksella: "<nimi>-800.webp", "<nimi>-600.webp" (ei "-kortti", jonka rajaus
// voi poiketa). Mitat lib/kuvamitat.json:sta (prebuild), joten uusi versio tulee mukaan ilman koodimuutosta.
// Vain palvelimella (JSON ei päädy selaimen pakettiin).
import mitat from "./kuvamitat.json";

const M = mitat as Record<string, number[]>;

/** "/20/juhlat/halloween.webp" → "…-800.webp 800w, …webp 1448w"; undefined, jos versioita ei ole. */
export function kuvanSrcSet(src: string | null | undefined): string | undefined {
  if (!src || !src.startsWith("/20/") || !src.endsWith(".webp")) return undefined;
  const pohja = src.replace(/-\d+\.webp$/, ".webp").slice(0, -5);
  const versiot = Object.keys(M).filter((k) => k.startsWith(pohja) && (k === `${pohja}.webp` || /^-\d+\.webp$/.test(k.slice(pohja.length))));
  if (versiot.length < 2) return undefined;
  return versiot.sort((a, b) => M[a][0] - M[b][0]).map((k) => `${k} ${M[k][0]}w`).join(", ");
}
