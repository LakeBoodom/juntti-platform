/* Visasivun hakutulosotsikko eli <title> (SEO-brief 13.11.2026, Search Console 14.10.–10.11.).
   Ihmiset hakevat muodossa "{aihe} visa" / "{aihe} tietovisa" ("talvisotavisa", "kummeli visa"), mutta
   hakutuloksessa luki pelkkä näyttöotsikko ("Talvisota – 105 päivää, jotka muuttivat Suomen"). Siksi:
     1) quizzes.seo_title voittaa aina (käsin tehdyt poikkeukset, Heikki hyväksyy),
     2) muuten "{Aihe}-tietovisa – {alaotsikko} | Tietoniekka" näyttöotsikosta, aihe = osa ennen ensimmäistä " – ",
        alaotsikon puuttuessa "– N kysymystä" (määrä datasta).
   Vain <title>: H1, kortit, jakotekstit ja og:title pysyvät ennallaan. Sääntö on deterministinen eikä kirjoita kantaan.
   Sama funktio tuottaa tarkistuslistan (scripts/hakuotsikot-csv.ts), joten lista ja sivu eivät voi erota. */

export const HAKUOTSIKKO_MAX = 60;
const SUFFIKSI = " | Tietoniekka";

/** Suomen yhdyssanasääntö: yksisanainen aihe "Talvisota-tietovisa", monisanainen (tai välimerkkiin päättyvä)
 *  "Rauman Lukko -tietovisa", "Haloo Helsinki! -tietovisa". */
export function tietovisaYhdyssana(aihe: string): string {
  const a = aihe.trim();
  return /\s/.test(a) || /[^\p{L}\p{N}]$/u.test(a) ? `${a} -tietovisa` : `${a}-tietovisa`;
}

/** Ensimmäinen ehdokas, joka mahtuu 60 merkkiin; jos mikään ei mahdu, lyhin. */
function mahtuva(ehdokkaat: string[]): string {
  return ehdokkaat.find((e) => e.length <= HAKUOTSIKKO_MAX) ?? ehdokkaat[ehdokkaat.length - 1];
}

export function visanHakuotsikko(v: { nimi: string; seoTitle?: string | null; kysymyksia?: number | null }): string {
  const seo = v.seoTitle?.trim();
  if (seo) {
    // Sellaisenaan; suffiksi lisätään, jos se puuttuu ja mahtuu.
    return /tietoniekka/i.test(seo) ? seo : mahtuva([`${seo}${SUFFIKSI}`, seo]);
  }
  const nimi = v.nimi.trim();
  // Otsikossa on jo "visa" (myös megavisa, tietovisa, kuvavisa): ei muuteta.
  if (/visa/i.test(nimi)) return mahtuva([`${nimi}${SUFFIKSI}`, nimi]);
  const i = nimi.indexOf(" – ");
  const aihe = i > 0 ? nimi.slice(0, i) : nimi;
  const ala = i > 0 ? nimi.slice(i + 3).trim() : v.kysymyksia ? `${v.kysymyksia} kysymystä` : "";
  const runko = tietovisaYhdyssana(aihe);
  // Pituus: ensin pois " | Tietoniekka", sitten alaotsikko.
  return ala
    ? mahtuva([`${runko} – ${ala}${SUFFIKSI}`, `${runko} – ${ala}`, `${runko}${SUFFIKSI}`, runko])
    : mahtuva([`${runko}${SUFFIKSI}`, runko]);
}
