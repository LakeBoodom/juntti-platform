// KUMPI? 2.0 — seuralista /kumpi/seura: Oma seura -valinnan sivu ilman JavaScriptiä ja hakukoneille.
// Hubissa sama valinta aukeaa alapaneelina (OmaSeura.tsx).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Crumbs from "@/components/tn20/Crumbs";
import "@/components/tn20/korttirivi/hub.css";
import { hubinTeemat } from "@/lib/kumpi/sivu";
import "@/components/tn20/kumpi/kumpi.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kumpi? Oma seura",
  description: "Valitse Liiga-seura ja pelaa Kumpi?-kierros sen pelaajista.",
  alternates: { canonical: "/kumpi/seura" },
};

export default async function KumpiSeurat() {
  const hub = await hubinTeemat();
  if (!hub) notFound();
  return (
    <PeliKehys iho="tumma">
      <Crumbs items={[{ label: "Kumpi?", href: "/kumpi" }, { label: "Oma seura" }]} />
      <main id="main">
        <div className="hub">
          <header className="hub-hero hub-hero--ilman">
            <div className="hub-hero-teksti">
              <h1 className="hub-h1">Oma seura</h1>
            </div>
          </header>
          <ul className="kp-seurat kp-seurat--sivu">
            {hub.seurat.map((s) => (
              <li key={s.slug}><a href={`/kumpi/seura/${s.slug}`}>{s.nimi}</a></li>
            ))}
          </ul>
        </div>
      </main>
    </PeliKehys>
  );
}
