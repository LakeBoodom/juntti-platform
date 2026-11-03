// JÄRJESTÄ — yhteinen rivi (CD "Järjestä yhtenäinen UX", Heikki 2.11.2026): sama kortti hubissa, pelissä ja tuloksessa.
// Tavallinen moduuli, käytetään sekä palvelimella että clientillä.

/** Kokoelmassa ja hubissa kortit ovat vinossa (±0,5–1,3°); pelissä ne suoristuvat ja tuloksessa väärät jäävät vinoon. */
const KALLISTUS = ["-1.2deg", ".9deg", "-.5deg", "1.3deg", "-.9deg", ".6deg", "-1.1deg", ".8deg"];
export const kallistus = (i: number) => KALLISTUS[i % KALLISTUS.length];

/** KORTTISÄÄNTÖ: yli 13 merkin sanat tavutettuina (U+00AD), muuten kapea kortti pienentäisi nimen alle 12 px:n. */
const TAVUT: Record<string, string> = {
  Kristillisdemokraatit: "Kristillis­demokraatit",
  Perussuomalaiset: "Perus­suomalaiset",
  Vasemmistoliitto: "Vasemmisto­liitto",
  Sosialidemokraatit: "Sosiali­demokraatit",
  Kristiinankaupunki: "Kristiinan­kaupunki",
  kansallispuisto: "kansallis­puisto",
  Kangchendzönga: "Kangchen­dzönga",
  Aakenustunturi: "Aakenus­tunturi",
};
export const tavuta = (nimi: string) => nimi.replace(/[^\s\-–]+/g, (w) => TAVUT[w] ?? w);

/** KORTTISÄÄNTÖ: pisin rivitettävä osa (välilyönti, yhdysmerkki tai tavuviiva U+00AD jakaa) → nimen koko CSS:ssä. */
export const pisinTavu = (nimi: string) => Math.max(...nimi.split(/[\s\-–­]+/).map((w) => w.length));

/** Tuloksessa vuosi riittää (CD 3e), mutta saman vuoden osuessa samalle riville järjestys ei näkyisi: silloin koko
 *  päivämäärä (Jäätteenmäki ja Vanhanen 2003, Rinne ja Marin 2019). Muut arvot ("1 317 m") sellaisenaan. */
export function vuosiTaiPaiva(arvot: string[]): string[] {
  const vuosi = (a: string) => a.match(/^\d{1,2}\.\d{1,2}\.(\d{4})$/)?.[1] ?? null;
  const vuodet = arvot.map(vuosi);
  return arvot.map((a, i) => {
    const v = vuodet[i];
    return v && vuodet.filter((x) => x === v).length === 1 ? v : a;
  });
}

/** Ohjeen loppu kaikissa pakoissa: napautus vaihtaa kaksi korttia, raahaus siirtää. */
export const VAIHTO_OHJE = "Napauta kahta vaihtaaksesi, tai raahaa.";
