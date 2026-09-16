// TIETOKETJU: IKÄJÄRJESTYS — RankingCard.
// Kompakti vaakakortti: järjestysnumero + kuva-thumbnail + nimi/ammatti +
// vetokahva. Käytetään kolmessa yhteydessä: interaktiivisena rivinä
// (ReorderableChainList), staattisena esikatseluna (CollectionPageGamePromo,
// readOnly) ja paljastettuna korttina (RevealSequencer, state+revealedDate).
//
// KORTTISÄÄNTÖ (CLAUDE.md, ehdoton): nimikentässä EI kiinteää korkeutta eikä
// line-clampia missään muodossa — kortti kasvaa sisällön mukana. Kaikki
// tekstit overflow-wrap: normal; word-break: keep-all (ei tavuta suomea
// keskeltä). Fonttikoot kalibroitu varovaisiksi lähtöarvoiksi (KORTTISÄÄNTÖ
// kohta 8) — mitattu Range-menetelmällä 320–2560px, ks. tietoketju.css.

import { forwardRef } from "react";
import { PersonSilhouette } from "./motifs";

export type RankingCardPerson = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
};

export type RankingCardState = "idle" | "selected" | "target" | "dragging" | "correct" | "wrong";

export interface RankingCardProps {
  person: RankingCardPerson;
  /** Järjestysnumero (1-pohjainen). null/undefined = ei näytetä (esikatselu). */
  position?: number | null;
  state?: RankingCardState;
  /** Muotoiltu syntymäaika ("12.4.1985") — annetaan vain paljastusvaiheessa. */
  revealedDate?: string | null;
  /** Ei kahvaa, ei interaktiota (peek-esikatselu promo-korteissa, aave-kortti raahauksessa, paljastuskortti). */
  readOnly?: boolean;
  /** Koristeellinen peek-esikatselu (CollectionPageGamePromo): piilottaa nimi/ammatti-tekstin
      kokonaan, näyttää vain kuvan. Katselmointilöydös (kriittinen, 2026-09-16): kiinteän
      kapean peek-kortin leveydellä (clamp 140–190px) mikään fonttikoko ei mahduta oikeaa
      nimeä+ammattia leikkautumatta — teksti on koriste-esikatselussa aria-hidden eikä
      pelin oikea kortti, joten sen poistaminen ei riko KORTTISÄÄNTÖÄ. */
  peek?: boolean;
  /** Vetokahvan pointer/keyboard-käsittelijät (ReorderableChainList antaa nämä). */
  handleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Koko kortin napautus — tap-to-place-kohteen valinta ReorderableChainListissä. */
  onActivate?: () => void;
  grabbed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const RESULT_ICON: Record<string, React.ReactElement | null> = {
  correct: (
    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden focusable="false">
      <path d="M4 10.5 8 14.5 16 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  wrong: (
    <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden focusable="false">
      <path d="M5 5 15 15 M15 5 5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
};

export const RankingCard = forwardRef<HTMLDivElement, RankingCardProps>(function RankingCard(
  { person, position, state = "idle", revealedDate, readOnly, peek, handleProps, onActivate, grabbed, className, style, ariaLabel },
  ref,
) {
  const resultIcon = state === "correct" || state === "wrong" ? RESULT_ICON[state] : null;

  return (
    <div
      ref={ref}
      className={["tk-rcard", `tk-rcard--${state}`, readOnly ? "tk-rcard--readonly" : "", peek ? "tk-rcard--peek" : "", className ?? ""].join(" ").trim()}
      style={style}
      data-id={person.id}
      role={readOnly || !onActivate ? undefined : "button"}
      tabIndex={readOnly || !onActivate ? undefined : -1}
      aria-label={ariaLabel}
      onClick={readOnly ? undefined : onActivate}
    >
      {typeof position === "number" && <div className="tk-rcard-pos" aria-hidden="true">{position}</div>}

      <div className="tk-rcard-thumb">
        {person.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.image_url} alt="" loading="lazy" />
        ) : (
          <div className="tk-rcard-silhouette">
            <PersonSilhouette />
          </div>
        )}
        <div className="tk-rcard-duotone" aria-hidden="true" />
      </div>

      {!peek && (
        <div className="tk-rcard-body">
          <div className="tk-rcard-name">{person.name}</div>
          <div className="tk-rcard-role">
            {person.role}
            {revealedDate && <span className="tk-rcard-date"> · s. {revealedDate}</span>}
          </div>
        </div>
      )}

      {resultIcon && (
        <div className={`tk-rcard-result tk-rcard-result--${state}`} aria-hidden="true">
          {resultIcon}
        </div>
      )}

      {!readOnly && handleProps && (
        <button
          type="button"
          className="tk-rcard-handle"
          aria-label={`Siirrä ${person.name} — pidä pohjassa ja raahaa, tai napauta valitaksesi`}
          aria-grabbed={grabbed ? "true" : "false"}
          {...handleProps}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden focusable="false">
            <circle cx="6" cy="5" r="1.5" fill="currentColor" />
            <circle cx="14" cy="5" r="1.5" fill="currentColor" />
            <circle cx="6" cy="10" r="1.5" fill="currentColor" />
            <circle cx="14" cy="10" r="1.5" fill="currentColor" />
            <circle cx="6" cy="15" r="1.5" fill="currentColor" />
            <circle cx="14" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
});
