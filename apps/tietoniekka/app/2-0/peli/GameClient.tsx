"use client";
// TIETONIEKKA 2.0 — PELINÄKYMÄ 2026 PROD (design_handoff_peli_2026_prod +
// design_handoff_kuvavisa_2026_prod, toteutettu 28.–29.8.2026). Korvasi pelikuoren
// 2A "Jaettu lava" + Tuloskortti A:n kokonaan (Heikki 28.8.: "korvaa samaan tapaan
// nyt haarassa olevan preview-version").
//
// Yksi komponentti, kaksi kysymystyyppiä (teksti / kuva — tyyppi per kysymys,
// joten sekamuotoinen Mega toimii samalla rungolla). Vaiheet: aloitus → peli →
// tulos. Heikin päätökset 28.8.2026:
//  1a pistelasku ennallaan: 100 p + putkibonus 50 p/porras (quiz_plays samalla asteikolla)
//  2a Oljenkorsi 1 per 10 kysymystä (min 1), poistaa 2 väärää, aidosti disabled
//  3a haastelinkki = visan oma osoite (kuvavisoissa pelattu kuvasarja mukana),
//     tila aina "valmis" — ei erillistä linkkipalvelua
//  4a Learn-osiot pois tulosnäkymästä (SSR-aiheopas jää sivun alle, piilossa pelin ajan)
//  5a Liekkikortti, konfetti ja HUD:n asetusnappi pois
//  6b "Valitse uusi visa" → /2-0/kokoelmat
//  7a tausta = kokoelma-/visakuva designin tummennuksella, kategoriaväri kokoelman mukaan
// Säilyy: quiz_plays-tallennus + shared-merkintä, päivän putki (mikä tahansa visa,
// 28.8.), Päivän visan pelattu-merkintä, kaupunkileima, tn_played_quizzes.
// Tekninen ohitus (kuva ei lataudu): ei pisteitä, ei putken katkaisua, ei väärä
// vastaus; ensin yritetään korvata kysymys varakysymyksellä (spare), sitten ohitus.
// KORTTISÄÄNTÖ: kysymys- ja aloitusotsikot sovitetaan JS:llä (fitHeading) —
// staattinen Archivo, suomen sanoja ei katkaista.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import { PAIVAN_VISA_KEY, localDateKey } from "../../../components/tn20/PaivanVisaCard";
import "../peli2026.css";

const BASE_POINTS = 100;
const STREAK_BONUS = 50;
const KEYS = ["A", "B", "C", "D"];

export type GameQuestion = {
  question: string;
  options: string[];
  correct: string;
  fact: string | null;
  /** kuvakysymys: kuvan osoite (kuvavisas.image_url / Megan kuvarivi) */
  image?: string;
  /** Megan lähdevisan konteksti (Heikki 4.8.2026) */
  context?: string;
};

export type GameRelated = { id: string; title: string; meta: string; href?: string };

export type GameQuiz = {
  id: string;
  title: string;
  teaser: string | null;
  collectionLabel: string;
  genreLabel: string | null;
  hubHref: string;
  bgImg: string;
  topicImg?: string | null;
  accent: string;
  isSankari: boolean;
  citySlug?: string | null;
  /** "kuva" = kuvavisa (laskurit "N kuvaa", suositusten meta "N kuvaa") */
  kind?: "teksti" | "kuva";
  /** Haastelinkin polku (origin lisätään selaimessa). */
  challengePath: string;
  /** Varakysymykset teknistä ohitusta varten (kuvavisat) */
  spare?: GameQuestion[];
  questions: GameQuestion[];
  related: GameRelated[];
};

type Hist = "ok" | "bad" | "skipped";

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Sama putkilogiikka kuin tuotannon pelissä (tn_paivan_visa_putki). */
function updateDailyStreak(): number {
  try {
    const KEY = "tn_paivan_visa_putki";
    const today = localDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yd = localDate(yesterday);
    const raw = window.localStorage.getItem(KEY);
    let count = 1;
    if (raw) {
      const prev = JSON.parse(raw) as { count: number; last: string };
      if (prev.last === today) return prev.count;
      count = prev.last === yd ? prev.count + 1 : 1;
    }
    window.localStorage.setItem(KEY, JSON.stringify({ count, last: today }));
    const BEST = "tn_paivan_visa_putki_paras";
    const prevBest = Number(window.localStorage.getItem(BEST) ?? "0") || 0;
    if (count > prevBest) window.localStorage.setItem(BEST, String(count));
    return count;
  } catch {
    return 0;
  }
}

/** SUOMEN KAUPUNGIT -matkapassi (28.8.2026): leima ansaitaan PELAAMALLA. */
function stampCity(cityId: string): void {
  try {
    const KEY = "tn_kaupunkileimat";
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const set = new Set(Array.isArray(arr) ? arr : []);
    if (!set.has(cityId)) {
      set.add(cityId);
      window.localStorage.setItem(KEY, JSON.stringify([...set]));
    }
  } catch { /* best-effort */ }
}

function getOrCreateSessionId(): string {
  try {
    let id = window.localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/* Tulostasot (design): kaikki kannustukset positiivisia, myös 0/10. */
const TIERS = [
  { min: 100, title: "Täydet pisteet!", body: "Virheetön suoritus. Haasta kaveri ja katso, kuka pysyy perässä." },
  { min: 80, title: "Erinomainen tulos", body: "Tämä on niekan tasoa. Kaverin on vaikea päihittää sinua." },
  { min: 60, title: "Hyvä tulos", body: "Vahva suoritus — muutama tarkennus, ja tulos on huippuluokkaa." },
  { min: 40, title: "Keskitasoinen tulos", body: "Hyvä pohja. Käy vastaukset läpi ja yritä heti uudelleen." },
  { min: 0, title: "Harjoiteltavaa jäi", body: "Tästä on hyvä lähteä. Katso oikeat vastaukset ja pelaa uusiksi — tulos nousee nopeasti." },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (hex: string, a: number) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
const lift = (hex: string) => { const up = (v: number) => Math.round(v + (255 - v) * 0.42); const [r, g, b] = hexToRgb(hex); return `rgb(${up(r)},${up(g)},${up(b)})`; };

/** KORTTISÄÄNTÖ: pienennä otsikkoa kunnes pisin sana mahtuu elementtiin.
    Mittaa canvasilla (nopea, ei reflow-silmukkaa). Palauttaa käytetyn koon. */
function fitHeading(el: HTMLElement | null) {
  if (!el) return;
  el.style.fontSize = "";
  const cs = getComputedStyle(el);
  let size = parseFloat(cs.fontSize);
  const min = 14;
  const avail = el.clientWidth;
  if (!avail) return;
  const words = (el.textContent ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ls = parseFloat(cs.letterSpacing) || 0;
  const widthAt = (s: number) => {
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${s}px ${cs.fontFamily}`;
    return Math.max(...words.map((w) => ctx.measureText(w.toUpperCase()).width + ls * (s / size) * w.length));
  };
  let guard = 0;
  while (size > min && widthAt(size) > avail * 0.97 && guard++ < 40) size = Math.floor(size * 0.95);
  if (guard > 0) el.style.fontSize = `${size}px`;
}

const enc = encodeURIComponent;

export default function GameClient({ quiz }: { quiz: GameQuiz }) {
  const isKuva = quiz.kind === "kuva";
  const [questions, setQuestions] = useState<GameQuestion[]>(quiz.questions);
  const spare = useRef<GameQuestion[]>([...(quiz.spare ?? [])]);
  const total = questions.length;

  const [phase, setPhase] = useState<"start" | "play" | "end">("start");
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [right, setRight] = useState(0);
  const [hist, setHist] = useState<Hist[]>([]);
  const [picks, setPicks] = useState<Array<number | null>>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const oljenkorsiTotal = Math.max(1, Math.floor(total / 10));
  const [lifeLeft, setLifeLeft] = useState(oljenkorsiTotal);
  const [review, setReview] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [imgs, setImgs] = useState<Record<string, "loading" | "ready" | "error">>({});
  const [bust, setBust] = useState<Record<number, number>>({});
  const [shownScore, setShownScore] = useState(0);
  const [copyState, setCopyState] = useState<"copied" | "error" | "sharefail" | null>(null);
  const [hasShare, setHasShare] = useState(false);
  const [origin, setOrigin] = useState("https://tietoniekka.fi");

  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const qhRef = useRef<HTMLHeadingElement>(null);
  const startH1Ref = useRef<HTMLHeadingElement>(null);
  const dlgRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const zoomOpenerRef = useRef<HTMLElement | null>(null);
  const anchorTop = useRef<number | null>(null);
  const recorded = useRef(false);
  const playIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const done = phase === "end";
  const q = questions[Math.min(qi, total - 1)];
  const imgKey = (i: number) => { const qq = questions[i]; return qq?.image ? qq.image + (bust[i] ? `?r=${bust[i]}` : "") : null; };
  const imgState = (i: number) => { const k = imgKey(i); return k ? (imgs[k] ?? "loading") : null; };
  const answersLocked = !!(q?.image && imgState(qi) !== "ready" && !locked);
  const maxScore = total * BASE_POINTS + ((total * (total - 1)) / 2) * STREAK_BONUS;

  /* ── kategoriaväri → CSS-muuttujat (design: --tnAcc, --tnAccBorder, --tnAccWash, --tnAccText) ── */
  const accent = quiz.accent || "#E8A320";
  const accentVars = {
    "--tnAcc": accent,
    "--tnAccBorder": mix(accent, 0.5),
    "--tnAccWash": mix(accent, 0.16),
    "--tnAccText": lift(accent),
  } as React.CSSProperties;

  useEffect(() => {
    try { setOrigin(window.location.origin); } catch { /* no-op */ }
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") setHasShare(true);
  }, []);

  /* SEO-aiheopas (SSR, pelin alla) piilotetaan pelin ajaksi ja tulosnäkymässä */
  useEffect(() => {
    document.body.classList.toggle("tn-game-playing", phase !== "start");
    return () => document.body.classList.remove("tn-game-playing");
  }, [phase]);

  /* ── KORTTISÄÄNTÖ: otsikoiden sovitus ── */
  useLayoutEffect(() => {
    fitHeading(qhRef.current);
    fitHeading(startH1Ref.current);
  }, [phase, qi, questions]);
  useEffect(() => {
    const onR = () => { fitHeading(qhRef.current); fitHeading(startH1Ref.current); anchorTop.current = null; applyFreeze(); };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Freeze: lukitussa tilassa vastauslistan ylätila pidetään samana kuin
        vastaamattomassa, keskitetyssä tilassa — palaute kasvaa vain alaspäin ── */
  const applyFreeze = useCallback(() => {
    const m = mainRef.current, g = groupRef.current;
    if (!m) return;
    const clear = () => { m.style.removeProperty("padding-top"); m.style.removeProperty("align-content"); };
    if (!g || !locked || m.clientWidth < 880 || anchorTop.current == null) { clear(); return; }
    clear();
    m.style.setProperty("align-content", "start", "important");
    const zero = g.offsetTop;
    const pad = Math.max(0, anchorTop.current - zero + parseFloat(getComputedStyle(m).paddingTop || "0"));
    m.style.setProperty("padding-top", `${pad}px`, "important");
  }, [locked]);
  useLayoutEffect(() => { applyFreeze(); }, [applyFreeze, qi, phase]);

  /* ── Dialogien fokus + inert-tausta ── */
  useEffect(() => {
    const page = pageRef.current;
    const open = review != null || zoom;
    if (page) {
      if (open) { page.setAttribute("inert", ""); page.setAttribute("aria-hidden", "true"); }
      else { page.removeAttribute("inert"); page.removeAttribute("aria-hidden"); }
    }
    if (zoom && zoomRef.current) zoomRef.current.focus({ preventScroll: true });
    else if (review != null && dlgRef.current) dlgRef.current.focus({ preventScroll: true });
  }, [review, zoom]);
  useEffect(() => {
    if (review == null && openerRef.current) { try { openerRef.current.focus({ preventScroll: true }); } catch { /* no-op */ } openerRef.current = null; }
  }, [review]);
  useEffect(() => {
    if (!zoom && zoomOpenerRef.current) { try { zoomOpenerRef.current.focus({ preventScroll: true }); } catch { /* no-op */ } zoomOpenerRef.current = null; }
  }, [zoom]);

  /* ── Kuvan lataustila: välimuistista tullut kuva ei laukaise load-tapahtumaa ── */
  useEffect(() => {
    const el = imgRef.current;
    const k = imgKey(qi);
    if (!el || !k) return;
    if (el.complete && el.naturalWidth > 0) setImgs((m) => (m[k] === "ready" ? m : { ...m, [k]: "ready" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, bust, phase, questions]);

  const preloadNext = useCallback((i: number) => {
    const nxt = questions[i + 1];
    if (!nxt?.image) return;
    const im = new Image();
    im.decoding = "async";
    im.src = nxt.image;
  }, [questions]);

  function countUp(target: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShownScore(target); return; }
    const t0 = performance.now(), dur = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setShownScore(Math.round(target * e));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function recordPlay(finalScore: number) {
    if (recorded.current || !quiz.id) return; // kuvavisat: ei quizzes-riviä → ei tallennusta
    recorded.current = true;
    try {
      const sb = getSupabase();
      if (!sb) return;
      const playId = crypto.randomUUID();
      const { error } = await sb.from("quiz_plays").insert({
        id: playId, quiz_id: quiz.id, platform: "tietoniekka", score: finalScore, total: maxScore,
        session_id: getOrCreateSessionId(), shared: false,
      });
      if (!error) playIdRef.current = playId;
    } catch { /* best-effort */ }
  }
  async function markShared() {
    try {
      const sb = getSupabase();
      if (!sb || !playIdRef.current) return;
      await sb.from("quiz_plays").update({ shared: true }).eq("id", playIdRef.current);
    } catch { /* no-op */ }
  }

  function finish(finalScore: number) {
    anchorTop.current = null;
    setPhase("end");
    setReview(null);
    setCopyState(null);
    try { window.scrollTo(0, 0); } catch { /* no-op */ }
    try {
      if (quiz.id) {
        const KEY = "tn_played_quizzes";
        const arr = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
        if (!arr.includes(quiz.id)) { arr.push(quiz.id); window.localStorage.setItem(KEY, JSON.stringify(arr)); }
      }
    } catch { /* no-op */ }
    void recordPlay(finalScore);
    updateDailyStreak();
    if (quiz.isSankari) { try { window.localStorage.setItem(PAIVAN_VISA_KEY, localDateKey()); } catch { /* no-op */ } }
    if (quiz.citySlug) stampCity(quiz.citySlug);
    countUp(finalScore);
  }

  function lock(i: number) {
    if (phase !== "play" || locked || removed.includes(i) || answersLocked || !q) return;
    const m = mainRef.current, g = groupRef.current;
    anchorTop.current = m && g && m.clientWidth >= 880 ? g.offsetTop : null;
    const ok = q.options[i] === q.correct;
    const ns = ok ? streak + 1 : 0;
    const gained = ok ? BASE_POINTS + (ns > 1 ? (ns - 1) * STREAK_BONUS : 0) : 0;
    setSel(i);
    setLocked(true);
    setHist((h) => { const n = h.slice(); n[qi] = ok ? "ok" : "bad"; return n; });
    setPicks((p) => { const n = p.slice(); n[qi] = i; return n; });
    setStreak(ns);
    if (ok) { setRight((r) => r + 1); setScore((s) => s + gained); }
  }
  function pick(i: number) {
    if (locked || removed.includes(i) || answersLocked) return;
    setSel(i);
  }
  function next() {
    anchorTop.current = null;
    setQi((n) => n + 1);
    setSel(null);
    setLocked(false);
    setRemoved([]);
    preloadNext(qi + 1);
    try { window.scrollTo({ top: 0 }); } catch { /* no-op */ }
  }
  function advance() {
    if (!locked) return;
    if (qi >= total - 1) finish(score);
    else next();
  }
  function useLife() {
    if (lifeLeft <= 0 || locked || removed.length > 0 || answersLocked || !q) return;
    const wrong = q.options.map((o, i) => (o === q.correct ? -1 : i)).filter((i) => i >= 0);
    if (wrong.length < 2) return;
    const gone = [...wrong].sort(() => Math.random() - 0.5).slice(0, 2);
    setRemoved(gone);
    setLifeLeft((l) => l - 1);
    if (sel != null && gone.includes(sel)) setSel(null);
  }
  /* Tekninen ohitus: ensin korvaava kysymys (spare), sitten ohitus. */
  function skipTechnical() {
    const alt = spare.current.shift();
    if (alt) {
      setQuestions((qs) => { const n = qs.slice(); n[qi] = alt; return n; });
      setSel(null); setLocked(false); setRemoved([]);
      return;
    }
    anchorTop.current = null;
    const h = hist.slice(); h[qi] = "skipped";
    const p = picks.slice(); p[qi] = null;
    setHist(h); setPicks(p); setSel(null); setLocked(false); setRemoved([]);
    if (qi >= total - 1) finish(score);
    else { setQi(qi + 1); preloadNext(qi + 1); }
  }
  function retryImg() { setBust((b) => ({ ...b, [qi]: (b[qi] ?? 0) + 1 })); }
  function startGame() {
    setPhase("play");
    preloadNext(-1);
    try { window.scrollTo(0, 0); } catch { /* no-op */ }
  }
  function restart() {
    anchorTop.current = null;
    setPhase("play"); setQi(0); setSel(null); setLocked(false); setScore(0); setStreak(0); setRight(0);
    setHist([]); setPicks([]); setRemoved([]); setLifeLeft(oljenkorsiTotal); setReview(null); setShownScore(0); setCopyState(null);
    recorded.current = false; playIdRef.current = null;
    try { window.scrollTo(0, 0); } catch { /* no-op */ }
  }

  /* ── Näppäimistö (design): A–D / 1–4 lukitsevat, nuolet valitsevat, Enter/väli
        lukitsee tai siirtyy; fokus kontrollissa → näppäin kuuluu sille ── */
  useEffect(() => {
    function ctx() {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return { typing: false, control: false };
      const tag = el.tagName.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
      const control = typing || tag === "button" || tag === "a" || tag === "summary" || el.getAttribute("role") === "button" || el.hasAttribute("tabindex");
      return { typing, control };
    }
    function nextEnabled(from: number | null, dir: number, n: number) {
      let i = from == null ? (dir > 0 ? 0 : n - 1) : (from + dir + n) % n;
      for (let g = 0; g < n; g++) { if (!removed.includes(i)) return i; i = (i + dir + n) % n; }
      return null;
    }
    function onKey(e: KeyboardEvent) {
      const c = ctx();
      if (zoom) { if (e.key === "Escape") { e.preventDefault(); setZoom(false); } return; }
      if (phase === "start") { if ((e.key === "Enter" || e.key === " ") && !c.control) { e.preventDefault(); startGame(); } return; }
      if (review != null) {
        if (e.key === "Escape") { e.preventDefault(); setReview(null); }
        else if (!c.typing && e.key === "ArrowRight") { e.preventDefault(); setReview(Math.min(total - 1, review + 1)); }
        else if (!c.typing && e.key === "ArrowLeft") { e.preventDefault(); setReview(Math.max(0, review - 1)); }
        return;
      }
      if (phase !== "play" || !q) return;
      const n = q.options.length;
      const k = (e.key || "").toUpperCase();
      if (!locked && !c.typing) {
        const li = KEYS.indexOf(k);
        const ni = "1234".indexOf(k);
        const idx = li >= 0 ? li : ni;
        if (idx >= 0 && idx < n) { if (!removed.includes(idx)) { e.preventDefault(); lock(idx); } return; }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const i = nextEnabled(sel, e.key === "ArrowDown" ? 1 : -1, n);
          if (i != null) pick(i);
          return;
        }
      }
      if (e.key === "Enter" || e.key === " ") {
        if (c.control) return;
        e.preventDefault();
        if (locked) advance(); else if (sel != null) lock(sel);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── Haaste ja jaot (3a: linkki = visan oma osoite, aina valmis) ── */
  const challengeUrl = `${origin}${quiz.challengePath}`;
  const shareText = `Sain ${right}/${total} Tietoniekan ${quiz.title} -visassa. Pystytkö parempaan?`;
  const linkReady = !!quiz.challengePath;
  function clearCopyLater() { if (copyTimer.current) clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopyState(null), 3000); }
  function copyLink() {
    const payload = `${shareText} ${challengeUrl}`;
    const ok = () => { setCopyState("copied"); clearCopyLater(); void markShared(); };
    const fail = () => { setCopyState("error"); clearCopyLater(); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(payload).then(ok, fail);
    else fail();
  }
  function nativeShare() {
    if (!navigator.share) return;
    navigator.share({ title: `Tietoniekka · ${quiz.title}`, text: shareText, url: challengeUrl })
      .then(() => void markShared())
      .catch((e: { name?: string }) => { if (e && e.name !== "AbortError") { setCopyState("sharefail"); clearCopyLater(); } });
  }

  const category = quiz.collectionLabel;
  const countLabel = `${total} ${isKuva ? "kuvaa" : "kysymystä"}`;
  const mode = phase === "start" ? "aloitus" : done ? "valmis" : "peli";

  /* ── Tulosnäkymän arvot ── */
  const skipped = hist.filter((v) => v === "skipped").length;
  const scored = Math.max(1, total - skipped);
  const pct = Math.round((right / scored) * 100);
  const tier = TIERS.find((t) => pct >= t.min) ?? TIERS[TIERS.length - 1];
  const today = new Date();
  const playedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
  const liveStatus =
    copyState === "copied" ? "Haastelinkki kopioitu leikepöydälle."
    : copyState === "error" ? "Linkin kopiointi ei onnistunut. Yritä uudelleen."
    : copyState === "sharefail" ? "Jakaminen ei onnistunut. Yritä uudelleen."
    : linkReady ? "Haastelinkki valmis." : "Haastelinkkiä ei ole vielä luotu — jakaminen aktivoituu, kun linkki on olemassa.";
  const waHref = linkReady ? `https://wa.me/?text=${enc(`${shareText} ${challengeUrl}`)}` : undefined;
  const fbHref = linkReady ? `https://www.facebook.com/sharer/sharer.php?u=${enc(challengeUrl)}` : undefined;
  const tgHref = linkReady ? `https://t.me/share/url?url=${enc(challengeUrl)}&text=${enc(shareText)}` : undefined;
  const xHref = linkReady ? `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(challengeUrl)}` : undefined;
  const shareTab = linkReady ? undefined : -1;

  const openReview = (i: number, opener?: HTMLElement | null) => {
    if (review == null) openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setReview(Math.max(0, Math.min(total - 1, i)));
  };

  const qLen = !q ? "short" : q.question.length > 220 ? "xlong" : q.question.length > 100 ? "long" : q.question.length > 58 ? "med" : "short";
  const curImgState = q?.image ? imgState(qi) : null;
  const curImgKey = imgKey(qi);
  const revealed = locked;
  const rq = questions[review ?? 0];
  const rp = review != null ? picks[review] : null;
  const rvKind: "ok" | "bad" | "tech" | "skip" = review == null ? "skip" : hist[review] === "ok" ? "ok" : hist[review] === "bad" ? "bad" : hist[review] === "skipped" ? "tech" : "skip";

  return (
    <div ref={rootRef} className="tng" style={accentVars}>
      <div className="tng-bg" aria-hidden style={{ backgroundImage: `url(${quiz.bgImg})` }} />
      <div className="tng-bgshade" aria-hidden />
      <div className="tng-topline" aria-hidden />

      <div ref={pageRef}>
        {/* ── HUD ── */}
        <header className="tng-top">
          <div className="tng-brand">
            <a className="tng-logo" href="/2-0" aria-label="Tietoniekka etusivu"><b>TIETO</b><span>NIEKKA</span></a>
            <span className="tng-brandsep" aria-hidden />
            <span className="tng-cat">{category}</span>
          </div>
          <div className="tng-progress" data-hide={phase === "start" ? "1" : "0"}>
            <div className="tng-pips" role="img" aria-label={`Kysymys ${Math.min(qi + 1, total)} / ${total}, ${right} oikein`}>
              {questions.map((_, i) => (
                <span key={i} className="tng-pip" data-state={hist[i] ?? (i === qi && !done ? "now" : "todo")} />
              ))}
            </div>
            <div className="tng-progress-row">
              {done ? (
                <span className="tng-done">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 8.6l3.3 3.3 7.7-7.8" /></svg>
                  Visa valmis
                </span>
              ) : (
                <span className="tng-qcount">Kysymys <b>{Math.min(qi + 1, total)}</b> / {total}</span>
              )}
              <span className="tng-right">{right} oikein</span>
            </div>
          </div>
          <div className="tng-stats" data-hide={phase === "start" ? "1" : "0"}>
            <div className="tng-stat">
              <span className="tng-stat-l">Pisteet</span>
              <span className="tng-stat-v">{score}</span>
            </div>
            <span className="tng-statsep" aria-hidden />
            <div className="tng-stat tng-stat--streak">
              <span className="tng-stat-l">Putki</span>
              <span className="tng-stat-v tng-stat-v--streak">
                <svg className="tng-flame" width="14" height="17" viewBox="0 0 13 16" aria-hidden="true"><path d="M6.4 15.6C3.6 15.6 1.4 13.6 1.4 11c0-3.7 3.4-5.2 3.4-8.5 0-.9-.2-1.7-.5-2.5 3 1.2 5 3.7 5 6.4 0 .8-.2 1.5-.5 2.1 1-.1 1.6-.8 1.8-1.7.7 1 1 2.1 1 3.2 0 3.1-2.4 5.6-5.2 5.6z" fill="#E8A320" /></svg>
                {streak}
              </span>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="tng-main" data-mode={mode}>
          {/* ── Aloitusnäkymä ── */}
          {phase === "start" && (
            <section className="tng-start" aria-label="Visan aloitus">
              <span className="tng-start-cat"><i aria-hidden />{category}</span>
              <h1 ref={startH1Ref} className="tng-start-h1">{quiz.title}</h1>
              {quiz.teaser && <p className="tng-start-p">{quiz.teaser}</p>}
              <div className="tng-start-row">
                <button type="button" className="tng-start-btn" onClick={startGame}>Aloita visa <span aria-hidden>→</span></button>
                <span className="tng-start-count">{countLabel}</span>
              </div>
            </section>
          )}

          {/* ── Kysymysnäkymä ── */}
          {phase === "play" && q && (
            <>
              <section className="tng-qcol">
                {q.context && <span className="tng-context">{q.context}</span>}
                <h1 ref={qhRef} className="tng-qh" data-qlen={qLen} data-img={q.image ? "1" : undefined}>{q.question}</h1>
                {q.image && (
                  <figure className="tng-media">
                    <div className="tng-mediaframe">
                      {curImgState !== "ready" && curImgState !== "error" && <div className="tng-skeleton" aria-hidden />}
                      <button
                        type="button"
                        className="tng-zoombtn"
                        aria-label="Suurenna kysymyksen kuva"
                        disabled={curImgState !== "ready"}
                        onClick={(e) => { zoomOpenerRef.current = e.currentTarget; setZoom(true); }}
                      >
                        {curImgState === "ready" && (
                          <span className="tng-zoomhint" aria-hidden>
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8.6" cy="8.6" r="5.6" /><path d="M12.8 12.8L17 17M6.4 8.6h4.4M8.6 6.4v4.4" /></svg>
                            Suurenna kuva
                          </span>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          key={curImgKey ?? "img"}
                          ref={imgRef}
                          className="tng-qimg"
                          src={curImgKey ?? undefined}
                          alt={revealed ? `Kysymyksen kuva — oikea vastaus: ${q.correct}` : "Kysymys perustuu kuvan tunnistamiseen"}
                          decoding="async"
                          data-ready={curImgState === "ready" ? "1" : "0"}
                          onLoad={() => { if (curImgKey) setImgs((m) => ({ ...m, [curImgKey]: "ready" })); }}
                          onError={() => { if (curImgKey) setImgs((m) => ({ ...m, [curImgKey]: "error" })); }}
                        />
                      </button>
                      {curImgState === "error" && (
                        <div className="tng-imgerr">
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFA88F" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M3 5.5h18v13H3zM3 15l5-4 4 3 3-2.5 6 4.5" /><path d="M2 2l20 20" /></svg>
                          <span className="tng-imgerr-t">Kuvaa ei voitu ladata</span>
                          <span className="tng-imgerr-p">Tekninen virhe ei ole väärä vastaus: se ei vie pisteitä eikä katkaise putkea.</span>
                          <div className="tng-imgerr-row">
                            <button type="button" className="tng-ghost tng-ghost--outline" onClick={retryImg}>
                              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 10a7 7 0 11-2.05-4.95M17 3v3.5h-3.5" /></svg>
                              Yritä uudelleen
                            </button>
                            <button type="button" className="tng-ghost tng-ghost--dashed" onClick={skipTechnical}>
                              Ohita teknisen virheen vuoksi <span aria-hidden>→</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="tng-sr" role="status" aria-live="polite">
                      {curImgState === "loading" ? "Kuva latautuu…" : curImgState === "error" ? "Kuvaa ei voitu ladata." : ""}
                    </span>
                  </figure>
                )}
              </section>

              <section className="tng-acol">
                {answersLocked && curImgState !== "error" && (
                  <div className="tng-wait" role="status" aria-live="polite"><i aria-hidden />Kuva latautuu. Vastaaminen avautuu, kun kuva on valmis.</div>
                )}
                <div ref={groupRef} className="tng-agroup" role="group" aria-label="Vastausvaihtoehdot" aria-busy={answersLocked}>
                  {q.options.map((text, i) => {
                    const gone = removed.includes(i);
                    let state = "", note = "", mark = "";
                    if (gone) state = "gone";
                    else if (locked) {
                      if (text === q.correct) { state = "correct"; note = "Oikea vastaus"; mark = "✓"; }
                      else if (i === sel) { state = "wrong"; note = "Sinun valintasi"; mark = "✕"; }
                      else state = "dim";
                    } else if (sel === i) { state = "sel"; note = "Valittu"; mark = "•"; }
                    return (
                      <button
                        key={`${qi}-${i}`}
                        type="button"
                        className="tng-ans"
                        data-state={state || undefined}
                        disabled={gone || locked || answersLocked}
                        aria-pressed={sel === i}
                        aria-label={`${KEYS[i]}. ${text}${gone ? " — poistettu oljenkorrella" : note ? ` — ${note}` : ""}`}
                        onClick={() => lock(i)}
                      >
                        <span className="tng-badge" aria-hidden>{KEYS[i]}</span>
                        <span className="tng-abody">
                          <span className="tng-atext">{text}</span>
                          <span className="tng-anote" data-empty={note ? "0" : "1"} aria-hidden>
                            <i>{mark}</i>{note}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {locked && (
                  <div className="tng-fbslot">
                    <div className="tng-fb" data-fb={sel != null && q.options[sel] === q.correct ? "ok" : "bad"} role="status" aria-live="polite">
                      <div className="tng-fb-head">
                        <span className="tng-fbicon" aria-hidden>{sel != null && q.options[sel] === q.correct ? "✓" : "✕"}</span>
                        <span className="tng-fbtitle">{sel != null && q.options[sel] === q.correct ? "Oikein!" : "Väärin"}</span>
                        <span className="tng-fbpts">
                          {sel != null && q.options[sel] === q.correct
                            ? `+${BASE_POINTS + (streak > 1 ? (streak - 1) * STREAK_BONUS : 0)} pistettä`
                            : "+0 pistettä"}
                        </span>
                      </div>
                      <div className="tng-fb-body">
                        {sel != null && q.options[sel] !== q.correct && (
                          <span className="tng-fb-correct">Oikea vastaus: {q.correct}</span>
                        )}
                        {q.fact && (
                          <>
                            <span className="tng-kicker">Tiesitkö?</span>
                            <span className="tng-tip">{q.fact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="tng-act">
                  <button
                    type="button"
                    className="tng-life"
                    data-state={lifeLeft <= 0 ? "used" : undefined}
                    disabled={lifeLeft <= 0 || locked || removed.length > 0 || answersLocked}
                    onClick={useLife}
                  >
                    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="9" r="7.1" /><circle cx="9" cy="9" r="2.6" /><path d="M4 4l3.1 3.1M14 4l-3.1 3.1M4 14l3.1-3.1M14 14l-3.1-3.1" /></svg>
                    <span>
                      {lifeLeft <= 0 ? "Oljenkorsi käytetty" : oljenkorsiTotal > 1 ? `Oljenkorsi ×${lifeLeft} · poista 2 väärää` : "Oljenkorsi · poista 2 väärää"}
                    </span>
                  </button>
                  {locked ? (
                    <button type="button" className="tng-next" onClick={advance}>
                      {qi >= total - 1 ? "Näytä tulos" : "Seuraava"} <span aria-hidden>→</span>
                    </button>
                  ) : (
                    <span className="tng-hint">Vastaa myös näppäimillä A–D</span>
                  )}
                </div>
              </section>
            </>
          )}

          {/* ── Tulosnäkymä ── */}
          {done && (
            <>
              <section className="tng-resleft" aria-label="Tulos">
                <div className="tng-rescard" data-perfect={pct === 100 ? "1" : "0"}>
                  <div className="tng-rescard-top">
                    <span className="tng-rescat"><i aria-hidden />{category}</span>
                    <span className="tng-resdate">{playedDate}</span>
                  </div>
                  <div className="tng-resnums">
                    <span className="tng-bignum" aria-hidden><b>{right}</b><i>/</i>{total}</span>
                    <div className="tng-resmeta">
                      <div><span className="tng-resmeta-l">Osumatarkkuus</span><span className="tng-resmeta-v">{pct} %</span></div>
                      <div><span className="tng-resmeta-l">Pisteet</span><span className="tng-resmeta-v">{shownScore}</span></div>
                    </div>
                  </div>
                  <span className="tng-sr">{right} oikein {total}:sta, osumatarkkuus {pct} prosenttia, {score} pistettä.</span>
                  <h1 className="tng-restitle">{tier.title}</h1>
                  <p className="tng-resbody">{tier.body}</p>
                  <p className="tng-resname">{quiz.title}</p>
                </div>

                <div className="tng-sumwrap">
                  <div className="tng-sumhead">
                    <span className="tng-sumlabel">Vastauksesi</span>
                    <span className="tng-sumtext">
                      {right} oikein, {Math.max(0, total - right - skipped)} väärin{skipped ? `, ${skipped} tekninen ohitus` : ""}
                    </span>
                    <button type="button" className="tng-ghost tng-ghost--right" onClick={(e) => openReview(0, e.currentTarget)}>
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1.4 9S3.9 4 9 4s7.6 5 7.6 5-2.5 5-7.6 5S1.4 9 1.4 9z" /><circle cx="9" cy="9" r="2.1" /></svg>
                      Tarkastele vastauksia
                    </button>
                  </div>
                  <div className="tng-sumgrid" role="list">
                    {questions.map((_, i) => {
                      const st = hist[i] === "bad" ? "bad" : hist[i] === "ok" ? "ok" : hist[i] === "skipped" ? "skip" : "todo";
                      const label = st === "ok" ? "oikein" : st === "bad" ? "väärin" : st === "skip" ? "tekninen ohitus" : "ei vastattu";
                      return (
                        <button key={i} type="button" role="listitem" className="tng-sum" data-state={st} aria-label={`Kysymys ${i + 1}, ${label} — avaa vastaus`} onClick={(e) => openReview(i, e.currentTarget)}>
                          <i aria-hidden>{st === "ok" ? "✓" : st === "bad" ? "✕" : st === "skip" ? "⤼" : "–"}</i>{i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="tng-resright" aria-label="Haasta kaveri ja jaa haaste">
                <div className="tng-chal">
                  <h2 className="tng-chaltitle">Haasta kaveri — kumpi tietää enemmän?</h2>
                  <ul className="tng-chalbullets">
                    <li><i aria-hidden />Kaveri saa täsmälleen saman kysymyssarjan.</li>
                    <li><i aria-hidden />Tuloksesi {right}/{total} on hänen vertailukohtansa.</li>
                    <li><i aria-hidden />Linkki avaa visan suoraan — kirjautumista ei tarvita.</li>
                  </ul>
                  <div className="tng-linkstatus" data-kind={linkReady ? "ready" : "demo"} role="status" aria-live="polite">
                    <span className="tng-linkdot" aria-hidden />
                    <span>{liveStatus}</span>
                  </div>
                  <a className="tng-wa" href={waHref} target="_blank" rel="noopener" data-blocked={linkReady ? undefined : "true"} aria-disabled={!linkReady || undefined} tabIndex={shareTab} onClick={() => void markShared()}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.2-4.92-4.4-.14-.2-1.16-1.55-1.16-2.96 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.56c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.14-.3.3-.13.59.17.29.75 1.23 1.6 2 1.1.97 2.03 1.28 2.32 1.42.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.71-.17 1.39z" /></svg>
                    Haasta WhatsAppissa
                  </a>
                  <div className="tng-sharepreview">
                    <span className="tng-sharepreview-l">Kaverille lähtee</span>
                    <span className="tng-sharepreview-t">{shareText}</span>
                    <span className="tng-sharepreview-u">{challengeUrl}</span>
                  </div>
                </div>

                <div className="tng-sharewrap">
                  {hasShare && (
                    <button type="button" className="tng-share tng-share--native" disabled={!linkReady} data-blocked={linkReady ? undefined : "true"} onClick={nativeShare}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="15" cy="4.6" r="2.4" /><circle cx="5" cy="10" r="2.4" /><circle cx="15" cy="15.4" r="2.4" /><path d="M7.1 8.8 12.9 5.8M7.1 11.2l5.8 3" /></svg>
                      Haasta muissa sovelluksissa
                    </button>
                  )}
                  <span className="tng-sumlabel">Jaa haaste</span>
                  <div className="tng-sharegrid">
                    <a className="tng-share" href={fbHref} target="_blank" rel="noopener" data-blocked={linkReady ? undefined : "true"} aria-disabled={!linkReady || undefined} tabIndex={shareTab} onClick={() => void markShared()}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.45-4.92 8.45-9.94z" /></svg>
                      Facebook
                    </a>
                    <a className="tng-share" href={tgHref} target="_blank" rel="noopener" data-blocked={linkReady ? undefined : "true"} aria-disabled={!linkReady || undefined} tabIndex={shareTab} onClick={() => void markShared()}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.64 6.86-1.7 8.03c-.13.57-.47.71-.95.44l-2.62-1.93-1.27 1.22c-.14.14-.26.26-.53.26l.19-2.68 4.88-4.41c.21-.19-.05-.29-.33-.11l-6.03 3.8-2.6-.81c-.56-.18-.57-.56.12-.83l10.15-3.91c.47-.17.88.11.72.94z" /></svg>
                      Telegram
                    </a>
                    <a className="tng-share" href={xHref} target="_blank" rel="noopener" data-blocked={linkReady ? undefined : "true"} aria-disabled={!linkReady || undefined} tabIndex={shareTab} onClick={() => void markShared()}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFFBF2" aria-hidden="true"><path d="M17.53 3h3.2l-6.99 7.99L21.5 21h-5.3l-4.15-5.43L7.3 21H4.1l7.28-8.32L3.5 3h5.4l3.86 5.1L17.53 3zm-1.12 16.1h1.77L7.68 4.8H5.8l10.6 14.3z" /></svg>
                      <span>X</span>
                    </a>
                    <button type="button" className="tng-share" disabled={!linkReady} data-blocked={linkReady ? undefined : "true"} onClick={copyLink}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#CBC1AD" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.4" /><path d="M13 4.6A2.6 2.6 0 0010.4 2H5.6A2.6 2.6 0 003 4.6v4.8A2.6 2.6 0 005.6 12" /></svg>
                      <span style={{ whiteSpace: "nowrap" }}>{copyState === "copied" ? "Linkki kopioitu" : copyState === "error" ? "Kopiointi ei onnistunut" : "Kopioi linkki"}</span>
                    </button>
                  </div>
                </div>

                <div className="tng-resact">
                  <button type="button" onClick={restart}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 10a7 7 0 11-2.05-4.95M17 3v3.5h-3.5" /></svg>
                    Pelaa uudelleen
                  </button>
                  <a href="/2-0/kokoelmat">Valitse uusi visa</a>
                </div>
              </section>

              {quiz.related.length > 0 && (
                <section className="tng-recs" aria-label="Lisää samasta aiheesta">
                  <span className="tng-sumlabel">Lisää: {category}</span>
                  <div className="tng-recgrid">
                    {quiz.related.map((r) => (
                      <a key={r.id} className="tng-rec" href={r.href ?? `/2-0/peli?quiz_id=${r.id}`}>
                        <span className="tng-rec-text">
                          <span className="tng-rec-name">{r.title}</span>
                          <span className="tng-rec-meta">{r.meta}</span>
                        </span>
                        <span className="tng-recarrow" aria-hidden>→</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Suurennettu kuva ── */}
      {zoom && q?.image && (
        <div className="tng-zoom">
          <div className="tng-zoom-head">
            <span className="tng-zoom-l">Suurennettu kuva</span>
            <button type="button" className="tng-iconbtn tng-iconbtn--right" aria-label="Sulje suurennettu kuva" onClick={() => setZoom(false)}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
            </button>
          </div>
          <div ref={zoomRef} className="tng-zoom-body" role="dialog" aria-modal="true" aria-label="Kysymyksen kuva suurennettuna" tabIndex={-1}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={curImgKey ?? undefined} alt={revealed ? `Kysymyksen kuva — oikea vastaus: ${q.correct}` : "Kysymys perustuu kuvan tunnistamiseen"} />
          </div>
        </div>
      )}

      {/* ── Vastausten tarkastelu ── */}
      {review != null && rq && (
        <div className="tng-overlay">
          <button type="button" className="tng-overlay-close" aria-label="Sulje vastausten tarkastelu" onClick={() => setReview(null)} />
          <div ref={dlgRef} className="tng-dlg" role="dialog" aria-modal="true" aria-label="Vastausten tarkastelu" tabIndex={-1}>
            <div className="tng-dlg-head">
              <span className="tng-dlg-num">Kysymys {review + 1} / {total}</span>
              <span className="tng-rvstate" data-kind={rvKind}>
                <span aria-hidden>{rvKind === "ok" ? "✓" : rvKind === "bad" ? "✕" : rvKind === "tech" ? "⤼" : "–"}</span>
                {rvKind === "ok" ? "Oikein" : rvKind === "bad" ? "Väärin" : rvKind === "tech" ? "Tekninen ohitus" : "Ei vastattu"}
              </span>
              <button type="button" className="tng-iconbtn tng-iconbtn--right" aria-label="Sulje" onClick={() => setReview(null)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
              </button>
            </div>
            <div className="tng-dlg-body">
              {rq.context && <span className="tng-context">{rq.context}</span>}
              <h3 className="tng-dlg-q">{rq.question}</h3>
              {rq.image && (
                <div className="tng-dlg-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rq.image} alt={`Kysymyksen kuva — oikea vastaus: ${rq.correct}`} />
                </div>
              )}
              <div className="tng-rvrows">
                <div className="tng-rvrow" data-kind={rvKind}>
                  <span className="tng-rvrow-l">Sinun vastauksesi</span>
                  <span className="tng-rvrow-v">{rp == null ? (rvKind === "tech" ? "Ohitettu teknisen virheen vuoksi — ei laskettu vääräksi" : "Ei vastattu") : rq.options[rp]}</span>
                </div>
                <div className="tng-rvrow tng-rvrow--correct">
                  <span className="tng-rvrow-l">Oikea vastaus</span>
                  <span className="tng-rvrow-v">{rq.correct}</span>
                </div>
              </div>
              {rq.fact && (
                <div className="tng-fb-body">
                  <span className="tng-kicker">Tiesitkö?</span>
                  <span className="tng-dlg-tip">{rq.fact}</span>
                </div>
              )}
            </div>
            <div className="tng-dlg-foot">
              <button type="button" className="tng-navbtn" aria-label="Edellinen kysymys" disabled={review <= 0} onClick={() => setReview(Math.max(0, review - 1))}><span aria-hidden>←</span> Edellinen</button>
              <button type="button" className="tng-navbtn tng-navbtn--right" aria-label="Seuraava kysymys" disabled={review >= total - 1} onClick={() => setReview(Math.min(total - 1, review + 1))}>Seuraava <span aria-hidden>→</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
