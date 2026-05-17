import { CATEGORIES } from "@/lib/categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/**
 * /llms.txt — emerging standard (https://llmstxt.org) jota AI-crawlerit
 * lukevat ymmärtääkseen sivuston rakenteen ja keskeisen sisällön ytimekkäästi.
 *
 * Sisältö:
 * - Sivuston tarkoitus 1–2 lauseena
 * - Linkit keskeisimpiin sivuihin (etusivu, kategoriat, tietosuoja)
 * - Ohjeita siitä, mitä materiaalia on saatavilla
 */
export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [];

  lines.push("# Tietoniekka.fi");
  lines.push("");
  lines.push(
    "> Suomalainen tietovisa-sivusto. Päivittäin vaihtuva visa, yli 9 kategoriaa, päivän sankari -profiilit. Aina ilmainen, ei rekisteröitymistä, ei mainoksia.",
  );
  lines.push("");
  lines.push("## Pääsivut");
  lines.push("");
  lines.push(`- [Etusivu](${SITE_URL}/): Päivän visa, kategoriavalikoima ja päivän sankari.`);
  lines.push(`- [Tietosuoja](${SITE_URL}/tietosuoja): Tietosuojaseloste. Tietoniekka ei kerää henkilötietoja.`);
  lines.push("");
  lines.push("## Visa-kategoriat");
  lines.push("");
  for (const c of CATEGORIES) {
    lines.push(`- [${c.title}](${SITE_URL}/kategoria/${c.slug}): ${c.description}.`);
  }
  lines.push("");
  lines.push("## Visat");
  lines.push("");
  lines.push(
    "Sivustolla on yli 500 julkaistua tietovisaa. Visat ovat 10-kysymyksisiä monivalintatehtäviä. Jokaisessa kysymyksessä on neljä vaihtoehtoa ja yksi oikea vastaus.",
  );
  lines.push("");
  lines.push("## Aineiston käyttö");
  lines.push("");
  lines.push(
    "Visasivut, kategoriasivut ja päivän sankari -sivut ovat vapaasti indeksoitavissa ja AI-crawlereiden luettavissa. Sisältö on suomenkielistä.",
  );
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
