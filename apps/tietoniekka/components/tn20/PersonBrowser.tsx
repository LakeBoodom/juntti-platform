"use client";
// TIETONIEKKA 2.0 — TUNNETUT HENKILÖT: "Selaa kaikkia" -selain (26.8.2026 CD-design,
// design_handoff_tunnetut_henkilot/README.md). Korvaa aiemman palvelinpuolen
// suodata-query-param-version: haku + kategoria + lajittelu + sivutus toimivat
// nyt kaikki samassa client-tilassa ilman sivun uudelleenlatausta, kuten
// README vaatii ("q/cat/sort/limit URLiin, limit nollautuu haun/kategorian
// vaihtuessa"). Koko henkilölista (max ~300 riviä, kevyt JSON) tulee serveriltä
// propina — haku on paikallinen, ei uutta verkkopyyntöä per näppäin.
//
// README:n kielletyt paluut (ÄLÄ LISÄÄ): teemakarusellit, pelitapa-/alakokoelma-
// suodattimet, heron oma "Tänään juhlii" -CTA, iso Wikipedia-kapseli kuvan päällä.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PersonCard, type PersonCardData } from "./cards";
import { PersonSilhouette } from "./motifs";

export type BrowserPerson = PersonCardData & {
  role: string | null;
  priority: number | null;
  created_at: string;
  href: string;
};

const GROUP_LABELS = [
  { key: "kaikki", label: "Kaikki" },
  { key: "nayttelijat", label: "Näyttelijät" },
  { key: "artistit", label: "Muusikot ja artistit" },
  { key: "urheilijat", label: "Urheilijat" },
  { key: "poliitikot", label: "Poliitikot ja merkkihenkilöt" },
  { key: "muut", label: "Muut" },
];

const SORT_OPTIONS = [
  { key: "suosituimmat", label: "Suosituimmat" },
  { key: "aakkoset", label: "A–Ö" },
  { key: "uusimmat", label: "Uusimmat" },
];

const INITIAL = 24;
const STEP = 18;

/* Diakriitit normalisoituna hakua varten (README: "case-insensitive,
   diakriitit normalisoidaan"). */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/* A–Ö-lajittelu sukunimen mukaan (Heikin toive 27.8.2026), ei etunimen.
   Nimet ovat muotoa "Etunimi Sukunimi" (myös yhdysmerkkiset sukunimet,
   esim. "Anttila-Jääskeläinen", pysyvät yhtenä viimeisenä tokenina).
   Osalla kannan nimistä on sulkuihin lisätty tarkenne, esim.
   "Sanni (laulaja)", "Daniel (Ruotsin prinssi)" — sulkuosa EI ole
   sukunimi, joten se pudotetaan pois ennen viimeisen sanan poimintaa.
   Viimeinen välilyönnillä erotettu pätkä = sukunimi; jos nimessä ei ole
   välilyöntiä lainkaan (tarkenteen poiston jälkeenkään), käytetään koko
   alkuperäistä nimeä (ei kaadu yksisanaisiin taiteilijanimiin kuten
   "VilleGalle"). */
function surname(name: string): string {
  const withoutParen = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const base = withoutParen || name.trim();
  const parts = base.split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

/* useSearchParams() vaatii Suspense-rajan server-renderöidyssä puussa
   (Next 15 App Router) — [collection]/page.tsx on server component eikä
   tarjoa sitä, joten ulompi export kääräisee sisäisen komponentin. */
export function PersonBrowser(props: { people: BrowserPerson[] }) {
  return (
    <Suspense fallback={<PersonBrowserFallback count={props.people.length} />}>
      <PersonBrowserInner {...props} />
    </Suspense>
  );
}

function PersonBrowserFallback({ count }: { count: number }) {
  return (
    <div className="tn-personbrowser">
      <div className="tn-personbrowser-head">
        <h2 className="tn-section-title">Selaa kaikkia</h2>
        <span className="tn-personbrowser-count">{count} henkilöä</span>
      </div>
      <div className="tn-card-grid tn-personbrowser-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="tn-skeleton" />
        ))}
      </div>
    </div>
  );
}

function PersonBrowserInner({ people }: { people: BrowserPerson[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [cat, setCat] = useState(() => searchParams.get("cat") ?? "kaikki");
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? "suosituimmat");
  const [limit, setLimit] = useState(() => {
    const n = Number(searchParams.get("limit"));
    return Number.isFinite(n) && n > 0 ? n : INITIAL;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // q/cat/sort/limit URLiin (history.replaceState-tyylinen, ei uutta historiamerkintää)
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat !== "kaikki") params.set("cat", cat);
    if (sort !== "suosituimmat") params.set("sort", sort);
    if (limit !== INITIAL) params.set("limit", String(limit));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, sort, limit]);

  const filtered = useMemo(() => {
    let list = people;
    if (cat !== "kaikki") list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const nq = normalize(q.trim());
      list = list.filter((p) => normalize(p.name).includes(nq) || (p.role && normalize(p.role).includes(nq)));
    }
    const sorted = [...list];
    if (sort === "aakkoset") {
      sorted.sort((a, b) => surname(a.name).localeCompare(surname(b.name), "fi") || a.name.localeCompare(b.name, "fi"));
    } else if (sort === "uusimmat") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      sorted.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name, "fi"));
    }
    return sorted;
  }, [people, cat, q, sort]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > visible.length;

  function handleQChange(next: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(next);
      setLimit(INITIAL);
    }, 150);
  }

  function handleCatChange(next: string) {
    setCat(next);
    setLimit(INITIAL);
  }

  function handleShowMore() {
    setLoadingMore(true);
    // Pieni viive näyttää shimmer-luurangot (README: "6 shimmer-korttia
    // ruudukon perässä" latauksen ajan) — data on jo muistissa, joten
    // aidon verkkoviiveen sijaan simuloidaan lyhyt tauko.
    window.setTimeout(() => {
      setLimit((l) => l + STEP);
      setLoadingMore(false);
    }, 220);
  }

  return (
    <div className="tn-personbrowser">
      <div className="tn-personbrowser-head">
        <h2 className="tn-section-title">Selaa kaikkia</h2>
        <span className="tn-personbrowser-count">{people.length} henkilöä</span>
      </div>

      <label className="tn-personsearch" aria-label="Hae henkilöä nimellä tai ammatilla">
        <svg viewBox="0 0 20 20" aria-hidden width="18" height="18">
          <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <line x1="14" y1="14" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          defaultValue={q}
          placeholder="Hae henkilöä nimellä…"
          onChange={(e) => handleQChange(e.target.value)}
        />
      </label>

      <div className="tn-personbrowser-controls">
        <nav className="tn-catnav" aria-label="Kategoriat">
          {GROUP_LABELS.map((f) => {
            const active = cat === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                className={active ? "is-active" : undefined}
                onClick={() => handleCatChange(f.key)}
              >
                {f.label}
              </button>
            );
          })}
        </nav>

        <label className="tn-sortselect">
          <span>Lajittele</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="tn-personempty">
          <div className="tn-personempty-title">Ei osumia</div>
          <p>
            {q ? `Haulla "${q}" ei löytynyt henkilöitä.` : "Tästä ryhmästä ei löytynyt vielä henkilöitä."}
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("kaikki");
              setLimit(INITIAL);
            }}
          >
            Tyhjennä haku ja suodattimet
          </button>
        </div>
      ) : (
        <>
          {/* Ruudukko ≥641px, kompakti lista ≤640px — molemmat renderöity,
              näkyvyys ratkeaa container queryllä komponentin omasta
              leveydestä (README: ei ikkunan leveydestä). */}
          <div className="tn-card-grid tn-personbrowser-grid">
            {visible.map((p) => (
              <PersonCard key={p.id} person={p} href={p.href} />
            ))}
            {loadingMore &&
              Array.from({ length: 6 }).map((_, i) => <div key={`sk-${i}`} className="tn-skeleton" />)}
          </div>
          <div className="tn-personlist">
            {visible.map((p) => (
              <a key={p.id} className="tn-personlist-row" href={p.href}>
                <div className="tn-personlist-photo">
                  {p.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url} alt="" loading="lazy" />
                      <div className="tn-person-tint" />
                    </>
                  ) : (
                    <div className="tn-person-silhouette">
                      <PersonSilhouette />
                    </div>
                  )}
                </div>
                <div className="tn-personlist-body">
                  <div className="tn-personlist-name">{p.name}</div>
                  {p.role && <div className="tn-personlist-role">{p.role}</div>}
                </div>
                <span className="tn-personlist-cta">Pelaa →</span>
              </a>
            ))}
          </div>

          <p className="tn-personbrowser-progress">
            Näytetään {visible.length} / {filtered.length}
          </p>

          {hasMore ? (
            <button type="button" className="tn-showmore" onClick={handleShowMore} disabled={loadingMore}>
              {loadingMore ? "Ladataan…" : `Näytä lisää henkilöitä (${filtered.length - visible.length})`}
            </button>
          ) : (
            filtered.length > INITIAL && <p className="tn-personbrowser-done">Kaikki henkilöt näytetty</p>
          )}
        </>
      )}

      <p className="tn-photo-credit-note">
        Henkilökuvat: Wikipedia / Wikimedia Commons (CC-lisenssit). Kuvan lähde- ja
        lisenssitiedot löytyvät henkilön Wikipedia-sivulta.
      </p>
    </div>
  );
}
