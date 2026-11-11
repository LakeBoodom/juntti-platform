// H5 "Täältä kotoisin" — vertailu (11.11.2026): kaupunkisivun henkilöosio vanhalla tekstihaulla vs. uudella
// born_in-suhdehaulla kaikille 35 kaupungille (vanha = tuotannon haku: inessiivi + kaupungit.vanhat_kunnat). Raportoi menetetyt ja uudet henkilöt, varahaun osumat,
// kaksoiskappaleet ja vanhan kunnan lisärivit. Virhe, jos joku putoaa pois tai näkyy kahdesti.
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/h5-vertailu.ts

import { HENKILOT_MAX, haeKaupungit, haeSyntyneetTekstilla, haeSyntyneetTiedoin, vanhaKuntaRivi } from "@/lib/kaupunkisivu";

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

  console.log("\nKaupunki            vanha  uusi  näkyvissä  muutos");
  let varaYht = 0;
  const lisarivit: string[] = [];
  for (const k of kaupungit) {
    const vanha = (await haeSyntyneetTekstilla(k)).map((c) => c.name);
    const { henkilot, varahaulla } = await haeSyntyneetTiedoin(k);
    const uusi = henkilot.map((h) => h.name);
    const pois = vanha.filter((n) => !uusi.includes(n));
    const uudet = uusi.filter((n) => !vanha.includes(n));
    const kahdesti = uusi.filter((n, i) => uusi.indexOf(n) !== i);
    varaYht += varahaulla.length;
    for (const h of henkilot) if (h.ala) lisarivit.push(`${k.nimi}: ${h.name} – ${h.ala}`);
    const muutos = [
      uudet.length ? `+ ${uudet.join(", ")}` : "",
      pois.length ? `− ${pois.join(", ")}` : "",
      varahaulla.length ? `(varahaku: ${varahaulla.join(", ")})` : "",
    ].filter(Boolean).join("  ");
    console.log(`${k.nimi.padEnd(20)}${String(vanha.length).padStart(5)}${String(uusi.length).padStart(6)}${String(Math.min(uusi.length, HENKILOT_MAX)).padStart(11)}  ${muutos}`);
    if (pois.length) { virheet++; console.log(`  VIRHE: ${k.nimi} menettää ${pois.join(", ")}`); }
    if (kahdesti.length) { virheet++; console.log(`  VIRHE: ${k.nimi} kahdesti ${kahdesti.join(", ")}`); }
  }
  console.log(`\nVarahaun kautta yhteensä: ${varaYht} henkilöä`);
  console.log(`Vanhan kunnan lisärivit (${lisarivit.length}):\n  ${lisarivit.join("\n  ")}`);
  console.log(virheet ? `\n${virheet} VIRHETTÄ` : "\nKaikki tarkistukset ok");
  process.exit(virheet ? 1 : 0);
}

main();
