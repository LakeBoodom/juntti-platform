// KYSYMYSMÄÄRÄN TARKISTUS (Heikki 13.11.2026): henkilövisoja laajennetaan 5 → 10 kysymykseen, ja teksteihin
// kirjoitettu luku ("Viisi kysymystä …", "10 kysymyksen visa", "5 kys.") vanhenee hiljaa. Tarkistus etsii
// julkaistujen visojen teksteistä kysymysmäärän ja vertaa sitä visan todelliseen määrään (quiz_cards.question_count,
// sama luku kuin sivustolla). Kokoelmasivujen SEO-tekstit (page_content) verrataan kokoelman visojen määriin.
// Koodin tekstit eivät kuulu tähän: niissä luku tulee datasta.
//
// Ajo (apps/tietoniekka): NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… node scripts/run-ts.cjs scripts/kysymysmaara-tarkistus.ts
// Poistumiskoodi 1, jos ristiriitoja löytyy.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Puuttuu NEXT_PUBLIC_SUPABASE_URL tai NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(2);
}
// Erillinen skriptiasiakas (ei sovelluksen getSupabase, joka vaatii Next-ympäristön).
const sb = createClient(url, key, { auth: { persistSession: false } });

/** Lukusanojen taivutusmuodot → luku. Kattaa muodot, joita visateksteissä käytetään. */
const SANAT: Record<string, number> = {};
const lisaa = (n: number, ...muodot: string[]) => muodot.forEach((m) => (SANAT[m] = n));
lisaa(3, "kolme", "kolmen", "kolmella", "kolmea");
lisaa(4, "neljä", "neljän", "neljällä", "neljää");
lisaa(5, "viisi", "viiden", "viidellä", "viittä", "viidessä");
lisaa(6, "kuusi", "kuuden", "kuudella", "kuutta", "kuudessa");
lisaa(7, "seitsemän", "seitsemällä", "seitsemää", "seitsemässä");
lisaa(8, "kahdeksan", "kahdeksalla", "kahdeksaa", "kahdeksassa");
lisaa(9, "yhdeksän", "yhdeksällä", "yhdeksää", "yhdeksässä");
lisaa(10, "kymmenen", "kymmenellä", "kymmentä", "kymmenessä");
lisaa(12, "kaksitoista", "kahdentoista", "kahdellatoista", "kahtatoista");
lisaa(15, "viisitoista", "viidentoista", "viidellätoista", "viittätoista");
lisaa(20, "kaksikymmentä", "kahdenkymmenen", "kahdellakymmenellä");

const SANA = Object.keys(SANAT).sort((a, b) => b.length - a.length).join("|");
// Luku + kysymys-sana tai lyhenne "kys.". Vaihteluväli ("5–10 kysymystä") ohitetaan: se ei väitä yhtä määrää.
const MAARA = new RegExp(`(?<![\\d–-]\\s?)(?<![\\p{L}])(\\d{1,3}|${SANA})(?![\\p{L}])\\s*(?:-\\s*)?(?:kysym\\p{L}*|kys\\.)`, "giu");

/** Tekstissä mainitut kysymysmäärät, esim. "Viisi kysymystä Keke Rosbergista" → [5]. */
export function mainitutMaarat(teksti: string | null | undefined): number[] {
  if (!teksti) return [];
  const out: number[] = [];
  for (const m of teksti.matchAll(MAARA)) {
    const t = m[1].toLowerCase();
    const n = /^\d+$/.test(t) ? Number(t) : SANAT[t];
    if (n) out.push(n);
  }
  return out;
}

const KENTAT = ["title", "display_title", "teaser", "description", "seo_title", "seo_description"] as const;
type Visa = { id: string; slug: string; collection: string | null } & Partial<Record<(typeof KENTAT)[number], string | null>>;

/** Hakee kaikki rivit sivuttain (PostgREST palauttaa enintään 1000 kerralla). */
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

async function main() {
  // Itsetesti: tunnistus ja ohitukset.
  const testit: Array<[string, number[]]> = [
    ["Viisi kysymystä Keke Rosbergin urasta", [5]],
    ["Testaa itsesi 10 kysymyksen visassa.", [10]],
    ["Jalkapalloilija · 5 kys.", [5]],
    ["Kymmenen kysymystä Lenita Airiston elämästä", [10]],
    ["Visoissa on 5–10 kysymystä.", []],
    ["Vuonna 1985 syntynyt kysyy", []],
    ["Kuudessa kysymyksessä", [6]],
  ];
  let itsetesti = 0;
  for (const [s, odotus] of testit) {
    const saatu = mainitutMaarat(s);
    if (JSON.stringify(saatu) !== JSON.stringify(odotus)) {
      itsetesti++;
      console.log(`ITSETESTI: "${s}" → ${JSON.stringify(saatu)}, odotettiin ${JSON.stringify(odotus)}`);
    }
  }
  if (itsetesti) process.exit(2);

  const [kortit, visat, sivut] = await Promise.all([
    kaikki<{ id: string; question_count: number | null }>((a, b) => sb.from("quiz_cards").select("id, question_count").range(a, b)),
    kaikki<Visa>((a, b) => sb.from("quizzes").select(`id, slug, collection, ${KENTAT.join(", ")}`).eq("status", "published").range(a, b)),
    kaikki<{ slug: string; seo_title: string | null; seo_description: string | null }>((a, b) =>
      sb.from("page_content").select("slug, seo_title, seo_description").range(a, b)),
  ]);
  const maara = new Map(kortit.map((k) => [k.id, k.question_count ?? 0]));

  const virheet: string[] = [];
  const kokoelmanMaarat = new Map<string, Set<number>>();
  for (const v of visat) {
    const n = maara.get(v.id);
    // Ei sivustolla (toisen sivuston visa) tai megavisa: megan kysymykset kootaan muista visoista, joten
    // quiz_cards.question_count on 0 eikä kerro megan pituutta. Megojen määrät tarkistetaan megasivulta.
    if (!n) continue;
    if (v.collection) {
      const s = kokoelmanMaarat.get(v.collection) ?? new Set<number>();
      s.add(n);
      kokoelmanMaarat.set(v.collection, s);
    }
    for (const kentta of KENTAT) {
      for (const m of mainitutMaarat(v[kentta])) {
        if (m !== n) virheet.push(`visa ${v.slug} · ${kentta}: tekstissä ${m}, visassa ${n} — "${v[kentta]}"`);
      }
    }
  }

  // Kokoelman SEO-teksti saa mainita luvun vain, jos jokaisessa kokoelman visassa on juuri niin monta kysymystä.
  for (const p of sivut) {
    const maarat = kokoelmanMaarat.get(p.slug);
    for (const kentta of ["seo_title", "seo_description"] as const) {
      for (const m of mainitutMaarat(p[kentta])) {
        if (!maarat) continue; // pelimuotosivu tai kokoelma ilman tavallisia visoja: ei verrattavaa
        if (maarat.size !== 1 || !maarat.has(m)) {
          const kuvaus = [...maarat].sort((a, b) => a - b).join(", ");
          virheet.push(`kokoelmasivu ${p.slug} · ${kentta}: tekstissä ${m}, kokoelman visoissa ${kuvaus} — "${p[kentta]}"`);
        }
      }
    }
  }

  console.log(`Tarkistettu ${visat.length} julkaistua visaa ja ${sivut.length} kokoelma-/pelimuotosivua.`);
  if (virheet.length) {
    console.log(`\n${virheet.length} RISTIRIITAA:\n  ${virheet.join("\n  ")}`);
    process.exit(1);
  }
  console.log("Kaikki tekstien kysymysmäärät vastaavat visoja.");
}

main();
