// TUPLA TAI KUITTI — pelimuodon hub-sivu (hub-runko, Heikki 12.11.2026): hero (studiokuva + nimi + intro), aiheet
// jaettuina riveinä, ohjeet suljettuina. Toteutus TuplaHub.tsx; aiheen pelisivun aloitus on [teema]/ (TuplaAloitus).

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { TEEMAT, TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";
import { TuplaSaannot, TuplaTausta } from "./ohjeet";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Crumbs from "@/components/tn20/Crumbs";
import TuplaHub from "./TuplaHub";

export const revalidate = 300; // SEO-erä A4

export const metadata: Metadata = {
  title: "Tupla tai kuitti – Tietoniekan versio tietovisaklassikosta | Tietoniekka",
  description:
    "Valitse aihe ja vastaa kymmeneen yhä vaikeampaan kysymykseen. Jokainen oikea vastaus tuplaa potin – kuittaa ajoissa tai pelaa kaikesta.",
  // Julkaistu 26.9.2026: Pelimuodot-valikossa ja etusivun bannerissa
  alternates: { canonical: "/peli/tupla-tai-kuitti" },
  ...jakoMeta({
    title: "Tupla tai kuitti – Tietoniekan versio tietovisaklassikosta",
    description: "Kymmenen yhä vaikeampaa kysymystä. Jokainen oikea vastaus tuplaa potin – kuittaa ajoissa tai pelaa kaikesta.",
    url: "/peli/tupla-tai-kuitti",
    kuva: "/og/sivu/tupla-tai-kuitti",
  }),
};

export default function TuplaTaiKuittiSivu() {
  /* Rivi = aiheen nimi + kuvausrivi (TEEMAT.nosto); kuva = kokoelman korttikuvan pieni rivikopio (scripts/rivikuvat.py). */
  const aiheet = TEEMAT.map((t) => ({
    href: `/peli/tupla-tai-kuitti/${t.slug}?aloita=1`,
    kuva: `/20/rivi/tupla-${t.slug}.webp`,
    kuvaton: t.nimi,
    nimi: t.painos?.nimi ?? t.nimi,
    rivi: t.nosto,
  }));
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Tupla tai kuitti", url: TUPLA_SIVU, description: "Kymmenen yhä vaikeampaa kysymystä; jokainen oikea vastaus tuplaa potin – kuittaa ajoissa tai pelaa kaikesta." })} />
      <Crumbs items={[{ label: "Tupla tai kuitti" }]} />
      <main>
        <TuplaHub aiheet={aiheet} saannot={<TuplaSaannot />} tausta={<TuplaTausta />} />
      </main>
    </PeliKehys>
  );
}
