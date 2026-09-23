"use client";

// Visalista: haku, tila- ja kokoelmasuodatus sekä järjestys selaimessa (21.9.2026).
// Kaikki ~700 visaa tulevat kerralla propseina, joten suodatus on välitön eikä
// lataa sivua uudelleen. Valinnat pidetään URL:ssa (?q=&tila=&kokoelma=&jarj=),
// jotta paluu visasta listaan säilyttää näkymän ja sen voi jakaa linkkinä.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Search, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { kokoelmaNimi } from "@/lib/kokoelmat";

export type ListaVisa = {
  id: string;
  title: string;
  slug: string | null;
  collection: string | null;
  category: string | null;
  difficulty: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  pelit: number;
  pelit30: number;
  ylos: number;
  alas: number;
};

const SIVUSTO = "https://tietoniekka.fi";

const TILAT = [
  { key: "kaikki", label: "Kaikki" },
  { key: "published", label: "Julkaistut" },
  { key: "draft", label: "Luonnokset" },
] as const;

const JARJESTYKSET = [
  { key: "uusimmat", label: "Uusimmat ensin" },
  { key: "muokatut", label: "Viimeksi muokatut" },
  { key: "aakkoset", label: "Otsikko A–Ö" },
  { key: "pelatuimmat", label: "Eniten pelatut" },
  { key: "pelatuimmat30", label: "Eniten pelatut (30 pv)" },
] as const;

function normalisoi(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function QuizList(props: { visat: ListaVisa[] }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Ladataan…</p>}>
      <QuizListInner {...props} />
    </Suspense>
  );
}

function QuizListInner({ visat }: { visat: ListaVisa[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(() => sp.get("q") ?? "");
  const [haku, setHaku] = useState(q);
  const [tila, setTila] = useState(() => sp.get("tila") ?? "kaikki");
  const [kokoelma, setKokoelma] = useState(() => sp.get("kokoelma") ?? "kaikki");
  const [jarj, setJarj] = useState(() => {
    const j = sp.get("jarj");
    return JARJESTYKSET.some((o) => o.key === j) ? (j as string) : "uusimmat";
  });
  const viive = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (tila !== "kaikki") p.set("tila", tila);
    if (kokoelma !== "kaikki") p.set("kokoelma", kokoelma);
    if (jarj !== "uusimmat") p.set("jarj", jarj);
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tila, kokoelma, jarj]);

  const rikastettu = useMemo(
    () => visat.map((v) => ({ ...v, kokoelma: kokoelmaNimi(v), hakuteksti: normalisoi(`${v.title} ${v.slug ?? ""}`) })),
    [visat],
  );

  /* Hakuehto ilman tila- ja kokoelmasuodatusta — lukumäärät lasketaan tästä,
     jotta napit kertovat montako osumaa valinta antaisi. */
  const hakuOsumat = useMemo(() => {
    const nq = normalisoi(q.trim());
    return nq ? rikastettu.filter((v) => v.hakuteksti.includes(nq)) : rikastettu;
  }, [rikastettu, q]);

  const tilaMaarat = useMemo(() => {
    const pohja = kokoelma === "kaikki" ? hakuOsumat : hakuOsumat.filter((v) => v.kokoelma === kokoelma);
    return {
      kaikki: pohja.length,
      published: pohja.filter((v) => v.status === "published").length,
      draft: pohja.filter((v) => v.status === "draft").length,
    } as Record<string, number>;
  }, [hakuOsumat, kokoelma]);

  const kokoelmaMaarat = useMemo(() => {
    const pohja = tila === "kaikki" ? hakuOsumat : hakuOsumat.filter((v) => v.status === tila);
    const m = new Map<string, number>();
    for (const v of pohja) m.set(v.kokoelma, (m.get(v.kokoelma) ?? 0) + 1);
    return m;
  }, [hakuOsumat, tila]);

  const kaikkiKokoelmat = useMemo(
    () => [...new Set(rikastettu.map((v) => v.kokoelma))].sort((a, b) => a.localeCompare(b, "fi")),
    [rikastettu],
  );

  const naytettavat = useMemo(() => {
    let l = hakuOsumat;
    if (tila !== "kaikki") l = l.filter((v) => v.status === tila);
    if (kokoelma !== "kaikki") l = l.filter((v) => v.kokoelma === kokoelma);
    const s = [...l];
    switch (jarj) {
      case "muokatut":
        s.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        break;
      case "aakkoset":
        s.sort((a, b) => a.title.localeCompare(b.title, "fi"));
        break;
      case "pelatuimmat":
        s.sort((a, b) => b.pelit - a.pelit || b.pelit30 - a.pelit30);
        break;
      case "pelatuimmat30":
        s.sort((a, b) => b.pelit30 - a.pelit30 || b.pelit - a.pelit);
        break;
      default:
        s.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return s;
  }, [hakuOsumat, tila, kokoelma, jarj]);

  const suodatettu = q !== "" || tila !== "kaikki" || kokoelma !== "kaikki";

  function kirjoitus(arvo: string) {
    setHaku(arvo);
    if (viive.current) clearTimeout(viive.current);
    viive.current = setTimeout(() => setQ(arvo), 120);
  }

  function tyhjenna() {
    if (viive.current) clearTimeout(viive.current);
    setHaku("");
    setQ("");
    setTila("kaikki");
    setKokoelma("kaikki");
  }

  return (
    <div className="space-y-4">
      {/* Haku */}
      <label className="relative block">
        <span className="sr-only">Hae visaa</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          enterKeyHint="search"
          value={haku}
          onChange={(e) => kirjoitus(e.target.value)}
          placeholder="Hae otsikolla tai osoitteella…"
          autoFocus
          className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {haku && (
          <button
            type="button"
            onClick={() => kirjoitus("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Tyhjennä haku"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      {/* Suodattimet */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2" role="group" aria-label="Tila">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tila</span>
          {TILAT.map((t) => {
            const aktiivinen = tila === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={aktiivinen}
                onClick={() => setTila(t.key)}
                className={
                  aktiivinen
                    ? "rounded-full border border-foreground bg-foreground px-3 py-1 text-sm text-background"
                    : "rounded-full border px-3 py-1 text-sm hover:bg-muted"
                }
              >
                {t.label} <span className={aktiivinen ? "opacity-70" : "text-muted-foreground"}>{tilaMaarat[t.key] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Kokoelma</span>
          <select
            value={kokoelma}
            onChange={(e) => setKokoelma(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="kaikki">Kaikki kokoelmat</option>
            {kaikkiKokoelmat.map((k) => (
              <option key={k} value={k}>
                {k} ({kokoelmaMaarat.get(k) ?? 0})
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Järjestys</span>
          <select
            value={jarj}
            onChange={(e) => setJarj(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {JARJESTYKSET.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Näytetään <strong className="text-foreground">{naytettavat.length}</strong> / {visat.length}
        </span>
        {suodatettu && (
          <button type="button" onClick={tyhjenna} className="inline-flex items-center gap-1 hover:text-foreground">
            Tyhjennä suodattimet <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {naytettavat.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ei osumia.{" "}
          <button type="button" onClick={tyhjenna} className="underline hover:text-foreground">
            Tyhjennä haku ja suodattimet
          </button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Otsikko</TableHead>
                <TableHead>Kokoelma</TableHead>
                <TableHead>Vaikeus</TableHead>
                <TableHead>Tila</TableHead>
                <TableHead className="text-right" title="Pelikerrat yhteensä (viimeiset 30 päivää)">
                  Pelattu
                </TableHead>
                <TableHead className="text-right">Palaute</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {naytettavat.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="max-w-[28rem]">
                    <div className="flex items-start gap-1.5">
                      <Link href={`/quizzes/${v.id}`} className="font-medium hover:underline">
                        {v.title}
                      </Link>
                      {v.status === "published" && v.slug && (
                        <a
                          href={`${SIVUSTO}/visa/${v.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label={`Avaa ${v.title} sivustolla`}
                          title="Avaa sivustolla"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {v.category ?? "—"}
                      {v.slug ? ` · ${v.slug}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{v.kokoelma}</TableCell>
                  <TableCell className="text-sm">{v.difficulty ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        v.status === "published"
                          ? "inline-flex items-center rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs text-green-700"
                          : v.status === "draft"
                            ? "inline-flex items-center rounded-full border border-yellow-600/30 bg-yellow-600/10 px-2 py-0.5 text-xs text-yellow-700"
                            : "inline-flex items-center rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {v.status === "published" ? "Julkaistu" : v.status === "draft" ? "Luonnos" : "Arkistoitu"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-sm tabular-nums">
                    {v.pelit === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <>
                        {v.pelit} <span className="text-muted-foreground">({v.pelit30})</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-sm tabular-nums text-muted-foreground">
                    {v.ylos || v.alas ? `👍 ${v.ylos} · 👎 ${v.alas}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
