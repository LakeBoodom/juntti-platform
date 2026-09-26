// KUNTALIITOS — reittipelin yhteiset tyypit ja apufunktiot (CD "Kuntaliitos v0.2",
// kierros 5 = v1:n säännöt, 26.9.2026). Tämä tiedosto kelpaa myös selaimeen: siinä ei ole
// kunta-aineistoa. Reitin arvonta ja kartta ovat palvelimella (lib/kuntaliitos/reitti.ts).
//
// Säännöt (Heikin päätökset 26.9.2026, Clauden suositukset):
//   - 8 kuntaa, 7 yhteyttä, päätepisteet lukittuina. Ei lauttoja.
//   - Päivän reitti on sama kaikille; "Arvo uusi reitti" antaa satunnaisen (?reitti=).
//   - Reitti saa kulkea maakuntien yli; maakunta näkyy kortissa vihjeenä.
//   - Pari hyväksytään, jos kunnilla on yhteinen raja (myös merialueella) → sana
//     "Yhteinen raja", ei "Maaraja". Arvonta käyttää vain selviä maarajoja (≥ 2 km).
//   - Pisteet 10 / oikea yhteys.

export const KL_SIVU = "/peli/kuntaliitos";
export const KL_KUNTIA = 8;
export const KL_YHTEYKSIA = KL_KUNTIA - 1;
export const KL_PISTEET = 10;

/** Kunta pelikortissa ja kartalla. x/y = nastan paikka prosentteina kartasta. */
export type KlKunta = { k: string; n: string; m: string; v: string | null; x: number; y: number };

/** Kartan tausta: reitin alueen kunnat valmiina SVG-polkuina (viewBox-koordinaatit). */
export type KlKartta = { viewBox: string; alueet: Array<{ k: string; d: string; s: number }> };

export type KlReitti = {
  siemen: string;
  /** Oikea järjestys (yksi ratkaisu; reitti arvotaan niin, että ratkaisuja on tasan yksi). */
  ratkaisu: KlKunta[];
  /** Pelaajan lähtöjärjestys: päätepisteet paikallaan, välikunnat sekoitettuina. */
  alku: string[];
  /** Kaikki yhteiset rajat reitin kuntien kesken ("a-b", a < b) — tarkistus parikohtaisesti. */
  rajat: string[];
  kartta: KlKartta;
};

export const pariAvain = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** Selaimessa arvottava siemen uudelle reitille (ei renderissä → ei hydraatioeroa). */
export const uusiReittiSiemen = () => Math.random().toString(36).slice(2, 8);
