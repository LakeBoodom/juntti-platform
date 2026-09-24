// KOKOELMASIVUJEN MOBIILIRUNKO (CD "TN Kokoelmasivut – mobiili" 24.9.2026).
// Yksi sankari kaikille 15 kokoelmasivulle ≤ 768 px: kuvanauha (tai sävypohja)
// → tunniste → otsikko (aksentti viimeisellä rivillä, kokonaisina sanoina) →
// ingressi → tilastorivi tekstinä → valinnainen edistymismittari → hiusviiva.
// Ei painiketta (Heikki 24.9.): ensimmäinen toiminto on ensimmäisen osion kortti.
//
// Sivun oma sankari näkyy edelleen työpöydällä; mobiilissa se piilotetaan
// luokalla "tnms-desk" ja tämä komponentti näytetään (mobiilisankari.css).
// Näkyvissä on aina vain toinen h1 — piilotettu (display: none) ei ole
// ruudunlukijan puussa.

import type { CSSProperties, ReactNode } from "react";

export type SankariTilasto = { n?: string | number; label: string };

export function MobiiliSankari(p: {
  /** image = kuva yllä, teksti alla · overlay = teksti kuvan päällä varjostuksella · plain = sävypohja */
  variant?: "image" | "overlay" | "plain";
  /** Kokoelman aksenttiväri: otsikon viimeinen rivi, tunniste, tilastojen luvut */
  accent: string;
  /** Sankaripohjan sävy (oletus: aksentti 10 % mustan päällä) */
  tint?: string;
  eyebrow?: string;
  /** Otsikko riveittäin — aksentti aina viimeisellä rivillä */
  title: readonly string[];
  lead: string;
  stats?: SankariTilasto[];
  image?: { src: string; position?: string; alt?: string };
  /** Kuvattoman sivun kuviotekstuuri */
  pattern?: "rays" | "stripes";
  /** Sankarimoduuli: vain edistymismittari */
  module?: ReactNode;
}) {
  const variant = p.variant ?? (p.image ? "image" : "plain");
  const rivit = p.title.filter(Boolean);
  const alku = rivit.slice(0, -1);
  const loppu = rivit[rivit.length - 1] ?? "";
  // Pisin sana ratkaisee koon: 34 px, laskee kohti 30 px:ää niin, ettei sana
  // koskaan katkea eikä leikkaudu (Archivo 900 versaalina ≈ 0,78 em / merkki).
  const pisin = Math.max(...rivit.flatMap((r) => r.split(/\s+/)).map((w) => w.length), 1);
  const style = {
    "--tnms-acc": p.accent,
    "--tnms-title-size": `min(34px, max(30px, calc((100vw - 2 * var(--page-x)) / ${(pisin * 0.78).toFixed(2)})))`,
    ...(p.tint ? { "--tnms-tint": p.tint } : {}),
  } as CSSProperties;
  return (
    <section className="tnms" data-variant={variant} data-pattern={p.pattern} data-module={p.module ? "" : undefined} style={style} aria-label="Kokoelman esittely">
      {p.image && variant !== "plain" && (
        <div className="tnms-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image.src} alt={p.image.alt ?? ""} style={p.image.position ? { objectPosition: p.image.position } : undefined} fetchPriority="high" />
        </div>
      )}
      <div className="tnms-body">
        {p.eyebrow && <div className="tnms-eyebrow">{p.eyebrow}</div>}
        <h1 className="tnms-title" lang="fi">
          {alku.map((r) => (
            <span key={r} className="tnms-title-l">{r}</span>
          ))}
          <span className="tnms-title-l tnms-title-acc">{loppu}</span>
        </h1>
        <p className="tnms-lead">{p.lead}</p>
        {p.stats && p.stats.length > 0 && (
          <p className="tnms-stats">
            {p.stats.slice(0, 3).map((s, i) => (
              <span key={s.label}>
                {i > 0 && <span className="tnms-dot" aria-hidden> · </span>}
                {s.n != null && <b>{s.n}</b>}
                {s.n != null ? " " : ""}
                {s.label}
              </span>
            ))}
          </p>
        )}
        {p.module}
      </div>
    </section>
  );
}

/** Osion aloitus — tunniste aksentilla + hiusviiva + määrä oikealla, otsikko, selite. */
export function MobiiliOsioOtsikko(p: { eyebrow: string; count?: string; title: string; note?: string; accent?: string }) {
  return (
    <div className="tnms-sechead" style={p.accent ? ({ "--tnms-acc": p.accent } as CSSProperties) : undefined}>
      <div className="tnms-sechead-row">
        <span className="tnms-sechead-eyebrow">{p.eyebrow}</span>
        <i aria-hidden />
        {p.count && <span className="tnms-sechead-count">{p.count}</span>}
      </div>
      <h2 className="tnms-sechead-title">{p.title}</h2>
      {p.note && <p className="tnms-sechead-note">{p.note}</p>}
    </div>
  );
}

/** Alakokoelmat yksipalstaisena listana (Jalkapallon malli) — ei orpoa solua. */
export function MobiiliLista(p: {
  accent: string;
  eyebrow: string;
  count?: string;
  title: string;
  rows: Array<{ kicker?: string; name: string; meta?: string; href: string; color?: string }>;
  children?: ReactNode;
}) {
  return (
    <section className="tnms-first" style={{ "--tnms-acc": p.accent } as CSSProperties}>
      <MobiiliOsioOtsikko eyebrow={p.eyebrow} count={p.count} title={p.title} />
      <ul className="tnms-list">
        {p.rows.map((r) => (
          <li key={r.href + r.name}>
            <a href={r.href}>
              <span className="tnms-list-main">
                {r.kicker && <span className="tnms-list-kicker" style={r.color ? { color: r.color } : undefined}>{r.kicker}</span>}
                <span className="tnms-list-name">{r.name}</span>
              </span>
              {r.meta && <span className="tnms-list-meta">{r.meta}</span>}
            </a>
          </li>
        ))}
      </ul>
      {p.children}
    </section>
  );
}

/** Edistymismittari (Historia, Suomen kaupungit) — yksi komponentti, ei painiketta. */
export function MobiiliEdistyminen(p: { label: string; pct: number; lines: string[] }) {
  const pct = Math.max(0, Math.min(100, Math.round(p.pct)));
  return (
    <div className="tnms-progress">
      <div className="tnms-progress-row">
        <span className="tnms-progress-label">{p.label}</span>
        <span className="tnms-progress-pct">{pct} %</span>
      </div>
      <div className="tnms-progress-bar"><i style={{ width: `${Math.max(pct, 2)}%` }} /></div>
      {p.lines.map((l) => (
        <p key={l} className="tnms-progress-note">{l}</p>
      ))}
    </div>
  );
}
