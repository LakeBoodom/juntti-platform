"use client";
// SUOMEN KAUPUNGIT — pelilauta (kartta + valitun kaupungin paneeli) ja
// Kaikki kaupungit -ruudukko + suodatin. Yksi client-komponentti, koska
// kartan klikkaus, ruudukon klikkaus ja suodatin jakavat saman valintatilan
// (design_handoff_suomen_kaupungit/README.md §Interactions).
//
// LEIMAT (matkapassi): localStorage, avain "tn_kaupunkileimat" — JSON-array
// pelattujen kaupunkien id:istä. Kirjoitetaan GameClient.tsx:ssä pelin
// päättyessä (stampCity()), luetaan täällä. Ei kirjautumista (Heikin päätös
// 28.8.2026, sama periaate kuin Putki) — leimat ovat siis selainkohtaisia.
//
// Kortin klikkaus (README:n suositus): valitsee kaupungin JA scrollaa
// pelilaudan paneeliin (window.scrollTo, ei scrollIntoView — README:n
// nimenomainen varoitus).

import { useEffect, useMemo, useState } from "react";
import {
  KAUPUNGIT, KAUPUNKI_REGIONS, KAUPUNKI_REITTI, kaupunkiImg, SUOMI_PATH,
  type Kaupunki, type KaupunkiSuunta,
} from "@/lib/kaupungit";

export const KAUPUNKILEIMAT_KEY = "tn_kaupunkileimat";

function readStamps(): Set<string> {
  try {
    const raw = window.localStorage.getItem(KAUPUNKILEIMAT_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

const ACCENT = "#E8A320";
const STAMP = "#35D6A0";

type Props = {
  /** id -> onko visa julkaistu (pelattava). Kaikki 20 ovat 28.8.2026 alkaen, mutta
      rakenne kestää tulevan julkaisemattoman kaupungin ilman kaatumista. */
  publishedIds: Set<string>;
  /** id -> kysymysmäärä kannasta (ei kovakoodattu, KORTTISÄÄNTÖ-hengessä samoin kuin muut teemasivut). */
  questionCounts: Record<string, number>;
};

export default function KaupunkiPelilauta({ publishedIds, questionCounts }: Props) {
  const [selId, setSelId] = useState<string>("vantaa");
  const [region, setRegion] = useState<"Kaikki" | KaupunkiSuunta>("Kaikki");
  const [stamps, setStamps] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStamps(readStamps());
    // Toisesta välilehdestä/pelin päättymisestä palatessa tila voi olla muuttunut.
    const onFocus = () => setStamps(readStamps());
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const routeD = useMemo(() => {
    const pts = KAUPUNKI_REITTI
      .filter((id) => stamps.has(id))
      .map((id) => KAUPUNGIT.find((c) => c.id === id))
      .filter((c): c is Kaupunki => Boolean(c));
    if (pts.length < 2) return "";
    return pts.map((c, i) => `${i ? "L" : "M"}${c.px},${c.py}`).join(" ");
  }, [stamps]);

  const sel = KAUPUNGIT.find((c) => c.id === selId) ?? KAUPUNGIT[0];
  const selStamped = stamps.has(sel.id);
  const selPlayable = publishedIds.has(sel.id);
  const selHref = selPlayable ? `/peli?visa=${sel.quizSlug}` : null;

  function pick(id: string, scroll: boolean) {
    setSelId(id);
    if (scroll) {
      const el = document.getElementById("lauta");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }

  const grid = region === "Kaikki" ? KAUPUNGIT : KAUPUNGIT.filter((c) => c.region === region);

  return (
    <>
      {/* ══ PELILAUTA ══ */}
      <section id="lauta" className="tn-shell tnk2-lauta">
        <div className="tnk2-eyebrow-row">
          <span className="tnk2-eyebrow">Etappi 1</span>
          <span className="tnk2-eyebrow-line" />
        </div>
        <div className="tnk2-headrow">
          <h2 className="tnk2-h2">Valitse etappi</h2>
          <p className="tnk2-intro">Kartta on pelilauta. Napauta kaupunkia — leimatut paikat hehkuvat, loput odottavat vuoroaan.</p>
        </div>

        <div className="tnk2-lauta-cols">
          {/* Kartta */}
          <div className="tnk2-mapwrap">
            <div className="tnk2-mappanel">
              <div className="tnk2-mapstage">
                <svg className="tnk2-land" viewBox="0 0 600 1000" preserveAspectRatio="xMidYMid meet" aria-hidden>
                  <path d={SUOMI_PATH} fill="#221C10" stroke="#4A3F28" strokeWidth={2} strokeLinejoin="round" />
                </svg>

                {routeD && (
                  <svg className="tnk2-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <path
                      d={routeD} fill="none" stroke={STAMP} strokeWidth={2} strokeDasharray="7 9"
                      strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={0.85}
                    />
                  </svg>
                )}

                {KAUPUNGIT.map((c) => {
                  const stamped = stamps.has(c.id);
                  const active = c.id === selId;
                  const dot = active ? 20 : stamped ? 15 : 13;
                  const dotBg = stamped ? STAMP : "rgba(19,17,9,.9)";
                  const dotBorder = stamped ? "2px solid rgba(19,17,9,.6)" : `2px solid ${ACCENT}`;
                  const dotShadow = active
                    ? "0 0 0 4px rgba(245,240,230,.95)"
                    : stamped
                      ? "0 0 0 3px rgba(19,17,9,.65)"
                      : "0 0 0 2px rgba(19,17,9,.7)";
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="tnk2-dot-btn"
                      style={{ left: `${c.px}%`, top: `${c.py}%` }}
                      title={`${c.name} — ${c.slogan}`}
                      aria-label={`${c.name} — ${c.slogan}`}
                      onClick={() => pick(c.id, false)}
                    >
                      <span
                        className="tnk2-dot"
                        style={{ width: dot, height: dot, background: dotBg, border: dotBorder, boxShadow: dotShadow }}
                      />
                    </button>
                  );
                })}

                <div className="tnk2-flag" style={{ left: `${sel.px}%`, top: `${sel.py}%` }} aria-hidden>
                  {sel.name}
                </div>
              </div>

              <div className="tnk2-legend">
                <span className="item"><span className="dot" style={{ background: STAMP }} />Leimattu</span>
                <span className="item"><span className="dot" style={{ background: "rgba(19,17,9,.9)", border: `2px solid ${ACCENT}`, boxSizing: "border-box" }} />Pelaamatta</span>
                <span className="item"><span className="dot" style={{ background: "#0F0D07", border: "2px solid #131109", boxShadow: "0 0 0 2px #F5F0E6", boxSizing: "border-box" }} />Valittu</span>
              </div>
            </div>
          </div>

          {/* Valitun kaupungin paneeli */}
          <div className="tnk2-panelwrap">
            <div className="tnk2-panel">
              <div className="tnk2-panel-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kaupunkiImg(sel.id)} alt={sel.name} />
                <div className="tnk2-panel-pills">
                  {selStamped && <span className="tnk2-pill tnk2-pill-stamp">✓ Leimattu</span>}
                  <span className="tnk2-pill tnk2-pill-region">{sel.region}</span>
                </div>
                <div className="tnk2-panel-name">{sel.name}</div>
              </div>
              <div className="tnk2-panel-body">
                <p className="tnk2-panel-slogan">{sel.slogan}</p>
                <div className="tnk2-panel-stats">
                  <div>
                    <div className="tnk2-panel-stat-v">{questionCounts[sel.id] ?? 10}</div>
                    <div className="tnk2-panel-stat-k">kysymystä</div>
                  </div>
                  <div>
                    <div className="tnk2-panel-stat-v">{selStamped ? "✓ Leima ansaittu" : "Ei vielä leimattu"}</div>
                    <div className="tnk2-panel-stat-k">matkapassi</div>
                  </div>
                  <div>
                    <div className="tnk2-panel-stat-v tnk2-panel-stat-v--region">{sel.region}</div>
                    <div className="tnk2-panel-stat-k">suunta</div>
                  </div>
                </div>
                <div className="tnk2-panel-actions">
                  {selHref ? (
                    <a className="tnk2-cta" href={selHref}>Pelaa {sel.name} -visa</a>
                  ) : (
                    <span className="tnk2-cta" style={{ opacity: 0.6, pointerEvents: "none" }}>Tulossa</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ KAIKKI KAUPUNGIT ══ */}
      <section id="kaupungit" className="tnk2-allsection">
        <div className="tn-shell">
          <div className="tnk2-eyebrow-row">
            <span className="tnk2-eyebrow">Tai selaa kaikkia kaupunkeja</span>
            <span className="tnk2-eyebrow-line" />
          </div>
          <div className="tnk2-headrow">
            <h2 className="tnk2-h2">Kaikki kaupungit</h2>
            <p className="tnk2-intro">Selaa kaikki kohteet tai rajaa suunnan mukaan.</p>
          </div>

          <div className="tnk2-filters">
            <button
              type="button"
              className="tnk2-filter"
              aria-pressed={region === "Kaikki"}
              onClick={() => setRegion("Kaikki")}
            >
              Kaikki <span className="tnk2-filter-count">{KAUPUNGIT.length}</span>
            </button>
            {KAUPUNKI_REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                className="tnk2-filter"
                aria-pressed={region === r}
                onClick={() => setRegion(r)}
              >
                {r} <span className="tnk2-filter-count">{KAUPUNGIT.filter((c) => c.region === r).length}</span>
              </button>
            ))}
          </div>

          <div className="tnk2-grid">
            {grid.map((c) => {
              const stamped = stamps.has(c.id);
              const active = c.id === selId;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="tnk2-card"
                  aria-label={`${c.name} — ${c.slogan}`}
                  onClick={() => pick(c.id, true)}
                >
                  <div className="tnk2-card-face" data-sel={active} data-stamped={stamped}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={kaupunkiImg(c.id)} alt="" loading="lazy" />
                    {stamped && <span className="tnk2-card-stamp">✓ Leimattu</span>}
                    <div className="tnk2-card-text">
                      <div className="tnk2-card-name">{c.name}</div>
                      <div className="tnk2-card-slogan">{c.slogan}</div>
                    </div>
                    {stamped && <span className="tnk2-card-tint" aria-hidden />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
