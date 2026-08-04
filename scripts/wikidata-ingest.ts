/**
 * wikidata-ingest.ts
 *
 * Hakee rakenteista dataa Wikidatasta faktapankkiin (fact_entities /
 * fact_attributes).
 *
 * Käyttö:
 *   npx tsx scripts/wikidata-ingest.ts                 # kuivaharjoitus, ei kirjoita
 *   npx tsx scripts/wikidata-ingest.ts jarvet          # vain yksi aineisto
 *   npx tsx scripts/wikidata-ingest.ts jarvet --apply  # kirjoittaa kantaan
 *
 * Vaatii:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * ─── Miksi tämä ei tuo kaikkea mitä löytyy ──────────────────────────────────
 *
 * Hyvä kysymys asettuu kahden reunan väliin: sen jota kaikki tietävät ja sen
 * jota kukaan ei voi tietää. Kumpi-pelissä on jo koneisto ylärajalle —
 * max_gap hylkää itsestään selvät parit. Alarajalle ei ollut mitään, ja se
 * näkyi heti kun aineistoa alettiin kasvattaa: Suomen 56. suurin järvi on
 * kysymyksenä yhtä huono kuin "kummassa on enemmän asukkaita, Suomessa vai
 * Yhdysvalloissa" — vain toisesta päästä.
 *
 * Siksi jokainen aineisto rajataan tunnettuuden mukaan:
 *
 *   1. Kohteella on oltava suomenkielinen nimi Wikidatassa. Jos suomeksi ei
 *      ole kirjoitettu riviäkään, suomalainen pelaaja tuskin tuntee kohdetta.
 *   2. Järjestys on kielilinkkien määrä (montako Wikipediaa on kirjoittanut
 *      kohteesta). Karkea mittari, mutta se mittaa juuri oikeaa asiaa:
 *      kuinka moni on pitänyt kohdetta merkittävänä.
 *   3. Mukaan otetaan vain top N. Ei "kaikki mitä löytyy".
 *
 * Tavoite ei ole suuri pankki vaan pankki jossa jokainen kohde on sellainen
 * että pelaaja voi kuvitella tuntevansa sen.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://pkfsdzqwfxqczirjddue.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const APPLY = process.argv.includes("--apply");
const WANTED = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const SPARQL = "https://query.wikidata.org/sparql";
const UA = "TietoniekkaBot/1.0 (https://tietoniekka.fi; data ingest)";

/* ─── Aineistot ──────────────────────────────────────────────────────────────
   Jokainen aineisto on yksi SPARQL-kysely ja yksi attribuutti. `limit` on
   tunnettuusraja: montako tunnetuinta otetaan mukaan.

   HUOM: skripti EI luo attribuuttimäärityksiä (fact_attribute_defs). Ne
   sisältävät kysymystekstit, eikä suomea voi koota säännöillä — ne
   kirjoitetaan käsin. Skripti kertoo jos määritys puuttuu.                */

type Dataset = {
  key: string;
  kind: string;
  domain: string;
  attrKey: string;
  limit: number;
  /** Yksikkö näyttöarvossa. */
  unit: string;
  /** Jakaja: Wikidatan normalisoitu arvo on SI-yksikössä (m, m²). */
  divisor: number;
  decimals: number;
  sparql: string;
};

/** Suomalainen kohde, jolla on suomenkielinen nimi ja mitattava arvo. */
const suomalainen = (luokka: string, ominaisuus: string) => `
SELECT ?item ?nimi ?arvo ?linkit WHERE {
  ?item wdt:P31/wdt:P279* wd:${luokka} ;
        wdt:P17 wd:Q33 ;
        wikibase:sitelinks ?linkit .
  ?item p:${ominaisuus}/psn:${ominaisuus}/wikibase:quantityAmount ?arvo .
  ?item rdfs:label ?nimi . FILTER(LANG(?nimi) = "fi")
}
ORDER BY DESC(?linkit)
LIMIT 60`;

/** Maailmanlaajuinen kohde — sama tunnettuusrajaus, ei maarajausta. */
const maailmalta = (luokka: string, ominaisuus: string) => `
SELECT ?item ?nimi ?arvo ?linkit WHERE {
  ?item wdt:P31/wdt:P279* wd:${luokka} ;
        wikibase:sitelinks ?linkit .
  ?item p:${ominaisuus}/psn:${ominaisuus}/wikibase:quantityAmount ?arvo .
  ?item rdfs:label ?nimi . FILTER(LANG(?nimi) = "fi")
}
ORDER BY DESC(?linkit)
LIMIT 60`;

const DATASETS: Dataset[] = [
  {
    key: "jarvet",
    kind: "lake",
    domain: "lake",
    attrKey: "area_km2",
    limit: 20,
    unit: "km²",
    divisor: 1_000_000, // m² -> km²
    decimals: 0,
    sparql: suomalainen("Q23397", "P2046"), // järvi, pinta-ala
  },
  {
    key: "joet",
    kind: "river",
    domain: "river",
    attrKey: "river_length",
    limit: 20,
    unit: "km",
    divisor: 1000, // m -> km
    decimals: 0,
    sparql: suomalainen("Q4022", "P2043"), // joki, pituus
  },
  {
    key: "saaret",
    kind: "island",
    domain: "island",
    attrKey: "island_area",
    limit: 15,
    unit: "km²",
    divisor: 1_000_000,
    decimals: 0,
    sparql: suomalainen("Q23442", "P2046"), // saari, pinta-ala
  },
  {
    key: "vuoret",
    kind: "mountain",
    domain: "mountain",
    attrKey: "mountain_height",
    limit: 20,
    unit: "m",
    divisor: 1,
    decimals: 0,
    sparql: maailmalta("Q8502", "P2044"), // vuori, korkeus merenpinnasta
  },
];

/* ─── Haku ───────────────────────────────────────────────────────────────── */

type Rivi = { qid: string; nimi: string; arvo: number; linkit: number };

async function haeWikidatasta(d: Dataset): Promise<Rivi[]> {
  const url = `${SPARQL}?query=${encodeURIComponent(d.sparql)}&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
  if (!res.ok) throw new Error(`Wikidata ${res.status} ${res.statusText}`);
  const json = await res.json();

  const rivit: Rivi[] = json.results.bindings.map((b: Record<string, { value: string }>) => ({
    qid: b.item.value.replace("http://www.wikidata.org/entity/", ""),
    nimi: b.nimi.value,
    arvo: Number(b.arvo.value) / d.divisor,
    linkit: Number(b.linkit.value),
  }));

  // Sama kohde voi palautua useasti jos sillä on monta arvoa. Otetaan suurin
  // linkkimäärä ja ensimmäinen arvo, ja pudotetaan duplikaatit.
  const uniikit = new Map<string, Rivi>();
  for (const r of rivit) if (!uniikit.has(r.qid)) uniikit.set(r.qid, r);

  return [...uniikit.values()]
    .sort((a, b) => b.linkit - a.linkit)
    .slice(0, d.limit);
}

/* ─── Kirjoitus ──────────────────────────────────────────────────────────── */

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

type Tulos = { uusi: string[]; linkitetty: string[]; ristiriita: string[]; ennallaan: string[] };

async function aja(d: Dataset): Promise<Tulos> {
  const rivit = await haeWikidatasta(d);
  const tulos: Tulos = { uusi: [], linkitetty: [], ristiriita: [], ennallaan: [] };

  const { data: maaritys } = await sb
    .from("fact_attribute_defs")
    .select("attr_key")
    .eq("attr_key", d.attrKey)
    .maybeSingle();
  if (!maaritys)
    console.log(
      `  ! attribuutille ${d.attrKey} ei ole määritystä — data menee kantaan mutta\n` +
        `    kysymyksiä ei synny ennen kuin määritys (kysymysteksti) on kirjoitettu`,
    );

  for (const r of rivit) {
    const pyoristetty = Number(r.arvo.toFixed(d.decimals));
    const naytto = `${pyoristetty.toLocaleString("fi-FI")} ${d.unit}`;

    // Etsitään ensin pysyvällä tunnisteella, sitten nimellä.
    const { data: qidOsuma } = await sb
      .from("fact_entities").select("id, name").eq("wikidata_id", r.qid).maybeSingle();
    const { data: nimiOsuma } = qidOsuma
      ? { data: null }
      : await sb
          .from("fact_entities").select("id, name")
          .eq("name", r.nimi).eq("kind", d.kind).maybeSingle();

    const olemassa = qidOsuma ?? nimiOsuma;

    if (!olemassa) {
      tulos.uusi.push(`${r.nimi} — ${naytto} (${r.linkit} kieltä, ${r.qid})`);
      if (APPLY) {
        const { data: ent } = await sb
          .from("fact_entities")
          .insert({
            name: r.nimi, kind: d.kind, domain: d.domain, status: "published",
            show_role: false, wikidata_id: r.qid, prominence: r.linkit,
          })
          .select("id").single();
        if (ent)
          await sb.from("fact_attributes").insert({
            entity_id: ent.id, attr_key: d.attrKey, num_value: pyoristetty,
            display_value: naytto, source: `https://www.wikidata.org/wiki/${r.qid}`,
            verified_at: new Date().toISOString().slice(0, 10), volatility: "stable",
          });
      }
      continue;
    }

    // Olemassa oleva: liitetään tunniste ja verrataan arvoa.
    const { data: attr } = await sb
      .from("fact_attributes").select("num_value")
      .eq("entity_id", olemassa.id).eq("attr_key", d.attrKey).maybeSingle();

    if (attr && attr.num_value !== null) {
      const vanha = Number(attr.num_value);
      const ero = Math.abs(vanha - pyoristetty) / Math.max(vanha, pyoristetty);
      if (ero > 0.02) {
        // Ei ylikirjoiteta: kannassa oleva arvo on varmennettu käsin, ja
        // Wikidata on löytämiskerros. Ristiriita raportoidaan ihmiselle.
        tulos.ristiriita.push(`${r.nimi}: kanta ${vanha} vs Wikidata ${pyoristetty} ${d.unit}`);
      } else {
        tulos.ennallaan.push(r.nimi);
      }
    } else {
      tulos.uusi.push(`${r.nimi} — ${naytto} (arvo puuttui, ${r.qid})`);
      if (APPLY)
        await sb.from("fact_attributes").insert({
          entity_id: olemassa.id, attr_key: d.attrKey, num_value: pyoristetty,
          display_value: naytto, source: `https://www.wikidata.org/wiki/${r.qid}`,
          verified_at: new Date().toISOString().slice(0, 10), volatility: "stable",
        });
    }

    tulos.linkitetty.push(`${olemassa.name} -> ${r.qid}`);
    if (APPLY)
      await sb.from("fact_entities")
        .update({ wikidata_id: r.qid, prominence: r.linkit })
        .eq("id", olemassa.id);
  }

  return tulos;
}

/* ─── Ajo ────────────────────────────────────────────────────────────────── */

async function main() {
  if (APPLY && !SUPABASE_SERVICE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY puuttuu — ei voi kirjoittaa.");
    process.exit(1);
  }
  const ajettavat = WANTED.length
    ? DATASETS.filter((d) => WANTED.includes(d.key))
    : DATASETS;
  if (!ajettavat.length) {
    console.error(`Tuntematon aineisto. Vaihtoehdot: ${DATASETS.map((d) => d.key).join(", ")}`);
    process.exit(1);
  }

  console.log(APPLY ? "KIRJOITUSAJO — muutokset menevät kantaan\n" : "KUIVAHARJOITUS — mitään ei kirjoiteta\n");

  for (const d of ajettavat) {
    console.log(`\n=== ${d.key} (${d.kind}, top ${d.limit} tunnettuuden mukaan) ===`);
    try {
      const t = await aja(d);
      if (t.uusi.length) {
        console.log(`\n  LISÄTÄÄN (${t.uusi.length}):`);
        t.uusi.forEach((x) => console.log(`    + ${x}`));
      }
      if (t.ristiriita.length) {
        console.log(`\n  RISTIRIITA — ei ylikirjoiteta, tarkista käsin (${t.ristiriita.length}):`);
        t.ristiriita.forEach((x) => console.log(`    ! ${x}`));
      }
      if (t.ennallaan.length) console.log(`\n  ennallaan: ${t.ennallaan.length} kohdetta`);
      if (t.linkitetty.length) console.log(`  tunniste liitetty: ${t.linkitetty.length}`);
    } catch (e) {
      console.error(`  VIRHE: ${(e as Error).message}`);
    }
  }

  console.log(
    APPLY
      ? "\nValmis."
      : "\nTämä oli kuivaharjoitus. Aja --apply kun lista näyttää oikealta.",
  );
}

main();
