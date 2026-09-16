"use client";
// TIETOKETJU: IKÄJÄRJESTYS — CategoryPicker.
// Kevyt bottom sheet / modaali kierroksen aloitukseen: kategoriachipit
// (amber-sävyiset, "Kaikki henkilöt" esivalittu), suuntabadge ja "Aloita
// kierros" -pääpainike (lime). variant="sheet" = kiinnitetty alaspäin
// avautuva paneeli (esim. "Vaihda aihetta" -pyyntö kesken pelin);
// variant="inline" = sama sisältö ilman backdrop-ylikerrosta (pelisivun
// oma aloitusnäkymä, kun kierrosta ei ole vielä arvottu).

import { CHAIN_CATEGORIES } from "@/lib/personCategories";
import { SuuntaindikaattoriBadge } from "./SuuntaindikaattoriBadge";
import type { ChainDirection } from "@/lib/ikajarjestysConstants";

export function CategoryPicker({
  open,
  variant = "inline",
  selectedCategory,
  onSelectCategory,
  onStart,
  onClose,
  direction = "vanhin-nuorin",
  title = "Tietoketju: Ikäjärjestys",
  description = "Aseta 10 henkilöä syntymävuoden mukaiseen järjestykseen. Valitse ensin aihe.",
}: {
  open: boolean;
  variant?: "sheet" | "inline";
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  onStart: () => void;
  onClose?: () => void;
  direction?: ChainDirection;
  title?: string;
  description?: string;
}) {
  if (!open) return null;

  const content = (
    <div className="tk-picker" role="dialog" aria-modal={variant === "sheet" ? "true" : undefined} aria-label={title}>
      {variant === "sheet" && onClose && (
        <button type="button" className="tk-picker-close" onClick={onClose} aria-label="Sulje">
          ×
        </button>
      )}
      <div className="tk-picker-handle" aria-hidden="true" />
      <h2 className="tk-picker-title">{title}</h2>
      <p className="tk-picker-desc">{description}</p>
      <SuuntaindikaattoriBadge direction={direction} className="tk-picker-direction" />
      <div className="tk-chiprow" role="group" aria-label="Kategoria">
        {CHAIN_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`tk-chip-amber${selectedCategory === c.key ? " is-active" : ""}`}
            aria-pressed={selectedCategory === c.key}
            onClick={() => onSelectCategory(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <button type="button" className="tk-btn-primary tk-picker-start" onClick={onStart}>
        Aloita kierros
      </button>
    </div>
  );

  if (variant === "inline") return content;

  return (
    <div className="tk-sheet-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{content}</div>
    </div>
  );
}
