"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

function getSessionId(): string {
  const key = "synttarit_session_id";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

type AwarenessVote   = "ei_tunnista" | "tuttu" | "legenda";
type FavorabilityVote = "ei_uppoa"   | "ihan_ok" | "rakastan";
type Step = "q1" | "q2" | "results";

interface AwarenessCounts    { legenda: number; tuttu: number; ei_tunnista: number; total: number; }
interface FavorabilityCounts { rakastan: number; ihan_ok: number; ei_uppoa: number; total: number; }
interface AllCounts          { awareness: AwarenessCounts | null; favorability: FavorabilityCounts | null; }

interface Props {
  celebrityId: string;
  celebrityName: string;
  todayStr: string;
  age: number;
  compact?: boolean;
}

async function saveVote(
  celebrityId: string,
  sessionId: string,
  todayStr: string,
  questionType: "awareness" | "favorability",
  vote: string
) {
  const sb = getClient();
  await sb.from("celebrity_votes").upsert(
    { celebrity_id: celebrityId, question_type: questionType, vote, session_id: sessionId, vote_date: todayStr },
    { onConflict: "celebrity_id,question_type,session_id,vote_date" }
  );
}

async function fetchAllCounts(celebrityId: string, todayStr: string): Promise<AllCounts> {
  const sb = getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await sb.from("celebrity_vote_counts").select("*").eq("celebrity_id", celebrityId).eq("vote_date", todayStr) as any;
  if (!data) return { awareness: null, favorability: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aw  = data.find((r: any) => r.question_type === "awareness");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fav = data.find((r: any) => r.question_type === "favorability");
  return {
    awareness:    aw  ? { legenda: aw.legenda_count ?? 0,     tuttu: aw.tuttu_count ?? 0,         ei_tunnista: aw.ei_tunnista_count ?? 0, total: aw.total_count  ?? 0 } : null,
    favorability: fav ? { rakastan: fav.rakastan_count ?? 0, ihan_ok: fav.ihan_ok_count ?? 0, ei_uppoa: fav.ei_uppoa_count ?? 0,      total: fav.total_count ?? 0 } : null,
  };
}

function pct(val: number, total: number) {
  return total ? Math.round((val / total) * 100) : 0;
}

export default function VoteWidget({ celebrityId, celebrityName, todayStr, age, compact }: Props) {
  const [step,    setStep]    = useState<Step>("q1");
  const [q1vote,  setQ1vote]  = useState<AwarenessVote   | null>(null);
  const [q2vote,  setQ2vote]  = useState<FavorabilityVote | null>(null);
  const [counts,  setCounts]  = useState<AllCounts>({ awareness: null, favorability: null });
  const [loading, setLoading] = useState(false);
  const [undoSecs, setUndoSecs] = useState(0);
  const undoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const av = localStorage.getItem(`vote_${celebrityId}_awareness_${todayStr}`)   as AwarenessVote   | null;
    const fv = localStorage.getItem(`vote_${celebrityId}_favorability_${todayStr}`) as FavorabilityVote | null;
    if (av) {
      setQ1vote(av);
      if (fv) setQ2vote(fv);
      setStep("results");
      fetchAllCounts(celebrityId, todayStr).then(setCounts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrityId, todayStr]);

  function startUndoTimer() {
    setUndoSecs(5);
    undoRef.current = setInterval(() => {
      setUndoSecs(prev => {
        if (prev <= 1) { clearInterval(undoRef.current!); undoRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function handleUndo() {
    if (undoRef.current) { clearInterval(undoRef.current); undoRef.current = null; }
    setUndoSecs(0);
    localStorage.removeItem(`vote_${celebrityId}_awareness_${todayStr}`);
    setQ1vote(null);
    setStep("q1");
  }

  async function handleQ1(v: AwarenessVote) {
    if (q1vote || loading) return;
    setLoading(true);
    const sid = getSessionId();
    await saveVote(celebrityId, sid, todayStr, "awareness", v);
    localStorage.setItem(`vote_${celebrityId}_awareness_${todayStr}`, v);
    setQ1vote(v);
    setLoading(false);

    if (v === "ei_tunnista") {
      const c = await fetchAllCounts(celebrityId, todayStr);
      setCounts(c);
      setStep("results");
    } else {
      setStep("q2");
      if (!compact) startUndoTimer(); // undo only in hero mode
    }
  }

  async function handleQ2(v: FavorabilityVote) {
    if (q2vote || loading) return;
    if (undoRef.current) { clearInterval(undoRef.current); undoRef.current = null; }
    setUndoSecs(0);
    setLoading(true);
    const sid = getSessionId();
    await saveVote(celebrityId, sid, todayStr, "favorability", v);
    localStorage.setItem(`vote_${celebrityId}_favorability_${todayStr}`, v);
    setQ2vote(v);
    const c = await fetchAllCounts(celebrityId, todayStr);
    setCounts(c);
    setLoading(false);
    setStep("results");
  }

  function handleShare() {
    const q1lbl = q1vote === "legenda" ? "legenda" : q1vote === "tuttu" ? "tuttu tyyppi" : "en tunne";
    const q2lbl = q2vote === "rakastan" ? "fanitan" : q2vote === "ihan_ok" ? "tykkään" : q2vote === "ei_uppoa" ? "ei oo mun juttu" : null;
    let text = `${celebrityName} täyttää tänään ${age} vuotta! Minulle hän on: ${q1lbl}`;
    if (q2lbl) text += `, ja ${q2lbl}`;
    text += " 🎂 synttarit.com";
    if (navigator.share) {
      navigator.share({ text, url: "https://synttarit.com" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Kopioitu!")).catch(() => {});
    }
  }

  // "Ei mun juttu" hidden if Q1 = legenda (contradiction)
  const showEiMunJuttu = q1vote !== "legenda";

  // ─── COMPACT MODE ────────────────────────────────────────────────────────────
  if (compact) {
    // Q1 buttons
    if (step === "q1") {
      return (
        <div className="lc-vote-row">
          <button className="lc-vbtn" onClick={() => handleQ1("ei_tunnista")} disabled={loading} aria-label="En tunne">
            <i className="ti ti-mood-empty" aria-hidden="true" />
          </button>
          <button className="lc-vbtn" onClick={() => handleQ1("tuttu")} disabled={loading} aria-label="Tuttu">
            <i className="ti ti-mood-smile" aria-hidden="true" />
          </button>
          <button className="lc-vbtn" onClick={() => handleQ1("legenda")} disabled={loading} aria-label="Legenda">
            <i className="ti ti-star" aria-hidden="true" />
          </button>
        </div>
      );
    }

    // Q2 buttons (swap in place)
    if (step === "q2") {
      return (
        <div className="lc-vote-row">
          {showEiMunJuttu && (
            <button className="lc-vbtn" onClick={() => handleQ2("ei_uppoa")} disabled={loading} aria-label="Ei mun juttu">
              <i className="ti ti-mood-confuzed" aria-hidden="true" />
            </button>
          )}
          <button className="lc-vbtn" onClick={() => handleQ2("ihan_ok")} disabled={loading} aria-label="Tykkään">
            <i className="ti ti-thumb-up" aria-hidden="true" />
          </button>
          <button className="lc-vbtn" onClick={() => handleQ2("rakastan")} disabled={loading} aria-label="Fanitan">
            <i className="ti ti-heart" aria-hidden="true" />
          </button>
        </div>
      );
    }

    // Results (compact bars in right column, no locked buttons)
    const aw  = counts.awareness;
    const fav = counts.favorability;
    return (
      <div className="lc-result-col">
        {aw && (
          <>
            <div className="lcr-row">
              <i className="ti ti-star lcr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "var(--pink)", width: `${pct(aw.legenda, aw.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--pink)" }}>{pct(aw.legenda, aw.total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-mood-smile lcr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "var(--yellow)", width: `${pct(aw.tuttu, aw.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--yellow)" }}>{pct(aw.tuttu, aw.total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-mood-empty lcr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(aw.ei_tunnista, aw.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--text-muted)" }}>{pct(aw.ei_tunnista, aw.total)}%</span>
            </div>
          </>
        )}
        {q1vote !== "ei_tunnista" && fav && (
          <>
            <div className="lcr-divider" />
            <div className="lcr-row">
              <i className="ti ti-heart lcr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "var(--pink)", width: `${pct(fav.rakastan, fav.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--pink)" }}>{pct(fav.rakastan, fav.total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-thumb-up lcr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "var(--yellow)", width: `${pct(fav.ihan_ok, fav.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--yellow)" }}>{pct(fav.ihan_ok, fav.total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-mood-confuzed lcr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
              <div className="lcr-bar-bg"><div className="lcr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(fav.ei_uppoa, fav.total)}%` }} /></div>
              <span className="lcr-pct" style={{ color: "var(--text-muted)" }}>{pct(fav.ei_uppoa, fav.total)}%</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── HERO MODE ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Q1 */}
      {step === "q1" && (
        <div className="vote-row">
          <button className="vm-btn" onClick={() => handleQ1("ei_tunnista")} disabled={loading}>
            <i className="ti ti-mood-empty" aria-hidden="true" /><span>En tunne</span>
          </button>
          <button className="vm-btn" onClick={() => handleQ1("tuttu")} disabled={loading}>
            <i className="ti ti-mood-smile" aria-hidden="true" /><span>Tuttu</span>
          </button>
          <button className="vm-btn" onClick={() => handleQ1("legenda")} disabled={loading}>
            <i className="ti ti-star" aria-hidden="true" /><span>Legenda!</span>
          </button>
        </div>
      )}

      {/* Q2 + optional undo */}
      {step === "q2" && (
        <div>
          {/* Q1 locked row */}
          <div className="vote-row" style={{ marginBottom: 6 }}>
            <button className={`vm-btn${q1vote === "ei_tunnista" ? " voted-neverhear" : " vm-btn-dim"}`} disabled>
              <i className="ti ti-mood-empty" aria-hidden="true" /><span>En tunne</span>
            </button>
            <button className={`vm-btn${q1vote === "tuttu" ? " voted-tuttu" : " vm-btn-dim"}`} disabled>
              <i className="ti ti-mood-smile" aria-hidden="true" /><span>Tuttu</span>
            </button>
            <button className={`vm-btn${q1vote === "legenda" ? " voted-legenda" : " vm-btn-dim"}`} disabled>
              <i className="ti ti-star" aria-hidden="true" /><span>Legenda!</span>
            </button>
          </div>

          {/* Undo */}
          {undoSecs > 0 && (
            <button className="undo-btn" onClick={handleUndo}>
              <i className="ti ti-arrow-back-up" aria-hidden="true" /> Peruuta ({undoSecs}s)
            </button>
          )}

          {/* Q2 label */}
          <div className="vote-q-label">Mikä fiilis?</div>

          {/* Q2 buttons */}
          <div className="vote-row">
            {showEiMunJuttu && (
              <button className="vm-btn" onClick={() => handleQ2("ei_uppoa")} disabled={loading}>
                <i className="ti ti-mood-confuzed" aria-hidden="true" /><span>Ei mun juttu</span>
              </button>
            )}
            <button className="vm-btn" onClick={() => handleQ2("ihan_ok")} disabled={loading}>
              <i className="ti ti-thumb-up" aria-hidden="true" /><span>Tykkään</span>
            </button>
            <button className="vm-btn" onClick={() => handleQ2("rakastan")} disabled={loading}>
              <i className="ti ti-heart" aria-hidden="true" /><span>Fanitan</span>
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {step === "results" && (
        <div className="mini-results">
          {/* Q1 section */}
          <div className="vote-q-label">Tunnistettavuus</div>
          {counts.awareness && (
            <>
              <div className="mr-row">
                <i className="ti ti-star mr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "var(--pink)", width: `${pct(counts.awareness.legenda, counts.awareness.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--pink)" }}>{pct(counts.awareness.legenda, counts.awareness.total)}%</span>
              </div>
              <div className="mr-row">
                <i className="ti ti-mood-smile mr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "var(--yellow)", width: `${pct(counts.awareness.tuttu, counts.awareness.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--yellow)" }}>{pct(counts.awareness.tuttu, counts.awareness.total)}%</span>
              </div>
              <div className="mr-row">
                <i className="ti ti-mood-empty mr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(counts.awareness.ei_tunnista, counts.awareness.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--text-muted)" }}>{pct(counts.awareness.ei_tunnista, counts.awareness.total)}%</span>
              </div>
            </>
          )}

          {/* Q2 section (only if not "en tunne") */}
          {q1vote !== "ei_tunnista" && counts.favorability && (
            <>
              <div className="vote-q-label" style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>Fiilis</div>
              <div className="mr-row">
                <i className="ti ti-heart mr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "var(--pink)", width: `${pct(counts.favorability.rakastan, counts.favorability.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--pink)" }}>{pct(counts.favorability.rakastan, counts.favorability.total)}%</span>
              </div>
              <div className="mr-row">
                <i className="ti ti-thumb-up mr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "var(--yellow)", width: `${pct(counts.favorability.ihan_ok, counts.favorability.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--yellow)" }}>{pct(counts.favorability.ihan_ok, counts.favorability.total)}%</span>
              </div>
              <div className="mr-row">
                <i className="ti ti-mood-confuzed mr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                <div className="mr-bar-bg"><div className="mr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(counts.favorability.ei_uppoa, counts.favorability.total)}%` }} /></div>
                <span className="mr-pct" style={{ color: "var(--text-muted)" }}>{pct(counts.favorability.ei_uppoa, counts.favorability.total)}%</span>
              </div>
            </>
          )}

          <button className="share-btn" onClick={handleShare}>
            <i className="ti ti-share" aria-hidden="true" />
            Jaa kaverille
          </button>
        </div>
      )}
    </div>
  );
}
