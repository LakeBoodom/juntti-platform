"use client";
// TIETONIEKKA 2.0 — PUTKINAUHA (design_handoff_etusivu_2026 §4, lukittu 17.8.2026).
// Kompakti 64 px:n vaakanauha suoraan Päivän visan alla — Heikki valitsi tämän
// Liekkikortin tilalle etusivulla (Liekkikortti jää pelin loppunäkymään).
// README:n säännöt: EI isoa putkilukua, ei ennätystilastoja, ei tavoitekortteja,
// ei toista pelinappia. Selvästi toissijainen pinta (#141108, kevyempi kuin
// visakortti). Lukee samaa localStorage-avainta kuin PutkiCard/GameClient
// (tn_paivan_visa_putki {count, last}) — striikit säilyvät.

import { useEffect, useState } from "react";

type StreakState = { days: number; playedToday: boolean };

function readStreak(): StreakState {
  try {
    const d = (n: Date) =>
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const raw = window.localStorage.getItem("tn_paivan_visa_putki");
    if (!raw) return { days: 0, playedToday: false };
    const { count, last } = JSON.parse(raw) as { count: number; last: string };
    if (last === d(today)) return { days: count, playedToday: true };
    if (last === d(yesterday)) return { days: count, playedToday: false };
    return { days: 0, playedToday: false };
  } catch {
    return { days: 0, playedToday: false };
  }
}

const DAY_LABELS = ["ma", "ti", "ke", "to", "pe", "la", "su"];

export default function StreakStrip() {
  const [s, setS] = useState<StreakState | null>(null);
  useEffect(() => setS(readStreak()), []);

  const days = s?.days ?? 0;
  const playedToday = s?.playedToday ?? false;

  /* Viikkorivi = KULUVAN VIIKON edistymä: 7 palloa, nollautuu joka viikko
     (8. päivä aloittaa uuden rivin). Tämä on tarkoituksellista — putken
     TODELLINEN pituus näkyy aina isosta lukemasta ("N päivän putki"), ei
     tästä rivistä. Tämä päivä = seuraava tyhjä pallo (tai viimeisin täysi,
     jos tänään on jo pelattu). */
  const filled = days === 0 ? 0 : ((days - 1) % 7) + 1;
  const todayIdx = playedToday ? filled - 1 : filled;

  return (
    <aside className="tn-es-streak" aria-label="Päivän putki">
      <div className="tn-es-streak-left">
        <span className="tn-es-streak-flame" aria-hidden>
          🔥
        </span>
        {days === 0 ? (
          <span className="tn-es-streak-text">
            <b>Aloita putkesi</b>
            <span className="tn-es-streak-dot" aria-hidden>
              ·
            </span>
            <span className="tn-es-streak-sub">Pelaa päivän visa — ensimmäinen päivä lähtee tästä.</span>
          </span>
        ) : (
          <span className="tn-es-streak-text">
            <b>
              {days} päivän putki
            </b>
            <span className="tn-es-streak-dot" aria-hidden>
              ·
            </span>
            <span className="tn-es-streak-sub">{playedToday ? "Tänään pelattu" : "Tänään pelaamatta"}</span>
          </span>
        )}
      </div>
      <div className="tn-es-streak-week" aria-hidden>
        {DAY_LABELS.map((label, i) => (
          <span
            key={label}
            className="tn-es-streak-day"
            data-on={i < filled || undefined}
            data-today={i === todayIdx || undefined}
          >
            <span className="tn-es-streak-daylabel">{label}</span>
            <span className="tn-es-streak-dot2" />
          </span>
        ))}
      </div>
    </aside>
  );
}
