"use client";
// TUPLA TAI KUITTI — K2-aloitus pelikehyksessä (TOTEUTUSBRIEF §4, CD-arkki 5b, 20.10.2026): h1 → yksi lause →
// aiheen valinta → "Aloita · <aihe>" → ohjeet ja pelin tausta avattavina. Sama näkymä aihesivulla
// (/peli/tupla-tai-kuitti) ja aiheen pelisivun alussa. Jos valittu aihe on tämän sivun aihe, nappi aloittaa
// suoraan (onAloita); muuten siirrytään aiheen sivulle ?aloita=1 (peli alkaa heti).
import { useState, type CSSProperties, type ReactNode } from "react";
import PeliAloitus from "@/components/tn20/pelikehys/PeliAloitus";
import "./tuplaaloitus.css";

export type AiheValinta = { slug: string; nimi: string; accent: string };

export default function TuplaAloitus({
  aiheet,
  valittu,
  onAloita,
  alarivi,
  saannot,
  tausta,
}: {
  aiheet: AiheValinta[];
  valittu: string;
  /** Sivun oma aihe: aloita ilman siirtymää. */
  onAloita?: () => void;
  alarivi?: ReactNode;
  saannot: ReactNode;
  tausta: ReactNode;
}) {
  const [sel, setSel] = useState(valittu);
  const aihe = aiheet.find((a) => a.slug === sel) ?? aiheet[0];
  const aloita = () => {
    if (onAloita && sel === valittu) onAloita();
    else location.assign(`/peli/tupla-tai-kuitti/${aihe.slug}?aloita=1`);
  };
  /* Palautus 21.10.2026 (Heikki): studiokuva ja virallinen logo takaisin aloitukseen; aiheet ja Aloita kuvan alla,
     aiheet edelleen ensimmäisessä näkymässä. Logo on sivun h1 (alt = pelin nimi). */
  return (
    <>
    <div className="tks-kuva">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/20/tupla/studio.webp"
        srcSet="/20/tupla/studio-800.webp 800w, /20/tupla/studio.webp 1672w"
        sizes="(max-width: 760px) 100vw, 720px"
        alt="Mikko ja Laura Tupla tai kuitti -studiossa"
        width={1672}
        height={941}
        fetchPriority="high"
      />
    </div>
    <PeliAloitus
      otsikko={
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tks-logo" src="/20/tupla/logo.webp" alt="Tupla tai kuitti" width={640} height={374} />
      }
      lause="Valitse aihe, vastaa ja päätä joka kierroksella: tuplaatko vai otatko kuitin."
      valinta={
        <fieldset className="pk-valinta">
          <legend>Valitse aihe</legend>
          <div className="pk-vaihtoehdot">
            {aiheet.map((a) => (
              <label key={a.slug} className="pk-vaihtoehto" style={{ "--va": a.accent } as CSSProperties}>
                <input type="radio" name="tupla-aihe" value={a.slug} checked={sel === a.slug} onChange={() => setSel(a.slug)} />
                <span className="pk-vaihtoehto-piste" aria-hidden="true" />
                {a.nimi}
              </label>
            ))}
          </div>
        </fieldset>
      }
      toiminto={
        <button type="button" className="pk-nappi" onClick={aloita}>
          Aloita · {aihe.nimi}
        </button>
      }
      alarivi={alarivi}
      ohjeet={[
        { otsikko: "Näin pelaat", sisalto: saannot },
        { otsikko: "Pelin tausta", sisalto: tausta },
      ]}
    />
    </>
  );
}
