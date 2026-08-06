"use client";
// HISTORIA-AIKAJANA — clientkerros (CD "Tietoniekka - Historia", 6.8.2026)
// Vastaa: pelattu-merkinnät (localStorage tn_played_quizzes, kirjoitetaan
// GameClientin endGamessa), oma edistyminen -paneeli, Jana/Kaudet-vaihto.
// Ei vaikeustasoja (lukittu 6.8.2026). Ei kirjautumista.

import { useEffect, useMemo, useState } from "react";

export type HistoriaCard = { id: string; title: string; questions: number; href: string; tag?: string };
export type HistoriaEra = { key: string; years: string; short: string; title: string; desc: string; quizzes: HistoriaCard[] };
export type HistoriaData = { eras: HistoriaEra[]; themes: HistoriaCard[]; lapileikkaus: HistoriaCard | null };

export default function HistoriaClient({ data }: { data: HistoriaData }) {
  const [played, setPlayed] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"jana" | "kaudet">("jana");

  useEffect(() => {
    try {
      const arr = JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[];
      setPlayed(new Set(arr));
    } catch { /* no-op */ }
  }, []);

  const eraQuizzes = useMemo(() => data.eras.flatMap((e) => e.quizzes), [data]);
  const totalQuizzes = eraQuizzes.length + data.themes.length + (data.lapileikkaus ? 1 : 0);
  const playedEra = eraQuizzes.filter((q) => played.has(q.id)).length;
  const pct = eraQuizzes.length > 0 ? Math.round((playedEra / eraQuizzes.length) * 100) : 0;
  const nextUp = eraQuizzes.find((q) => !played.has(q.id)) ?? null;
  const continueTarget = nextUp ?? data.lapileikkaus;

  const eraState = (e: HistoriaEra) => {
    const p = e.quizzes.filter((q) => played.has(q.id)).length;
    return { p, n: e.quizzes.length, done: e.quizzes.length > 0 && p === e.quizzes.length, some: p > 0 };
  };

  const Dot = ({ on, half }: { on: boolean; half?: boolean }) => (
    <i className="tnh-dot" data-on={on || undefined} data-half={half || undefined} aria-hidden />
  );

  return (
    <main className="tnh" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      {/* ─── Hero: typografinen (CD) ─── */}
      <div className="tn-shell">
        <section className="tnh-hero">
          <nav style={{ fontSize: 13, fontWeight: 700, color: "#8E8676", marginBottom: 14 }}>
            <a href="/2-0" style={{ color: "inherit", textDecoration: "none" }}>Kokoelmat</a>
            {" / "}
            <span style={{ color: "var(--tn-gold)" }}>Historia</span>
          </nav>
          <h1 className="tn-display tnh-title">
            Suomen<br /><span>historia</span>
          </h1>
          <p className="tnh-lede">
            Kivikaudesta nykypäivään. Jokainen aikakausi on oma visansa — pelaa järjestyksessä tai poimi jakso, joka kiinnostaa juuri nyt.
          </p>
          <div className="tnh-chips">
            <span className="tnh-chip" data-accent="true">{totalQuizzes} visaa</span>
            <span className="tnh-chip">{data.eras.length} aikakautta</span>
            <span className="tnh-chip">Aina ilmainen</span>
          </div>

          {/* Oma edistyminen — näytetään vasta kun jotain on pelattu */}
          {continueTarget && (
            <div className="tnh-progress">
              <div className="tnh-progress-info">
                <span className="tnh-progress-label">Oma edistyminen</span>
                <span className="tnh-progress-pct">{pct}%</span>
                <div className="tnh-bar"><i style={{ width: `${pct}%` }} /></div>
                <span className="tnh-progress-note">
                  {playedEra}/{eraQuizzes.length} aikakausivisaa pelattu
                  {nextUp ? <> · seuraava: {nextUp.title}</> : <> · kaikki pelattu!</>}
                </span>
              </div>
              <a className="tnh-cta" href={continueTarget.href}>
                {playedEra === 0 ? "Aloita aikajana →" : nextUp ? "Jatka aikajanaa →" : "Pelaa läpileikkaus →"}
              </a>
            </div>
          )}
        </section>

        {/* ─── Aikakausien pikanavi ─── */}
        <nav className="tnh-eranav" aria-label="Aikakaudet">
          {data.eras.map((e) => {
            const s = eraState(e);
            return (
              <a key={e.key} href={`#${e.key}`} data-done={s.done || undefined} data-some={(!s.done && s.some) || undefined}>
                <small>{e.years}</small>
                {e.short}
              </a>
            );
          })}
        </nav>

        {/* ─── Aikajana ─── */}
        <section className="tn-section" style={{ paddingBottom: 0 }}>
          <div className="tn-section-head" style={{ alignItems: "flex-end" }}>
            <div>
              <h2 className="tn-section-title">Aikajana</h2>
              <div className="tn-hubrow-note">
                Seitsemän aikakautta, joiden alta löydät niihin liittyvät visat. Merkintä kertoo, mitkä olet jo pelannut.
              </div>
            </div>
            <div className="tnh-toggle" role="tablist" aria-label="Näkymä">
              <button role="tab" aria-selected={view === "jana"} data-on={view === "jana" || undefined} onClick={() => setView("jana")}>Jana</button>
              <button role="tab" aria-selected={view === "kaudet"} data-on={view === "kaudet" || undefined} onClick={() => setView("kaudet")}>Kaudet</button>
            </div>
          </div>

          {view === "jana" ? (
            <ol className="tnh-timeline">
              {data.eras.map((e, i) => {
                const s = eraState(e);
                return (
                  <li key={e.key} id={e.key} className="tnh-era">
                    <div className="tnh-era-rail">
                      <span className="tnh-era-num" data-done={s.done || undefined}>{i + 1}</span>
                    </div>
                    <div className="tnh-era-info">
                      <div className="tnh-era-years">{e.years}</div>
                      <h3 className="tnh-era-title">{e.title}</h3>
                      <p className="tnh-era-desc">{e.desc}</p>
                      <div className="tnh-era-meter">
                        <div className="tnh-bar tnh-bar-mini"><i style={{ width: s.n > 0 ? `${(s.p / s.n) * 100}%` : "0%" }} /></div>
                        <span>{s.p}/{s.n} pelattu</span>
                      </div>
                    </div>
                    <div className="tnh-era-quizzes">
                      {e.quizzes.map((q) => (
                        <a key={q.id} className="tnh-quiz" href={q.href} data-played={played.has(q.id) || undefined}>
                          <Dot on={played.has(q.id)} />
                          <span className="tnh-quiz-title">{q.title}</span>
                          <span className="tnh-quiz-meta">{q.questions} kysymystä</span>
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="tnh-kaudet">
              {data.eras.map((e, i) => {
                const s = eraState(e);
                const target = e.quizzes.find((q) => !played.has(q.id)) ?? e.quizzes[0];
                return (
                  <a key={e.key} className="tnh-kausi" href={target?.href ?? `#${e.key}`} data-done={s.done || undefined}>
                    <span className="tnh-era-num" data-done={s.done || undefined}>{i + 1}</span>
                    <span className="tnh-kausi-body">
                      <small>{e.years}</small>
                      <b>{e.title}</b>
                      <span>{s.p}/{s.n} pelattu · {e.quizzes.length} visaa</span>
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── Läpileikkaavat teemat ─── */}
        {data.themes.length > 0 && (
          <section className="tn-section" style={{ paddingBottom: 0 }}>
            <div className="tn-section-head">
              <div>
                <h2 className="tn-section-title" style={{ color: "var(--tn-gold)" }}>Läpileikkaavat teemat</h2>
                <div className="tn-hubrow-note">Nämä aiheet kattavat useita aikakausia, joten ne eivät sijoitu yhteen kohtaan aikajanaa.</div>
              </div>
            </div>
            <div className="tnh-themes">
              {data.themes.map((t) => (
                <a key={t.id} className="tnh-theme" href={t.href} data-played={played.has(t.id) || undefined}>
                  <small>{t.tag ?? "Teema"}</small>
                  <b>{t.title}</b>
                  <span className="tnh-quiz-meta"><Dot on={played.has(t.id)} /> {t.questions} kysymystä</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Selite */}
        <div className="tnh-legend">
          <span><Dot on={false} /> Et ole vielä pelannut</span>
          <span><Dot on={true} /> Pelattu</span>
        </div>

        {/* ─── Läpileikkaus-CTA ─── */}
        {data.lapileikkaus && (
          <section className="tn-section" style={{ paddingBottom: 0 }}>
            <div className="tn-ctapanel" style={{ ["--tn-hub-accent" as string]: "#E8A320" }}>
              <div style={{ flex: "2 1 min(100%, 280px)" }}>
                <h2 className="tn-display" style={{ fontSize: "clamp(24px, 3.4cqw, 44px)", margin: "0 0 10px" }}>
                  Kokeile koko aikajana yhdellä kertaa
                </h2>
                <p style={{ margin: 0, color: "#B9AF9B", maxWidth: "44ch" }}>
                  Yksi kysymys jokaisesta aikakaudesta, kivikaudesta 2000-luvulle. {data.lapileikkaus.questions} kysymystä, noin 4 minuuttia.
                </p>
              </div>
              <a className="tn-cta" href={data.lapileikkaus.href} style={{ color: "var(--tn-bg)" }}>
                Pelaa läpileikkaus →
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
