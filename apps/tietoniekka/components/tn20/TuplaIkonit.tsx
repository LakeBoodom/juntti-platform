// TUPLA TAI KUITTI — palkintoikonit ja kasat (CD "TN Tupla tai kuitti" 1C, 25.9.2026).
// Rakennussääntö: 48 px ruudukko, kaksi täyttösävyä, vaalea ääriviiva 1,8 px ja kiiltoviiva.
// Kiekko ja kolikko pinoutuvat torniksi, pallo/karkki/lahja pyramidiksi. Kasan korkeus =
// oikeiden vastausten määrä, eli jokainen tuplaus lisää yhden kerroksen.
// Symbolit ovat yhdessä spritessä (TuplaSprite), joka piirretään kerran sivulle.

import type { CSSProperties } from "react";
import type { PalkintoIkoni } from "@/lib/tuplaTaiKuitti";

export function TuplaSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <symbol id="ttk-kiekko" viewBox="0 0 48 48">
        <path d="M4 19v10a20 8 0 0 0 40 0V19z" fill="#1D2127" />
        <ellipse cx="24" cy="19" rx="20" ry="8" fill="#363D47" />
        <path d="M4 19a20 8 0 0 0 40 0" fill="none" stroke="#A9E9FA" strokeWidth="1.2" opacity=".5" />
        <path d="M4 19a20 8 0 0 1 40 0v10a20 8 0 0 1-40 0z" fill="none" stroke="#A9E9FA" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 15.6a16 5.4 0 0 1 12-2.6" fill="none" stroke="#EAF9FF" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="ttk-kolikko" viewBox="0 0 48 48">
        <path d="M4 21v6a20 8 0 0 0 40 0v-6z" fill="#B57C14" />
        <ellipse cx="24" cy="21" rx="20" ry="8" fill="#F2C35A" />
        <ellipse cx="24" cy="21" rx="13" ry="5" fill="none" stroke="#C98B1C" strokeWidth="1.8" />
        <path d="M4 21a20 8 0 0 1 40 0v6a20 8 0 0 1-40 0z" fill="none" stroke="#FFE3A0" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 17.6a16 5.4 0 0 1 12-2.6" fill="none" stroke="#FFF6DC" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="ttk-pallo" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" fill="#F5F0E6" />
        <path d="M24 17.5l6.2 4.5-2.4 7.3h-7.6l-2.4-7.3z" fill="#26221A" />
        <g stroke="#26221A" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M24 17.5V10" /><path d="M30.2 22l7.1-2.3" /><path d="M27.8 29.3l4.4 6" /><path d="M20.2 29.3l-4.4 6" /><path d="M17.8 22l-7.1-2.3" />
        </g>
        <g fill="#26221A">
          {[0, 72, 144, 216, 288].map((r) => (
            <path key={r} d="M20.4 6.5h7.2l-1.3 3.6h-4.6z" transform={r ? `rotate(${r} 24 24)` : undefined} />
          ))}
        </g>
        <circle cx="24" cy="24" r="18" fill="none" stroke="#F5F0E6" strokeWidth="1.8" />
        <path d="M11.5 17a14 14 0 0 1 6.5-7" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="ttk-karkki" viewBox="0 0 48 48">
        <path d="M14 24L4.5 15.5l2.6 8.5-2.6 8.5z" fill="#FFB35C" stroke="#FFD29A" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M34 24l9.5-8.5-2.6 8.5 2.6 8.5z" fill="#FFB35C" stroke="#FFD29A" strokeWidth="1.4" strokeLinejoin="round" />
        <ellipse cx="24" cy="24" rx="11.5" ry="9" fill="#FF8A2A" />
        <g stroke="#8A4DE8" strokeWidth="3" strokeLinecap="round"><path d="M18.5 31.5l3.4-14.8" /><path d="M26.2 32.4l3.3-14.6" /><path d="M14 27.2l1.6-6.6" /></g>
        <ellipse cx="24" cy="24" rx="11.5" ry="9" fill="none" stroke="#FFD29A" strokeWidth="1.8" />
        <path d="M16.5 20.5a8.5 6 0 0 1 5.5-3.6" fill="none" stroke="#FFF1DE" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="ttk-lahja" viewBox="0 0 48 48">
        <rect x="8" y="18" width="32" height="22" rx="3" fill="#E0457B" />
        <rect x="6" y="13" width="36" height="8" rx="2.5" fill="#F07AA3" />
        <rect x="21.5" y="13" width="5" height="27" fill="#F2C35A" />
        <path d="M24 13c-3-6-10-6-9-1.5 1 3 6 1.5 9 1.5zm0 0c3-6 10-6 9-1.5-1 3-6 1.5-9 1.5z" fill="none" stroke="#F2C35A" strokeWidth="2" strokeLinejoin="round" />
        <rect x="6" y="13" width="36" height="8" rx="2.5" fill="none" stroke="#FFC2D6" strokeWidth="1.6" />
      </symbol>
      {/* CD v0.2 (2A): aihekokoelmien palkinnot */}
      <symbol id="ttk-vinyyli" viewBox="0 0 48 48">
        <path d="M4 21v4a20 8 0 0 0 40 0v-4z" fill="#0F0D14" />
        <ellipse cx="24" cy="21" rx="20" ry="8" fill="#26222F" />
        <ellipse cx="24" cy="21" rx="15.5" ry="6.2" fill="none" stroke="#403A4E" strokeWidth="1.2" />
        <ellipse cx="24" cy="21" rx="11" ry="4.4" fill="none" stroke="#403A4E" strokeWidth="1.2" />
        <ellipse cx="24" cy="21" rx="6.2" ry="2.5" fill="#A855F7" />
        <ellipse cx="24" cy="21" rx="1.3" ry=".6" fill="#0F0D14" />
        <path d="M4 21a20 8 0 0 1 40 0v4a20 8 0 0 1-40 0z" fill="none" stroke="#D9C4FF" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 17.6a16 5.4 0 0 1 12-2.6" fill="none" stroke="#F3EBFF" strokeWidth="1.8" strokeLinecap="round" />
      </symbol>
      <symbol id="ttk-kapy" viewBox="0 0 48 48">
        <g transform="rotate(-35 24 25)">
          <path d="M24 8c7 0 11 8 11 17s-5 16-11 16-11-7-11-16 4-17 11-17z" fill="#8A5A2E" />
          <g fill="none" stroke="#D59A5E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 17l8 5 8-5" /><path d="M14 24.5l10 6 10-6" /><path d="M15.5 32l8.5 5 8.5-5" /></g>
          <path d="M24 8c7 0 11 8 11 17s-5 16-11 16-11-7-11-16 4-17 11-17z" fill="none" stroke="#E8C193" strokeWidth="1.8" />
          <path d="M24 8V3.5" stroke="#8FB86A" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M18.5 13.5a8 8 0 0 1 4-3.5" fill="none" stroke="#F6DDBA" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </symbol>
      <symbol id="ttk-lippu" viewBox="0 0 48 48">
        <path d="M2 24v3l30 7 14-9v-3l-14 9z" fill="#9D2E6B" />
        <path d="M2 24l14-9 30 7-14 9z" fill="#F472B6" />
        <path d="M25 17.1l-14 9" fill="none" stroke="#FFD1E8" strokeWidth="1.6" strokeDasharray="2 2" />
        <circle cx="31" cy="23" r="2.6" fill="#FFD1E8" />
        <path d="M2 24l14-9 30 7v3l-14 9-30-7z" fill="none" stroke="#FFD1E8" strokeWidth="1.8" strokeLinejoin="round" />
      </symbol>
      <symbol id="ttk-popcorn" viewBox="0 0 48 48">
        <g fill="#FFE7A8" stroke="#FFF7DE" strokeWidth="1.4"><circle cx="17" cy="16.5" r="5" /><circle cx="31" cy="16.5" r="5" /><circle cx="24" cy="12" r="5.5" /><circle cx="20.5" cy="19.5" r="4.5" /><circle cx="27.5" cy="19.5" r="4.5" /></g>
        <path d="M12 20h24l-3 23H15z" fill="#F5F0E6" />
        <path d="M17 20l1.4 23h4l-.4-23zM26 20l-.4 23h4l1.4-23z" fill="#FF3D9E" />
        <path d="M12 20h24l-3 23H15z" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" />
      </symbol>
      <symbol id="ttk-lukko" viewBox="0 0 16 18">
        <path d="M4.5 8.5V5.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <rect x="2" y="8" width="12" height="9.2" rx="2.4" fill="currentColor" />
      </symbol>
      <symbol id="ttk-lukko-auki" viewBox="0 0 16 18">
        <path d="M4.5 8.5V4.2a3.5 3.5 0 0 1 7 0v.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <rect x="2" y="8" width="12" height="9.2" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </symbol>
    </svg>
  );
}

export function Symboli({ id, koko, style, className }: { id: string; koko: number | [number, number]; style?: CSSProperties; className?: string }) {
  const [w, h] = Array.isArray(koko) ? koko : [koko, koko];
  return (
    <svg className={className} style={{ width: w, height: h, flexShrink: 0, ...style }} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

/** Symbolin tyhjä reunus ylhäältä ja alhaalta (osuus koosta) — kasa pakataan tiiviiksi. */
const PAD: Record<PalkintoIkoni, number> = { kiekko: 0.23, kolikko: 0.27, pallo: 0.125, karkki: 0.3, lahja: 0.17, vinyyli: 0.31, kapy: 0.1, lippu: 0.29, popcorn: 0.1 };
/** Litteät palkinnot pinoutuvat torniksi (kerrosväli), muut kasautuvat pyramidiksi (CD v0.2). */
const TORNI: Partial<Record<PalkintoIkoni, number>> = { kiekko: 0.21, kolikko: 0.15, vinyyli: 0.12, lippu: 0.11 };
const RIVIVALI: Partial<Record<PalkintoIkoni, number>> = { karkki: 0.4, kapy: 0.5, lahja: 0.6 };
const HEILUNTA = [0, 1.5, -1, 2, -2, 1, -1.5, 2, 0, -1];

type Pala = { x: number; y: number; op: number; i: number };

/** Kasan palat (CD:n stack()): n = oikeiden vastausten määrä (0 → haalea ääriviivapala). */
export function kasanPalat(p: PalkintoIkoni, n: number, s: number, tavoite = false): { palat: Pala[]; w: number; h: number } {
  const pad = PAD[p] * s;
  if (n <= 0) return { palat: [{ x: 0, y: -pad, op: 0.22, i: 0 }], w: s, h: s - 2 * pad };
  const torni = TORNI[p];
  if (torni != null) {
    const askel = s * torni;
    const palat = Array.from({ length: n }, (_, i) => ({ x: s * 0.06 + HEILUNTA[i % 10] * s * 0.025, y: i * askel - pad, op: 1, i }));
    if (tavoite) palat[n - 1].op = 0.3;
    return { palat, w: s * 1.12, h: s - 2 * pad + (n - 1) * askel };
  }
  // Pyramidi: 4 + 3 + 2 + 1 = enintään 10 palaa
  const rivit = [4, 3, 2, 1];
  const dx = s * 0.74;
  const dy = s * (RIVIVALI[p] ?? 0.56);
  const palat: Pala[] = [];
  let k = 0;
  let R = 0;
  for (let r = 0; r < 4 && k < n; r++) {
    const c = Math.min(rivit[r], n - k);
    for (let j = 0; j < c; j++) palat.push({ x: (r * dx) / 2 + j * dx, y: r * dy - pad, op: 1, i: k++ });
    R = r + 1;
  }
  if (tavoite) palat[n - 1].op = 0.3;
  return { palat, w: s + (Math.min(n, 4) - 1) * dx, h: s - 2 * pad + (R - 1) * dy };
}

export function Kasa({ p, n, s, tavoite, uusin, className }: { p: PalkintoIkoni; n: number; s: number; tavoite?: boolean; /** animoi päällimmäisen palan (tuplaus) */ uusin?: boolean; className?: string }) {
  const k = kasanPalat(p, n, s, tavoite);
  return (
    <span className={`ttk-kasa ${className ?? ""}`} style={{ width: k.w, height: k.h }} aria-hidden="true">
      {k.palat.map((pl) => (
        <svg
          key={pl.i}
          className={uusin && pl.i === n - 1 && !tavoite ? "ttk-pala-uusi" : undefined}
          style={{ left: pl.x, bottom: pl.y, width: s, height: s, opacity: pl.op, ["--i" as string]: pl.i }}
        >
          <use href={`#ttk-${p}`} />
        </svg>
      ))}
    </span>
  );
}
