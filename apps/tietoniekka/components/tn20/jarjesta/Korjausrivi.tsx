"use client";
// JÄRJESTÄ — pelilauta (CD "Järjestä yhtenäinen UX" 1a/2b/3d, Heikki 2.11.2026): kaikki järjestyspelit näyttävät samalta.
// "Korjaa rivi" → lause → ↑ yläpää, rivit, ↓ alapää → Lukitse valintasi. Mobiilissa nappi pysyy alareunassa, desktopilla
// (≥ 900 px) otsikko ja nappi vasemmalla, rivit oikealla. Nappi himmenee raahauksen ajaksi (CSS: :has(.tk-rcard-ghost)).
import type { ReactNode } from "react";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import type { RankingCardPerson } from "@/components/tn20/RankingCard";
import { VAIHTO_OHJE } from "@/lib/jarjesta/rivi";

export default function Korjausrivi<T extends RankingCardPerson>({
  lause,
  ylin,
  alin,
  items,
  onReorder,
  onTarkista,
  huomautus,
}: {
  lause: string;
  ylin: string;
  alin?: string;
  items: T[];
  onReorder: (next: T[]) => void;
  onTarkista: () => void;
  huomautus?: ReactNode;
}) {
  return (
    <main className="jr-lauta">
      <div className="jr-lauta-vasen">
        <h1 className="jr-h1">Korjaa rivi</h1>
        <p className="jr-lause">{lause} {VAIHTO_OHJE}</p>
        {huomautus}
      </div>
      <div className="jr-lauta-rivit">
        <span className="jr-merkki"><span aria-hidden="true">↑ </span>{ylin}</span>
        <ReorderableChainList items={items} onReorder={onReorder} />
        {alin && <span className="jr-merkki jr-merkki--ala"><span aria-hidden="true">↓ </span>{alin}</span>}
      </div>
      <div className="jr-tarkista">
        <button type="button" className="jr-nappi" onClick={onTarkista}>Lukitse valintasi</button>
      </div>
    </main>
  );
}
