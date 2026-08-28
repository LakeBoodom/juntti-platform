"use client";
// TIETONIEKKA 2.0 — PÄIVÄN PUTKI -NAPPI ylätunnisteessa (design_handoff_etusivu_2026_prod,
// toteutettu 28.8.2026). Korvasi etusivun putkinauhan (StreakStrip, 17.–23.8.).
// - Liekki (inline-SVG, ei emoji) + lukema; teksti "päivän putki" / "Aloita putki" /
//   "· Tänään pelattu ✓" näkyy vain ≥ 1100 px (CSS piilottaa kapealla).
// - Klikkaus avaa popoverin: otsikko "Päivän putki" + "N päivää" + vihjeteksti.
//   Viikkorivi (7 päivää) JÄTETTY POIS designista Heikin päätöksellä 28.8.2026
//   (sama linja kuin 23.8.: viikkonäkymä poistetaan putkesta kokonaan).
// - Putki jatkuu MISTÄ TAHANSA visasta (Heikki 28.8.2026) — GameClient päivittää
//   samaa localStorage-avainta (tn_paivan_visa_putki {count, last}) jokaisen pelin
//   päätteeksi; vanhat putket säilyvät.
// - Esc, klikkaus ulkopuolelle tai uusi klikkaus sulkee; aria-expanded + role=dialog.

import { useEffect, useRef, useState } from "react";

type StreakState = { days: number; playedToday: boolean };

export const PUTKI_KEY = "tn_paivan_visa_putki";

function localDate(n: Date) {
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

export function readStreak(): StreakState {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const raw = window.localStorage.getItem(PUTKI_KEY);
    if (!raw) return { days: 0, playedToday: false };
    const { count, last } = JSON.parse(raw) as { count: number; last: string };
    if (last === localDate(today)) return { days: count, playedToday: true };
    if (last === localDate(yesterday)) return { days: count, playedToday: false };
    return { days: 0, playedToday: false };
  } catch {
    return { days: 0, playedToday: false };
  }
}

export default function StreakButton() {
  const [s, setS] = useState<StreakState>({ days: 0, playedToday: false });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setS(readStreak()), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { days, playedToday } = s;
  const streakText = days === 1 ? "1 päivä" : `${days} päivää`;
  const aria =
    days === 0
      ? "Putkea ei ole vielä aloitettu. Pelaa yksi visa aloittaaksesi."
      : `${days} päivän putki. ${playedToday ? "Tänään pelattu." : "Pelaa tänään jatkaaksesi putkea."}`;
  const hint =
    days === 0
      ? "Pelaa yksi visa päivässä ja rakenna oma Tietoniekka-putkesi."
      : playedToday
        ? "Tämä päivä on merkitty. Palaa huomenna jatkamaan putkea."
        : "Pelaa mikä tahansa visa tänään jatkaaksesi putkea.";

  return (
    <div ref={rootRef} className="tn-putki">
      <button
        type="button"
        className="tn-putki-btn"
        aria-label={aria}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="tn-putki-flame">
          <path d="M13.6 2.2c.3 3.2-.7 4.7-2.3 6.2-1.9 1.8-3.4 3.3-3.4 5.9 0 3.4 2.4 6 5.5 6s5.6-2.6 5.6-6c0-4-2.4-6.6-4-8.7-.5-.7-1-1.6-1.4-3.4Z" fill="currentColor" />
          <path d="M6.6 10.7c-1.4 1.4-2.1 3-2.1 4.6 0 3 2 5 4.4 5.4-1.4-1.2-2.1-2.9-2.1-4.6 0-2 .6-3.6 1.6-5.2-.5-.1-1.2-.1-1.8-.2Z" fill="currentColor" opacity=".55" />
          <path d="M13.3 11.4c.2 1.5-.5 2.2-1.2 3-.8.9-1.3 1.6-1.3 2.7 0 1.5 1.1 2.6 2.5 2.6s2.5-1.1 2.5-2.6c0-1.7-1.1-2.9-1.8-3.8-.3-.4-.6-.8-.7-1.9Z" fill="#0F0D07" />
        </svg>
        {days > 0 ? (
          <span aria-hidden="true" className="tn-putki-txt">
            <span>{days}</span>
            <span className="tn-putki-wide">päivän putki</span>
            {playedToday && (
              <span className="tn-putki-done">
                <span className="tn-putki-wide tn-putki-donetxt">· Tänään pelattu</span>
                <span>✓</span>
              </span>
            )}
          </span>
        ) : (
          <span aria-hidden="true" className="tn-putki-wide">Aloita putki</span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Päivän putki" className="tn-putki-pop">
          <div className="tn-putki-pop-head">
            <span className="tn-putki-pop-title">Päivän putki</span>
            <span className="tn-putki-pop-count">{days === 0 ? "Ei vielä putkea" : streakText}</span>
          </div>
          <p className="tn-putki-pop-hint">{hint}</p>
        </div>
      )}
    </div>
  );
}
