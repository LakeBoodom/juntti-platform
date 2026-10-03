"use client";
// Aihesivujen pelihylly (erä B4, design 3f): pääkortti (visa) + muut pelit. Pääkortin tila luetaan
// localStoragesta (GameClient tallentaa tuloksen avaimeen tn_quiz_results): ei pelattu → "Aloita visa",
// pelattu → tulospalkki + "Sait 4/5 · <fanitaso>" + "Pelaa uudelleen". Ei tyhjiä paikkoja:
// muut pelit renderöidään vain jos niitä on.
import { useEffect, useState } from "react";

export type HyllyVisa = { id: string; eyebrow: string; otsikko: string; href: string; fanitasot?: string[] | null };
export type HyllyPeli = { eyebrow: string; otsikko: string; href: string; meta?: string };

type Tulos = { right: number; total: number };

const KYNNYKSET = [0, 40, 60, 80, 100];

function lueTulos(id: string): Tulos | null {
  try {
    const t = JSON.parse(window.localStorage.getItem("tn_quiz_results") ?? "{}")[id];
    return t && Number.isFinite(t.right) && Number.isFinite(t.total) && t.total > 0 ? t : null;
  } catch {
    return null;
  }
}

export default function PeliHylly({ otsikko, visa, pelit }: { otsikko?: string; visa: HyllyVisa | null; pelit: HyllyPeli[] }) {
  const [tulos, setTulos] = useState<Tulos | null>(null);
  useEffect(() => {
    if (visa) setTulos(lueTulos(visa.id));
  }, [visa]);

  if (!visa && !pelit.length) return null;

  let taso: string | null = null;
  if (tulos && visa?.fanitasot) {
    const pct = (tulos.right / tulos.total) * 100;
    const i = KYNNYKSET.reduce((acc, k, idx) => (pct >= k ? idx : acc), 0);
    taso = visa.fanitasot[i] ?? null;
  }

  return (
    <section className="hub-hylly" aria-label={otsikko ?? "Pelit"}>
      {otsikko && <h2 className="hub-h3 hub-hylly-otsikko">{otsikko}</h2>}
      {visa && (
        <div className={tulos ? "hub-visa hub-visa--pelattu" : "hub-visa"}>
          <div className="hub-visa-teksti">
            <span className="hub-eyebrow">{visa.eyebrow}</span>
            <span className="hub-visa-nimi">{visa.otsikko}</span>
            {tulos && (
              <span className="hub-visa-tulos">
                <span className="hub-visa-palkit" aria-hidden="true">
                  {Array.from({ length: Math.min(tulos.total, 10) }, (_, i) => (
                    <span key={i} className={i < tulos.right ? "on" : ""} />
                  ))}
                </span>
                <span>
                  Sait {tulos.right}/{tulos.total}
                  {taso ? ` · ${taso}` : ""}
                </span>
              </span>
            )}
          </div>
          <a className={tulos ? "hub-btn hub-btn--ghost" : "hub-btn"} href={visa.href}>
            {tulos ? "Pelaa uudelleen" : "Aloita visa →"}
          </a>
        </div>
      )}
      {pelit.length > 0 && (
        <ul className="hub-pelit">
          {pelit.map((p) => (
            <li key={p.href}>
              <a href={p.href} className="hub-peli">
                <span className="hub-peli-teksti">
                  <span className="hub-eyebrow hub-eyebrow--himmea">{p.eyebrow}</span>
                  <span className="hub-peli-nimi">{p.otsikko}</span>
                </span>
                <span className="hub-peli-meta">{p.meta ?? "→"}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
