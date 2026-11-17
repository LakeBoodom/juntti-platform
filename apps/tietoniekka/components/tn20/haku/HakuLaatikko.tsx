"use client";
// Sivuston haku (Heikki 16.11.2026): tavallinen hakukenttä, jonka tulokset avautuvat suoraan kentän alle.
// Ei ponnahdusikkunaa eikä sivun lukitusta (Heikki 16.11.: "sitä ei pitäisi tarvita sulkea, vaan voisin vain scrollata
// normaalisti"). Tulokset piiloutuvat, kun klikkaa muualle tai painaa Esc; kenttään palatessa ne näkyvät taas.
// Tulokset ryhmissä (Visat, Pelit, Henkilöt, Kaupungit, Kokoelmat). Enter vie ensimmäiseen osumaan; ilman
// JavaScriptiä lomake vie /haku-sivulle. Ei osumia -haut kirjataan Plausibleen ("Haku ei osumia").
import "./haku.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { hae, ryhmitellyt, valmistele, type HakuKohde } from "@/lib/hakuMoottori";

export const HAKU_PLACEHOLDER = "Hae visaa, peliä tai aihetta";

export function HakuIkoni() {
  return (
    <svg className="tn-haku-ikoni" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

let lataus: Promise<HakuKohde[]> | null = null;
/** Indeksi ladataan kerran (ensimmäinen kosketus kenttään); virheessä uusi yritys seuraavalla kerralla. */
export function lataaIndeksi(): Promise<HakuKohde[]> {
  if (!lataus) {
    lataus = fetch("/api/haku")
      .then((r) => (r.ok ? (r.json() as Promise<HakuKohde[]>) : Promise.reject(r.status)))
      .catch((e) => {
        lataus = null;
        throw e;
      });
  }
  return lataus;
}

export default function HakuLaatikko({ id, autoFocus, entry }: { id: string; autoFocus?: boolean; entry?: string }) {
  const [q, setQ] = useState("");
  const [auki, setAuki] = useState(false);
  const [indeksi, setIndeksi] = useState<ReturnType<typeof valmistele> | null>(null);
  const [virhe, setVirhe] = useState(false);
  const juuri = useRef<HTMLFormElement>(null);
  const kentta = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const kirjattu = useRef(new Set<string>());

  const lataa = () => {
    if (indeksi) return;
    lataaIndeksi().then((d) => { setIndeksi(valmistele(d)); setVirhe(false); }, () => setVirhe(true));
  };

  useEffect(() => {
    if (autoFocus) { kentta.current?.focus(); lataa(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Klikkaus muualle piilottaa tulokset (ei lukitse mitään). */
  useEffect(() => {
    if (!auki) return;
    const pois = (e: PointerEvent) => { if (juuri.current && !juuri.current.contains(e.target as Node)) setAuki(false); };
    document.addEventListener("pointerdown", pois);
    return () => document.removeEventListener("pointerdown", pois);
  }, [auki]);

  const ryhmat = useMemo(() => (indeksi ? ryhmitellyt(hae(indeksi, q)) : []), [indeksi, q]);
  const haettu = q.trim().length >= 2;
  const eiOsumia = !!indeksi && haettu && ryhmat.length === 0;
  const nayta = auki && haettu && (ryhmat.length > 0 || eiOsumia || virhe);

  useEffect(() => {
    if (!eiOsumia || q.trim().length < 3) return;
    const sana = q.trim().toLocaleLowerCase("fi");
    const t = window.setTimeout(() => {
      if (kirjattu.current.has(sana)) return;
      kirjattu.current.add(sana);
      (window as unknown as { plausible?: (e: string, o?: object) => void }).plausible?.("Haku ei osumia", { props: { haku: sana } });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [eiOsumia, q]);

  const linkit = () => Array.from(lista.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setAuki(false); kentta.current?.focus(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const l = linkit();
    if (!l.length) return;
    e.preventDefault();
    setAuki(true);
    const i = l.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowUp" && i <= 0) { kentta.current?.focus(); return; }
    l[e.key === "ArrowDown" ? Math.min(i + 1, l.length - 1) : i - 1]?.focus();
  };
  const onSubmit = (e: React.FormEvent) => {
    const eka = linkit()[0];
    if (eka) { e.preventDefault(); window.location.href = eka.href; }
  };

  return (
    <form ref={juuri} className="tn-haku" role="search" action="/haku" method="get" onSubmit={onSubmit} onKeyDown={onKey} data-tn-entry={entry}>
      <label htmlFor={id} className="tn-haku-sr">Haku</label>
      <span className="tn-haku-kentta">
        <HakuIkoni />
        <input
          ref={kentta}
          id={id}
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={HAKU_PLACEHOLDER}
          value={q}
          onChange={(e) => { setQ(e.target.value); setAuki(true); }}
          onFocus={() => { lataa(); setAuki(true); }}
          onPointerEnter={lataa}
          aria-controls={`${id}-tulokset`}
          aria-expanded={nayta}
        />
      </span>
      {nayta && (
        <div id={`${id}-tulokset`} ref={lista} className="tn-haku-tulokset" aria-live="polite">
          {virhe && <p className="tn-haku-tyhja">Haku ei juuri nyt toimi. Yritä hetken päästä uudelleen.</p>}
          {eiOsumia && <p className="tn-haku-tyhja">Ei osumia haulle ”{q.trim()}”.</p>}
          {ryhmat.map((g) => (
            <section key={g.t} className="tn-haku-ryhma" aria-label={g.otsikko}>
              <h2 className="tn-haku-ryhma-h">{g.otsikko}</h2>
              <ul>
                {g.rivit.map((r) => (
                  <li key={r.h}>
                    <a href={r.h} className="tn-haku-rivi">
                      <span className="tn-haku-rivi-n">{r.n}</span>
                      {r.c && <span className="tn-haku-rivi-c">{r.c}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </form>
  );
}
