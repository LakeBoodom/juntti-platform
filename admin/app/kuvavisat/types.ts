// Kuvavisa-tyypit yhdessä paikassa — tab-rivi, lomakkeen valikko ja validointi
// lukevat kaikki tästä, jotta uuden kategorian lisääminen tapahtuu yhdellä rivillä.
// Slugit ASCII-muodossa (vastaa DB:n type-saraketta), label näytetään käyttäjälle.

export const KUVAVISA_TYPES = [
  { slug: "liput", label: "Liput" },
  { slug: "vaakunat", label: "Vaakunat" },
  { slug: "linnut", label: "Linnut" },
  { slug: "kasvit", label: "Kasvit" },
  { slug: "elaimet", label: "Eläimet" },
  { slug: "henkilot", label: "Henkilöt" },
  { slug: "rakennukset", label: "Rakennukset" },
  { slug: "kaupungit", label: "Kaupungit" },
  { slug: "maalaukset", label: "Maalaukset" },
] as const;

export type KuvavisaType = (typeof KUVAVISA_TYPES)[number]["slug"];

export const KUVAVISA_TYPE_SLUGS: readonly KuvavisaType[] = KUVAVISA_TYPES.map(
  (t) => t.slug,
);
