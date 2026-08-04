"use client";

// Mega-editorin client-osa: rivit (avaa/arvo/valitse tilalle/poista/siirrä)
// + kysymysselain, joka toimii kahdessa tilassa (Heikki 4.8.2026):
//   'add'     = poimi yksittäisiä kysymyksiä lisättäväksi (checkboxit)
//   'replace' = valitse yksi kysymys tietyn rivin tilalle

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addMegaQuestions, deleteMega, loadQuizQuestions, moveMegaQuestion,
  removeMegaQuestion, replaceMegaQuestion, searchSourceQuizzes,
  swapMegaQuestion, toggleMegaPublish,
} from "../actions";

export type MegaRow = {
  questionId: string;
  sortOrder: number;
  question: string;
  explanation: string | null;
  answers: Array<{ text: string; is_correct: boolean }>;
  sourceQuizId: string;
  sourceTitle: string;
  collection: string;
};

const COLL_LABEL: Record<string, string> = {
  tv: "TV", urheilu: "Urheilu", elokuvat: "Elokuvat", musiikki: "Musiikki",
  matkakohteet: "Matkakohteet", yleistieto: "Yleistieto", "tunnetut-henkilot": "Henkilöt",
};

type BrowserState =
  | { mode: "add" }
  | { mode: "replace"; questionId: string; question: string }
  | null;

export function MegaEditor({ mega, rows }: { mega: { id: string; title: string; slug: string | null; status: string }; rows: MegaRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [browser, setBrowser] = useState<BrowserState>(null);

  const perSource = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.sourceQuizId, (m.get(r.sourceQuizId) ?? 0) + 1);
    return m;
  }, [rows]);
  const collCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.collection, (m.get(r.collection) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const overLimit = [...perSource.values()].some((n) => n > 2);

  function run(fn: () => Promise<{ ok: boolean; error?: string } | void>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res && !res.ok) setError(res.error ?? "Tuntematon virhe");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            <span className="mr-2 inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700">MEGA</span>
            {mega.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} kysymystä · {mega.status === "published" ? "Julkaistu" : "Draft"}
            {mega.slug && (
              <> · <a className="underline" href={`https://tietoniekka-git-feat-tietoniekka-2-0-lakeboodoms-projects.vercel.app/2-0/peli?mega=${mega.slug}`} target="_blank" rel="noreferrer">Avaa previewssä ↗</a></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run(() => toggleMegaPublish(mega.id, mega.status !== "published"))}
          >
            {mega.status === "published" ? "Palauta draftiksi" : "Julkaise"}
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            disabled={pending}
            onClick={() => { if (confirm("Poistetaanko koko Mega? Lähdevisojen kysymyksiin ei kosketa.")) run(() => deleteMega(mega.id)); }}
          >
            Poista Mega
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {collCounts.map(([c, n]) => (
          <span key={c} className="inline-flex items-center rounded-full border px-2 py-0.5 text-muted-foreground">
            {COLL_LABEL[c] ?? c}: {n}
          </span>
        ))}
        {overLimit && (
          <span className="inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-600/10 px-2 py-0.5 text-yellow-700">
            ⚠ Jostain lähdevisasta on yli 2 kysymystä
          </span>
        )}
      </div>

      {mega.status !== "published" && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          Julkaistu Mega näkyisi myös nykyisen tuotantosivun listauksissa. Suositus: pidä draftina
          2.0-julkaisuun asti — draft näkyy silti 2.0-previewssä pelattavana.
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="divide-y rounded-md border">
        {rows.map((r, i) => {
          const many = (perSource.get(r.sourceQuizId) ?? 0) > 2;
          return (
            <details key={r.questionId} className="group">
              <summary className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.question}</span>
                <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-xs sm:inline-flex ${many ? "border-yellow-600/40 text-yellow-700" : "text-muted-foreground"}`}>
                  {COLL_LABEL[r.collection] ?? r.collection}
                </span>
                <span className="hidden max-w-44 shrink-0 truncate text-xs text-muted-foreground md:block">{r.sourceTitle}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" disabled={pending || i === 0} onClick={(e) => { e.preventDefault(); run(() => moveMegaQuestion(mega.id, r.questionId, "up")); }}>↑</Button>
                  <Button variant="ghost" size="sm" disabled={pending || i === rows.length - 1} onClick={(e) => { e.preventDefault(); run(() => moveMegaQuestion(mega.id, r.questionId, "down")); }}>↓</Button>
                  <Button variant="ghost" size="sm" disabled={pending} title="Arvo tilalle satunnainen samasta kokoelmasta" onClick={(e) => { e.preventDefault(); run(() => swapMegaQuestion(mega.id, r.questionId)); }}>Arvo</Button>
                  <Button variant="ghost" size="sm" disabled={pending} title="Valitse korvaaja itse kysymysselaimesta" onClick={(e) => { e.preventDefault(); setBrowser({ mode: "replace", questionId: r.questionId, question: r.question }); }}>Valitse…</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={(e) => { e.preventDefault(); run(() => removeMegaQuestion(mega.id, r.questionId)); }}>Poista</Button>
                </span>
              </summary>
              <div className="space-y-1 bg-muted/30 px-14 py-3 text-sm">
                {r.answers.map((a, ai) => (
                  <div key={ai} className={a.is_correct ? "font-semibold text-green-700" : "text-muted-foreground"}>
                    {String.fromCharCode(65 + ai)}. {a.text} {a.is_correct ? "✓" : ""}
                  </div>
                ))}
                {r.explanation && <p className="pt-1 text-xs text-muted-foreground">{r.explanation}</p>}
                <p className="pt-1 text-xs text-muted-foreground">Lähde: <a className="underline" href={`/quizzes/${r.sourceQuizId}`}>{r.sourceTitle}</a></p>
              </div>
            </details>
          );
        })}
      </div>

      {browser === null ? (
        <Button variant="outline" onClick={() => setBrowser({ mode: "add" })}>+ Lisää kysymys lähdevisasta</Button>
      ) : (
        <QuestionBrowser
          megaId={mega.id}
          state={browser}
          perSource={perSource}
          existing={new Set(rows.map((r) => r.questionId))}
          onClose={() => setBrowser(null)}
          onDone={() => { setBrowser(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

/* ── Kysymysselain: 'add' = poimi useita · 'replace' = valitse yksi tilalle ── */
function QuestionBrowser({ megaId, state, perSource, existing, onClose, onDone }: {
  megaId: string;
  state: Exclude<BrowserState, null>;
  perSource: Map<string, number>;
  existing: Set<string>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [term, setTerm] = useState("");
  const [quizzes, setQuizzes] = useState<Array<{ id: string; title: string; collection: string | null }>>([]);
  const [openQuiz, setOpenQuiz] = useState<{ id: string; title: string } | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: string; question_text: string; correct: string }>>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();

  if (!loaded) {
    setLoaded(true);
    start(async () => setQuizzes(await searchSourceQuizzes("")));
  }

  const replaceMode = state.mode === "replace";

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {replaceMode
            ? <>Valitse tilalle → <span className="font-normal text-muted-foreground">korvaa: &rdquo;{state.mode === "replace" ? state.question : ""}&rdquo;</span></>
            : "Kysymysselain — poimi yksittäisiä kysymyksiä"}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Sulje</Button>
      </div>
      {!openQuiz ? (
        <>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="Hae visaa nimellä…"
            value={term}
            onChange={(e) => {
              const v = e.target.value;
              setTerm(v);
              start(async () => setQuizzes(await searchSourceQuizzes(v)));
            }}
          />
          <div className="max-h-72 divide-y overflow-auto rounded-md border">
            {quizzes.map((z) => (
              <button
                key={z.id}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
                onClick={() => {
                  setOpenQuiz({ id: z.id, title: z.title });
                  start(async () => setQuestions(await loadQuizQuestions(z.id)));
                }}
              >
                <span className="truncate">{z.title}</span>
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                  {COLL_LABEL[z.collection ?? ""] ?? z.collection}
                  {(perSource.get(z.id) ?? 0) > 0 && ` · Megassa jo ${perSource.get(z.id)}`}
                </span>
              </button>
            ))}
            {quizzes.length === 0 && <div className="p-3 text-sm text-muted-foreground">Ei osumia.</div>}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <b>{openQuiz.title}</b>
            <Button variant="ghost" size="sm" onClick={() => { setOpenQuiz(null); setPicked(new Set()); }}>← Takaisin hakuun</Button>
          </div>
          {(perSource.get(openQuiz.id) ?? 0) >= 2 && (
            <p className="text-xs text-yellow-700">⚠ Tästä visasta on Megassa jo {perSource.get(openQuiz.id)} kysymystä (suositus max 2).</p>
          )}
          <div className="max-h-72 divide-y overflow-auto rounded-md border">
            {questions.map((q) => {
              const already = existing.has(q.id);
              if (replaceMode) {
                return (
                  <div key={q.id} className={`flex items-center gap-3 px-3 py-2 text-sm ${already ? "opacity-50" : ""}`}>
                    <span className="min-w-0 flex-1">
                      <span className="block">{q.question_text}</span>
                      <span className="block text-xs text-muted-foreground">Oikea: {q.correct}{already ? " · jo Megassa" : ""}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || already}
                      onClick={() => start(async () => {
                        if (state.mode !== "replace") return;
                        await replaceMegaQuestion(megaId, state.questionId, q.id);
                        onDone();
                      })}
                    >
                      Vaihda tähän
                    </Button>
                  </div>
                );
              }
              return (
                <label key={q.id} className={`flex items-start gap-3 px-3 py-2 text-sm ${already ? "opacity-50" : "cursor-pointer hover:bg-muted/50"}`}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    disabled={already}
                    checked={already || picked.has(q.id)}
                    onChange={(e) => {
                      const next = new Set(picked);
                      if (e.target.checked) next.add(q.id); else next.delete(q.id);
                      setPicked(next);
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block">{q.question_text}</span>
                    <span className="block text-xs text-muted-foreground">Oikea: {q.correct}{already ? " · jo Megassa" : ""}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {!replaceMode && (
            <Button
              disabled={pending || picked.size === 0}
              onClick={() => start(async () => {
                await addMegaQuestions(megaId, [...picked]);
                setPicked(new Set());
                onDone();
              })}
            >
              Lisää valitut ({picked.size})
            </Button>
          )}
        </>
      )}
    </div>
  );
}
