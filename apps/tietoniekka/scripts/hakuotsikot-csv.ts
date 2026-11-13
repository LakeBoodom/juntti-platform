// HAKUOTSIKKOLISTA (SEO-brief 13.11.2026): kaikkien julkaistujen /visa/<slug>-sivujen <title> ennen ja jälkeen
// lib/hakuotsikko.ts-säännön. Uusi otsikko lasketaan samalla funktiolla kuin sivulla. Nykyinen otsikko on 23.9.
// säännön kopio (seo_title → sellaisenaan, tunnetut henkilöt → "Nimi – tietovisa: kuinka hyvin tunnet?", muut nimi).
//
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/hakuotsikot-csv.ts > hakuotsikot.csv

import { createClient } from "@supabase/supabase-js";
import { visanHakuotsikko, HAKUOTSIKKO_MAX } from "../lib/hakuotsikko";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Puuttuu NEXT_PUBLIC_SUPABASE_URL tai NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(2);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const SITE = "62d75f45-a857-4fdd-9a45-b70ceeee98a8";

async function kaikki<T>(haku: (a: number, b: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; ; i += 1000) {
    const { data, error } = await haku(i, i + 999);
    if (error) throw new Error(error.message);
    const rivit = (data ?? []) as T[];
    out.push(...rivit);
    if (rivit.length < 1000) return out;
  }
}

type Visa = { id: string; slug: string; title: string; display_title: string | null; seo_title: string | null; collection: string | null; game_mode: string | null };

function nykyinen(v: Visa, nimi: string): string {
  const suffix = " | Tietoniekka";
  if (v.seo_title) return /tietoniekka/i.test(v.seo_title) ? v.seo_title : `${v.seo_title}${suffix}`;
  if (v.collection === "tunnetut-henkilot") return `${nimi.split(/\s[–—-]\s/)[0].trim()} – tietovisa: kuinka hyvin tunnet?${suffix}`;
  return `${nimi}${suffix}`;
}

const csv = (s: string | number) => (typeof s === "number" ? String(s) : `"${s.replace(/"/g, '""')}"`);

async function main() {
  // Itsetesti briefin esimerkeillä.
  const testit: Array<[string, number, string]> = [
    ["Rauman Lukko", 10, "Rauman Lukko -tietovisa – 10 kysymystä | Tietoniekka"],
    ["Salo – elektroniikkakaupungin juuret", 10, "Salo-tietovisa – elektroniikkakaupungin juuret | Tietoniekka"],
    ["Kummeli", 10, "Kummeli-tietovisa – 10 kysymystä | Tietoniekka"],
    ["Jippu – suomipoplaulaja", 5, "Jippu-tietovisa – suomipoplaulaja | Tietoniekka"],
    ["Suomen linnut pienille", 10, "Suomen linnut pienille -tietovisa – 10 kysymystä"],
    ["Kotka – satamakaupunki Kymijoen suulla", 10, "Kotka-tietovisa – satamakaupunki Kymijoen suulla"],
    ["Haloo Helsinki!", 10, "Haloo Helsinki! -tietovisa – 10 kysymystä | Tietoniekka"],
  ];
  let virhe = 0;
  for (const [nimi, n, odotus] of testit) {
    const saatu = visanHakuotsikko({ nimi, kysymyksia: n });
    if (saatu !== odotus) { virhe++; console.error(`ITSETESTI: "${nimi}" → "${saatu}", odotettiin "${odotus}"`); }
  }
  if (virhe) process.exit(2);

  const [visat, kysymykset] = await Promise.all([
    kaikki<Visa>((a, b) => sb.from("quizzes").select("id, slug, title, display_title, seo_title, collection, game_mode")
      .eq("status", "published").eq("site_id", SITE).not("slug", "is", null).order("slug").range(a, b)),
    kaikki<{ quiz_id: string }>((a, b) => sb.from("questions").select("quiz_id").order("id").range(a, b)),
  ]);
  const maara = new Map<string, number>();
  for (const k of kysymykset) maara.set(k.quiz_id, (maara.get(k.quiz_id) ?? 0) + 1);

  const rivit = [["slug", "nykyinen_title", "uusi_title", "merkkeja", "yli_60", "seo_title_kaytossa"].join(",")];
  for (const v of visat) {
    if (v.game_mode === "mega") continue; // megat eivät ole /visa/-sivuja
    const nimi = v.display_title ?? v.title;
    const uusi = visanHakuotsikko({ nimi, seoTitle: v.seo_title, kysymyksia: maara.get(v.id) ?? 0 });
    rivit.push([csv(v.slug), csv(nykyinen(v, nimi)), csv(uusi), uusi.length, uusi.length > HAKUOTSIKKO_MAX ? "kyllä" : "", v.seo_title ? "kyllä" : ""].join(","));
  }
  process.stdout.write(rivit.join("\n") + "\n");
  console.error(`${rivit.length - 1} visaa.`);
}

main();
