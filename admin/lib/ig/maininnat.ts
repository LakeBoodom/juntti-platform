// Tägäys (vaihtoehto 1): @-maininta kuvatekstissä. Maininta ilmoittaa tilille ja näkyy
// julkaisussa linkkinä, mutta ei vaadi yhteistyökutsun hyväksyntää. Tilit tallennetaan
// visalle tai henkilölle ehdotukseksi (quizzes.ig_tilit, celebrities.ig_tilit), ja
// toimitus voi muuttaa ne julkaisukohtaisesti (kentat.maininnat).
//
// Ei tekoälyarvauksia: väärä tunnus tägäisi väärän tilin. Toimitus tarkistaa tilin
// linkistä ennen tallennusta.

/** Instagram-käyttäjätunnus: 1–30 merkkiä, kirjaimet, numerot, piste ja alaviiva. */
const TUNNUS = /^[a-z0-9._]{1,30}$/;

/** "@NylonBeat, instagram.com/toinen/ kolmas" → tunnukset pienillä kirjaimilla + virheelliset. */
export function jasennaTilit(teksti: string): { tilit: string[]; virheelliset: string[] } {
  const tilit: string[] = [];
  const virheelliset: string[] = [];
  for (const osa of teksti.split(/[\s,;]+/).filter(Boolean)) {
    const url = osa.match(/instagram\.com\/([^/?#]+)/i);
    const t = (url ? url[1] : osa).replace(/^@+/, "").toLowerCase();
    if (!t) continue;
    if (TUNNUS.test(t) && !t.startsWith(".") && !t.endsWith(".")) {
      if (!tilit.includes(t)) tilit.push(t);
    } else {
      virheelliset.push(osa);
    }
  }
  return { tilit: tilit.slice(0, 5), virheelliset };
}

export const tilitTekstina = (tilit: string[]) => tilit.map((t) => `@${t}`).join(" ");

/** Lisää maininnat omalle rivilleen hashtagien edelle (tai loppuun). Kuvatekstissä jo
    olevaa mainintaa ei toisteta. */
export function lisaaMaininnat(teksti: string, tilit: string[]): string {
  const puuttuvat = tilit.filter((t) => !new RegExp(`(^|[^\\w.])@${t.replace(/\./g, "\\.")}(?![\\w.])`, "i").test(teksti));
  if (!puuttuvat.length) return teksti;
  const rivi = tilitTekstina(puuttuvat);
  const rivit = teksti.replace(/\s+$/, "").split("\n");
  const viimeinen = rivit[rivit.length - 1] ?? "";
  if (viimeinen.trim().startsWith("#")) {
    rivit.splice(rivit.length - 1, 0, rivi, "");
    return rivit.join("\n").replace(/\n{3,}/g, "\n\n");
  }
  return `${rivit.join("\n")}\n\n${rivi}`;
}

/** Julkaisun maininnat: toimituksen valinta, muuten visan ja henkilön tallennetut tilit. */
export const julkaisunMaininnat = (maininnat: string[] | undefined, ehdotus: string[]) => maininnat ?? ehdotus;
