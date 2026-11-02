"use client";
// JÄRJESTÄ — tulos (CD "Järjestä yhtenäinen UX" 2d/3a, Heikki 2.11.2026): iso x/n ylhäällä (lime kun kaikki oikein,
// muuten amber), rivit pelaajan järjestyksessä, väärät vinossa ja "Kuuluu paikalle N.", arvo oikealla. Ei titteleitä,
// pisteitä eikä ketjua. Paljastus on nopea hallittu sarja: rivi kerrallaan, luku ja jatko sen jälkeen. Ajastimet vain
// paljastavat kortit, eivät koskaan vaihda näkymää (LIVE-QA 16.9.2026: pelaajan on ehdittävä katsoa).
// prefers-reduced-motion: sama lopputulos ilman porrastusta.

import { useEffect, useState, type ReactNode } from "react";
import { RankingCard, type RankingCardState } from "./RankingCard";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type RevealItem = {
  id: string;
  name: string;
  image_url: string | null;
  hideThumb?: boolean;
  tunnus?: boolean;
  /** Pelaajan asettama paikka (1-pohjainen): tässä järjestyksessä kortit pysyvät koko paljastuksen ajan. */
  placedPosition: number;
  /** Oikea paikka (1-pohjainen), tasatuloksissa lähin. */
  correctPosition: number;
  /** Arvo oikealla ("1917", "1 317 m"). */
  valueLabel: string;
};

const STAGGER_MS = 90;
const BASE_DELAY_MS = 220;

export function RevealSequencer({
  items,
  jatko,
  alaviite,
}: {
  items: RevealItem[];
  /** Seuraava rivi, jako ja muut toiminnot: näkyvät, kun kaikki on paljastettu. */
  jatko: ReactNode;
  alaviite?: ReactNode;
}) {
  const ordered = [...items].sort((a, b) => a.placedPosition - b.placedPosition);
  const reducedMotion = usePrefersReducedMotion();
  const [revealedCount, setRevealedCount] = useState(0);

  const total = ordered.length;
  const allRevealed = total > 0 && revealedCount >= total;
  const oikein = ordered.filter((k) => k.placedPosition === k.correctPosition).length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reducedMotion) {
      timers.push(setTimeout(() => setRevealedCount(total), 200));
    } else {
      ordered.forEach((_, i) => {
        timers.push(setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), BASE_DELAY_MS + i * STAGGER_MS));
      });
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, reducedMotion]);

  return (
    <div className="jr-tulos" style={{ "--tk-n": total } as React.CSSProperties}>
      <h1 className="jr-luku" data-valmis={allRevealed || undefined}>
        <span className="jr-luku-n">
          <span data-kaikki={oikein === total || undefined}>{oikein}</span>/{total}
        </span>
        <span className="jr-luku-sana">oikealla paikalla</span>
      </h1>

      <div className="jr-tulos-rivit">
        {ordered.map((item, i) => {
          const isRevealed = i < revealedCount;
          const ok = item.placedPosition === item.correctPosition;
          const state: RankingCardState = isRevealed ? (ok ? "correct" : "wrong") : "idle";
          return (
            <div key={item.id} className={`tk-reveal-row${isRevealed ? " tk-reveal-row--revealed" : ""}`}>
              <RankingCard
                person={{ id: item.id, name: item.name, role: "", image_url: item.image_url, hideThumb: item.hideThumb, tunnus: item.tunnus }}
                position={item.placedPosition}
                state={state}
                note={isRevealed && !ok ? `Kuuluu paikalle ${item.correctPosition}.` : null}
                value={isRevealed ? item.valueLabel : null}
                readOnly
              />
            </div>
          );
        })}
      </div>

      {allRevealed && <div className="jr-jatko">{jatko}</div>}
      {allRevealed && alaviite && <p className="jr-alaviite">{alaviite}</p>}
    </div>
  );
}
