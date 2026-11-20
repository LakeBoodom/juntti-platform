// KUMPI? 2.0 — laatuportti (brief A5): 500 kysymystä jokaisesta teemasta (myös seurateemat), tarkistukset
// lib/kumpi/laatu.ts:ssä. Kaksi tapaa ajaa:
//   1) Esikatselun data (luonnospelaajat + kytkemättömät määrittelyt, service role palvelimella):
//        node scripts/run-ts.cjs scripts/kumpi-laatu.ts https://<preview>.vercel.app
//      Skripti hakee raportin osoitteesta /api/kumpi/laatu (tuotannossa 404).
//   2) Julkaistu data anon-avaimella (sama kuin tuotannossa ennen vaihetta C):
//        NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/kumpi-laatu.ts
// Poistumiskoodi 1, jos jokin tarkistus kaatuu tai pelattavasta teemasta syntyy alle 30 kysymystä.

import { laatuportti, type TeemaRaportti } from "@/lib/kumpi/laatu";
import { lataaKumpiData } from "@/lib/kumpi/data";
import type { KumpiKysymys } from "@/lib/kumpi/tyypit";

const MIN_KYSYMYKSIA = 30;

async function main() {
  const url = process.argv[3];
  let teemat: TeemaRaportti[];
  let otos: KumpiKysymys[];
  if (url) {
    const r = await fetch(`${url.replace(/\/$/, "")}/api/kumpi/laatu`);
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    ({ teemat, otos } = await r.json());
  } else {
    const data = await lataaKumpiData();
    if (!data) throw new Error("Ei Supabase-ympäristömuuttujia");
    ({ teemat, otos } = laatuportti(data));
  }

  let kaatui = 0;
  for (const t of teemat) {
    const vahan = t.kysymyksia < MIN_KYSYMYKSIA;
    const tila = t.virheet.length ? "VIRHE" : vahan ? "VÄHÄN" : "ok";
    if (t.virheet.length) kaatui++;
    console.log(`${tila.padEnd(5)} ${t.slug.padEnd(24)} pooli ${String(t.pooli).padStart(4)}  kysymyksiä ${String(t.kysymyksia).padStart(3)}  ${JSON.stringify(t.vaikeudet)}`);
    if (vahan) console.log(`      (alle ${MIN_KYSYMYKSIA}: ei hubiin) attribuutit: ${t.attribuutit.join(", ") || "–"}`);
    for (const v of t.virheet) console.log(`      ${v}`);
  }
  console.log("\nOtos (30):");
  for (const q of otos) {
    const [a, b] = q.vaihtoehdot;
    console.log(`| ${q.teema} | ${q.lause} | ${a.nimi} (${a.arvo}) | ${b.nimi} (${b.arvo}) | ${q.vaihtoehdot[q.oikea].lyhyt} | ${q.vaikeus} |`);
  }
  process.exit(kaatui ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
