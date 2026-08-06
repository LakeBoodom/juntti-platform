// TIETONIEKKA 2.0 — HISTORIA: aikajana-hub (CD "Tietoniekka - Historia", 6.8.2026)
// Seitsemän aikakautta pystyaikajanalla + läpileikkaavat teemat + läpileikkausvisa.
// Aikakausi = quizzes.subcollection (backfill 6.8.2026); aikakausien metatiedot
// (vuodet, otsikko, kuvaus) ovat koodissa. "Pelattu"-merkinnät tulevat clientillä
// localStoragesta (tn_played_quizzes) — ei kirjautumista, kuten Putkikin.
// Staattinen segmentti ohittaa dynaamisen [collection]-reitin.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import HistoriaClient, { type HistoriaData, type HistoriaCard } from "./HistoriaClient";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("historia");
  const title = pc?.seo_title ?? "Suomen historia — aikajana ja tietovisat";
  const description =
    pc?.seo_description ??
    "Kivikaudesta nykypäivään. Jokainen aikakausi on oma visansa — pelaa järjestyksessä tai poimi jakso, joka kiinnostaa.";
  const canonical = `${SITE_URL}/2-0/kokoelma/historia`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

/* Aikakaudet CD:n designin mukaan — järjestys on aikajanan järjestys. */
const ERAS = [
  { key: "esihistoria", years: "n. 9000 eaa. – 1100-luku", short: "Esihistoria", title: "Suomi ennen Suomea", desc: "Jääkauden vetäydyttyä ensimmäiset asukkaat saapuivat nykyisen Suomen alueelle noin 9000 eaa. Kivikaudesta rautakauteen ulottuva jakso päättyy vähitellen, kun kristinusko ja ruotsalainen vaikutus saapuvat lännestä." },
  { key: "ruotsin-aika", years: "1100-luku – 1809", short: "Ruotsin aika", title: "Kun Suomi oli osa Ruotsia", desc: "Suomi kuului Ruotsin valtakuntaan noin kuudensadan vuoden ajan. Ruotsin laki, hallinto, uskonpuhdistus ja kirkko muovasivat suomalaisen yhteiskunnan perustan." },
  { key: "autonomia", years: "1809–1917", short: "Autonomia", title: "Suuriruhtinaskunnan vuosisata", desc: "Haminan rauha siirsi Suomen Venäjän keisarikunnan yhteyteen. Autonomian aikana syntyivät oma raha, rautatiet, Kalevala ja kansallinen herääminen." },
  { key: "itsenaisyys", years: "1917–1918", short: "Itsenäisyys", title: "Itsenäinen Suomi syntyy", desc: "Venäjän vallankumous mursi keisarivallan, ja eduskunta hyväksyi itsenäisyysjulistuksen 6. joulukuuta 1917. Seuraavana keväänä sisällissota jakoi juuri itsenäistyneen maan." },
  { key: "sodat", years: "1939–1945", short: "Sodat", title: "Sotien Suomi", desc: "Talvisota alkoi 30. marraskuuta 1939 ja kesti 105 päivää. Jatkosota käytiin 1941–1944, ja Lapin sota päätti sotavuodet keväällä 1945." },
  { key: "jalleenrakennus", years: "1945–1960-luku", short: "Jälleenrak.", title: "Jälleenrakennuksen Suomi", desc: "Sotakorvaukset maksettiin, yli 400 000 evakkoa asutettiin ja rintamamiestaloja nousi ympäri maata. Samalla Suomi teollistui ja siirtyi kohti modernia." },
  { key: "nykyaika", years: "1952–2000-luku", short: "Nykyaika", title: "Suomi maailmalle", desc: "Helsingin olympialaiset 1952 avasivat maan maailmalle. Kaupungistuminen, hyvinvointivaltio, Nokian nousu ja EU-jäsenyys 1995 tekivät Suomesta sen, joka se tänään on." },
];

/* Läpileikkaavien teemojen vuosileimat (CD) — muut saavat neutraalin leiman. */
const THEME_TAG: Record<string, string> = {
  "suomen-presidentit-visa": "1919–",
  "mannerheim-visa": "1867–1951",
  "suomen-kolme-legendaarista-linnaa": "1200–1700-luku",
  "suomenlinna-visa": "1748–",
  "naiset-suomen-historian-tekijoina": "Kautta historian",
  "suomi-ennen-vanhaan-arjen-historia": "Arjen historia",
};

type Row = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; teaser: string | null;
  subcollection: string | null; question_count: number;
};

export default async function HistoriaPage() {
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, subcollection, question_count")
      .eq("collection", "historia")
      .order("published_at", { ascending: true }),
    getPageContent("historia"),
  ]);
  const rows = (cardsRes.data ?? []) as unknown as Row[];

  const toCard = (r: Row): HistoriaCard => ({
    id: r.id,
    title: r.display_title ?? r.title,
    questions: r.question_count,
    href: r.custom_slug || r.slug ? `/2-0/peli?visa=${r.custom_slug ?? r.slug}` : `/2-0/peli?quiz_id=${r.id}`,
    tag: r.slug ? THEME_TAG[r.slug] : undefined,
  });

  const data: HistoriaData = {
    eras: ERAS.map((e) => ({
      ...e,
      quizzes: rows.filter((r) => r.subcollection === e.key).map(toCard),
    })),
    themes: rows.filter((r) => r.subcollection === "teema").map(toCard),
    lapileikkaus: rows.filter((r) => r.subcollection === "lapileikkaus").map(toCard)[0] ?? null,
  };

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Suomen historia" accent="#E8A320" />
  ) : null;

  return (
    <>
      <HistoriaClient data={data} />
      {article}
    </>
  );
}
