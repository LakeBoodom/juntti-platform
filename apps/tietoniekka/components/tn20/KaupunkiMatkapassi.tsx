"use client";
// SUOMEN KAUPUNGIT — hero-matkapassikortti. Lukee samaa localStorage-avainta
// kuin KaupunkiPelilauta (tn_kaupunkileimat) itsenäisesti — sama periaate
// kuin StreakStrip lukee Putki-tilan omana pienenä komponenttinaan sen
// sijaan että serveri välittäisi client-tilaa proppina.

import { useEffect, useState } from "react";
import { KAUPUNGIT, KAUPUNKI_REITTI } from "@/lib/kaupungit";
import { KAUPUNKILEIMAT_KEY } from "./KaupunkiPelilauta";

function readStampCount(): number {
  try {
    const raw = window.localStorage.getItem(KAUPUNKILEIMAT_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.filter((id) => KAUPUNGIT.some((c) => c.id === id)).length : 0;
  } catch {
    return 0;
  }
}

function nextCityName(visited: Set<string>): string {
  const nextId = KAUPUNKI_REITTI.find((id) => !visited.has(id));
  if (!nextId) return "Koko Suomi kierretty";
  return KAUPUNGIT.find((c) => c.id === nextId)?.name ?? "Koko Suomi kierretty";
}

export function KaupunkiMatkapassiBadge() {
  const [visitedN, setVisitedN] = useState<number | null>(null);
  useEffect(() => setVisitedN(readStampCount()), []);
  return (
    <span className="tnk2-ctabox-badge">
      Matkapassisi {visitedN ?? 0}/{KAUPUNGIT.length}
    </span>
  );
}

export default function KaupunkiMatkapassi() {
  const [visitedN, setVisitedN] = useState<number | null>(null);
  const [next, setNext] = useState("");

  useEffect(() => {
    const read = () => {
      let visited: Set<string>;
      try {
        const raw = window.localStorage.getItem(KAUPUNKILEIMAT_KEY);
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        visited = new Set(Array.isArray(arr) ? arr : []);
      } catch {
        visited = new Set();
      }
      setVisitedN(readStampCount());
      setNext(nextCityName(visited));
    };
    read();
    window.addEventListener("focus", read);
    document.addEventListener("visibilitychange", read);
    return () => {
      window.removeEventListener("focus", read);
      document.removeEventListener("visibilitychange", read);
    };
  }, []);

  const totalN = KAUPUNGIT.length;
  const visited = visitedN ?? 0;
  const remaining = totalN - visited;
  const pct = totalN > 0 ? Math.round((visited / totalN) * 100) : 0;

  return (
    <div className="tnk2-passport">
      <div className="tnk2-passport-row1">
        <span className="tnk2-passport-label">Matkapassi</span>
        <span className="tnk2-passport-pct">{pct}%</span>
      </div>
      <div className="tnk2-passport-num">
        <b>{visited}</b>
        <span className="tot">/ {totalN}</span>
        <span className="lbl">kaupunkia leimattu</span>
      </div>
      <div className="tnk2-passport-bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="tnk2-passport-stats">
        <div>
          <div className="tnk2-passport-stat-v">{remaining}</div>
          <div className="tnk2-passport-stat-k">kaupunkia jäljellä</div>
        </div>
        <div>
          <div className="tnk2-passport-stat-v">{visitedN === null ? "…" : next}</div>
          <div className="tnk2-passport-stat-k">seuraava etappi</div>
        </div>
      </div>
    </div>
  );
}
