// Visan kokoelma samoin nimin kuin tietoniekka.fi:ssä (vrt. apps/tietoniekka/lib/visanKokoelma.ts).
// Useimmat tulevat collection-kentästä; osa kokoelmista tunnistetaan kategoriasta.
// Jalkapallo on sivustolla oma kokoelmansa, mutta kannassa se on urheilun alla.

const KOKOELMAT: Record<string, string> = {
  elokuvat: "Elokuvat",
  historia: "Historia",
  kulttuuri: "Kulttuuri",
  luonto: "Luonto",
  matkakohteet: "Maantieto",
  musiikki: "Musiikki",
  "tunnetut-henkilot": "Tunnetut henkilöt",
  tv: "TV & suoratoisto",
  urheilu: "Urheilu",
  yleistieto: "Yleistieto",
};

export function kokoelmaNimi(v: { collection: string | null; category: string | null }): string {
  if (v.category === "mega") return "Megavisat";
  if (v.category === "tiede-teknologia") return "Tiede & teknologia";
  if (v.category === "kaupungit") return "Suomen kaupungit";
  if (v.category === "jaakiekko") return "Jääkiekko";
  return (v.collection && KOKOELMAT[v.collection]) || "Muut";
}

/** Urheiluaiheinen visa — Instagram-testin tasapainotus (design 2j: jokainen
    pohja saa sekä urheilu- että muita aiheita). */
export function onUrheilu(v: { collection: string | null; category: string | null }): boolean {
  return v.collection === "urheilu" || v.category === "jaakiekko" || v.category === "urheilu";
}
