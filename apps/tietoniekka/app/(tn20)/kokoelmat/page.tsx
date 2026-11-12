// KAIKKI KOKOELMAT /kokoelmat hub-rungolla (Heikki 12.11.2026, vaihe 2): hero ilman kuvaa (nimi + nykyinen yksi rivi),
// aiheet jaettuina riveinä (kuva, nimi, visamäärä kannasta) ja Pelimuodot omana osionaan samoina riveinä.
// Navigaation "Kaikki kokoelmat →" -kohde (CD:n navigaatiosääntö 17.8.2026: valikkolinkit vievät todellisille sivuille).
// Lista lib/nav.ts-kokoonpanosta (sama kuin valikoissa), luvut kannasta (getCounts), rivikuvat public/20/rivi/ (288 × 216).
import type { Metadata } from "next";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import HubRivit, { type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import { jakoMeta } from "@/lib/jakoMeta";
import { getCounts } from "@/lib/kokoelmaMaarat";
import { NAV_COLLECTIONS, NAV_MODES, navHref } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Kaikki kokoelmat – tietovisat aiheittain | Tietoniekka",
  description: "Valitse aihe: TV ja suoratoisto, urheilu, jääkiekko, jalkapallo, elokuvat, musiikki, maantieto, Suomen kaupungit, tunnetut henkilöt, kulttuuri, historia, luonto, tiede ja teknologia, juhlat sekä vaalit ja politiikka.",
  alternates: { canonical: "/kokoelmat" },
  ...jakoMeta({
    title: "Kaikki kokoelmat – tietovisat aiheittain",
    description: "Valitse aihe ja pelaa: urheilu, elokuvat, musiikki, historia, luonto, tunnetut henkilöt ja paljon muuta.",
    url: "/kokoelmat",
    kuva: "/og/sivu/kokoelmat",
  }),
};

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

/** Pelimuodon rivikuva (scripts/rivikuvat.py). Uusi pelimuoto ilman kuvaa saa kuvattoman rivin (nimi kuva-alueella). */
const PELIMUOTOKUVAT: Record<string, Pick<RiviKortti, "kuva" | "sovitus">> = {
  "/peli/tupla-tai-kuitti": { kuva: "/20/rivi/peli-tupla-logo.webp", sovitus: "logo" },
  "/peli/karttapelit": { kuva: "/20/rivi/peli-karttapelit.webp" },
  "/peli/mika-maa": { kuva: "/20/rivi/peli-mika-maa.webp" },
  "/peli/vaalipiiriketju": { kuva: "/20/rivi/peli-vaalipiiriketju.webp" },
  "/peli/jarjesta": { kuva: "/20/rivi/peli-jarjesta.webp" },
  "/megavisat": { kuva: "/20/rivi/peli-megavisat.webp" },
  "/kokoelma/kuvavisat": { kuva: "/20/rivi/peli-kuvavisat.webp" },
  "/aanivisa/suomen-linnut": { kuva: "/20/rivi/peli-aanivisat.webp" },
  "/visapaketit": { kuva: "/20/rivi/peli-visapaketit.webp" },
};

export default async function KokoelmatPage() {
  const counts = await getCounts();
  const aiheet: RiviKortti[] = NAV_COLLECTIONS.map((c) => {
    const n = counts[c.slug] ?? 0;
    return { href: navHref(c), kuva: `/20/rivi/kokoelma-${c.slug}.webp`, kuvaton: c.label, nimi: c.label, rivi: n > 0 ? `${n} visaa` : null };
  });
  const pelimuodot: RiviKortti[] = NAV_MODES.map((m) => ({
    href: m.href, kuva: PELIMUOTOKUVAT[m.href]?.kuva ?? null, sovitus: PELIMUOTOKUVAT[m.href]?.sovitus, kuvaton: m.label, nimi: m.label, rivi: m.desc,
  }));

  return (
    <PeliKehys iho="tumma">
      <KokoelmaLd avain="kokoelmat" nimi="Kaikki kokoelmat" polku="/kokoelmat" />
      <Crumbs items={[{ label: "Kokoelmat" }]} />
      <main>
        <div className="hub">
          <HubHero nimi="Kaikki kokoelmat" intro="Valitse aihe, josta tiedät eniten — tai se, josta haluat oppia lisää." />
          <HubRivit kortit={aiheet} nimi="Kokoelmat" eager={6} />
          <section className="hub-osio" aria-labelledby="hub-pelimuodot">
            <h2 className="hub-h2" id="hub-pelimuodot">Pelimuodot</h2>
            <HubRivit kortit={pelimuodot} nimi="Pelimuodot" eager={0} />
          </section>
        </div>
      </main>
    </PeliKehys>
  );
}
