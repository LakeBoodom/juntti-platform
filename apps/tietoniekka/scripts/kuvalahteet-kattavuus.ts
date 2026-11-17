// KUVALÄHTEIDEN KATTAVUUS (kuvalähdebrief 17.11.2026): koska /kuvien-lahteet on ainoa merkintä, jokaisella
// näkyvällä vapaasti lisensoidulla kuvalla pitää olla rivi rekisterissä (lib/kuvalahteet.ts,
// lib/henkilokuvalahteet.ts) tai kannassa tekijä + lisenssi. Tulostaa puutteet.
//
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/kuvalahteet-kattavuus.ts [--csv tiedosto.csv]
// --csv kirjoittaa kuvavisojen puuttuvat rivit (yleinen tai tyhjä source_credit) Coworkin täydennettäviksi.
import { createClient } from "@supabase/supabase-js";
import { KUVALAHTEET } from "../lib/kuvalahteet";
import { HENKILOKUVALAHTEET } from "../lib/henkilokuvalahteet";
import { henkiloKuva } from "../lib/henkilokuvat";
import { kuvavisanLahde } from "../lib/lahdesivu";
import { writeFileSync } from "node:fs";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
const rekisteri = [...KUVALAHTEET, ...HENKILOKUVALAHTEET];

/** /20/<kokoelma>/[k/|hero/]<slug>[-kortti|-800|-1200].webp → rekisterin rivi */
export function rekisterissa(src: string | null | undefined): boolean {
  const m = src?.split("?")[0].match(/^\/20\/([^/]+)\/(?:k\/|hero\/)?(.+?)(?:-kortti|-800|-1200)?\.(?:webp|jpe?g|png|svg)$/);
  if (!m) return false;
  return rekisteri.some((x) => x.kokoelma === m[1] && x.slug === m[2]);
}

async function main() {
  const { data: visat } = await sb.from("quizzes").select("slug, title, hero_image, hero_alt, collection, game_mode")
    .eq("status", "published").in("platform", ["tietoniekka", "both"]).limit(5000);
  const puuttuu: string[] = [];
  let ok = 0, omat = 0, slugilla = 0;
  const eriTekija: string[] = [];
  const omaKansiot = new Map<string, number>();
  for (const v of visat ?? []) {
    if (!v.hero_image) continue;
    const kuvaAlt = /kuva:/i.test(v.hero_alt ?? "");
    if (rekisterissa(v.hero_image)) { ok++; continue; }
    // Yläkuva voi olla saman kuvan eri rajaus kuin kortti: rekisterin rivi visan slugilla, tekijä täsmättävä alt-tekstiin.
    const rivi = rekisteri.find((x) => x.slug === v.slug);
    if (rivi && kuvaAlt) {
      const tekijaAltissa = (v.hero_alt ?? "").toLowerCase().includes(rivi.tekija.toLowerCase().split(/[,(]/)[0].trim());
      if (tekijaAltissa) { slugilla++; continue; }
      eriTekija.push(`${v.slug}\trekisteri: ${rivi.tekija} / ${rivi.lisenssi}\talt: ${(v.hero_alt ?? "").slice((v.hero_alt ?? "").search(/kuva:/i))}`);
      continue;
    }
    if (kuvaAlt) puuttuu.push(`${v.slug}\t${v.hero_image}\t${(v.hero_alt ?? "").slice((v.hero_alt ?? "").search(/kuva:/i))}`);
    else { omat++; omaKansiot.set(v.hero_image.replace(/\/[^/]+$/, ""), (omaKansiot.get(v.hero_image.replace(/\/[^/]+$/, "")) ?? 0) + 1); }
  }
  console.log(`YLÄKUVAT: tiedosto rekisterissä ${ok}, sama kuva visan slugilla ${slugilla}, slug rekisterissä mutta eri tekijä ${eriTekija.length}`);
  for (const p of eriTekija) console.log("  " + p);
  console.log(`YLÄKUVAT: ei rekisterissä mutta alt kertoo lähteen ${puuttuu.length}, ei rekisterissä eikä lähdettä (oma kuvitus?) ${omat}`);
  for (const p of puuttuu) console.log("  " + p);
  console.log("  ilman lähdettä kansioittain: " + [...omaKansiot].map(([k, n]) => `${k} ${n}`).join(", "));

  const { data: julkkikset } = await sb.from("celebrities").select("name, image_url, image_credit, image_license").not("image_url", "is", null).limit(5000);
  const hPuuttuu: string[] = [];
  let hOk = 0, hEi = 0;
  for (const c of julkkikset ?? []) {
    const oma = henkiloKuva(c.image_url);
    if (!oma) { hEi++; continue; }
    const slug = oma.match(/\/20\/henkilot\/k\/(.+)\.webp$/)?.[1];
    if ((slug && HENKILOKUVALAHTEET.some((x) => x.slug === slug)) || rekisterissa(oma)) hOk++;
    else hPuuttuu.push(`${c.name}\t${oma}\t${c.image_credit ?? "-"} / ${c.image_license ?? "-"}`);
  }
  console.log(`HENKILÖKUVAT: oma kopio + rekisterissä ${hOk}, ei omaa kopiota (ei näytetä) ${hEi}, oma kopio ilman riviä ${hPuuttuu.length}`);
  for (const p of hPuuttuu) console.log("  " + p);

  const kv: Array<{ id: string; type: string; correct_option: string; image_url: string; source_credit: string | null; license_note: string | null }> = [];
  for (let i = 0; ; i += 1000) {
    const { data } = await sb.from("kuvavisas").select("id, type, correct_option, image_url, source_credit, license_note").eq("active", true).order("type").order("correct_option").range(i, i + 999);
    kv.push(...((data ?? []) as typeof kv));
    if ((data ?? []).length < 1000) break;
  }
  const puuttuvat = kv.filter((r) => !kuvavisanLahde(r.source_credit));
  const tyypit = [...new Set(kv.map((r) => r.type))];
  console.log("KUVAVISAT (tyyppi: lähdesivulla / puuttuu): " + tyypit.map((t) => `${t} ${kv.filter((r) => r.type === t).length - puuttuvat.filter((r) => r.type === t).length}/${puuttuvat.filter((r) => r.type === t).length}`).join(", "));
  const csvI = process.argv.indexOf("--csv");
  if (csvI > 0) {
    const q = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rivit = ["id,tyyppi,oikea_vastaus,kuva,nykyinen_merkinta,license_note", ...puuttuvat.map((r) => [r.id, r.type, r.correct_option, r.image_url, r.source_credit, r.license_note].map(q).join(","))];
    writeFileSync(process.argv[csvI + 1], rivit.join("\n") + "\n");
    console.log(`  ${puuttuvat.length} riviä → ${process.argv[csvI + 1]}`);
  }
}
main();
