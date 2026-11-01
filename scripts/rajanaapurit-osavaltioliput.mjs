// RAJANAAPURIT: YHDYSVALLAT — osavaltioiden liput omiksi kopioiksi (1.11.2026).
// Lähde: Wikimedia Commons "Flag of <osavaltio>.svg" (public domain), Commonsin oma PNG-renderöinti
// 480 px → WebP 240 px leveä, alkuperäinen kuvasuhde (pelin lippulaatta rajaa cover-periaatteella).
// Ei hotlinkkiä (UI-sääntö 6): kuvat ovat public/20/rajanaapurit/liput/us-<xx>.webp.
//
//   node scripts/rajanaapurit-osavaltioliput.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const juuri = join(dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(join(juuri, "apps/tietoniekka/package.json"))("sharp");
const data = JSON.parse(readFileSync(join(juuri, "apps/tietoniekka/lib/rajanaapurit/osavaltiot.json"), "utf8"));
const EN = {
  AL: "Alabama", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia (U.S. state)", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

for (const a of data.alueet) {
  const tiedosto = `Flag of ${EN[a.k]}.svg`;
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(tiedosto.replace(/ /g, "_"))}?width=480`;
  const r = await fetch(url, { headers: { "User-Agent": "Tietoniekka/1.0 (tietoniekka.fi; liput omiksi kopioiksi)" } });
  if (!r.ok) throw new Error(`${tiedosto}: ${r.status}`);
  const kuva = await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 240 }).webp({ quality: 86 }).toBuffer();
  writeFileSync(join(juuri, "apps/tietoniekka/public", a.v), kuva);
  const m = await sharp(kuva).metadata();
  console.log(`${a.k} ${tiedosto} → ${a.v} ${m.width}×${m.height} ${Math.round(kuva.length / 1024)} kt`);
  await new Promise((ok) => setTimeout(ok, 400));
}
