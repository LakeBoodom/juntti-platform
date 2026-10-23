// Jakokortin kuvalähde (Heikki 23.10.2026): kun kortin kuvan lisenssi vaatii nimeämisen (CC BY, CC BY-SA …),
// kortin alareunaan pieni rivi "Kuva: {tekijä} / {lisenssi}". Public domain / CC0 → ei riviä. Tuntematon lisenssi
// → ei riviä (lähdettä ei voi väittää). Sama sääntö tulee myöhemmin pelimuotojen jakokortteihin.
// Lähteet: omat kopiot public/20/… (lib/kuvalahteet.ts + lib/henkilokuvalahteet.ts), kuvavisojen
// kuvavisas.source_credit ("Tekijä / Wikimedia Commons, CC BY-SA 4.0") ja celebrities.image_credit/image_license.
import { KUVALAHTEET } from "./kuvalahteet";
import { HENKILOKUVALAHTEET } from "./henkilokuvalahteet";

const vaatiiNimeamisen = (lisenssi: string) => /^cc[\s-]?by\b/i.test(lisenssi.trim());

/** "Kuva: tekijä / lisenssi", jos lisenssi vaatii nimeämisen; muuten null. */
export function krediittirivi(tekija: string | null | undefined, lisenssi: string | null | undefined): string | null {
  const t = tekija?.trim(), l = lisenssi?.trim();
  if (!t || !l || !vaatiiNimeamisen(l)) return null;
  return `Kuva: ${t} / ${l}`;
}

/** Oma kopio /20/<kokoelma>/[k/|hero/]<slug>[-kortti|-800].webp → rekisterin rivi. */
export function krediittiPolulle(src: string | null | undefined): string | null {
  const m = src?.split("?")[0].match(/^\/20\/([^/]+)\/(?:k\/|hero\/)?(.+?)(?:-kortti|-800)?\.(?:webp|jpe?g|png)$/);
  if (!m) return null;
  const [, kokoelma, slug] = m;
  const l = [...KUVALAHTEET, ...HENKILOKUVALAHTEET].find((x) => x.kokoelma === kokoelma && x.slug === slug);
  return l ? krediittirivi(l.tekija, l.lisenssi) : null;
}

/** kuvavisas.source_credit "Tekijä / Wikimedia Commons, CC BY-SA 4.0" → "Kuva: Tekijä / CC BY-SA 4.0". */
export function krediittiTekstista(credit: string | null | undefined): string | null {
  if (!credit) return null;
  const m = credit.match(/^(.*?)\s*,\s*([^,]+)$/);
  if (!m) return null;
  const tekija = m[1].replace(/\s*\/\s*(Wikimedia Commons|Wikipedia)\s*$/i, "").trim();
  if (!tekija || /^(wikipedia|wikimedia commons)$/i.test(tekija)) return null;
  return krediittirivi(tekija, m[2]);
}
