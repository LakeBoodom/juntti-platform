"use client";
// Laadullinen järjestyspakka (brief 4.10.2026): Ikäjärjestyksen järjestämis- ja paljastuskomponentit,
// pisteytys CD-designin mukaan (oikea paikka 10 p, yhden sijan päässä 5 p). Tasatulokset: kumpi
// tahansa järjestys on oikein, ja paljastus kertoo "tasan".
import { useMemo, useState } from "react";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import type { ChainScoreResult } from "@/components/tn20/ChainResultSummary";
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

/** Jokaiselle sijoitetulle: lähin oikea sija (tasatuloksissa lähin samanarvoinen paikka). */
function arvioi(order: OmaKohde[], oikea: OmaKohde[]) {
  return order.map((k, i) => {
    const paikat = oikea.map((o, j) => (o.value === k.value ? j : -1)).filter((j) => j >= 0);
    const lahin = paikat.reduce((best, j) => (Math.abs(j - i) < Math.abs(best - i) ? j : best), paikat[0] ?? i);
    return { lahin, oikein: lahin === i, tasan: paikat.length > 1 };
  });
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

  const tulos: ChainScoreResult = useMemo(() => {
    let score = 0;
    let pisin = 0;
    let jakso = 0;
    arviot.forEach((a, i) => {
      if (a.oikein) score += 10;
      else if (Math.abs(a.lahin - i) === 1) score += 5;
      jakso = a.oikein ? jakso + 1 : 0;
      pisin = Math.max(pisin, jakso);
    });
    return { score, correctCount: arviot.filter((a) => a.oikein).length, totalCount: order.length, longestCorrectChain: pisin };
  }, [arviot, order.length]);

  const revealItems: RevealItem[] = order.map((k, i) => {
    const a = arviot[i];
    const lisat = [a.tasan ? "tasan" : null, a.oikein ? null : `oikea sija ${a.lahin + 1}.`].filter(Boolean).join(" · ");
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
          Oikea paikka 10 p · yhden sijan päässä 5 p{tilastot ? ` · ${tilastot}` : ""}
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
