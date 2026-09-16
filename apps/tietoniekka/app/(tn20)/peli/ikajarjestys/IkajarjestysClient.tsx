"use client";
// TIETOKETJU: IKÄJÄRJESTYS — pelinäkymän tilakone.
// Vaiheet: aloitus (CategoryPicker) → järjestäminen (ReorderableChainList)
// → paljastus (RevealSequencer) → tulos (ChainResultSummary) → arvo uudet.
//
// "Sama henkilö ei toistu peräkkäisillä kierroksilla" (tehtävänanto kohta 5):
// kevyt client-puolen sessionStorage-tila muistaa edellisen kierroksen
// henkilö-id:t ja antaa ne getChainRoundille poissuljettavaksi. Ei pysyvää
// tallennusta pelaajan järjestyksestä — sessionStorage tyhjenee välilehden
// sulkeutuessa eikä mitään kirjoiteta kantaan pelin aikana.

import { useMemo, useState } from "react";
import { getChainRound } from "@/lib/ikajarjestys";
import {
  DEFAULT_DIRECTION,
  ROUND_SIZE,
  formatBirthDate,
  shuffleChain,
  sortForDirection,
  type ChainPerson,
} from "@/lib/ikajarjestysConstants";
import { CategoryPicker } from "@/components/tn20/CategoryPicker";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { ChainResultSummary, calculateChainScore, type ChainScoreResult } from "@/components/tn20/ChainResultSummary";

const LAST_SEEN_KEY = "tk-ikajarjestys-viimeksi-nahdyt";

function readLastSeen(): string[] {
  try {
    const raw = sessionStorage.getItem(LAST_SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeLastSeen(ids: string[]) {
  try {
    sessionStorage.setItem(LAST_SEEN_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage voi olla estetty (yksityinen selaus) — toistoneston puute ei kaada peliä.
  }
}

type Phase = "start" | "loading" | "ordering" | "revealing" | "result";

export default function IkajarjestysClient({
  initialCategory,
  initialRound,
}: {
  initialCategory: string;
  initialRound: ChainPerson[] | null;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [pickerCategory, setPickerCategory] = useState(initialCategory);
  const [round, setRound] = useState<ChainPerson[] | null>(initialRound);
  const [order, setOrder] = useState<ChainPerson[]>(() => (initialRound ? shuffleChain(initialRound) : []));
  const [phase, setPhase] = useState<Phase>(initialRound && initialRound.length > 0 ? "ordering" : "start");
  const [scoreResult, setScoreResult] = useState<ChainScoreResult | null>(null);
  const [emptyNotice, setEmptyNotice] = useState<string | null>(null);
  const [partialRoundNotice, setPartialRoundNotice] = useState<string | null>(null);

  const correctOrder = useMemo(() => (round ? sortForDirection(round, DEFAULT_DIRECTION) : []), [round]);

  async function startRound(chosenCategory: string) {
    setPhase("loading");
    setEmptyNotice(null);
    setPartialRoundNotice(null);
    const lastSeen = readLastSeen();
    const next = await getChainRound(chosenCategory, lastSeen);
    setCategory(chosenCategory);
    setRound(next);
    setOrder(shuffleChain(next));
    if (next.length > 0) {
      writeLastSeen(next.map((p) => p.id));
      // Pieni kategoria voi palauttaa alle ROUND_SIZE henkilöä (ks. JULKAISUTEKSTI
      // "Kierroksen koko") — kierros pelataan silti loppuun, mutta pelaajalle
      // kerrotaan ettei tällä kertaa saatu täyttä kymmenikköä, koska muu UI
      // (otsikko, "Arvo 10 uutta") muuten implikoi aina täyttä kierrosta.
      if (next.length < ROUND_SIZE) {
        setPartialRoundNotice(`Tästä kategoriasta löytyi vain ${next.length} henkilöä tällä kierroksella.`);
      }
      setPhase("ordering");
    } else {
      setEmptyNotice("Tästä kategoriasta ei löytynyt tarpeeksi pelattavia henkilöitä juuri nyt. Kokeile toista kategoriaa.");
      setPhase("start");
    }
  }

  function handleRevealComplete() {
    if (!round) return;
    const result = calculateChainScore(order, correctOrder);
    setScoreResult(result);
    setPhase("result");
  }

  const revealItems: RevealItem[] = useMemo(() => {
    if (!round) return [];
    const correctIndexById = new Map(correctOrder.map((p, i) => [p.id, i]));
    return order.map((person, i) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      image_url: person.image_url,
      placedPosition: i + 1,
      correctPosition: (correctIndexById.get(person.id) ?? i) + 1,
      birthDateLabel: formatBirthDate(person.birthDate),
    }));
  }, [order, round, correctOrder]);

  if (phase === "start" || phase === "loading") {
    return (
      <main className="tk-page tk-page--start">
        <CategoryPicker
          open
          variant="inline"
          selectedCategory={pickerCategory}
          onSelectCategory={setPickerCategory}
          onStart={() => startRound(pickerCategory)}
        />
        {phase === "loading" && (
          <p className="tk-loading" role="status">
            Arvotaan kierrosta…
          </p>
        )}
        {emptyNotice && (
          <p className="tk-loading" role="alert">
            {emptyNotice}
          </p>
        )}
      </main>
    );
  }

  if (phase === "revealing") {
    return (
      <main className="tk-page">
        <RevealSequencer items={revealItems} onComplete={handleRevealComplete} />
      </main>
    );
  }

  if (phase === "result" && scoreResult) {
    return (
      <main className="tk-page">
        <ChainResultSummary
          result={scoreResult}
          onNewRound={() => startRound(category)}
          onChangeCategory={() => {
            setPickerCategory(category);
            setPhase("start");
          }}
        />
      </main>
    );
  }

  // phase === "ordering"
  return (
    <main className="tk-page">
      <header className="tk-order-head">
        <SuuntaindikaattoriBadge direction={DEFAULT_DIRECTION} />
        <h1 className="tk-order-title">Tietoketju: Ikäjärjestys</h1>
        <p className="tk-order-desc">
          Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu oikealta, paljasta tulos.
        </p>
        {partialRoundNotice && (
          <p className="tk-loading" role="status">
            {partialRoundNotice}
          </p>
        )}
      </header>
      <ReorderableChainList items={order} onReorder={setOrder} />
      <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => setPhase("revealing")}>
        Paljasta järjestys
      </button>
    </main>
  );
}
