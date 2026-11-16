"use client";
// Sivuston haku (Heikki 16.11.2026): hakuikkuna. Mobiilissa koko ruutu, työpöydällä paneeli yläpalkin alla.
// Tulokset kirjoittaessa ryhmiteltyinä (Visat, Pelit, Henkilöt, Kaupungit, Kokoelmat). Esc / Sulje / tausta sulkee,
// fokus palaa avaajaan. Enter vie ensimmäiseen osumaan; ilman osumia lomake vie /haku-sivulle.
// Ei osumia -haut kirjataan Plausibleen ("Haku ei osumia"), jotta näkee mitä visoja etsitään mutta ei ole.
import "./haku.css";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { hae, ryhmitellyt, valmistele, type HakuKohde } from "@/lib/hakuMoottori";
import { HAKU_KENTTA_ID, hakuTila, lataaIndeksi, suljeHaku, tilaa } from "./hakuTila";

const PALVELIN = { auki: false, alku: "", avaaja: null };

export const HAKU_PLACEHOLDER = "Hae visaa, peliä tai aihetta";

export function HakuIkoni() {
  return (
    <svg className="tn-haku-ikoni" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function HakuDialogi() {
  const t = useSyncExternalStore(tilaa, hakuTila, () => PALVELIN);
  if (!t.auki) return null;
  return <Ikkuna alku={t.alku} />;
}

function Ikkuna({ alku }: { alku: string }) {
  const [q, setQ] = useState(alku);
  const [indeksi, setIndeksi] = useState<ReturnType<typeof valmistele> | null>(null);
  const [virhe, setVirhe] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const kirjattu = useRef(new Set<string>());

  useEffect(() => {
    let ok = true;
    lataaIndeksi().then((d: HakuKohde[]) => ok && setIndeksi(valmistele(d)), () => ok && setVirhe(true));
    return () => { ok = false; };
  }, []);

  /* Taustan vieritys lukkoon, Esc sulkee */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") suljeHaku(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, []);

  const ryhmat = useMemo(() => (indeksi ? ryhmitellyt(hae(indeksi, q)) : []), [indeksi, q]);
  const haettu = q.trim().length >= 2;
  const eiOsumia = !!indeksi && haettu && ryhmat.length === 0;

  /* Ei osumia -haku Plausibleen, kun kirjoittaminen on pysähtynyt (kerran per hakusana). */
  useEffect(() => {
    if (!eiOsumia || q.trim().length < 3) return;
    const sana = q.trim().toLocaleLowerCase("fi");
    const id = window.setTimeout(() => {
      if (kirjattu.current.has(sana)) return;
      kirjattu.current.add(sana);
      (window as unknown as { plausible?: (e: string, o?: object) => void }).plausible?.("Haku ei osumia", { props: { haku: sana } });
    }, 1500);
    return () => window.clearTimeout(id);
  }, [eiOsumia, q]);

  const linkit = () => Array.from(listaRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
  const onKentta = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); linkit()[0]?.focus(); }
  };
  const onLista = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const l = linkit();
    const i = l.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowUp" && i <= 0) { document.getElementById(HAKU_KENTTA_ID)?.focus(); return; }
    l[e.key === "ArrowDown" ? Math.min(i + 1, l.length - 1) : i - 1]?.focus();
  };
  const onSubmit = (e: React.FormEvent) => {
    const eka = linkit()[0];
    if (eka) { e.preventDefault(); window.location.href = eka.href; }
  };

  return (
    <div className="tn-haku-root">
      <button type="button" className="tn-haku-tausta" aria-label="Sulje haku" tabIndex={-1} onClick={suljeHaku} />
      <div className="tn-haku-paneeli" role="dialog" aria-modal="true" aria-label="Haku">
        <form className="tn-haku-lomake" role="search" action="/haku" method="get" onSubmit={onSubmit}>
          <label htmlFor={HAKU_KENTTA_ID} className="tn-haku-sr">Haku</label>
          <span className="tn-haku-kentta">
            <HakuIkoni />
            <input
              id={HAKU_KENTTA_ID}
              name="q"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={HAKU_PLACEHOLDER}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKentta}
              aria-controls="tn-haku-tulokset"
            />
          </span>
          <button type="button" className="tn-haku-sulje" onClick={suljeHaku}>Sulje</button>
        </form>
        <div id="tn-haku-tulokset" ref={listaRef} className="tn-haku-tulokset" onKeyDown={onLista} aria-live="polite">
          {virhe && haettu && <p className="tn-haku-tyhja">Haku ei juuri nyt toimi. Yritä hetken päästä uudelleen.</p>}
          {eiOsumia && <p className="tn-haku-tyhja">Ei osumia haulle ”{q.trim()}”.</p>}
          {ryhmat.map((g) => (
            <section key={g.t} className="tn-haku-ryhma" aria-label={g.otsikko}>
              <h2 className="tn-haku-ryhma-h">{g.otsikko}</h2>
              <ul>
                {g.rivit.map((r) => (
                  <li key={r.h}>
                    <a href={r.h} className="tn-haku-rivi" onClick={() => suljeHaku()}>
                      {r.n}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
