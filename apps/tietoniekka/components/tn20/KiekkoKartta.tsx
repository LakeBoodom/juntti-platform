"use client";
// TIETONIEKKA 2.0 — Suomi-kaukalokartta (Jääkiekko-teemasivun 1. erä).
// CD "TN Jaakiekko -teemasivu" 22.8.2026, README luvut 1–1d — sivuston ainoa
// interaktiivinen teemasivukomponentti. Kolme kerrosta pohjakuvan päällä:
// SVG-johtoviivat (pointer-events: none) + pallopainikkeet + nimilaput,
// kaikki prosenttikoordinaateilla kuvan laatikosta (teams.json verbatim).
// - Säiliön aspect-ratio 1050/1498 = kuvan tarkka suhde (yleisin bugi jos
//   poikkeaa: kaikki pallot siirtyvät).
// - stroke-width + vector-effect ATTRIBUUTTEINA (Safari).
// - Koko interaktio: pallo, nimilappu ja paitaseinän kortti valitsevat saman
//   seuran. Ei zoomia, panorointia, hoverpaneeleja eikä taulukkonäkymää.
// - Nimilaput + viivat piilotetaan alle 600 px:n KARTAN leveydellä
//   (@container — ainoa sallittu kyselypohjainen katkos).
// - Kosketusalue 44×44 px joka pallolle (::before); päällekkäisissä pareissa
//   (Tappara/Ilves, HIFK/Jokerit) pienemmän SM-määrän seura on päällä.
// - Julkaisematon visa: CTA → "Visa tulossa" -tilamerkki (README luku 3).
// Tyylit: app/2-0/jaakiekko.css (.tnj-*).

import { useMemo, useRef, useState } from "react";
import { JK_MAP_IMG, type JkTeam } from "@/lib/jaakiekko";

export type KarttaTeam = JkTeam & {
  /** Pelilinkki kun julkaistu visa on olemassa, muuten null → "Visa tulossa" */
  playHref: string | null;
};

export default function KiekkoKartta({
  teams,
  defaultTeamId,
  footnote,
}: {
  teams: KarttaTeam[];
  defaultTeamId: string;
  footnote: string;
}) {
  const defaultIndex = Math.max(0, teams.findIndex((t) => t.id === defaultTeamId));
  const [sel, setSel] = useState(defaultIndex);
  const team = teams[sel] ?? teams[0];
  const groupRef = useRef<HTMLDivElement>(null);

  /** Pallonapautus valitsee LÄHIMMÄN pallon napautuspisteestä. Miksi: 44 px:n
      kosketusalueet menevät limittäin tiheissä pareissa (HIFK/Jokerit ~19 px
      päässä toisistaan mobiilikartalla) → päällimmäinen nappi kaappasi myös
      naapurin pallon päälle osuneet napautukset, eikä HIFK:ta voinut valita
      kapealla, jossa nimilaput ovat piilossa. Näppäimistöaktivointi (detail 0)
      valitsee suoraan oman seuransa. */
  const pickNearest = (e: React.MouseEvent, fallback: number) => {
    const el = groupRef.current;
    if (!el || e.detail === 0) return setSel(fallback);
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return setSel(fallback);
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    let best = fallback;
    let bd = Infinity;
    teams.forEach((t, i) => {
      const dx = (t.x - px) * r.width;
      const dy = (t.y - py) * r.height;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    });
    setSel(best);
  };

  /* Pallon koko designyksiköissä (README 1a: 13 + sm * 0.62 → 13…26) */
  const dots = useMemo(
    () =>
      teams.map((t) => ({
        size: Math.round(13 + t.sm * 0.62),
        lineX: t.anchor === "l" ? t.labelX + 0.4 : t.labelX - 0.4,
        /* Päällekkäiset osuma-alueet: pienempi SM-määrä päällimmäiseksi */
        z: 3 + (30 - Math.min(t.sm, 27)),
      })),
    [teams],
  );

  return (
    <div className="tnj-stage">
      {/* ─── Kartta ─── */}
      <div className="tnj-map-col">
        <div className="tnj-map">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="tnj-map-bg" src={JK_MAP_IMG} alt="Suomi jääkiekkokaukalona" />
          <svg className="tnj-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {teams.map((t, i) => (
              <line
                key={t.id}
                x1={t.x}
                y1={t.y}
                x2={dots[i].lineX}
                y2={t.labelY}
                stroke={i === sel ? "#4FD1F5" : "rgba(130,120,104,.9)"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div role="group" aria-label="Seurat kartalla" className="tnj-map-group" ref={groupRef}>
            {teams.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className="tnj-map-dot"
                data-active={i === sel || undefined}
                title={`${t.name} · ${t.city}`}
                aria-label={`${t.name} · ${t.city}`}
                aria-pressed={i === sel}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  zIndex: dots[i].z,
                  background: t.color,
                  ["--dot" as string]: dots[i].size,
                }}
                onClick={(e) => pickNearest(e, i)}
              />
            ))}
            {teams.map((t, i) => (
              <button
                key={`${t.id}-label`}
                type="button"
                className="tnj-map-label"
                data-active={i === sel || undefined}
                data-anchor={t.anchor}
                aria-label={`${t.name} · ${t.city}`}
                aria-pressed={i === sel}
                style={{ left: `${t.labelX}%`, top: `${t.labelY}%` }}
                onClick={(e) => pickNearest(e, i)}
              >
                {t.short}
              </button>
            ))}
          </div>
        </div>
        <p className="tnj-map-note">{footnote}</p>
      </div>

      {/* ─── Valitun seuran kortti + paitaseinä ─── */}
      <div className="tnj-side">
        {/* Ruudunlukijalle: valinnan vaihto luetaan (vain nimi ja kaupunki) */}
        <span className="tnj-sr" aria-live="polite">
          {team.name} · {team.city}
        </span>

        <article className="tnj-team" style={{ ["--tnj-team" as string]: team.color }}>
          <div className="tnj-team-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/20/jaakiekko/jk-${team.id}.webp`} alt={team.name} />
            <div className="tnj-team-pills">
              <span className="tnj-pill">{team.city}</span>
              <span className="tnj-pill">{team.badge}</span>
            </div>
            <h3 className="tnj-team-name">{team.name}</h3>
          </div>
          <div className="tnj-team-body">
            <p className="tnj-team-hook">{team.hook}</p>
            {team.playHref ? (
              <a className="tnj-cta" href={team.playHref}>
                Pelaa {team.name} -visa
              </a>
            ) : (
              <span className="tnj-cta-tulossa" aria-disabled="true">
                Visa tulossa
              </span>
            )}
          </div>
        </article>

        <div className="tnj-wall">
          <div className="tnj-wall-head">Paitaseinä · {teams.length} seuraa</div>
          <div className="tnj-wall-grid">
            {teams.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className="tnj-wall-card"
                data-active={i === sel || undefined}
                aria-label={`${t.name} · ${t.city}`}
                aria-pressed={i === sel}
                onClick={() => setSel(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/20/jaakiekko/jk-${t.id}.webp`} alt="" loading="lazy" />
                <span className="tnj-wall-short">{t.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
