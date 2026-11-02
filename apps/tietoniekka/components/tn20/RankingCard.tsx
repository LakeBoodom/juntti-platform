// JÄRJESTÄ — rivikortti (CD "Järjestä yhtenäinen UX" 3e, Heikki 2.11.2026): sama kortti hubissa (vino, ilman kahvaa),
// pelissä (suora, kahva, ReorderableChainList) ja tuloksessa (RevealSequencer: väärät jäävät vinoon). Numero on kortin
// ulkopuolella. Kolme muotoa: kuvallinen (henkilöt), tunnus (vaakunat, kokonaisena) ja kuvaton (paikat ja asiat).
// Kuvan puuttuessa rivi on kuvaton, henkilösiluettia ei käytetä koskaan.
//
// KORTTISÄÄNTÖ (CLAUDE.md, ehdoton): nimikentässä EI kiinteää korkeutta eikä line-clampia — kortti kasvaa sisällön
// mukana. Nimen koko lasketaan pisimmästä tavusta (--tk-lw, tietoketju.css); pitkät yhdyssanat tavutetaan (rivi.ts).

import { henkiloKuva } from "@/lib/henkilokuvat";
import { kallistus, pisinTavu, tavuta } from "@/lib/jarjesta/rivi";
import { forwardRef } from "react";

export type RankingCardPerson = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  /** Pakat, joiden kohteilla ei ole kuvia: ei kuvapaikkaa. */
  hideThumb?: boolean;
  /** Kuva on tunnus (vaakuna): kokonaisena, ei rajausta. */
  tunnus?: boolean;
};

export type RankingCardState = "idle" | "selected" | "dragging" | "correct" | "wrong";

export interface RankingCardProps {
  person: RankingCardPerson;
  /** Järjestysnumero (1-pohjainen). null = ei numeroa (nostettu kortti). */
  position?: number | null;
  state?: RankingCardState;
  /** Tulos: "Kuuluu paikalle 3." nimen alla. */
  note?: string | null;
  /** Tulos: arvo oikealla (vuosi, m, km²). */
  value?: string | null;
  /** Hub: kortti vinossa. */
  vino?: boolean;
  /** Ei kahvaa, ei interaktiota (hub, nostettu kortti, tulos). */
  readOnly?: boolean;
  /** Vetokahvan pointer/keyboard-käsittelijät (ReorderableChainList antaa nämä). */
  handleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Koko kortin juureen levitettävät käsittelijät (raahaus mistä tahansa kortin kohdasta, ks. ReorderableChainList). */
  dragProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Koko kortin napautus. */
  onActivate?: () => void;
  grabbed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const Kahva = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
    <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke="currentColor" strokeWidth="2.8" fill="none" strokeLinecap="round" />
  </svg>
);

export const RankingCard = forwardRef<HTMLDivElement, RankingCardProps>(function RankingCard(
  { person, position, state = "idle", note, value, vino, readOnly, handleProps, dragProps, onActivate, grabbed, className, style, ariaLabel },
  ref,
) {
  const kuva = person.hideThumb ? null : henkiloKuva(person.image_url);
  const muoto = !kuva ? "kuvaton" : person.tunnus ? "tunnus" : "kuva";
  const nimi = tavuta(person.name);

  return (
    <div
      ref={ref}
      className={[
        "tk-rcard",
        `tk-rcard--${state}`,
        `tk-rcard--${muoto}`,
        vino ? "tk-rcard--vino" : "",
        // Raahattava koko kortti: erillinen luokka, jotta kursori/touch-action/user-select osuvat vain pelin kortteihin.
        dragProps && !readOnly ? "tk-rcard--draggable" : "",
        className ?? "",
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()}
      style={{ "--tk-kallistus": kallistus((position ?? 1) - 1), "--tk-lw": pisinTavu(nimi), ...style } as React.CSSProperties}
      data-id={person.id}
      role={readOnly || !onActivate ? undefined : "button"}
      tabIndex={readOnly || !onActivate ? undefined : -1}
      aria-label={ariaLabel}
      onClick={readOnly ? undefined : onActivate}
      {...dragProps}
    >
      {typeof position === "number" && <span className="tk-rcard-pos" aria-hidden="true">{position}</span>}

      <div className="tk-rcard-kortti">
        {kuva && (
          // draggable={false}: ilman tätä hiiriraahaus kortin kuvasta käynnistäisi selaimen oman kuvanraahauksen.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="tk-rcard-kuva" src={kuva} alt="" loading="lazy" decoding="async" width={44} height={44} draggable={false} />
        )}

        <div className="tk-rcard-body">
          <span className="tk-rcard-nimi">{nimi}</span>
          {note ? <span className="tk-rcard-note">{note}</span> : person.role ? <span className="tk-rcard-role">{person.role}</span> : null}
        </div>

        {value && (
          <span className="tk-rcard-value">
            {state === "correct" && <span className="tk-rcard-ok" aria-label="Oikealla paikalla">✓</span>}
            {value}
          </span>
        )}

        {!readOnly && handleProps && (
          <button
            type="button"
            className="tk-rcard-handle"
            aria-label={`Siirrä ${person.name}: raahaa korttia tai napauta kahta korttia vaihtaaksesi, nuolinäppäimillä yksi paikka kerrallaan`}
            aria-grabbed={grabbed ? "true" : "false"}
            {...handleProps}
          >
            <Kahva />
          </button>
        )}
        {readOnly && state === "dragging" && <span className="tk-rcard-handle" aria-hidden="true"><Kahva /></span>}
      </div>
    </div>
  );
});
