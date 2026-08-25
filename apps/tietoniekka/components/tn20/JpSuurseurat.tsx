"use client";
// TIETONIEKKA 2.0 — JALKAPALLO / Lohko B: maasuodatin + suurseuraruudukko
// (CD "TN Jalkapallo -teemasivu" 25.8.2026, README §6). Suodatinnappien
// lukumäärät lasketaan datasta (README: ei kovakoodata). Julkaisematon visa
// (esim. Leverkusen, kannassa draft 25.8.) renderöityy Tulossa-tilassa:
// himmennetty, ei linkki — kortti näkyy silti kaikissa suodattimissa.

import { useState } from "react";
import { JP_FILTERS } from "@/lib/jalkapallo";

export type JpEuroCard = {
  id: string; name: string; country: string; stadium: string;
  color: string; hook: string; img: string;
  playHref: string | null;
  questionCount: number;
};

export default function JpSuurseurat({ clubs }: { clubs: JpEuroCard[] }) {
  const [filter, setFilter] = useState<string>("Kaikki");
  const shown = clubs.filter((c) => filter === "Kaikki" || c.country === filter);

  return (
    <>
      <div className="tnjp-filters">
        {JP_FILTERS.map((f) => {
          const count = f === "Kaikki" ? clubs.length : clubs.filter((c) => c.country === f).length;
          return (
            <button
              key={f}
              type="button"
              className="tnjp-filter"
              data-active={f === filter || undefined}
              onClick={() => setFilter(f)}
            >
              {f}
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="tnjp-eurogrid">
        {shown.map((c) => {
          const inner = (
            <span className="tnjp-ecard-in">
              <span className="tnjp-ecard-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.name} loading="lazy" />
                <span className="tnjp-card-tag">{c.playHref ? c.country : "Tulossa"}</span>
                <span className="tnjp-ecard-name">{c.name}</span>
              </span>
              <span className="tnjp-ecard-body">
                <span className="tnjp-ecard-hook">{c.hook}</span>
                <span className="tnjp-ecard-foot">
                  <span>{c.stadium}</span>
                  <span className="tnjp-ecard-q">{c.questionCount} kys.</span>
                </span>
              </span>
            </span>
          );
          return c.playHref ? (
            <a key={c.id} className="tnjp-ecard" href={c.playHref} style={{ color: c.color }}>
              {inner}
            </a>
          ) : (
            <div key={c.id} className="tnjp-ecard" data-tulossa style={{ color: c.color }}>
              {inner}
            </div>
          );
        })}
      </div>
    </>
  );
}
