"use client";
// PÄIVÄN PUTKI — "Liekkikortti" (CD:n ehdotus 1b, Heikki valitsi 10.8.2026).
// Lukee saman localStorage-avaimen kuin pelin putkilogiikka
// (tn_paivan_visa_putki, {count, last}) + paras putki -avaimen
// (tn_paivan_visa_putki_paras, GameClient päivittää). Ei kirjautumista.
// Sama kortti kahdessa paikassa: etusivun Tänään-slotti (dayHref
// päivän visaan) ja pelin loppunäkymä päivän visan jälkeen (palkinto).
// Copy-huomio: CD:n "klo 6 jälkeen" vaihdettu pelkkään "huomenna" —
// putki vaihtuu keskiyöllä (localDate), ei klo 6.

import { useEffect, useState } from "react";

/* Sama tavoiteporrastus kuin CD:n ehdotuksissa */
const TARGETS = [3, 7, 14, 30, 60, 100, 200, 365];

type PutkiState = { count: number; playedToday: boolean; best: number };

function readPutki(): PutkiState {
  try {
    const d = (n: Date) =>
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const best = Number(window.localStorage.getItem("tn_paivan_visa_putki_paras") ?? "0") || 0;
    const raw = window.localStorage.getItem("tn_paivan_visa_putki");
    if (!raw) return { count: 0, playedToday: false, best };
    const { count, last } = JSON.parse(raw) as { count: number; last: string };
    if (last === d(today)) return { count, playedToday: true, best: Math.max(best, count) };
    // Putki on voimassa (mutta tänään pelaamatta) jos viimeisin peli oli eilen
    if (last === d(yesterday)) return { count, playedToday: false, best: Math.max(best, count) };
    return { count: 0, playedToday: false, best };
  } catch {
    return { count: 0, playedToday: false, best: 0 };
  }
}

export default function PutkiCard({ dayHref }: { dayHref?: string }) {
  const [s, setS] = useState<PutkiState | null>(null);
  useEffect(() => setS(readPutki()), []);

  const count = s?.count ?? 0;
  const playedToday = s?.playedToday ?? false;
  const best = Math.max(s?.best ?? 0, count);
  const nextTarget = TARGETS.find((t) => t > count) ?? count + 100;

  /* Viikkorivi: 7 palloa, täysi viikko näyttää kaikki — kahdeksas päivä
     aloittaa uuden rivin (sama rytmi kuin vanhassa kortissa). */
  const filled = count === 0 ? 0 : ((count - 1) % 7) + 1;

  const msg =
    count === 0
      ? "Aloita putki tänään."
      : playedToday
        ? "Hienoa! Palaa huomenna, niin putki jatkuu."
        : "Pelaa päivän visa ennen puoltayötä, niin putki pysyy elossa.";

  return (
    <aside className="tn-putki-card">
      <div className="tn-putki-glow" aria-hidden />
      <div className="tn-putki-head">
        <div className="tn-putki-brand">
          <span className="tn-putki-flame" aria-hidden>
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c3.2 3.4 5.4 6 5.4 9.2A5.4 5.4 0 0 1 12 20.6a5.4 5.4 0 0 1-5.4-8.4C6.6 9 8.8 6.4 12 3z" />
              <path d="M12 17.6a2.3 2.3 0 0 0 2.3-2.3c0-1.4-1-2.4-2.3-3.9-1.3 1.5-2.3 2.5-2.3 3.9a2.3 2.3 0 0 0 2.3 2.3z" strokeOpacity=".5" />
            </svg>
          </span>
          <span className="tn-putki-label">Päivän putki</span>
        </div>
        <span className="tn-putki-pill" data-off={!playedToday || undefined}>
          <i />
          {playedToday ? "Tänään pelattu" : "Tänään pelaamatta"}
        </span>
      </div>

      <div className="tn-putki-num">
        <b>{count}</b>
        <span>{count === 1 ? "päivä" : "päivää"}</span>
      </div>
      <p className="tn-putki-msg">{msg}</p>

      <div className="tn-putki-week" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="tn-putki-day">
            {i < filled ? <b>✓</b> : <i />}
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="tn-putki-stats">
        <div className="tn-putki-stat">
          <span>Paras putki</span>
          <b>{best} {best === 1 ? "päivä" : "päivää"}</b>
        </div>
        <div className="tn-putki-stat">
          <span>Seuraava tavoite</span>
          <b>{nextTarget} päivää</b>
        </div>
      </div>

      {playedToday || !dayHref ? (
        <a className="tn-putki-cta" href="/2-0#kokoelmat">Pelaa lisää visoja</a>
      ) : (
        <a className="tn-putki-cta" href={dayHref}>Pelaa päivän visa</a>
      )}
    </aside>
  );
}
