/**
 * scrape-wikipedia-birthdays.ts
 *
 * Hakee kaikki 365 päivää fi.wikipedia.orgista, suodattaa suomalaiset
 * julkkikset ja tallentaa heidät Supabaseen (platform='synttarit').
 *
 * Käyttö:
 *   npx tsx scripts/scrape-wikipedia-birthdays.ts
 *
 * Vaatii ympäristömuuttujat:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Asenna tarvittaessa:
 *   npm install @supabase/supabase-js tsx --save-dev
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pkfsdzqwfxqczirjddue.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SITE_ID = "e7a1b323-20ca-46b9-af4c-15b7e8de96e1"; // synttarit

const DELAY_MS = 800; // kohteliaisuusviive Wikipedialle
const DRY_RUN = process.argv.includes("--dry-run");

// ─── Finnish months (Wikipedia URL format) ────────────────────────────────────

const MONTHS_FI = [
  "tammikuuta",   // 1
  "helmikuuta",   // 2
  "maaliskuuta",  // 3
  "huhtikuuta",   // 4
  "toukokuuta",   // 5
  "kesäkuuta",    // 6
  "heinäkuuta",   // 7
  "elokuuta",     // 8
  "syyskuuta",    // 9
  "lokakuuta",    // 10
  "marraskuuta",  // 11
  "joulukuuta",   // 12
];

// Days per month (non-leap year — Feb 29 skipped)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ─── Finnish-ness keywords ────────────────────────────────────────────────────

const FINNISH_KEYWORDS = [
  "suomalainen",
  "suomalais",
  "Suomen",
  "suomenruotsalainen",
  "helsinkiläinen",
  "tamperelainen",
  "turkulainen",
  "oululainen",
];

// Keywords to map rough role categories
const ROLE_MAP: [RegExp, string][] = [
  [/jalkapalloilij/i, "Jalkapalloilija"],
  [/jääkiekkoilij/i, "Jääkiekkoilija"],
  [/urheilij/i, "Urheilija"],
  [/laulaj/i, "Laulaja"],
  [/muusikko|muusik/i, "Muusikko"],
  [/näyttelijä/i, "Näyttelijä"],
  [/ohjaaj/i, "Ohjaaja"],
  [/kirjailij/i, "Kirjailija"],
  [/toimittaj/i, "Toimittaja"],
  [/poliitikko|politiikk|kansanedustaj|presidentti|pääministeri/i, "Poliitikko"],
  [/yrittäj|liikemies|toimitusjohtaj/i, "Yrittäjä"],
  [/taiteilij|kuvataiteilij/i, "Taiteilija"],
  [/tuottaj/i, "Tuottaja"],
  [/koomikko|humoristi/i, "Koomikko"],
  [/juontaj/i, "Juontaja"],
  [/radio|tv/i, "Mediapersoona"],
];

function guessRole(description: string): string {
  for (const [regex, role] of ROLE_MAP) {
    if (regex.test(description)) return role;
  }
  return "Julkisuuden henkilö";
}

// ─── Wikipedia parsing helpers ────────────────────────────────────────────────

interface ParsedPerson {
  name: string;
  birthYear: number;
  deathYear: number | null;
  description: string;
  role: string;
  wikiSlug: string;
}

/**
 * Fetch the Wikipedia page for a given day and extract Finnish-born people.
 * Wikipedia day pages look like:
 *   https://fi.wikipedia.org/wiki/1._tammikuuta
 *
 * The "Syntyneitä" section lists entries like:
 *   * 1955 – [[Pekka Haavisto]], suomalainen poliitikko
 *   * 1955 – [[John Doe]], yhdysvaltalainen näyttelijä (k. 2010)
 */
async function fetchDayBirthdays(
  month: number,
  day: number
): Promise<ParsedPerson[]> {
  const monthName = MONTHS_FI[month - 1];
  const url = `https://fi.wikipedia.org/w/api.php?action=parse&page=${day}._${monthName}&prop=wikitext&format=json&formatversion=2`;

  let wikitext: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "synttarit.com-bot/1.0 (heikki@synttarit.com)" },
    });
    if (!res.ok) {
      console.warn(`  ⚠ ${day}.${month}: HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { parse?: { wikitext: string }; error?: { info: string } };
    if (json.error) {
      console.warn(`  ⚠ ${day}.${month}: ${json.error.info}`);
      return [];
    }
    wikitext = json.parse?.wikitext ?? "";
  } catch (e) {
    console.warn(`  ⚠ ${day}.${month}: fetch error`, e);
    return [];
  }

  // Find the "Syntyneitä" section
  const sections = wikitext.split(/^==\s*/m);
  const birthSection = sections.find((s) => s.startsWith("Syntyneitä"));
  if (!birthSection) return [];

  const people: ParsedPerson[] = [];
  const lines = birthSection.split("\n");

  for (const line of lines) {
    // Match: * 1955 – [[Name|Display]] , description (k. YYYY)
    const match = line.match(
      /^\*\s*(\d{1,4})\s*[–-]\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*[,.]?\s*(.+?)(?:\s*\(k\.\s*(\d{4})\))?\s*$/
    );
    if (!match) continue;

    const [, yearStr, wikiTarget, displayName, rawDesc, deathYearStr] = match;
    const birthYear = parseInt(yearStr, 10);
    if (birthYear < 1900) continue; // skip historical figures

    const description = rawDesc?.trim() ?? "";

    // Must contain a Finnish keyword
    const isFinnish = FINNISH_KEYWORDS.some((kw) =>
      description.toLowerCase().includes(kw.toLowerCase())
    );
    if (!isFinnish) continue;

    const name = (displayName ?? wikiTarget).trim();
    const wikiSlug = wikiTarget.trim().replace(/ /g, "_");
    const deathYear = deathYearStr ? parseInt(deathYearStr, 10) : null;
    const role = guessRole(description);

    people.push({ name, birthYear, deathYear, description, role, wikiSlug });
  }

  return people;
}

// ─── Wikipedia image fetcher ──────────────────────────────────────────────────

async function fetchWikipediaImage(
  wikiSlug: string
): Promise<{ imageUrl: string | null; bioShort: string | null; wikiUrl: string }> {
  const wikiUrl = `https://fi.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`;

  try {
    const url = `https://fi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      wikiSlug.replace(/_/g, " ")
    )}&prop=pageimages|extracts&pithumbsize=400&exsentences=2&exintro=true&explaintext=true&format=json&formatversion=2`;

    const res = await fetch(url, {
      headers: { "User-Agent": "synttarit.com-bot/1.0 (heikki@synttarit.com)" },
    });
    if (!res.ok) return { imageUrl: null, bioShort: null, wikiUrl };

    const json = (await res.json()) as {
      query?: {
        pages?: Array<{
          thumbnail?: { source: string };
          extract?: string;
          missing?: boolean;
        }>;
      };
    };

    const page = json.query?.pages?.[0];
    if (!page || page.missing) return { imageUrl: null, bioShort: null, wikiUrl };

    const imageUrl = page.thumbnail?.source ?? null;
    const bioShort = page.extract
      ? page.extract.split("\n")[0].slice(0, 280) || null
      : null;

    return { imageUrl, bioShort, wikiUrl };
  } catch {
    return { imageUrl: null, bioShort: null, wikiUrl };
  }
}

// ─── Supabase upsert ──────────────────────────────────────────────────────────

interface CelebrityRow {
  name: string;
  birth_date: string; // YYYY-MM-DD
  death_date: string | null;
  role: string;
  bio_short: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  slug: string;
  platform: string;
  site_id: string;
  priority: number;
  is_hero: boolean;
}

function makeSlug(name: string, birthYear: number): string {
  return name
    .toLowerCase()
    .replace(/[äå]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + `-${birthYear}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY puuttuu ympäristömuuttujista.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log(
    `🎂 Synttärit Wikipedia -scraper — ${DRY_RUN ? "DRY RUN" : "LIVE"}`
  );
  console.log(`   Haetaan syntymäpäivätietoja fi.wikipedia.orgista...\n`);

  let totalFound = 0;
  let totalSaved = 0;
  let totalSkipped = 0;

  for (let month = 1; month <= 12; month++) {
    const daysInThisMonth = DAYS_IN_MONTH[month - 1];

    for (let day = 1; day <= daysInThisMonth; day++) {
      const dateLabel = `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}`;
      process.stdout.write(`${dateLabel} ... `);

      const people = await fetchDayBirthdays(month, day);
      process.stdout.write(`${people.length} suomalaista`);

      if (people.length === 0) {
        process.stdout.write("\n");
        await sleep(DELAY_MS);
        continue;
      }

      totalFound += people.length;

      for (const person of people) {
        // Fetch image + bio from Wikipedia
        await sleep(200);
        const { imageUrl, bioShort, wikiUrl } = await fetchWikipediaImage(
          person.wikiSlug
        );

        // Construct birth_date (use 1900-01-01 as placeholder year base)
        const birthDateStr = `${person.birthYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const deathDateStr = person.deathYear
          ? `${person.deathYear}-01-01` // approximate
          : null;

        const slug = makeSlug(person.name, person.birthYear);

        const row: CelebrityRow = {
          name: person.name,
          birth_date: birthDateStr,
          death_date: deathDateStr,
          role: person.role,
          bio_short: bioShort ?? person.description.slice(0, 280),
          image_url: imageUrl,
          wikipedia_url: wikiUrl,
          slug,
          platform: "synttarit",
          site_id: SITE_ID,
          priority: 5,
          is_hero: false,
        };

        if (DRY_RUN) {
          console.log(`   [DRY] ${person.name} (${person.birthYear}) — ${person.role}`);
          totalSaved++;
          continue;
        }

        // Upsert by slug (idempotent re-runs)
        const { error } = await supabase
          .from("celebrities")
          .upsert(row, { onConflict: "slug", ignoreDuplicates: false });

        if (error) {
          console.error(
            `\n  #❌ ${person.name}: ${error.message}`
          );
          totalSkipped++;
        } else {
          totalSaved++;
        }
      }

      process.stdout.write(` → tallennettu ${people.length}\n`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ Valmis!`);
  console.log(`   Löydettiin: ${totalFound} suomalaista`);
  console.log(`   Tallennettu: ${totalSaved}`);
  if (totalSkipped > 0) console.log(`   Ohitettu virheellä: ${totalSkipped}`);
  console.log(
    `\n💡 Seuraava askel: Mene admin.juntti.fi/synttarit ja aseta priority/hero-status haluamillesi julkkiksille.`
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((e) => {
  console.error("Kriittinen virhe:", e);
  process.exit(1);
});
