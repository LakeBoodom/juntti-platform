// SUOMEN KAUPUNGIT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Sisältö ja ilme tulevat asetuksesta lib/kokoelmat/kaupungit.ts, visat osioihin quizzes.section_tags-tagista.
// Vanha sivukohtainen toteutus (CD 27.8.2026: kartta-pelilauta, matkapassi) poistettu.
// 8.11.2026 (Heikki): kaupunkivisan kortti vie kaupunkisivulle (/kaupunki/<slug>); otsikkona kaupungin nimi ja
// metarivinä visamäärä. Tunturien ja kaupunkisivuttomien visojen kortit vievät edelleen visaan. Heron
// suosituin-nappi pelaa yhä suoraan visaa. Pelattu-merkki (data-visa-id) seuraa kaupunkivisaa.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import { haeRunkoData, type RunkoData } from "@/lib/kokoelmat/data";
import type { RunkoVisa } from "@/lib/kokoelmat/tyypit";
import { KAUPUNGIT_KOKOELMA } from "@/lib/kokoelmat/kaupungit";
import { KAUPUNGIT_LISTA, haeKaupunkilista, kaupunkiHref, nayttaaJulkaisemattomat } from "@/lib/kaupunkisivu";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kaupungit");
  const title = pc?.seo_title ?? "Suomen kaupungit — matkusta halki Suomen tietovisoina";
  const description =
    pc?.seo_description ?? "Oma visa joka kaupungille Hangosta Lapin tuntureille. Kuinka hyvin tunnet Suomen kaupungit?";
  const canonical = `${SITE_URL}/kokoelma/kaupungit`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/kaupungit" }) };
}

type Kortti = { href: string; nimi: string; meta: string };

/** Kaupunkivisan kortit kaupunkisivun korteiksi (sama kuva ja paikka osiossa). */
function kaupunkikortit(d: RunkoData, kortit: Map<string, Kortti>): RunkoData {
  const vaihda = <T extends RunkoVisa>(v: T): T => {
    const k = kortit.get(v.id);
    return k ? { ...v, ...k } : v;
  };
  return { ...d, osiot: d.osiot.map((o) => ({ ...o, b: o.b && vaihda(o.b), kortit: o.kortit.map(vaihda) })) };
}

export default async function KaupungitLanding() {
  const [d0, kaupungit] = await Promise.all([haeRunkoData(KAUPUNGIT_KOKOELMA), haeKaupunkilista(nayttaaJulkaisemattomat())]);
  if (!d0) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;
  const kortit = new Map<string, Kortti>();
  for (const k of kaupungit) {
    if (!k.kaupunkivisa_quiz_id) continue;
    kortit.set(k.kaupunkivisa_quiz_id, {
      href: kaupunkiHref(k.slug),
      nimi: k.korttinimi?.trim() || k.nimi,
      meta: k.visoja === 1 ? "1 visa" : `${k.visoja} visaa`,
    });
  }
  const d = kaupunkikortit(d0, kortit);
  /* Kaupunkisivut (7.11.2026): linkki kaupunkilistaan samassa paikassa kuin Tunnetut henkilöt -sivun A–Ö-linkki. */
  const julkaistuja = kaupungit.filter((k) => k.julkaistu).length;
  const lista = julkaistuja ? (
    <div className="rk-haku">
      <div className="rk-haku-rivi">
        <a className="rk-haku-kaikki" href={KAUPUNGIT_LISTA}>Kaikki {julkaistuja} kaupunkisivua A–Ö →</a>
      </div>
    </div>
  ) : null;
  return <KokoelmaRunko d={d} v3Lisa={lista} />;
}
