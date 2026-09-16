"use client";
// TIETOKETJU: IKÄJÄRJESTYS — RevealSequencer.
// Paljastusanimaatio: nopea hallittu sarja (ei kortti kerrallaan pysähtyen),
// lukitsee pelaajan asettaman järjestyksen paikalleen (EI järjestä uudelleen
// oikeaan järjestykseen — jokainen paikka vain merkitään oikeaksi/vääräksi),
// näyttää oikeat/väärät paikat ohuina reunoina/ikoneina (EI täyttöpintoina —
// ainoa semanttinen lime-käyttö tässä näkymässä on "oikein"-tila, joka on
// design-tokenina sama arvo kuin --tk-lime). Syntymäajat paljastuvat vasta nyt.
//
// Liikeajat (speksi): enter 320ms, state-muutos 220ms,
// easing cubic-bezier(.2,.8,.2,1). prefers-reduced-motion: sama lopputulos,
// ei porrastettua animaatiota — kaikki paljastuu kerralla lyhyen viiveen jälkeen.
//
// LIVE-QA-LÖYDÖS (kriittinen, 2026-09-16, Heikki): paljastettu järjestys näkyi
// vain ~1,4 s (BASE_DELAY + 10 × STAGGER + 320 ms), koska sarjan päätyttyä
// onComplete() kutsuttiin ajastimesta ja peli hyppäsi itse tulosnäkymään.
// Pelaaja ei ehtinyt katsoa mikä meni oikein ja mikä väärin. Korjattu:
// tämä komponentti EI enää koskaan kutsu onCompletea itse — ajastimet vain
// paljastavat kortit, ja siirtymä tulosnäkymään vaatii pelaajan oman
// "Näytä tulos" -klikkauksen. Paljastus jää siis näkyviin niin pitkäksi
// aikaa kuin pelaaja haluaa.

import { useEffect, useState } from "react";
import { RankingCard, type RankingCardState } from "./RankingCard";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type RevealItem = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  /** Pelaajan asettama paikka (1-pohjainen) — tässä järjestyksessä kortit pysyvät koko paljastuksen ajan. */
  placedPosition: number;
  /** Oikea kronologinen paikka (1-pohjainen) — verrataan placedPositioniin. */
  correctPosition: number;
  birthDateLabel: string;
};

const STAGGER_MS = 90;
const BASE_DELAY_MS = 220;

export function RevealSequencer({ items, onComplete }: { items: RevealItem[]; onComplete: () => void }) {
  const ordered = [...items].sort((a, b) => a.placedPosition - b.placedPosition);
  const reducedMotion = usePrefersReducedMotion();
  const [revealedCount, setRevealedCount] = useState(0);

  const total = ordered.length;
  const allRevealed = total > 0 && revealedCount >= total;

  useEffect(() => {
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (reducedMotion) {
      // Sama lopputulos ilman porrastettua liikettä — yksi lyhyt viive, sitten kaikki kerralla.
      timers.push(setTimeout(() => setRevealedCount(total), 200));
    } else {
      ordered.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            setRevealedCount((c) => Math.max(c, i + 1));
          }, BASE_DELAY_MS + i * STAGGER_MS),
        );
      });
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, reducedMotion]);

  /** Ohita porrastus: näytä kaikki kortit heti. EI siirry tulokseen — se on aina pelaajan klikki. */
  function revealAllNow() {
    setRevealedCount(total);
  }

  return (
    <div className="tk-reveal">
      <div className="tk-reveal-list">
        {ordered.map((item, i) => {
          const isRevealed = i < revealedCount;
          const state: RankingCardState = isRevealed ? (item.placedPosition === item.correctPosition ? "correct" : "wrong") : "idle";
          return (
            <div
              key={item.id}
              className={`tk-reveal-row${isRevealed ? " tk-reveal-row--revealed" : ""}`}
              style={reducedMotion ? undefined : { transitionDelay: `${i * STAGGER_MS}ms` }}
            >
              <RankingCard
                person={item}
                position={item.placedPosition}
                state={state}
                revealedDate={isRevealed ? item.birthDateLabel : null}
                readOnly
              />
            </div>
          );
        })}
      </div>

      {allRevealed ? (
        // tk-btn-secondary (ei tk-btn-primary): --tk-lime on tässä näkymässä
        // varattu "oikein"-tilan reunaviivalle (korkeintaan 1 lime-käyttö per
        // näkymä, ks. tokenikommentti tietoketju.css:ssä), joten tulos-CTA on
        // neutraali reunaviivanappi.
        <button type="button" className="tk-btn-secondary tk-reveal-cta" onClick={onComplete}>
          Näytä tulos
        </button>
      ) : (
        <button type="button" className="tk-reveal-skip" onClick={revealAllNow}>
          Näytä heti →
        </button>
      )}
    </div>
  );
}
