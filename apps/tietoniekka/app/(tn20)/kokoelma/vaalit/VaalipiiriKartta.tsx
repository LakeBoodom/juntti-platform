"use client";
// Vaalipiirikartta (CD 5.10.2026): 13 vaalipiiriä täytettynä paikkamäärän mukaan, hover/napautus →
// tooltip ja listarivin korostus; Ahvenanmaa ja Helsinki erillisinä laattoina (pinta-ala liian pieni).
// Kartta ja lista ovat palvelimen HTML:ssä; tila vain korostusta varten.
import { useState } from "react";
import type { VpRivi } from "@/lib/vaalit/data";
import { VP_H, VP_W } from "@/lib/vaalit/geometria";

const PIENET = ["Ahvenanmaa", "Helsinki"];

export default function VaalipiiriKartta({ rivit }: { rivit: VpRivi[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...rivit.map((r) => r.paikat), 1);
  const yht = rivit.reduce((s, r) => s + r.paikat, 0);
  const tayta = (r: VpRivi) => {
    if (r.k === hover) return "#B4A5FF";
    const t = Math.sqrt(r.paikat / max);
    const a = [36, 31, 51], b = [78, 66, 138];
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  };
  const hv = rivit.find((r) => r.k === hover);
  const pois = () => setHover(null);
  const jarj = [...rivit].sort((a, b) => a.k.localeCompare(b.k));

  return (
    <div className="vl-vp">
      <div className="vl-vp-kartta">
        <div className="vl-vp-svgwrap">
          <svg viewBox={`0 0 ${VP_W} ${VP_H}`} role="img" aria-label={`Suomen kartta, jossa ${rivit.length} vaalipiiriä ja niiden paikkamäärät`}>
            {rivit.map((r) => (
              <path
                key={r.k}
                d={r.d}
                fill={tayta(r)}
                stroke="#17140E"
                strokeWidth={2}
                strokeLinejoin="round"
                onMouseEnter={() => setHover(r.k)}
                onMouseLeave={pois}
                onClick={() => setHover(r.k)}
              />
            ))}
            {rivit
              .filter((r) => !PIENET.includes(r.nimi))
              .map((r) => (
                <text key={r.k} x={r.cx} y={r.cy + 8} textAnchor="middle" className="vl-vp-luku" fill={r.k === hover ? "#131109" : "#F5F0E6"}>
                  {r.paikat}
                </text>
              ))}
            {rivit
              .filter((r) => PIENET.includes(r.nimi))
              .map((r) => (
                <circle key={r.k} cx={r.cx} cy={r.cy} r={11} fill="none" stroke={r.k === hover ? "#B6FF3C" : "#F5F0E6"} strokeWidth={3} />
              ))}
          </svg>
          {hv && (
            <div className="vl-vp-tip" role="status" style={{ left: `${(hv.cx / VP_W) * 100}%`, top: `${(hv.cy / VP_H) * 100}%` }}>
              <span className="vl-vp-tip-nimi">
                {hv.nimi} · <span>{hv.paikat} {hv.paikat === 1 ? "paikka" : "paikkaa"}</span>
              </span>
              {hv.alue && <span className="vl-vp-tip-alue">{hv.alue}</span>}
            </div>
          )}
        </div>
        <div className="vl-vp-laatat">
          {PIENET.map((n) => rivit.find((r) => r.nimi === n))
            .filter((r): r is VpRivi => !!r)
            .map((r) => (
              <button
                key={r.k}
                type="button"
                className={r.k === hover ? "vl-vp-laatta on" : "vl-vp-laatta"}
                onMouseEnter={() => setHover(r.k)}
                onMouseLeave={pois}
                onFocus={() => setHover(r.k)}
                onBlur={pois}
                onClick={() => setHover(r.k)}
              >
                <span className="vl-vp-laatta-nimi">
                  <span className="vl-vp-rengas" aria-hidden="true" />
                  {r.nimi}
                </span>
                <span className="vl-vp-laatta-luku">{r.paikat}</span>
              </button>
            ))}
        </div>
      </div>
      <ol className="vl-vp-lista">
        {jarj.map((r) => (
          <li key={r.k} className={r.k === hover ? "on" : ""} onMouseEnter={() => setHover(r.k)} onMouseLeave={pois}>
            <span className="vl-vp-k">{r.k}</span>
            <span className="vl-vp-nimet">
              <span className="vl-vp-nimi">{r.nimi}</span>
              {r.alue && <span className="vl-vp-alue">{r.alue}</span>}
            </span>
            <span className="vl-vp-arvo">
              <span className="vl-vp-palkki">
                <span style={{ width: `${(r.paikat / max) * 100}%` }} />
              </span>
              <span className="vl-vp-paikat">{r.paikat}</span>
            </span>
          </li>
        ))}
        <li className="vl-vp-yht">
          <span>Yhteensä</span>
          <span>{yht}</span>
        </li>
      </ol>
    </div>
  );
}
