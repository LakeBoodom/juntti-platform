"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Client-side Supabase
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
type FavorabilityVote = "ei_uppoa" | "ihan_ok" | "rakastan";

interface VoteCounts {
  ei_tunnista: number;
  tuttu: number;
  legenda: number;
  ei_uppoa: number;
  ihan_ok: number;
  rakastan: number;
  awareness_total: number;
  favorability_total: number;
}

interface Props {
  celebrityId: string;
  celebrityName: string;
  todayStr: string;
  age: number;
  compact?: boolean;
}

export default function VoteWidget({ celebrityId, celebrityName, todayStr, age, compact }: Props) {
  const [awarenessVote, setAwarenessVote] = useState<AwarenessVote | null>(null);
  const [favorabilityVote, setFavorabilityVote] = useState<FavorabilityVote | null>(null);
  const [counts, setCounts] = useState<VoteCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"awareness" | "favorability" | "done">("awareness");

  useEffect(() => {
    const sid = getSessionId();
    const aKey = `vote_${celebrityId}_awareness_${todayStr}`;
    const fKey = `vote_${celebrityId}_favorability_${todayStr}`;
    const av = localStorage.getItem(aKey) as AwarenessVote | null;
    const fv = localStorage.getItem(fKey) as FavorabilityVote | null;

    if (av) {
      setAwarenessVote(av);
      if (fv) {
        setFavorabilityVote(fv);
        setPhase("done");
      } else if (av !== "ei_tunnista") {
        setPhase("favorability");
      } else {
        setPhase("done");
      }
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
    const fv = data.find((r) => r.question_type === "favorability");
    setCounts({
      ei_tunnista: aw?.ei_tunnista_count ?? 0,
      tuttu: aw?.tuttu_count ?? 0,
      legenda: aw?.legenda_count ?? 0,
      ei_uppoa: fv?.ei_uppoa_count ?? 0,
      ihan_ok: fv?.ihan_ok_count ?? 0,
      rakastan: fv?.rakastan_count ?? 0,
      awareness_total: aw?.total_count ?? 0,
      favorability_total: fv?.total_count ?? 0,
    });
  }

  async function handleAwareness(vote: AwarenessVote) {
    if (awarenessVote || loading) return;
    setLoading(true);
    const sid = getSessionId();
    const sb = getClient();

    await sb.from("celebrity_votes").upsert({
      celebrity_id: celebrityId,
      question_type: "awareness",
      vote,
      session_id: sid,
      vote_date: todayStr,
    }, { onConflict: "celebrity_id,question_type,session_id,vote_date" });

    localStorage.setItem(`vote_${celebrityId}_awareness_${todayStr}`, vote);
    setAwarenessVote(vote);

    await fetchCounts();
    setLoading(false);

    if (vote === "ei_tunnista") {
      setPhase("done");
    } else {
      setPhase("favorability");
    }
  }

  async function handleFavorability(vote: FavorabilityVote) {
    if (favorabilityVote || loading) return;
    setLoading(true);
    const sid = getSessionId();
    const sb = getClient();

    await sb.from("celebrity_votes").upsert({
      celebrity_id: celebrityId,
      question_type: "favorability",
      vote,
      session_id: sid,
      vote_date: todayStr,
    }, { onConflict: "celebrity_id,question_type,session_id,vote_date" });

    localStorage.setItem(`vote_${celebrityId}_favorability_${todayStr}`, vote);
    setFavorabilityVote(vote);
    setPhase("done");
    await fetchCounts();
    setLoading(false);
  }

  function handleShare() {
    const awarenessLabel = awarenessVote === "legenda" ? "legenda!" :
                           awarenessVote === "tuttu" ? "tuttu tyyppi" : "ei tuttu";
    const text = `${celebrityName} täyttää tänään ${age} vuotta! Minulla hän on: ${awarenessLabel} 🎂 synttarit.com`;
    if (navigator.share) {
      navigator.share({ text, url: "https://synttarit.com" }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Kopioitu leikepöydälle!")).catch(() => {});
    }
  }

  function pct(val: number, total: number) {
    if (!total) return 0;
    return Math.round((val / total) * 100);
  }

  return (
    <div>
      {phase === "awareness" && (
        <div className="vote-section">
          <div className="vote-label">Tunnenko tämän?</div>
          <div className="vote-buttons">
            <button className="vote-btn" onClick={() => handleAwareness("ei_tunnista")} disabled={loading}>
              En tunnista
            </button>
            <button className="vote-btn" onClick={() => handleAwareness("tuttu")} disabled={loading}>
              Tuttu tyyppi
            </button>
            <button className="vote-btn" onClick={() => handleAwareness("legenda")} disabled={loading}>
              🏆 Legenda!
            </button>
          </div>
        </div>
      )}

      {phase === "favorability" && (
        <div className="vote-section">
          <div className="vote-label">Mitä ajattelet hänestä?</div>
          <div className="vote-buttons">
            <button className="vote-btn" onClick={() => handleFavorability("ei_uppoa")} disabled={loading}>
              Ei uppoa
            </button>
            <button className="vote-btn" onClick={() => handleFavorability("ihan_ok")} disabled={loading}>
              Ihan ok
            </button>
            <button className="vote-btn" onClick={() => handleFavorability("rakastan")} disabled={loading}>
              ❤️ Rakastan!
            </button>
          </div>
        </div>
      )}

      {phase === "done" && counts && (
        <div className="vote-results">
          <div style={{ marginBottom: 4 }}>
            <div className="vote-label" style={{ marginBottom: 6 }}>
              Tunnettuus — {counts.awareness_total} ääntä
            </div>
            {[
              { label: "Legenda", val: counts.legenda, cls: "bar-pink" },
              { label: "Tuttu", val: counts.tuttu, cls: "bar-yellow" },
              { label: "Ei tunne", val: counts.ei_tunnista, cls: "bar-dim" },
            ].map((r) => (
              <div className="vote-bar-row" key={r.label}>
                <span className="vote-bar-label">{r.label}</span>
                <div className="vote-bar-track">
                  <div
                    className={`vote-bar-fill ${r.cls}`}
                    style={{ width: `${pct(r.val, counts.awareness_total)}%` }}
                  />
                </div>
                <span className="vote-bar-pct">{pct(r.val, counts.awareness_total)}%</span>
              </div>
            ))}
          </div>

          {counts.favorability_total > 0 && (
            <div style={{ marginTop: 10 }}>
              <div className="vote-label" style={{ marginBottom: 6 }}>
                Suosio — {counts.favorability_total} ääntä
              </div>
              {[
                { label: "Rakastan", val: counts.rakastan, cls: "bar-pink" },
                { label: "Ihan ok", val: counts.ihan_ok, cls: "bar-yellow" },
                { label: "Ei uppoa", val: counts.ei_uppoa, cls: "bar-dim" },
              ].map((r) => (
                <div className="vote-bar-row" key={r.label}>
                  <span className="vote-bar-label">{r.label}</span>
                  <div className="vote-bar-track">
                    <div
                      className={`vote-bar-fill ${r.cls}`}
                      style={{ width: `${pct(r.val, counts.favorability_total)}%` }}
                    />
                  </div>
                  <span className="vote-bar-pct">{pct(r.val, counts.favorability_total)}%</span>
                </div>
              ))}
            </div>
          )}

          <button className="share-btn" onClick={handleShare}>
            📤 Jaa kaverille
          </button>
        </div>
      )}
    </div>
  );
}
