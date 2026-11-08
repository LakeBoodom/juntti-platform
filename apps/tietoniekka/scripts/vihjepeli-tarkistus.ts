// VIHJEPELIN TARKISTUS (Mikä maa? -briefin valmiin määritelmä, 7.11.2026)
//   1. Päivän maa on deterministinen ja toistuu aikaisintaan toistovälin jälkeen (kaksi vuotta julkaisusta).
//   2. Jokainen maa löytyy täydennyksestä nimellään ja synonyymeillään; synonyymi ei osu kahteen maahan.
//   3. Etäisyys ja suunta tunnetuille pareille.
//   4. Harjoituskohde ei ole koskaan päivän kohde.
// Ajo (apps/tietoniekka): node scripts/run-ts.cjs scripts/vihjepeli-tarkistus.ts

import { MAA_AIHE, MAAT } from "@/lib/vihjepeli/aiheet/maa";
import { ehdotukset, harjoitusKohde, paivanKohde, taita, tunnista } from "@/lib/vihjepeli/arvonta";

let virheet = 0;
const virhe = (s: string) => { virheet++; console.log(`  VIRHE: ${s}`); };
const lisaa = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

console.log("1. Päivän maa");
const paivat = Array.from({ length: 730 }, (_, i) => lisaa(MAA_AIHE.julkaisu, i));
const sarja = paivat.map((p) => paivanKohde(MAA_AIHE, p).id);
const viimeksi = new Map<string, number>();
let lyhin = Infinity;
sarja.forEach((id, i) => {
  if (viimeksi.has(id)) lyhin = Math.min(lyhin, i - viimeksi.get(id)!);
  viimeksi.set(id, i);
});
if (lyhin <= MAA_AIHE.toistovali) virhe(`sama maa ${lyhin} päivän välein`);
// Sama tulos ilman välimuistia: käänteinen järjestys laskee historian alusta.
const tarkistus = [...paivat].reverse().slice(0, 20).map((p) => paivanKohde({ ...MAA_AIHE }, p).id);
if (tarkistus.some((id, i) => id !== sarja[729 - i])) virhe("päivän maa riippuu laskentajärjestyksestä");
if (sarja.some((id) => MAAT.find((m) => m.id === id)!.taso === "C")) virhe("C-maa päivän maana");
const kertoja = new Map<string, number>();
sarja.forEach((id) => kertoja.set(id, (kertoja.get(id) ?? 0) + 1));
console.log(`  730 päivää: ${kertoja.size} eri maata, lyhin toistoväli ${lyhin} pv (raja > ${MAA_AIHE.toistovali}), ensimmäiset: ${sarja.slice(0, 7).join(" ")}`);

console.log("2. Täydennys");
for (const m of MAAT) {
  for (const s of [m.nimi, ...(m.syn ?? [])]) {
    if (tunnista(MAAT, s)?.id !== m.id) virhe(`"${s}" ei tunnista maata ${m.nimi}`);
    if (!ehdotukset(MAAT, s, 200).some((x) => x.id === m.id)) virhe(`"${s}" ei ehdota maata ${m.nimi}`);
  }
}
const nimet = new Map<string, string>();
for (const m of MAAT) for (const s of [m.nimi, ...(m.syn ?? [])]) {
  const t = taita(s);
  if (nimet.has(t) && nimet.get(t) !== m.id) virhe(`"${s}" osuu sekä ${nimet.get(t)} että ${m.id}`);
  nimet.set(t, m.id);
}
for (const [syote, odotus] of [["Tsekki", "CZE"], ["hollanti", "NLD"], ["Itavalta", "AUT"], ["burma", "MMR"], ["Iso-Britannia", "GBR"]] as const)
  if (tunnista(MAAT, syote)?.id !== odotus) virhe(`"${syote}" → ${tunnista(MAAT, syote)?.id ?? "ei osumaa"}, odotettiin ${odotus}`);
console.log(`  ${MAAT.length} maata, ${nimet.size} hakunimeä; "Ch" → ${ehdotukset(MAAT, "Ch").map((m) => m.nimi).join(", ")}`);

console.log("3. Etäisyys ja suunta");
const maa = (id: string) => MAAT.find((m) => m.id === id)!;
for (const [a, b] of [["FIN", "SWE"], ["FIN", "CHL"], ["JPN", "BRA"], ["BRA", "CHL"], ["ARG", "CHL"], ["FIN", "EST"], ["LVA", "EST"], ["LTU", "EST"], ["NOR", "EST"]]) {
  const p = MAA_AIHE.palaute(maa(a), maa(b));
  if (p.tyyppi === "etaisyys") console.log(`  ${maa(a).nimi} → ${maa(b).nimi}: ${p.km} km, ${p.suunta} (${p.asteet}°)${p.naapuri ? ", naapuri" : ""}`);
}
const fs = MAA_AIHE.palaute(maa("FIN"), maa("SWE"));
if (fs.tyyppi !== "etaisyys" || !["länsi", "lounas"].includes(fs.suunta) || !fs.naapuri) virhe("Suomi → Ruotsi: odotettiin länsi tai lounas ja naapuri");
const fe = MAA_AIHE.palaute(maa("FIN"), maa("EST"));
if (fe.tyyppi !== "etaisyys" || fe.suunta !== "etelä" || fe.naapuri) virhe("Suomi → Viro: odotettiin etelä, ei maanaapuri");
// Pääkaupunkien väli (Heikki 8.11.2026): Helsinki–Tallinna ≈ 80 km, Riika–Tallinna ≈ 280 km.
if (fe.tyyppi !== "etaisyys" || fe.km < 70 || fe.km > 100) virhe(`Suomi → Viro: ${fe.tyyppi === "etaisyys" ? fe.km : "?"} km, odotettiin 70–100`);
const le = MAA_AIHE.palaute(maa("LVA"), maa("EST"));
if (le.tyyppi !== "etaisyys" || le.km < 260 || le.km > 300 || le.suunta !== "pohjoinen") virhe("Latvia → Viro: odotettiin ≈ 280 km pohjoiseen");

console.log("4. Harjoitus");
for (const p of paivat.slice(0, 60)) for (const s of ["a", "b", "c"]) if (harjoitusKohde(MAA_AIHE, p, s)?.id ===paivanKohde(MAA_AIHE, p).id) virhe(`harjoitus = päivän maa ${p}`);

console.log(virheet ? `\n${virheet} virhettä` : "\nKaikki tarkistukset läpi");
process.exit(virheet ? 1 : 0);
