// JUNANKULJETTAJA — neljäs reittipeli (CD "Junankuljettaja, kierros 1", Heikin päätökset 20.11.2026).
// Lähtö- ja määränpääasema pysyvät paikallaan, kuusi väliasemaa on sekaisin, ja pelaaja järjestää ne radan
// kulkujärjestykseen. Sama pelinäkymä kuin Kuntaliitoksessa (components/tn20/reittipeli/ReittipeliClient.tsx):
// 3 tarkistusta, vinkkinä vain väärien asemavälien määrä, 10 p / oikea väli, jokainen uusi yritys −10 p.
//   - Päivän vuoro on kaikille sama (tasokohtainen) ja vaihtuu keskiyöllä; "Arvo uusi vuoro" antaa satunnaisen.
//   - Vaikeustasot helppo, keski ja vaikea: asemia on aina kuusi, vaikeus tulee asemien tunnettuudesta.
//   - Asemapalassa kunta vihjeenä, kun aseman nimi on eri kuin kunnan ("Pännäinen · Pedersöre").
// Tämä tiedosto kelpaa myös selaimeen. Reittiaineisto ja arvonta ovat palvelimella (lib/junankuljettaja/vuoro.ts).

export const JK_SIVU = "/peli/junankuljettaja";

export type JkTaso = "helppo" | "keski" | "vaikea";
export const JK_TASOT: Array<{ taso: JkTaso; nimi: string }> = [
  { taso: "helppo", nimi: "Helppo" },
  { taso: "keski", nimi: "Keski" },
  { taso: "vaikea", nimi: "Vaikea" },
];
/** Oletustaso: hero ja jakokuva ilman ?taso=-parametria. */
export const JK_OLETUSTASO: JkTaso = "keski";
export const jkTaso = (t: unknown): JkTaso | null => (JK_TASOT.some((x) => x.taso === t) ? (t as JkTaso) : null);
