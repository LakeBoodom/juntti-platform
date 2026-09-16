// TIETOKETJU: IKÄJÄRJESTYS — jaetut vakiot ja tyypit.
//
// Eriytetty omaan tiedostoon lib/ikajarjestys.ts:stä, koska "use server"
// -tiedosto (Next.js Server Actions) saa eksportoida VAIN async-funktioita —
// vakion (ROUND_SIZE) tai tavallisen apufunktion (shuffle, sortForDirection)
// vienti samasta tiedostosta kaataisi buildin ("A 'use server' file can only
// export async functions"). Tyypit (type ChainPerson) olisivat sallittuja
// (TS-tyypit poistuvat käännöksessä), mutta pidetään koko jaettu API tässä
// yhdessä paikassa selkeyden vuoksi.

/** Kierroksen koko — pelimuodon oma, tarkoituksellinen vakio (ei sama asia
    kuin CLAUDE.md:n "ei kovakoodattua kysymysmäärää" -sääntö, joka koskee
    visojen kysymysmäärää). Ks. tarkempi perustelu lib/ikajarjestys.ts:ssä. */
export const ROUND_SIZE = 10;

export type ChainDirection = "vanhin-nuorin" | "nuorin-vanhin";

/** Oletussuunta tässä versiossa: aina vanhimmasta nuorimpaan (tekninen
    valinta, ks. lopun yhteenveto — komponentit tukevat kääntöä myöhempää
    varten, mutta UI ei vielä tarjoa suunnan vaihtoa pelaajalle). */
export const DEFAULT_DIRECTION: ChainDirection = "vanhin-nuorin";

export type ChainPerson = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  /** ISO-päivämäärä (YYYY-MM-DD) suoraan kannasta — muotoillaan näyttöön vasta paljastuksessa. */
  birthDate: string;
};

/** Palauttaa henkilöt oikeassa kronologisessa järjestyksessä valitun suunnan mukaan. */
export function sortForDirection(people: ChainPerson[], direction: ChainDirection): ChainPerson[] {
  const sorted = [...people].sort((a, b) => a.birthDate.localeCompare(b.birthDate));
  return direction === "vanhin-nuorin" ? sorted : sorted.reverse();
}

/** Muotoilee ISO-syntymäajan suomalaiseen "D.M.YYYY"-muotoon paljastusta varten. */
export function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function shuffleChain<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
