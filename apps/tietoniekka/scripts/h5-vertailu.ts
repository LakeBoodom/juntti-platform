// H5 "Täältä kotoisin" — tarkistus (11.11.2026): kaupunkisivun henkilöosio born_in-suhteista kaikille 35 kaupungille.
// Tarkistaa vanhan kunnan lisärivien taivutuksen, entity_id:n jokaisella kaupungilla ja ettei kukaan näy kahdesti.
// Tekstihaun varahaku ja kaupungit.vanhat_kunnat poistettiin 11.11.2026; vertailu niihin tehtiin ennen poistoa.
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/h5-vertailu.ts

import { HENKILOT_MAX, haeKaupungit, haeSyntyneet, vanhaKuntaRivi } from "@/lib/kaupunkisivu";

async function main() {
  let virheet = 0;
  const ok = (ehto: boolean, s: string) => (ehto ? console.log(`  ok: ${s}`) : (virheet++, console.log(`  VIRHE: ${s}`)));

  console.log("Taivutus");
  for (const [d, odotus] of [
    ["Nastola (nyk. Lahti)", "s. Nastolassa"],
    ["Mikkelin maalaiskunta (nyk. Mikkeli)", "s. Mikkelin maalaiskunnassa"],
    ["Haukivuori (nyk. Mikkeli)", "s. Haukivuorella"],
    ["Tuntematon (nyk. Jokin)", "Tuntematon (nyk. Jokin)"],
    [null, ""],
  ] as const)
    ok(vanhaKuntaRivi(d) === odotus, `${d ?? "NULL"} → "${vanhaKuntaRivi(d)}"`);

  const kaupungit = await haeKaupungit();
  ok(kaupungit.length === 35 && kaupungit.every((k) => k.entity_id), `entity_id: ${kaupungit.filter((k) => k.entity_id).length}/${kaupungit.length}`);

  console.log("\nKaupunki            henkilöt  näkyvissä");
  const lisarivit: string[] = [];
  for (const k of kaupungit) {
    const henkilot = await haeSyntyneet(k);
    const nimet = henkilot.map((h) => h.name);
    const kahdesti = nimet.filter((n, i) => nimet.indexOf(n) !== i);
    for (const h of henkilot) if (h.ala) lisarivit.push(`${k.nimi}: ${h.name} – ${h.ala}`);
    console.log(`${k.nimi.padEnd(20)}${String(nimet.length).padStart(8)}${String(Math.min(nimet.length, HENKILOT_MAX)).padStart(11)}`);
    if (kahdesti.length) { virheet++; console.log(`  VIRHE: ${k.nimi} kahdesti ${kahdesti.join(", ")}`); }
  }
  console.log(`\nVanhan kunnan lisärivit (${lisarivit.length}):\n  ${lisarivit.join("\n  ")}`);
  console.log(virheet ? `\n${virheet} VIRHETTÄ` : "\nKaikki tarkistukset ok");
  process.exit(virheet ? 1 : 0);
}

main();
