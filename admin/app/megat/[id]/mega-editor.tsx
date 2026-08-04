"use client";

// Mega-editorin client-osa — sekamuotoinen (Heikki 4.8.2026):
// rivit ovat visakysymyksiä (q:) tai kuvakortteja (kv:).
// Selain toimii kahdessa tilassa: 'add' (poimi useita) / 'replace' (valitse yksi).
// Lähteinä sekä visat että kuvakortistot.

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addMegaRows, deleteMega, listDecks, loadDeckImages, loadQuizQuestions,
  moveMegaRow, removeMegaRow, replaceMegaRow, searchSourceQuizzes,
  swapMegaRow, toggleMegaPublish,
} from "../actions";

export type MegaRow = {
  key: string;                 // "q:<id>" | "kv:<id>"
  sortOrder: number;
  question: string;
  explanation: string | null;
  answers: Array<{ text: string; is_correct: boolean }>;
  image: string | null;        // kuvakortin kuva
  sourceKey: string;           // lähdevisan id tai "kv:<type>"
  sourceTitle: string;
  bucket: string;              // kokoelma tai "kv:<type>"
};

const BUCKET_LABEL: Record<string, string> = {
  tv: "TV", urheilu: "Urheilu", elokuvat: "Elokuvat", musiikki: "Musiikki",
  matkakohteet: "Matkakohteet", yleistieto: "Yleistieto", "tunnetut-henkilot": "Henkilöt",
  "kv:liput": "🖼 Liput", "kv:vaakunat": "🖼 Vaakunat", "kv:linnut": "🖼 Linnut",
  "kv:elaimet": "🖼 Eläimet", "kv:kasvit": "🖼 Kasvit", "kv:henkilot": "🖼 Henkilöt",
  "kv:rakennukset": "🖼 Rakennukset", "kv:kaupungit": "🖼 Kaupungit", "kv:maalaukset": "🖼 Maalaukset",
};

type BrowserState =
  | { mode: "add" }
  | { mode: "replace"; rowKey: string; question: string }
  | null;

export function MegaEditor({ mega, rows }: { mega: { id: string; title: string; slug: string | null; status: string }; rows: MegaRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [browser, setBrowser] = useState<BrowserState>(null);

  const perSource = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.sourceKey, (m.get(r.sourceKey) ?? 0) + 1);
    return m;
  }, [rows]);
  const bucketCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.bucket, (m.get(r.bucket) ?? 0) + 1);
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
            {rows.length} riviä · {mega.status === "published" ? "Julkaistu" : "Draft"}
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
            onClick={() => { if (confirm("Poistetaanko koko Mega? Lähteisiin ei kosketa.")) run(() => deleteMega(mega.id)); }}
          >
            Poista Mega
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {bucketCounts.map(([b, n]) => (
          <span key={b} className="inline-flex items-center rounded-full border px-2 py-0.5 text-muted-foreground">
            {BUCKET_LABEL[b] ?? b}: {n}
          </span>
        ))}
        {overLimit && (
          <span className="inline-flex items-center rounded-full border border-yellow-600/40 bg-yellow-600/10 px-2 py-0.5 text-yellow-700">
            ⚠ Jostain lähteestä on yli 2 riviä
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
          const many = (perSource.get(r.sourceKey) ?? 0) > 2;
          return (
            <details key={r.key} className="group">
              <summary className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                {r.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.image} alt="" className="h-8 w-12 shrink-0 rounded border object-cover" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.question}</span>
                <span className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-xs sm:inline-flex ${many ? "border-yellow-600/40 text-yellow-700" : "text-muted-foreground"}`}>
                  {BUCKET_LABEL[r.bucket] ?? r.bucket}
                </span>
                <span className="hidden max-w-44 shrink-0 truncate text-xs text-muted-foreground md:block">{r.sourceTitle}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" disabled={pending || i === 0} onClick={(e) => { e.preventDefault(); run(() => moveMegaRow(mega.id, r.key, "up")); }}>↑</Button>
                  <Button variant="ghost" size="sm" disabled={pending || i === rows.length - 1} onClick={(e) => { e.preventDefault(); run(() => moveMegaRow(mega.id, r.key, "down")); }}>↓</Button>
                  <Button variant="ghost" size="sm" disabled={pending} title="Arvo tilalle satunnainen samasta teemasta" onClick={(e) => { e.preventDefault(); run(() => swapMegaRow(mega.id, r.key)); }}>Arvo</Button>
                  <Button variant="ghost" size="sm" disabled={pending} title="Valitse korvaaja itse selaimesta" onClick={(e) => { e.preventDefault(); setBrowser({ mode: "replace", rowKey: r.key, question: r.question }); }}>Valitse…</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={(e) => { e.preventDefault(); run(() => removeMegaRow(mega.id, r.key)); }}>Poista</Button>
                </span>
              </summary>
              <div className="space-y-1 bg-muted/30 px-14 py-3 text-sm">
                {r.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.image} alt="" className="mb-2 max-h-40 rounded border" />
                )}
                {r.answers.map((a, ai) => (
                  <div key={ai} className={a.is_correct ? "font-semibold text-green-700" : "text-muted-foreground"}>
                    {String.fromCharCode(65 + ai)}. {a.text} {a.is_correct ? "✓" : ""}
                  </div>
                ))}
                {r.explanation && <p className="pt-1 text-xs text-muted-foreground">{r.explanation}</p>}
                <p className="pt-1 text-xs text-muted-foreground">
                  Lähde: {r.key.startsWith("kv:")
                    ? <a className="underline" href="/kuvavisat">{r.sourceTitle}</a>
                    : <a className="underline" href={`/quizzes/${r.sourceKey}`}>{r.sourceTitle}</a>}
                </p>
              </div>
            </details>
          );
        })}
      </div>

      {browser === null ? (
        <Button variant="outline" onClick={() => setBrowser({ mode: "add" })}>+ Lisää lähteistä (visat & kuvakortistot)</Button>
      ) : (
        <SourceBrowser
          megaId={mega.id}
          state={browser}
          perSource={perSource}
          existing={new Set(rows.map((r) => r.key))}
          onClose={() => setBrowser(null)}
          onDone={() => { setBrowser(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

/* ── Lähdeselain: visat + kuvakortistot · 'add' poimii useita, 'replace' yhden ── */
function SourceBrowser({ megaId, state, perSource, existing, onClose, onDone }: {
  megaId: string;
  state: Exclude<BrowserState, null>;
  perSource: Map<string, number>;
  existing: Set<string>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [term, setTerm] = useState("");
  const [quizzes, setQuizzes] = useState<Array<{ id: string; title: string; collection: string | null }>>([]);
  const [decks, setDecks] = useState<Array<{ type: string; n: number }>>([]);
  const [openSource, setOpenSource] = useState<{ key: string; title: string } | null>(null);
  const [items, setItems] = useState<Array<{ key: string; question_text: string; correct: string; image_url: string | null }>>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  /* Alkulataus effectissä — datahaku renderin aikana kaataa Reactin */
  useEffect(() => {
    start(async () => {
      setQuizzes(await searchSourceQuizzes(""));
      setDecks(await listDecks());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replaceMode = state.mode === "replace";

  function openQuiz(id: string, title: string) {
    setOpenSource({ key: id, title });
    start(async () => setItems(await loadQuizQuestions(id)));
  }
  function openDeck(type: string) {
    setOpenSource({ key: `kv:${type}`, title: `Kuvakortisto: ${type}` });
    start(async () => setItems(await loadDeckImages(type)));
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {replaceMode
            ? <>Valitse tilalle → <span className="font-normal text-muted-foreground">korvaa: &rdquo;{state.mode === "replace" ? state.question : ""}&rdquo;</span></>
            : "Lähdeselain — poimi kysymyksiä ja kuvia"}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Sulje</Button>
      </div>
      {!openSource ? (
        <>
          {decks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {decks.map((d) => (
                <button
                  key={d.type}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-muted/50"
                  onClick={() => openDeck(d.type)}
                >
                  🖼 {d.type} ({d.n})
                  {(perSource.get(`kv:${d.type}`) ?? 0) > 0 && ` · Megassa ${perSource.get(`kv:${d.type}`)}`}
                </button>
              ))}
            </div>
          )}
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
                onClick={() => openQuiz(z.id, z.title)}
              >
                <span className="truncate">{z.title}</span>
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                  {BUCKET_LABEL[z.collection ?? ""] ?? z.collection}
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
            <b>{openSource.title}</b>
            <Button variant="ghost" size="sm" onClick={() => { setOpenSource(null); setPicked(new Set()); }}>← Takaisin</Button>
          </div>
          {(perSource.get(openSource.key) ?? 0) >= 2 && (
            <p className="text-xs text-yellow-700">⚠ Tästä lähteestä on Megassa jo {perSource.get(openSource.key)} riviä (suositus max 2).</p>
          )}
          <div className="max-h-72 divide-y overflow-auto rounded-md border">
            {items.map((q) => {
              const already = existing.has(q.key);
              const body = (
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  {q.image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={q.image_url} alt="" className="h-9 w-14 shrink-0 rounded border object-cover" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate">{q.question_text}</span>
                    <span className="block text-xs text-muted-foreground">Oikea: {q.correct}{already ? " · jo Megassa" : ""}</span>
                  </span>
                </span>
              );
              if (replaceMode) {
                return (
                  <div key={q.key} className={`flex items-center gap-3 px-3 py-2 text-sm ${already ? "opacity-50" : ""}`}>
                    {body}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || already}
                      onClick={() => start(async () => {
                        if (state.mode !== "replace") return;
                        await replaceMegaRow(megaId, state.rowKey, q.key);
                        onDone();
                      })}
                    >
                      Vaihda tähän
                    </Button>
                  </div>
                );
              }
              return (
                <label key={q.key} className={`flex items-center gap-3 px-3 py-2 text-sm ${already ? "opacity-50" : "cursor-pointer hover:bg-muted/50"}`}>
                  <input
                    type="checkbox"
                    disabled={already}
                    checked={already || picked.has(q.key)}
                    onChange={(e) => {
                      const next = new Set(picked);
                      if (e.target.checked) next.add(q.key); else next.delete(q.key);
                      setPicked(next);
                    }}
                  />
                  {body}
                </label>
              );
            })}
          </div>
          {!replaceMode && (
            <Button
              disabled={pending || picked.size === 0}
              onClick={() => start(async () => {
                await addMegaRows(megaId, [...picked]);
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
