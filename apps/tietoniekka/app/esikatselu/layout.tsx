// ESIKATSELU — adminin upottamat esikatselunäkymät (toteutusohje 19.9.2026,
// luku 8: "Esikatselu renderöi kortin täsmälleen kuten etusivulla").
// Samat fontit, tyylit ja komponentit kuin (tn20)-etusivulla, mutta ilman
// ylä- ja alatunnistetta. Ei indeksoida (metadata + robots.ts + X-Robots-Tag).
import type { Metadata } from "next";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/900.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/instrument-sans/700.css";
import "../(tn20)/tn20.css";
import "../(tn20)/etusivu.css";

export const metadata: Metadata = {
  title: "Esikatselu",
  robots: { index: false, follow: false },
};

export default function EsikatseluLayout({ children }: { children: React.ReactNode }) {
  return <div className="tn20">{children}</div>;
}
