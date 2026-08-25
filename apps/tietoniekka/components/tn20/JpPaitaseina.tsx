"use client";
// TIETONIEKKA 2.0 — JALKAPALLO / Lohko A: valittu seura + paitaseinä
// (CD "TN Jalkapallo -teemasivu" 25.8.2026, README §4 + §Interactions).
// Paitaseinän klikkaus vaihtaa vasemman paitakuvan, nimen, hookin, tilastot,
// CTA:n ja korostusvärin — ei sivulatausta. README:n suositus: valinta
// peilataan URL-parametriin (?seura=arsenal) jaettavuutta varten —
// toteutettu history.replaceState:lla (ei navigointia, ei scroll-hyppyä).
// Julkaisematon visa (README-vakiosääntö): CTA näyttää "Tulossa" eikä ole
// linkki — seura näkyy silti seinällä ja on valittavissa.

import { useState } from "react";

export type JpWallClub = {
  id: string; name: string; short: string; city: string;
  founded: number; stadium: string; color: string; tier: string; hook: string;
  img: string;
  playHref: string | null;
  questionCount: number;
};

export default function JpPaitaseina({ clubs, defaultClubId }: { clubs: JpWallClub[]; defaultClubId?: string }) {
  const defIdx = Math.max(0, clubs.findIndex((c) => c.id === defaultClubId));
  const [sel, setSel] = useState(defIdx);
  const c = clubs[sel] ?? clubs[0];

  function pick(i: number) {
    setSel(i);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seura", clubs[i].id);
      window.history.replaceState(null, "", url);
    } catch {
      /* no-op */
    }
  }

  return (
    <div className="tnjp-stage">
      {/* Valittu seura: paita (1:1) */}
      <div className="tnjp-jersey">
        <div className="tnjp-jersey-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.img} alt={c.name} />
          <div className="tnjp-jersey-pills">
            <span className="tnjp-pill">{c.city}</span>
            <span className="tnjp-pill">{c.tier}</span>
          </div>
        </div>
      </div>

      {/* Valittu seura: tiedot */}
      <div className="tnjp-club">
        <div className="tnjp-club-kicker" style={{ color: c.color }}>Seuravisa</div>
        <h3 className="tnjp-club-name">{c.name}</h3>
        <p className="tnjp-club-hook">{c.hook}</p>
        <div className="tnjp-stats">
          <div><b>{c.founded}</b><span>Perustettu</span></div>
          <div><b>{c.stadium}</b><span>Kotistadion</span></div>
          <div><b>{c.questionCount} kys.</b><span>Visan pituus</span></div>
        </div>
        {c.playHref ? (
          <a className="tnjp-cta" href={c.playHref}>Pelaa {c.name} -visa</a>
        ) : (
          <span className="tnjp-cta-tulossa">Tulossa</span>
        )}

        {/* Paitaseinä */}
        <div className="tnjp-wall">
          <div className="tnjp-wall-head">Paitaseinä · {clubs.length} seuraa</div>
          <div className="tnjp-wall-grid">
            {clubs.map((club, i) => (
              <button
                key={club.id}
                type="button"
                className="tnjp-wall-card"
                data-active={i === sel || undefined}
                title={`${club.name} · ${club.city}`}
                onClick={() => pick(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={club.img} alt={club.name} />
                <span className="tnjp-wall-short">{club.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
