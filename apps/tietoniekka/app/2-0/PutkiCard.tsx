"use client";
// Putki-striikki — lukee saman localStorage-avaimen kuin pelin putkilogiikka
// (tn_paivan_visa_putki, {count, last}). Ei kirjautumista.

import { useEffect, useState } from "react";

function readPutki(): number {
  try {
    const raw = window.localStorage.getItem("tn_paivan_visa_putki");
    if (!raw) return 0;
    const { count, last } = JSON.parse(raw) as { count: number; last: string };
    const today = new Date();
    const d = (n: Date) =>
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // Putki on voimassa jos viimeisin peli on tänään tai eilen
    if (last === d(today) || last === d(yesterday)) return count;
    return 0;
  } catch {
    return 0;
  }
}

export default function PutkiCard() {
  const [putki, setPutki] = useState<number | null>(null);
  useEffect(() => setPutki(readPutki()), []);

  const count = putki ?? 0;
  const dots = Array.from({ length: 7 }, (_, i) => i < count % 7 || (count > 0 && count % 7 === 0));

  return (
    <aside className="tn-putki-card">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 30 }}>🔥</span>
        <div>
          <div className="tn-putki-count">{count}</div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--tn-text-muted)", fontWeight: 700 }}>
            Päivän putki
          </div>
        </div>
      </div>
      <div className="tn-putki-dots">
        {dots.map((on, i) => (
          <i key={i} data-on={on} />
        ))}
      </div>
      <p style={{ margin: 0, color: "var(--tn-text-muted)", fontSize: 13.5, lineHeight: 1.5 }}>
        {count === 0
          ? "Pelaa päivän visa, niin putki syttyy. Huomenna se jatkuu."
          : count % 7 === 0
            ? "Täysi viikko! Pidä liekki elossa — huomenna uusi visa."
            : `${7 - (count % 7)} päivää lisää, niin viikko on täysi. Ei paineita.`}
      </p>
    </aside>
  );
}
