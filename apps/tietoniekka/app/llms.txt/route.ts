const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/**
 * /llms.txt — emerging standard (https://llmstxt.org) jota AI-crawlerit
 * lukevat ymmärtääkseen sivuston rakenteen ja keskeisen sisällön ytimekkäästi.
 * Päivitetty 2.0-rakenteeseen julkaisussa 31.8.2026: kokoelmat korvasivat
 * kategoriat, sankarisivut poistuivat, visasivut ovat /visa/<slug>.
 */
export const dynamic = "force-static";

const COLLECTIONS: Array<[string, string, string]> = [
  ["urheilu", "Urheilu", "Urheiluvisat lajien poikki"],
  ["jaakiekko", "Jääkiekko", "SM-liiga, Leijonat ja NHL"],
  ["jalkapallo", "Jalkapallo", "Valioliiga, maajoukkueet ja arvokisat"],
  ["elokuvat", "Elokuvat", "Kotimaiset ja kansainväliset elokuvat"],
  ["tv", "TV", "TV-sarjat kotimaasta ja maailmalta"],
  ["musiikki", "Musiikki", "Suomipop, iskelmä ja kansainväliset artistit"],
  ["historia", "Historia", "Suomen ja maailman historia"],
  ["luonto", "Luonto", "Eläimet, kasvit ja luonnonilmiöt"],
  ["matkakohteet", "Matkakohteet", "Maat, kaupungit ja nähtävyydet"],
  ["kulttuuri", "Kulttuuri", "Taide, kirjallisuus ja design"],
  ["kaupungit", "Suomen kaupungit", "Kaupunkivisat ympäri Suomen"],
  ["tunnetut-henkilot", "Tunnetut henkilöt", "Julkkikset ja merkkihenkilöt"],
  ["kuvavisat", "Kuvavisat", "Tunnista kuvasta: liput, vaakunat, linnut, kasvit, eläimet"],
];

export async function GET() {
  const lines: string[] = [];

  lines.push("# Tietoniekka.fi");
  lines.push("");
  lines.push(
    "> Suomalainen tietovisasivusto. Yli 500 visaa: Päivän visa, kokoelmat, megavisat ja kuvavisat. Aina ilmainen, ei rekisteröitymistä, ei mainoksia.",
  );
  lines.push("");
  lines.push("## Pääsivut");
  lines.push("");
  lines.push(`- [Etusivu](${SITE_URL}/): Päivän visa ja kokoelmien nostot.`);
  lines.push(`- [Kokoelmat](${SITE_URL}/kokoelmat): Kaikki kokoelmat yhdellä sivulla.`);
  lines.push(`- [Megavisat](${SITE_URL}/megavisat): 20–50 kysymyksen pitkät visat.`);
  lines.push(`- [Tietosuoja](${SITE_URL}/tietosuoja): Tietosuojaseloste. Tietoniekka ei kerää henkilötietoja.`);
  lines.push("");
  lines.push("## Kokoelmat");
  lines.push("");
  for (const [slug, title, desc] of COLLECTIONS) {
    lines.push(`- [${title}](${SITE_URL}/kokoelma/${slug}): ${desc}.`);
  }
  lines.push("");
  lines.push("## Visat");
  lines.push("");
  lines.push(
    "Sivustolla on yli 500 julkaistua tietovisaa osoitteissa /visa/<slug>. Visat ovat pääosin 10-kysymyksisiä monivalintatehtäviä: neljä vaihtoehtoa ja yksi oikea vastaus. Megavisoissa on 20–50 kysymystä.",
  );
  lines.push("");
  lines.push("## Aineiston käyttö");
  lines.push("");
  lines.push(
    "Visasivut ja kokoelmasivut ovat vapaasti indeksoitavissa ja AI-crawlereiden luettavissa. Sisältö on suomenkielistä.",
  );
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
