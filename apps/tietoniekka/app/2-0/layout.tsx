// TIETONIEKKA 2.0 — oma layout (Neon Night). Skoopattu .tn20-luokkaan,
// jotta nykyinen sivusto ei muutu. Fontit: Archivo (display) + Instrument Sans (body).
import type { Metadata } from "next";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/900.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "./tn20.css";
import TopBar from "@/components/tn20/TopBar";
import SiteFooter from "@/components/tn20/SiteFooter";

/* QA-006 (29.8.2026): oletusotsikko ja -kuvaus etusivulle; alasivut
   (kokoelmat, pelisivut) antavat omansa. noindex säilyy haaralla julkaisuun
   asti (poistetaan mergen yhteydessä, ks. Vielä auki). */
export const metadata: Metadata = {
  title: "Tietoniekka – suomalainen tietovisasivusto · 500+ visaa",
  description:
    "Ilmaisia tietovisoja jääkiekosta, jalkapallosta, elokuvista, musiikista, historiasta ja luonnosta. Päivän visa, megavisat ja kuvavisat – pelaa ilman kirjautumista.",
  robots: { index: false, follow: false },
};

/* Heikin katselmus 17.8.: visamäärät poistettiin navigaatiosta kokonaan →
   layoutin ei tarvitse hakea lukuja kannasta (/2-0/kokoelmat hakee omansa). */
export default function Tn20Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tn20">
      {/* Navigaatiojärjestelmä (lukittu 17.8.2026) — piiloutuu itse pelinäkymässä */}
      <TopBar />
      {children}
      {/* Yhteinen alatunniste kaikille sivuille (QA-005, 29.8.2026) */}
      <SiteFooter />
    </div>
  );
}
