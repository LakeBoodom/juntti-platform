"use client";
// Laadullinen järjestyspakka (brief 4.10.2026): Ikäjärjestyksen järjestämis- ja paljastuskomponentit,
// pisteytys yhteinen pakkapelien kanssa (lib/jarjesta/pisteytys.ts: 10/5, tasatulokset "tasan").
import { useMemo, useState } from "react";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { arvioi, arvoLisat, pisteet, PISTEOHJE } from "@/lib/jarjesta/pisteytys";
import { TkGameNav } from "@/components/tn20/TkGameNav";

export type OmaKohde = { id: string; name: string; role: string; image_url: string | null; value: number; valueLabel: string };

function sekoita<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function OmaJarjestysClient({
  otsikko,
  suunta,
  direction,
  kohteet,
  tilastot,
  takaisin,
}: {
  otsikko: string;
  suunta: string;
  direction: "asc" | "desc";
  kohteet: OmaKohde[];
  tilastot: string | null;
  takaisin: { href: string; nimi: string };
}) {
  const [order, setOrder] = useState<OmaKohde[]>(kohteet);
  const [paljastettu, setPaljastettu] = useState(false);
  const oikea = useMemo(() => [...kohteet].sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value)), [kohteet, direction]);
  const arviot = useMemo(() => arvioi(order, oikea), [order, oikea]);

  const tulos = useMemo(() => pisteet(arviot), [arviot]);

  const revealItems: RevealItem[] = order.map((k, i) => {
    const a = arviot[i];
    const lisat = arvoLisat(a);
    return {
      id: k.id,
      name: k.name,
      role: "",
      image_url: k.image_url,
      placedPosition: i + 1,
      correctPosition: a.oikein ? i + 1 : a.lahin + 1,
      valueLabel: lisat ? `${k.valueLabel} · ${lisat}` : k.valueLabel,
    };
  });

  if (paljastettu) {
    return (
      <main className="tk-page">
        <TkGameNav />
        <RevealSequencer
          items={revealItems}
          result={tulos}
          onNewRound={() => {
            setOrder(sekoita(kohteet));
            setPaljastettu(false);
            window.scrollTo({ top: 0 });
          }}
          summaryProps={{ newRoundLabel: "Pelaa uudelleen", collectionHref: takaisin.href, collectionLabel: `Takaisin: ${takaisin.nimi} →` }}
        />
        <p className="tk-jarj-lahde">
          {PISTEOHJE}{tilastot ? ` · ${tilastot}` : ""}
        </p>
      </main>
    );
  }

  return (
    <main className="tk-page">
      <TkGameNav />
      <header className="tk-order-head">
        <SuuntaindikaattoriBadge label={suunta.toUpperCase()} />
        <h1 className="tk-order-title">{otsikko}</h1>
        <p className="tk-order-desc">Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu oikealta, paljasta tulos.</p>
      </header>
      <ReorderableChainList items={order} onReorder={setOrder} />
      <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => setPaljastettu(true)}>
        Paljasta järjestys
      </button>
      {tilastot && <p className="tk-jarj-lahde">{tilastot}</p>}
    </main>
  );
}
