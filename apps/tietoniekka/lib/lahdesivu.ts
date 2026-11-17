// KUVALÄHTEIDEN KÄYTÄNTÖ (kuvalähdebrief, Heikki 17.11.2026): tekijä, lisenssi ja lähde näytetään vain
// sivulla /kuvien-lahteet. Näkymissä ei ole kuvakohtaisia merkintöjä; ainoa merkintä on alatunnisteen
// linkki "Kuvien lähteet" (pelisivuilla PeliAlatunniste). Poikkeukset: jakokortit (lib/kuvakrediitti.ts)
// ja visapakettien tuloste (lähdeluettelo viimeisellä sivulla).
//
// Siirtymäaika: kuvavisan kuvalla, jonka kuvavisas.source_credit on vielä yleinen ("Wikipedia / Wikimedia
// Commons" ilman tekijää ja lisenssiä), merkintä pysyy pelissä, kunnes Cowork täydentää rivin. Täydennetty
// rivi siirtyy lähdesivulle ja katoaa pelistä itsestään (sama tunnistus molemmissa).

export const LAHDESIVU = "/kuvien-lahteet";

/** "Tekijä / Wikimedia Commons, Lisenssi" → { tekija, lisenssi }; yleinen tai tyhjä merkintä → null. */
export function kuvavisanLahde(credit: string | null | undefined): { tekija: string; lisenssi: string } | null {
  const m = (credit ?? "").match(/^(.+?) \/ Wikimedia Commons, (.+)$/);
  return m ? { tekija: m[1], lisenssi: m[2] } : null;
}

/** Näytetäänkö kuvavisan merkintä vielä pelissä: vain, jos sitä ei ole lähdesivulla (siirtymäaika). */
export const krediittiPelissa = (credit: string | null | undefined): string | null =>
  credit && !kuvavisanLahde(credit) ? credit : null;
