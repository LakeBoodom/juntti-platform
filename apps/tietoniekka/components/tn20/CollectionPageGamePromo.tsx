"use client";
// TIETOKETJU: IKÄJÄRJESTYS — CollectionPageGamePromo.
// Pelinosto "Tunnetut henkilöt" -kokoelmasivulle (kokoelma/[collection]/page.tsx),
// "Tänään & tulevat synttärit" -rivin alapuolella. Eyebrow (amber), otsikko,
// ohjeteksti, kategoriavalinta (amber-chipit, client-tila), "Arvo kierros"
// -pääpainike (lime — AINOA lime tässä näkymässä) ja pieni koristeellinen
// 3–4 kortin peek-esikatselu (aria-hidden, ei interaktiivinen).

import { useState } from "react";
import { CHAIN_CATEGORIES } from "@/lib/personCategories";
import { SuuntaindikaattoriBadge } from "./SuuntaindikaattoriBadge";
import { RankingCard, type RankingCardPerson } from "./RankingCard";

export function CollectionPageGamePromo({ peekPeople = [] }: { peekPeople?: RankingCardPerson[] }) {
  const [category, setCategory] = useState("kaikki");
  const href = `/peli/ikajarjestys?category=${encodeURIComponent(category)}&autostart=1`;

  return (
    <section className="tk-promo">
      <div className="tk-promo-copy">
        <div className="tk-promo-eyebrow">Uusi pelimuoto</div>
        <h2 className="tk-promo-title">Tietoketju: Ikäjärjestys</h2>
        <p className="tk-promo-desc">
          Aseta kymmenen tuttua kasvoa syntymävuoden mukaiseen järjestykseen — nopea kierros, uusi
          porukka joka arvonnalla.
        </p>
        <SuuntaindikaattoriBadge direction="vanhin-nuorin" className="tk-promo-direction" />
        <div className="tk-chiprow tk-promo-chips" role="group" aria-label="Kategoria">
          {CHAIN_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`tk-chip-amber${category === c.key ? " is-active" : ""}`}
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <a className="tk-btn-primary tk-promo-cta" href={href}>
          Arvo kierros
        </a>
      </div>

      {peekPeople.length > 0 && (
        <div className="tk-promo-peek" aria-hidden="true">
          {peekPeople.slice(0, 4).map((p, i) => (
            <div className="tk-promo-peek-card" key={p.id} style={{ ["--tk-peek-i" as string]: i }}>
              <RankingCard person={p} readOnly peek />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
