// TIETONIEKKA 2.0 — oma layout (Neon Night). Skoopattu .tn20-luokkaan,
// jotta nykyinen sivusto ei muutu. Fontit: Archivo (display) + Barlow (body, juurilayoutista).
// UI-laatu kierros 1 (14.10.2026): Instrument Sans poistettu, leipäteksti Barlow'lla (3 fonttitiedostoa vähemmän).
import { getSiteStats } from "@/lib/siteStats";
import { TAGLINE, etusivunKuvaus, etusivunOtsikko } from "@/lib/paaviesti";
import type { Metadata } from "next";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/900.css";
/* KUVAVISAT 2.0 (17.9.2026): variable-Archivo leveysakselilla (wdth 62–125).
   Käytössä VAIN kuvavisat.css:n --kv-display-tokenin kautta — muu sivusto jää
   staattiseen Archivoon, ks. kuvavisat.css:n fonttikommentti. */
import "@fontsource-variable/archivo/wdth.css";
import "./tn20.css";
import "./tietoketju.css";
import "./kuvavisat.css";
import "./viikkovisa.css";
import "./mobiilisankari.css";
import TopBar from "@/components/tn20/TopBar";
import SiteFooter from "@/components/tn20/SiteFooter";
import Seuranta from "@/components/tn20/Seuranta";

/* QA-006 (29.8.2026): oletusotsikko ja -kuvaus etusivulle; alasivut
   (kokoelmat, pelisivut) antavat omansa. noindex poistettu julkaisussa
   31.8.2026 — 2.0 on nyt tuotanto juuressa ja indeksoitavissa. */
export async function generateMetadata(): Promise<Metadata> {
  const stats = await getSiteStats();
  return {
  /* absolute: juurilayoutin template ("%s | Tietoniekka") tuplaisi muuten
     brändin etusivun otsikkoon (havaittu julkaisu-QA:ssa 31.8.2026).
     SEO-erä A8: visamäärä kannasta (lib/siteStats.ts).
     SEO 16.10.2026 (Heikki): hakusana "tietovisat" alkuun, brändi loppuun.
     Pääviesti 21.11.2026 (Heikki): tekstit lib/paaviesti.ts, visamäärä vain kuvauksessa. */
  title: { absolute: etusivunOtsikko() },
  description: etusivunKuvaus(stats.quizzesFloor),
  };
}

/* Heikin katselmus 17.8.: visamäärät poistettiin navigaatiosta kokonaan →
   layoutin ei tarvitse hakea lukuja kannasta (/kokoelmat hakee omansa). */
export default async function Tn20Layout({ children }: { children: React.ReactNode }) {
  /* Pääviesti 21.11.2026: tagline ilman visamäärää (ennen "Suomalainen tietovisasivusto · 800+ visaa"). */
  const tagline = TAGLINE;
  return (
    <div className="tn20">
      {/* UI-laatu 14.10.2026: skip-linkki ensimmäiseksi; kohde on sisällön alussa (sivujen omat <main>-elementit
          vaihtelevat, joten ankkuri on layoutissa). */}
      <a href="#main" className="skip-link">Siirry sisältöön</a>
      {/* Navigaatiojärjestelmä (lukittu 17.8.2026) — piiloutuu itse pelinäkymässä */}
      <TopBar tagline={tagline} />
      <Seuranta />
      <span id="main" tabIndex={-1} />
      {children}
      {/* Yhteinen alatunniste kaikille sivuille (QA-005, 29.8.2026) */}
      <SiteFooter />
    </div>
  );
}
