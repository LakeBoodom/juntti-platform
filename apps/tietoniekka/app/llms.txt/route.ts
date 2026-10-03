import { getSiteStats, yliVisaa } from "@/lib/siteStats";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/**
 * /llms.txt — emerging standard (https://llmstxt.org) jota AI-crawlerit
 * lukevat ymmärtääkseen sivuston rakenteen ja keskeisen sisällön ytimekkäästi.
 * Päivitetty 2.0-rakenteeseen julkaisussa 31.8.2026: kokoelmat korvasivat
 * kategoriat, sankarisivut poistuivat, visasivut ovat /visa/<slug>.
 */
/* SEO-erä A8 (2.10.2026): luvut kannasta (lib/siteStats.ts), tunti välimuistissa. Lisätty
   pelimuodot, Tiede ja Juhlat; poistettu väite "pääosin 10-kysymyksisiä" (henkilövisoissa 5). */
export const revalidate = 3600;

const COLLECTIONS: Array<[string, string, string]> = [
  ["urheilu", "Urheilu", "Urheiluvisat lajien poikki"],
  ["jaakiekko", "Jääkiekko", "Liiga, Leijonat ja NHL"],
  ["jalkapallo", "Jalkapallo", "Valioliiga, Euroopan suurseurat ja Mestarien liiga"],
  ["elokuvat", "Elokuvat", "Kotimaiset ja kansainväliset elokuvat"],
  ["tv", "TV & suoratoisto", "TV-sarjat kotimaasta ja maailmalta"],
  ["musiikki", "Musiikki", "Suomipop, iskelmä ja kansainväliset artistit"],
  ["historia", "Historia", "Suomen ja maailman historia"],
  ["luonto", "Luonto", "Eläimet, kasvit ja luonnonilmiöt"],
  ["matkakohteet", "Maantieto", "Maat, kaupungit ja nähtävyydet"],
  ["kulttuuri", "Kulttuuri", "Taide, kirjallisuus ja design"],
  ["kaupungit", "Suomen kaupungit", "Kaupunkivisat ympäri Suomen"],
  ["tunnetut-henkilot", "Tunnetut henkilöt", "Visa jokaisesta henkilöstä: urheilijat, muusikot, näyttelijät, poliitikot"],
  ["tiede", "Tiede & teknologia", "Keho, avaruus, keksinnöt ja tiedemyytit"],
  ["juhlat", "Juhlat", "Vuoden juhlat ja perinteet: joulu, vappu, juhannus, halloween"],
  ["kuvavisat", "Kuvavisat", "Tunnista kuvasta: liput, vaakunat, linnut, kasvit, eläimet, maalaukset, rakennukset"],
];

const PELIMUODOT: Array<[string, string, string]> = [
  ["/peli/tupla-tai-kuitti", "Tupla tai kuitti", "Kymmenen yhä vaikeampaa kysymystä; jokainen oikea vastaus tuplaa potin"],
  ["/peli/kuntaliitos", "Kuntaliitos", "Järjestä kahdeksan kuntaa reitiksi naapurikuntien kautta; uusi reitti joka päivä"],
  ["/peli/rajanaapurit", "Rajanaapurit", "Sama reittipeli valtioilla ja maarajoilla"],
  ["/peli/ikajarjestys", "Tietoketju: Ikäjärjestys", "Aseta kymmenen tunnettua suomalaista syntymävuoden mukaan"],
  ["/kuvavisa/viikko", "Viikkovisa", "Viikoittain vaihtuva kuvavisa, sama kaikille koko viikon"],
  ["/megavisat", "Megavisat", "Pitkät visat yhteen istuntoon"],
];

export async function GET() {
  const stats = await getSiteStats();
  const yli = yliVisaa(stats);
  const lines: string[] = [];

  lines.push("# Tietoniekka.fi");
  lines.push("");
  lines.push(
    `> Suomalainen tietovisasivusto. ${yli} ja yli ${Math.floor(stats.questions / 1000) * 1000} kysymystä selityksineen: Päivän visa, ${stats.collections} kokoelmaa, pelimuodot, megavisat ja kuvavisat. Aina ilmainen, ei rekisteröitymistä, ei mainoksia.`,
  );
  lines.push("");
  lines.push("## Pääsivut");
  lines.push("");
  lines.push(`- [Etusivu](${SITE_URL}/): Päivän visa, Päivän sankari ja kokoelmien nostot.`);
  lines.push(`- [Kokoelmat](${SITE_URL}/kokoelmat): Kaikki kokoelmat yhdellä sivulla.`);
  lines.push(`- [Kuvien lähteet](${SITE_URL}/kuvien-lahteet): Vapaasti lisensoitujen kuvien tekijät ja lisenssit.`);
  lines.push(`- [Tietosuoja](${SITE_URL}/tietosuoja): Tietosuojaseloste. Tietoniekka ei kerää henkilötietoja.`);
  lines.push("");
  lines.push("## Kokoelmat");
  lines.push("");
  for (const [slug, title, desc] of COLLECTIONS) {
    lines.push(`- [${title}](${SITE_URL}/kokoelma/${slug}): ${desc}.`);
  }
  lines.push("");
  lines.push("## Pelimuodot");
  lines.push("");
  for (const [polku, title, desc] of PELIMUODOT) {
    lines.push(`- [${title}](${SITE_URL}${polku}): ${desc}.`);
  }
  lines.push("");
  lines.push("## Visat");
  lines.push("");
  lines.push(
    `Sivustolla on ${stats.quizzes} julkaistua tietovisaa osoitteissa /visa/<slug>. Visat ovat monivalintatehtäviä: neljä vaihtoehtoa ja yksi oikea vastaus, ja jokaisen kysymyksen jälkeen näytetään selitys. Aihevisoissa on yleensä 10 kysymystä, henkilövisoissa 5. Megavisoissa kysymyksiä on enemmän.`,
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
