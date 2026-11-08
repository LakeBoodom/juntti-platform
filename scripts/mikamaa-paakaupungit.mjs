// MIKÄ MAA? — pääkaupunkien sijainnit etäisyyspalautteeseen (Heikki 8.11.2026: painopisteiden väli antoi
// Suomesta Viroon 650 km; pelaaja ajattelee pääkaupunkien väliä, Helsinki–Tallinna ≈ 80 km).
//
// Lisää apps/tietoniekka/lib/vihjepeli/maat.json -tiedoston jokaiselle maalle kentän pl: [lat, lon] = pelissä näytettävän
// pääkaupungin (pk) sijainti Wikidatasta (CC0, P36 pääkaupunki, P625 koordinaatit). Aja aina scripts/mikamaa-data.mjs:n
// jälkeen, koska se kirjoittaa maat.json-tiedoston uudelleen.
//
//   node scripts/mikamaa-paakaupungit.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../apps/tietoniekka/lib/vihjepeli/maat.json");

/** Usean pääkaupungin maat: etäisyys hallinnon kotipaikasta (pk näyttää kaikki). Wikidatan nimi (fi tai en). */
const VALITSE = { BOL: "La Paz", ZAF: "Pretoria", KIR: "South Tarawa", MYS: "Kuala Lumpur", NLD: "Amsterdam", LKA: "Sri Jayawardenepura Kotte", BEN: "Porto-Novo", CHL: "Santiago", MEX: "Mexico City", CIV: "Yamoussoukro" };

const q = `SELECT ?iso3 ?fi ?en ?coord WHERE {
  { ?c p:P463 ?st . ?st ps:P463 wd:Q1065 . FILTER NOT EXISTS { ?st pq:P582 ?end } } UNION { VALUES ?c { wd:Q35 } }
  ?c wdt:P298 ?iso3 .
  ?c p:P36 ?cs . ?cs ps:P36 ?cap . FILTER NOT EXISTS { ?cs pq:P582 ?e2 }
  ?cap wdt:P625 ?coord .
  OPTIONAL { ?cap rdfs:label ?fi FILTER(lang(?fi)="fi") } OPTIONAL { ?cap rdfs:label ?en FILTER(lang(?en)="en") }
}`;
const r = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(q)}`, {
  headers: { Accept: "application/sparql-results+json", "User-Agent": "Tietoniekka/1.0 (tietoniekka.fi; valtioaineisto)" },
});
if (!r.ok) throw new Error(`Wikidata: ${r.status}`);
const paikat = new Map();
for (const b of (await r.json()).results.bindings) {
  const [lon, lat] = b.coord.value.replace(/^Point\(|\)$/g, "").split(" ").map(Number);
  const k = b.iso3.value;
  paikat.set(k, [...(paikat.get(k) ?? []), { fi: b.fi?.value, en: b.en?.value, lat, lon }]);
}
// Tanska: YK:n jäsen on Tanskan kuningaskunta (Q35), ISO-koodi DNK.
const taita = (s) => (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const data = JSON.parse(readFileSync(OUT, "utf8"));
const ongelmat = [];
for (const m of data.maat) {
  const vaihtoehdot = paikat.get(m.k) ?? [];
  const haku = taita(VALITSE[m.k] ?? m.pk);
  const osuma = vaihtoehdot.find((p) => taita(p.fi) === haku || taita(p.en) === haku)
    ?? vaihtoehdot.find((p) => haku.includes(taita(p.fi)) || haku.includes(taita(p.en)) || taita(p.fi).includes(haku) || taita(p.en).includes(haku))
    ?? (vaihtoehdot.length === 1 ? vaihtoehdot[0] : null);
  if (!osuma) { ongelmat.push(`${m.k} ${m.pk}: ${vaihtoehdot.map((p) => p.fi ?? p.en).join(", ") || "ei pääkaupunkia"}`); continue; }
  m.pl = [+osuma.lat.toFixed(3), +osuma.lon.toFixed(3)];
}
if (ongelmat.length) throw new Error(`Pääkaupunki puuttuu tai epäselvä:\n${ongelmat.join("\n")}`);
data.lahde = data.lahde.replace(/ Generoitu/, " Pääkaupunkien sijainnit: Wikidata (CC0). Generoitu");
writeFileSync(OUT, JSON.stringify(data));
console.log(`${data.maat.length} pääkaupunkia: ${data.maat.filter((m) => ["FIN", "EST", "LVA", "LTU", "SWE", "NOR", "BOL", "ZAF"].includes(m.k)).map((m) => `${m.k} ${m.pk} ${m.pl}`).join(" · ")}`);
