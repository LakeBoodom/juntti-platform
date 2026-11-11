import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
// TIETONIEKKA 2.0 — KAIKKI KOKOELMAT -indeksi (navigaation "Kaikki kokoelmat →" -kohde).
// CD:n navigaatiosääntö (lukittu 17.8.2026): kaikki valikkolinkit vievät todellisille
// sivuille, eivät etusivun ankkureihin — tämä sivu on se todellinen sivu.
// Hub-malli 11.11.2026 (Heikki): etusivun Pelaa aiheittain- ja Valitse peli -ruudukot (lib/etusivu5.ts aiheTiilet, peliRyhmat;
// components/tn20/etusivu5/EtusivuV5.tsx Aiheet, Pelit). Visamäärät kannasta (quiz_cards) tiilen alla pienellä.
import Crumbs from "@/components/tn20/Crumbs";
import { getCounts } from "@/lib/kokoelmaMaarat";
import { getSiteStats } from "@/lib/siteStats";
import { helsinginPaiva } from "@/lib/aika";
import { aiheTiilet, peliRyhmat } from "@/lib/etusivu5";
import { ETUSIVUN_PELIMUODOT, VISAPAKETIT_KORTTI, pelimuotoTanaan } from "@/lib/pelimuodot";
import { LAPSET_SIVU, lapsetNakyvissa } from "@/lib/lapset/data";
import { Aiheet, Pelit } from "@/components/tn20/etusivu5/EtusivuV5";
import "../etusivu-v5.css";

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

export default async function KokoelmatPage() {
  const [counts, stats] = await Promise.all([getCounts(), getSiteStats()]);
  const tanaan = helsinginPaiva().iso;
  /* Hub-malli (Heikki 11.11.2026): sisältönä etusivun kaksi ruudukkoa. Pelaa aiheittain + Lasten visat; Valitse peli ilman
     Klassinen visa -korttia (se vie tälle samalle sivulle), tilalla Visapaketit. Visamäärät pienellä tiilen alla. */
  const tiilet = aiheTiilet(lapsetNakyvissa() ? { lapset: { href: LAPSET_SIVU, kuva: "/20/lapset/etusivu-peli.webp" } } : {});
  const pelimuodot = [VISAPAKETIT_KORTTI, ...ETUSIVUN_PELIMUODOT.filter((p) => p.slug !== "klassinen")].map((p) => pelimuotoTanaan(p, tanaan));
  const { ryhmat, pelimuotoja } = peliRyhmat(pelimuodot, tanaan, `${stats.quizzesFloor}+`);

  return (
    <main style={{ minHeight: "100dvh" }}>
      <KokoelmaLd avain="kokoelmat" nimi="Kaikki kokoelmat" polku="/kokoelmat" />
      <Crumbs items={[{ label: "Kokoelmat" }]} />
      <div className="tn-es5 tn-kok">
        <header className="tn-colx-head tn-kok-head">
          <h1 className="tn-colx-title">
            Kaikki <span>kokoelmat</span>
          </h1>
          <p className="tn-colx-lede">Valitse aihe tai pelimuoto.</p>
        </header>
        <Aiheet a={{ kicker: `${stats.quizzesFloor}+ visaa · ${tiilet.length} kokoelmaa`, tiilet }} maarat={{ ...counts, lapset: counts.lapset ?? 0 }} entry="kokoelmat:aiheet" />
        <Pelit p={{ kicker: `${pelimuotoja} pelimuotoa`, ryhmat }} entry="kokoelmat:pelimuodot" />
      </div>
    </main>
  );
}
