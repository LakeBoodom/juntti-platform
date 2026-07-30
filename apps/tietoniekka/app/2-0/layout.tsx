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

export const metadata: Metadata = {
  title: "Tietoniekka 2.0 — esikatselu",
  robots: { index: false, follow: false },
};

export default function Tn20Layout({ children }: { children: React.ReactNode }) {
  return <div className="tn20">{children}</div>;
}
