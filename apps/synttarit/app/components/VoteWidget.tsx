"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSessionId(): string {
  const key = "synttarit_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

type AwarenessVote = "ei_tunnista" | "tuttu" | "legenda";

interface VoteCounts {
  ei_tunnista: number;
  tuttu: number;
  legenda: number;
  awareness_total: number;
}

interface Props {
  celebrityId: string;
  celebrityName: string;
  todayStr: string;
  age: number;
  compact?: boolean;
}

export default function VoteWidget({ celebrityId, celebrityName, todayStr, age, compact }: Props) {
  const [vote, setVote] = useState<AwarenessVote | null>(null);
  const [counts, setCounts] = useState<VoteCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const aKey = `vote_${celebrityId}_awareness_${todayStr}`;
    const av = localStorage.getItem(aKey) as AwarenessVote | null;
    if (av) {
      setVote(av);
      setShowResults(true);
      fetchCounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrityId, todayStr]);

  async function fetchCounts() {
    const sb = getClient();
    const { data } = await sb
      .from("celebrity_vote_counts")
      .select("*")
      .eq("celebrity_id", celebrityId)
      .eq("vote_date", todayStr);

    if (!data) return;
    const aw = data.find((r) => r.question_type === "awareness");
    setCounts({
      ei_tunnista: aw?.ei_tunnista_count ?? 0,
      tuttu: aw?.tuttu_count ?? 0,
      legenda: aw?.legenda_count ?? 0,
      awareness_total: aw?.total_count ?? 0,
    });
  }

  async function handleVote(v: AwarenessVote) {
    if (vote || loading) return;
    setLoading(true);
    const sid = getSessionId();
    const sb = getClient();

    await sb.from("celebrity_votes").upsert({
      celebrity_id: celebrityId,
      question_type: "awareness",
      vote: v,
      session_id: sid,
      vote_date: todayStr,
    }, { onConflict: "celebrity_id,question_type,session_id,vote_date" });

    localStorage.setItem(`vote_${celebrityId}_awareness_${todayStr}`, v);
    setVote(v);
    await fetchCounts();
    setLoading(false);
    setShowResults(true);
  }

  function handleShare() {
    const label = vote === "legenda" ? "legenda!" : vote === "tuttu" ? "tuttu tyyppi" : "en tunne";
    const text = `${celebrityName} täyttää tänään ${age} vuotta! Minulle hän on: ${label} 🎂 synttarit.com`;
    if (navigator.share) {
      navigator.share({ text, url: "https://synttarit.com" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Kopioitu!")).catch(() => {});
    }
  }

  function pct(val: number, total: number) {
    if (!total) return 0;
    return Math.round((val / total) * 100);
  }

  // ─── COMPACT MODE (lista-kortit) ───
  if (compact) {
    return (
      <>
        {!showResults && (
          <div className="lc-vote-row">
            <button
              className={`lc-vbtn${vote === "ei_tunnista" ? " voted-neverhear" : ""}`}
              onClick={() => handleVote("ei_tunnista")}
              disabled={!!vote || loading}
              aria-label="En tunne"
            >
              <i className="ti ti-mood-empty" aria-hidden="true" />
            </button>
            <button
              className={`lc-vbtn${vote === "tuttu" ? " voted-tuttu" : ""}`}
              onClick={() => handleVote("tuttu")}
              disabled={!!vote || loading}
              aria-label="Tuttu"
            >
              <i className="ti ti-mood-smile" aria-hidden="true" />
            </button>
            <button
              className={`lc-vbtn${vote === "legenda" ? " voted-legenda" : ""}`}
              onClick={() => handleVote("legenda")}
              disabled={!!vote || loading}
              aria-label="Legenda"
            >
              <i className="ti ti-star" aria-hidden="true" />
            </button>
          </div>
        )}
        {showResults && counts && (
          <div className="lc-vote-row">
            <button className={`lc-vbtn${vote === "ei_tunnista" ? " voted-neverhear" : ""}`} aria-label="En tunne" disabled>
              <i className="ti ti-mood-empty" aria-hidden="true" />
            </button>
            <button className={`lc-vbtn${vote === "tuttu" ? " voted-tuttu" : ""}`} aria-label="Tuttu" disabled>
              <i className="ti ti-mood-smile" aria-hidden="true" />
            </button>
            <button className={`lc-vbtn${vote === "legenda" ? " voted-legenda" : ""}`} aria-label="Legenda" disabled>
              <i className="ti ti-star" aria-hidden="true" />
            </button>
          </div>
        )}
        {showResults && counts && (
          <div className="lc-result">
            <div className="lcr-row">
              <i className="ti ti-star lcr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
              <div className="lcr-bar-bg">
                <div className="lcr-bar" style={{ background: "var(--pink)", width: `${pct(counts.legenda, counts.awareness_total)}%` }} />
              </div>
              <span className="lcr-pct" style={{ color: "var(--pink)" }}>{pct(counts.legenda, counts.awareness_total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-mood-smile lcr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
              <div className="lcr-bar-bg">
                <div className="lcr-bar" style={{ background: "var(--yellow)", width: `${pct(counts.tuttu, counts.awareness_total)}%` }} />
              </div>
              <span className="lcr-pct" style={{ color: "var(--yellow)" }}>{pct(counts.tuttu, counts.awareness_total)}%</span>
            </div>
            <div className="lcr-row">
              <i className="ti ti-mood-empty lcr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
              <div className="lcr-bar-bg">
                <div className="lcr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(counts.ei_tunnista, counts.awareness_total)}%` }} />
              </div>
              <span className="lcr-pct" style={{ color: "var(--text-muted)" }}>{pct(counts.ei_tunnista, counts.awareness_total)}%</span>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── HERO MODE ───
  return (
    <div>
      {!showResults && (
        <div className="vote-row">
          <button
            className={`vm-btn${vote === "ei_tunnista" ? " voted-neverhear" : ""}`}
            onClick={() => handleVote("ei_tunnista")}
            disabled={!!vote || loading}
          >
            <i className="ti ti-mood-empty" aria-hidden="true" />
            <span>En tunne</span>
          </button>
          <button
            className={`vm-btn${vote === "tuttu" ? " voted-tuttu" : ""}`}
            onClick={() => handleVote("tuttu")}
            disabled={!!vote || loading}
          >
            <i className="ti ti-mood-smile" aria-hidden="true" />
            <span>Tuttu</span>
          </button>
          <button
            className={`vm-btn${vote === "legenda" ? " voted-legenda" : ""}`}
            onClick={() => handleVote("legenda")}
            disabled={!!vote || loading}
          >
            <i className="ti ti-star" aria-hidden="true" />
            <span>Legenda!</span>
          </button>
        </div>
      )}

      {showResults && counts && (
        <div className="mini-results">
          <div className="mr-row">
            <i className="ti ti-star mr-icon" style={{ color: "var(--pink)" }} aria-hidden="true" />
            <div className="mr-bar-bg">
              <div className="mr-bar" style={{ background: "var(--pink)", width: `${pct(counts.legenda, counts.awareness_total)}%` }} />
            </div>
            <span className="mr-pct" style={{ color: "var(--pink)" }}>{pct(counts.legenda, counts.awareness_total)}%</span>
          </div>
          <div className="mr-row">
            <i className="ti ti-mood-smile mr-icon" style={{ color: "var(--yellow)" }} aria-hidden="true" />
            <div className="mr-bar-bg">
              <div className="mr-bar" style={{ background: "var(--yellow)", width: `${pct(counts.tuttu, counts.awareness_total)}%` }} />
            </div>
            <span className="mr-pct" style={{ color: "var(--yellow)" }}>{pct(counts.tuttu, counts.awareness_total)}%</span>
          </div>
          <div className="mr-row">
            <i className="ti ti-mood-empty mr-icon" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
            <div className="mr-bar-bg">
              <div className="mr-bar" style={{ background: "rgba(245,237,216,0.2)", width: `${pct(counts.ei_tunnista, counts.awareness_total)}%` }} />
            </div>
            <span className="mr-pct" style={{ color: "var(--text-muted)" }}>{pct(counts.ei_tunnista, counts.awareness_total)}%</span>
          </div>

          <button className="share-btn" onClick={handleShare}>
            <i className="ti ti-share" aria-hidden="true" />
            Jaa kaverille
          </button>
        </div>
      )}
    </div>
  );
}
