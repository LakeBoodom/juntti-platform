// TUPLA TAI KUITTI — pelin aloitus pelikehyksessä (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys" §4,
// vaihe 4, 20.10.2026): K1 pelipalkki (paluu /kokoelmat) + K2 aloitus (aiheen valinta ja "Aloita · <aihe>"
// 390 × 844:ssä ilman vieritystä). Entinen studiokuva, nosto ja aiheruudukko korvautuivat valinnalla; ohjelman
// historia ja säännöt ovat avattavina. Sivuston yläpalkki on piilossa (lib/nav.ts isGameRoute).

import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { TEEMAT, TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";
import { TuplaSaannot, TuplaTausta } from "./ohjeet";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import TuplaAloitus from "./TuplaAloitus";

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
  const aiheet = TEEMAT.map((t) => ({ slug: t.slug, nimi: t.painos?.nimi ?? t.nimi, accent: t.accent }));
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Tupla tai kuitti", url: TUPLA_SIVU, description: "Kymmenen yhä vaikeampaa kysymystä; jokainen oikea vastaus tuplaa potin – kuittaa ajoissa tai pelaa kaikesta." })} />
      <Pelipalkki peli="Tupla tai kuitti" koti={{ href: "/kokoelmat", nimi: "Kokoelmat" }} />
      <main>
        <TuplaAloitus
          aiheet={aiheet}
          valittu={aiheet[0].slug}
          saannot={<TuplaSaannot />}
          tausta={<TuplaTausta />}
        />
      </main>
    </PeliKehys>
  );
}
